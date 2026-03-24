import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayoutRequest {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
  events?: { title: string };
}

export default function AdminPayouts() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      // We join events to get the title
      const { data, error } = await supabase
        .from("payout_requests")
        .select(
          `
          *,
          events ( title )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as PayoutRequest[]);
    } catch (error: unknown) {
      console.error("Error fetching payouts:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load payouts";
      toast({
        title: "Error loading payouts",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayouts();

    // Set up realtime subscription
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payout_requests" },
        (_payload) => {
          fetchPayouts(); // Refresh the list when db changes
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPayouts]);

  const handleMarkAsPaid = async (requestId: string) => {
    try {
      setProcessingId(requestId);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/Gift-payout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ requestId }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process payout");
      }

      toast({
        title: "Success",
        description: "Payout marked as paid and user notified.",
      });

      // Update local state immediately for better UX
      setRequests((current) =>
        current.map((req) =>
          req.id === requestId ? { ...req, status: "paid" } : req,
        ),
      );
    } catch (error: unknown) {
      console.error("Process payout error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to process payout";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payout Requests</h1>
        <p className="text-muted-foreground">
          Manage and process gift withdrawals from event hosts.
        </p>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No payout requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(req.created_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {req.events?.title || "Unknown Event"}
                  </TableCell>
                  <TableCell className="font-bold whitespace-nowrap">
                    ₦{req.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="font-medium">{req.bank_name}</span>
                      <span className="text-muted-foreground">
                        {req.account_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {req.account_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={req.status === "paid" ? "default" : "secondary"}
                      className={
                        req.status === "paid"
                          ? "bg-green-500 hover:bg-green-600 cursor-default"
                          : "cursor-default"
                      }
                    >
                      {req.status === "paid" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={req.status === "paid" ? "default" : "default"}
                      className={
                        req.status === "paid"
                          ? "bg-green-600 hover:bg-green-600 text-white cursor-default"
                          : ""
                      }
                      onClick={() =>
                        req.status === "pending" && handleMarkAsPaid(req.id)
                      }
                      disabled={
                        processingId === req.id || req.status === "paid"
                      }
                    >
                      {processingId === req.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing
                        </>
                      ) : req.status === "paid" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        "Mark as Paid"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
