import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Banknote, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft,
  Building2,
  Wallet
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface RequestPayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  eventId: string;
  hostId: string;
  onSuccess?: () => void;
}

type Step = "form" | "confirm";

export function RequestPayoutDialog({
  isOpen,
  onClose,
  totalAmount,
  eventId,
  hostId,
  onSuccess,
}: RequestPayoutDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openBankSelect, setOpenBankSelect] = useState(false);
  const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  
  const [formData, setFormData] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setFormData({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
      });
      setVerificationError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const loadBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const res = await fetch("https://tisrjkejomwgknharrdz.supabase.co/functions/v1/get-banks");
        const data = await res.json();
        let banksList = Array.isArray(data) ? data : (data?.data?.data || data?.data || []);
        if (Array.isArray(banksList)) {
          // Deduplicate banks by code to fix React duplicate key warnings
          banksList = Array.from(new Map(banksList.map((item: {code: string, name: string}) => [item.code, item])).values());
          banksList.sort((a: {code: string, name: string}, b: {code: string, name: string}) => (a.name || "").localeCompare(b.name || ""));
        }
        setBanks(banksList);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        toast({
          title: "Network Error",
          description: "Could not load the list of banks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBanks(false);
      }
    };
    loadBanks();
  }, [isOpen, toast]);

  const verifyAccount = async (accountNumber: string, bankCode: string) => {
    if (accountNumber.length !== 10) return;
    
    setIsVerifying(true);
    setVerificationError("");
    setFormData(prev => ({ ...prev, accountName: "" }));
    
    try {
      const res = await fetch("https://tisrjkejomwgknharrdz.supabase.co/functions/v1/Account-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: bankCode,
        }),
      });
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        setFormData(prev => ({ ...prev, accountName: data.data.account_name }));
      } else {
        setVerificationError(data.message || "Could not verify this account. Please check the details.");
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setVerificationError("Network error during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccountChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    
    setFormData(prev => ({ ...prev, accountNumber: numericValue, accountName: "" }));
    setVerificationError("");
    
    if (numericValue.length === 10 && formData.bankCode) {
      verifyAccount(numericValue, formData.bankCode);
    }
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !formData.bankName.trim() ||
      !formData.accountNumber.trim() ||
      !formData.accountName.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please ensure all bank details are filled and verified.",
        variant: "destructive",
      });
      return;
    }
    
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to request a payout.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("payout_requests").insert([
        {
          event_id: eventId,
          host_id: hostId,
          amount: totalAmount,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Payout Requested Successfully! 🎉",
        description: "Your request has been received. Funds will be deposited shortly.",
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Payout request error:", error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
      setStep("form"); // Go back to form on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (!isSubmitting) onClose();
    }}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl p-0 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl">Request Payout</DialogTitle>
                <DialogDescription>
                  Withdraw your collected gifts directly to your bank.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Premium Balance Card */}
          <div className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-5 backdrop-blur-sm">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700/80 dark:text-amber-400/80 mb-1 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Available Balance
                </p>
                <p className="text-3xl font-bold bg-gradient-to-br from-amber-700 to-orange-600 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="relative px-6 pb-6 min-h-[320px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === "form" ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleProceedToConfirm} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-muted-foreground">Select Bank</Label>
                  <Popover open={openBankSelect} onOpenChange={setOpenBankSelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBankSelect}
                        className={cn(
                          "w-full justify-between bg-background/50 backdrop-blur-sm transition-colors",
                          !formData.bankName && "text-muted-foreground",
                          "hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                        disabled={isSubmitting || isLoadingBanks}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="w-4 h-4 opacity-50 shrink-0" />
                          <span className="truncate">
                            {formData.bankName 
                              ? formData.bankName 
                              : isLoadingBanks 
                                ? "Loading banks..." 
                                : "Search and select a bank..."}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden glass shadow-2xl"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search any bank..." className="border-none focus:ring-0" />
                        <CommandList className="max-h-[200px]">
                          <CommandEmpty>No bank found.</CommandEmpty>
                          <CommandGroup>
                            {banks.map((bank) => (
                              <CommandItem
                                key={bank.code}
                                value={bank.name}
                                onSelect={(currentValue) => {
                                  const selectedBank = banks.find((b) => b.name.toLowerCase() === currentValue.toLowerCase());
                                  if (selectedBank) {
                                    setFormData({
                                      ...formData,
                                      bankName: selectedBank.name,
                                      bankCode: selectedBank.code,
                                      accountName: "" 
                                    });
                                    setVerificationError("");
                                    if (formData.accountNumber.length === 10) {
                                      verifyAccount(formData.accountNumber, selectedBank.code);
                                    }
                                  }
                                  setOpenBankSelect(false);
                                }}
                                className="cursor-pointer transition-colors"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-primary",
                                    formData.bankCode === bank.code
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {bank.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-muted-foreground">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="10-digit account number"
                    value={formData.accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    disabled={isSubmitting || isVerifying || !formData.bankCode}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className={cn(
                      "bg-background/50 backdrop-blur-sm transition-colors text-lg tracking-wide",
                      "focus:ring-primary/20"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName" className="flex items-center justify-between text-muted-foreground">
                    Account Name
                    {formData.accountName && !isVerifying && (
                      <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </Label>
                  
                  <div className="relative">
                    <Input
                      id="accountName"
                      placeholder={
                        !formData.bankCode 
                          ? "Select bank first" 
                          : formData.accountNumber.length < 10 
                            ? "Enter 10-digit number" 
                            : isVerifying 
                              ? "Verifying account details..." 
                              : "Account name will appear here"
                      }
                      value={formData.accountName}
                      readOnly
                      className={cn(
                        "bg-muted/30 backdrop-blur-sm font-medium",
                        isVerifying && "text-muted-foreground animate-pulse",
                        formData.accountName && "bg-green-500/5 border-green-500/30 text-green-700 dark:text-green-400 focus-visible:ring-green-500/20",
                        verificationError && "bg-red-500/5 border-red-500/30 text-red-700 dark:text-red-400"
                      )}
                    />
                    
                    {isVerifying ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : formData.accountName ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : verificationError ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    ) : null}
                  </div>
                  
                  {verificationError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium text-red-500 mt-1.5 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" /> {verificationError}
                    </motion.p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      isVerifying || 
                      !formData.accountName || 
                      totalAmount <= 0
                    }
                    className="group"
                  >
                    Review Details
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/30">
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Bank</span>
                    <span className="font-semibold text-foreground">{formData.bankName}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Account Number</span>
                    <span className="font-mono text-lg font-medium text-foreground tracking-wider">{formData.accountNumber}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-1 bg-primary/5">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      Account Name <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </span>
                    <span className="font-semibold text-foreground">{formData.accountName}</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 dark:bg-amber-500/5 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm flex gap-3 shadow-inner">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Please confirm that the details above are completely accurate. Returns on incorrect transfers are not guaranteed.</p>
                </div>

                <div className="pt-2 flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("form")}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm & Request"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
