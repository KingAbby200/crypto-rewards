import { useRoute, useLocation } from "wouter";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useUserTransactions, useCreateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
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
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const [txDialogOpen, setTxDialogOpen] = useState(false);

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      walletAddress: user?.walletAddress || "",
      eligibleBalance: user?.eligibleBalance || 0,
      withdrawalFeeEth: user?.withdrawalFeeEth || 0,
      feeWalletAddress: user?.feeWalletAddress || "",
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

  const txForm = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      amount: 0,
      type: "bonus",
      status: "completed",
      txHash: "",
      note: "",
      date: new Date().toISOString().slice(0, 16),
    },
  });

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

      if (!res.ok) throw new Error("Failed to update user");

      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", slug] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast({ title: "User updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update user", variant: "destructive" });
    }
  };

  const onTxSubmit = async (data: z.infer<typeof txSchema>) => {
    try {
      const payload = {
        userSlug: slug,
        amount: Number(data.amount),
        type: data.type,
        status: data.status || "completed",
        txHash: data.txHash || undefined,
        note: data.note || undefined,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to add transaction');
      }

      toast({ title: "Transaction added successfully" });
      setTxDialogOpen(false);
      txForm.reset();

      queryClient.invalidateQueries({ queryKey: ['user-transactions', slug] });
    } catch (err: any) {
      toast({
        title: "Error adding transaction",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = () => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    deleteUser.mutate({ slug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", slug] });
        toast({ title: "User deleted successfully" });
        setLocation("/admin");
      },
      onError: (err: any) => {
        toast({ title: "Error deleting user", description: err.message || "Failed to delete user", variant: "destructive" });
      },
    });
  };

  const handleVerify = async () => {
    if (!withdrawalRequest) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/withdrawal-requests/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "verified" }),
      });

      if (!res.ok) throw new Error("Failed to verify payment");

      queryClient.invalidateQueries({ queryKey: ["withdrawal-request", slug] });
      queryClient.invalidateQueries({ queryKey: ["user", slug] });

      toast({ title: "Payment verified!", description: "User has been notified." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to verify", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!withdrawalRequest) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/withdrawal-requests/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) throw new Error("Failed to reject payment");

      queryClient.invalidateQueries({ queryKey: ["withdrawal-request", slug] });
      queryClient.invalidateQueries({ queryKey: ["user", slug] });

      toast({ title: "Payment rejected.", description: "User has been notified." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reject", variant: "destructive" });
    }
  };

  const userLink = `${window.location.origin}/u/${user.slug}`;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">{user.name}</h2>
            <p className="text-zinc-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </div>

        {/* Withdrawal Request Alert */}
        {withdrawalRequest && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-500">Withdrawal Request</p>
                  <p className="text-2xl font-medium mt-1">
                    {formatEth(withdrawalRequest.requestedAmount)} ETH
                  </p>
                </div>
                <Badge variant={withdrawalRequest.status === "verified" ? "default" : "secondary"}>
                  {withdrawalRequest.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-10">
            <h2 className="text-xl font-medium mb-6">Edit User Details</h2>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={userForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} className="bg-zinc-950 border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="walletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl><Input {...field} className="bg-zinc-950 border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="eligibleBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligible Balance (ETH)</FormLabel>
                    <FormControl><Input type="number" step="0.0001" {...field} className="bg-zinc-950 border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="withdrawalFeeEth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Fee (ETH)</FormLabel>
                    <FormControl><Input type="number" step="0.0001" {...field} className="bg-zinc-950 border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="feeWalletAddress" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Fee Destination Wallet</FormLabel>
                    <FormControl><Input {...field} className="bg-zinc-950 border-zinc-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="md:col-span-2 pt-4">
                  <Button type="submit" className="w-full py-6 bg-white text-black hover:bg-zinc-200" disabled={updateUser.isPending}>
                    {updateUser.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Transactions - Your original table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Transaction History</h2>
              <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Record</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                  </DialogHeader>
                  <Form {...txForm}>
                    <form onSubmit={txForm.handleSubmit(onTxSubmit)} className="space-y-4">
                      {/* Your original form fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={txForm.control} name="amount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (ETH)</FormLabel>
                            <FormControl><Input type="number" step="any" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={txForm.control} name="type" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <select className="flex h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm" {...field}>
                                <option value="bonus">Bonus</option>
                                <option value="commission">Commission</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="fee">Fee</option>
                              </select>
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={txForm.control} name="status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <select className="flex h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm" {...field}>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                              </select>
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={txForm.control} name="date" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & Time</FormLabel>
                            <FormControl><Input type="datetime-local" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={txForm.control} name="txHash" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tx Hash (Optional)</FormLabel>
                          <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={txForm.control} name="note" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Note</FormLabel>
                          <FormControl><Input placeholder="..." {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createTx.isPending}>Add Transaction</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-zinc-400 whitespace-nowrap">
                        {safeFormat(tx.date, "MMM d, yy HH:mm")}
                      </TableCell>
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell className="font-mono">{formatEth(tx.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-500"
                          onClick={() => {
                            if (confirm("Delete transaction?")) {
                              deleteTx.mutate({ slug, txId: tx.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-zinc-500">No transactions recorded.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
