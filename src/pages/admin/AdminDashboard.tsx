import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Banknote, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ChartData {
  date: string;
  amount: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    requestCount: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("payout_requests")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        let pending = 0;
        let paid = 0;
        const dailyData: Record<string, ChartData> = {};

        data?.forEach((req) => {
          if (req.status === "pending") pending += req.amount;
          if (req.status === "paid") paid += req.amount;

          // Group by date for chart
          const date = format(parseISO(req.created_at), "MMM dd");
          if (!dailyData[date]) {
            dailyData[date] = { date, amount: 0 };
          }
          dailyData[date].amount += req.amount;
        });

        setStats({
          totalPending: pending,
          totalPaid: paid,
          requestCount: data?.length || 0,
        });

        setChartData(Object.values(dailyData));
      } catch (error) {
        console.error("Failed to fetch payout stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mt-1">
          View your platform's payout statistics and trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Paid */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-card-foreground shadow-sm p-6 backdrop-blur-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Paid Out</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
            ₦{stats.totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Successfully disbursed funds
          </p>
        </div>

        {/* Total Pending */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 text-card-foreground shadow-sm p-6 backdrop-blur-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-amber-600 dark:text-amber-400">Pending Payouts</h3>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
            ₦{stats.totalPending.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Awaiting processing
          </p>
        </div>

        {/* Request Count */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 text-card-foreground shadow-sm p-6 backdrop-blur-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-primary/80">Total Requests</h3>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats.requestCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Across all time
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Payout Requests Over Time</h3>
              <p className="text-xs text-muted-foreground">Daily aggregate of requested amounts</p>
            </div>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₦${value.toLocaleString()}`}
                  dx={-10}
                />
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`₦${Number(value || 0).toLocaleString()}`, "Amount Requested"]}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderRadius: "12px", 
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }}
                  itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
                  labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))", marginBottom: "4px" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card text-card-foreground shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No Payout Data Yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Once payout requests are made on your platform, their trends and aggregates will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
