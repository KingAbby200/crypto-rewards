import { useRoute, useLocation } from "wouter";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useUserTransactions } from "@/hooks/use-transactions";
import { useWithdrawalRequest } from "@/hooks/use-withdrawal";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatEth } from "@/lib/utils";
import { format } from "date-fns";
import { Copy, Trash2, Plus, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const safeFormat = (dateInput: any, formatStr: string) => {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? "N/A" : format(date, formatStr);
};

const userSchema = z.object({
  name: z.string().min(1),
  walletAddress: z.string().min(10),
  eligibleBalance: z.coerce.number().min(0),
  withdrawalFeeEth: z.coerce.number().min(0),
  feeWalletAddress: z.string().min(10),
});

const txSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(["commission", "bonus", "withdrawal", "fee"]),
  status: z.enum(["pending", "completed", "failed"]),
  txHash: z.string().optional(),
  note: z.string().optional(),
  date: z.string(),
});

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:slug");
  const slug = params?.slug || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useUser(slug);
  const { data: transactions, isLoading: txLoading } = useUserTransactions(slug);
  const { data: withdrawalRequest, isLoading: wrLoading } = useWithdrawalRequest(slug);

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [txDialogOpen, setTxDialogOpen] = useState(false);

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      walletAddress: "",
      eligibleBalance: 0,
      withdrawalFeeEth: 0,
      feeWalletAddress: "",
    },
  });

  useEffect(() => {
    if (user) {
      userForm.reset({
        name: user.name || "",
        walletAddress: user.walletAddress || "",
        eligibleBalance: user.eligibleBalance || 0,
        withdrawalFeeEth: user.withdrawalFeeEth || 0,
        feeWalletAddress: user.feeWalletAddress || "",
      });
    }
  }, [user, userForm]);

  const onUserSubmit = async (data: z.infer<typeof userSchema>) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/users/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed (${res.status}): ${errorText}`);
      }

      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", slug] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["user", slug] });

      toast({ title: "User updated successfully" });
    } catch (err: any) {
      console.error("Update error:", err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update user", 
        variant: "destructive" 
      });
    }
  };

  // Keep your existing onTxSubmit, handleDeleteUser, handleVerify, handleReject for now

  if (userLoading || txLoading || wrLoading) {
    return <AdminLayout><div className="p-12 text-center text-white">Loading user data...</div></AdminLayout>;
  }

  if (!user) {
    return <AdminLayout><div className="p-12 text-center text-red-400">User not found</div></AdminLayout>;
  }

  const userLink = `${window.location.origin}/u/${user.slug}`;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">{user.name}</h1>
            <p className="text-zinc-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
            Delete User
          </Button>
        </div>

        {/* Withdrawal Request */}
        {withdrawalRequest && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-500">Withdrawal Request</p>
                  <p className="text-3xl font-medium mt-2">
                    {formatEth(withdrawalRequest.requestedAmount)} ETH
                  </p>
                </div>
                <Badge 
                  variant={withdrawalRequest.status === "verified" ? "default" : "secondary"}
                  className="text-sm px-4 py-1"
                >
                  {withdrawalRequest.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-10">
            <h2 className="text-2xl font-medium mb-8">Edit User Details</h2>
            
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <FormField control={userForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Name</FormLabel>
                    <FormControl><Input {...field} className="bg-black border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="walletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Wallet Address</FormLabel>
                    <FormControl><Input {...field} className="bg-black border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="eligibleBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Eligible Balance (ETH)</FormLabel>
                    <FormControl><Input type="number" step="0.0001" {...field} className="bg-black border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="withdrawalFeeEth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Withdrawal Fee (ETH)</FormLabel>
                    <FormControl><Input type="number" step="0.0001" {...field} className="bg-black border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="feeWalletAddress" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-zinc-400">Fee Destination Wallet</FormLabel>
                    <FormControl><Input {...field} className="bg-black border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="md:col-span-2 pt-4">
                  <Button type="submit" className="w-full py-7 text-base bg-white text-black hover:bg-zinc-200" disabled={updateUser.isPending}>
                    {updateUser.isPending ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Transactions Section - Keep your existing table for now */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-medium">Transaction History</h2>
              <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Add Transaction</Button>
                </DialogTrigger>
                {/* Your existing Dialog content stays here */}
              </Dialog>
            </div>

            {/* Your existing transaction table code goes here */}
            {/* ... keep as is for now ... */}

          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
