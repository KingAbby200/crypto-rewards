import { getGetUserBySlugQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useUserTransactions, useCreateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useWithdrawalRequest, useVerifyWithdrawalRequest, useRejectWithdrawalRequest } from "@/hooks/use-withdrawal";
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

  const { data: user, isLoading: userLoading } = useUser(slug);
  const { data: transactions, isLoading: txLoading } = useUserTransactions(slug);
  const { data: withdrawalRequest, isLoading: wrLoading } = useWithdrawalRequest(slug);

  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();
  const verifyWr = useVerifyWithdrawalRequest();
  const rejectWr = useRejectWithdrawalRequest();

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

  if (userLoading || txLoading || wrLoading) {
    return <AdminLayout><div className="p-12 text-center">Loading user data...</div></AdminLayout>;
  }

  if (!user) {
    return <AdminLayout><div className="p-12 text-center text-destructive">User not found</div></AdminLayout>;
  }

  const onUserSubmit = (data: z.infer<typeof userSchema>) => {
    updateUser.mutate({ slug, data }, {
      onSuccess: () => {
        // Broad invalidation for user queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['user', slug] });
        queryClient.invalidateQueries({ queryKey: ['users'] }); // if list exists
  
        toast({ title: "User updated successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to update", variant: "destructive" });
      },
    });
  };
  
  const onTxSubmit = async (data: z.infer<typeof txSchema>) => {
    try {
      const payload = {
        userSlug: slug,  // this is critical — backend likely expects userSlug
        amount: Number(data.amount),
        type: data.type,
        status: data.status || "completed",
        txHash: data.txHash || undefined,
        note: data.note || undefined,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      };
      
      console.log('Sending transaction payload:', payload);
      
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to add transaction`);
      }
  
      toast({ title: "Transaction added successfully" });
      setTxDialogOpen(false);
      txForm.reset();
  
      // Safe invalidation (no generated keys needed)
      queryClient.invalidateQueries({ queryKey: ['user-transactions', slug] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // fallback
    } catch (err: any) {
      console.error('Transaction add error:', err);
      toast({
        title: "Error adding transaction",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = () => {
    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      deleteUser.mutate({ slug }, {
        onSuccess: () => {
          toast({ title: "User deleted" });
          setLocation("/admin");
        },
      });
    }
  };

  const handleVerify = () => {
    if (!withdrawalRequest) return;
    verifyWr.mutate({ requestId: withdrawalRequest.id }, {
      onSuccess: () => toast({ title: "Payment verified!", description: "User has been notified." }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleReject = () => {
    if (!withdrawalRequest) return;
    rejectWr.mutate({ requestId: withdrawalRequest.id }, {
      onSuccess: () => toast({ title: "Payment rejected.", description: "User has been notified." }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const userLink = `${window.location.origin}${import.meta.env.BASE_URL}u/${user.slug}`;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Public Link:</span>
              <code className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-primary">
                {userLink}
              </code>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                navigator.clipboard.writeText(userLink);
                toast({ title: "Link copied to clipboard" });
              }}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                <a href={`/u/${user.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDeleteUser}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete User
          </Button>
        </div>

        {/* Withdrawal Request Alert */}
        {withdrawalRequest && (
          <Card className={`border ${
            withdrawalRequest.status === "pending"
              ? "border-amber-500/40 bg-amber-500/5"
              : withdrawalRequest.status === "verified"
              ? "border-green-500/40 bg-green-500/5"
              : "border-destructive/40 bg-destructive/5"
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {withdrawalRequest.status === "pending" && <Clock className="w-5 h-5 text-amber-400 animate-pulse" />}
                {withdrawalRequest.status === "verified" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                {withdrawalRequest.status === "rejected" && <XCircle className="w-5 h-5 text-destructive" />}
                Withdrawal Request
                <Badge variant={
                  withdrawalRequest.status === "pending" ? "warning" :
                  withdrawalRequest.status === "verified" ? "success" : "destructive"
                } className="ml-1">
                  {withdrawalRequest.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Requested amount:{" "}
                    <span className="text-white font-mono font-semibold">
                      {formatEth(withdrawalRequest.requestedAmount)}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Fee paid:{" "}
                    <span className="text-white font-mono">
                      {formatEth(withdrawalRequest.feeAmount)}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Submitted:{" "}
                    <span className="text-white">
                      {safeFormat(withdrawalRequest.createdAt, "MMM d, yyyy HH:mm")}
                    </span>
                  </p>
                </div>
                {withdrawalRequest.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/40 text-green-400 hover:bg-green-500/10"
                      onClick={handleVerify}
                      disabled={verifyWr.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={handleReject}
                      disabled={rejectWr.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit user form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                    <FormField control={userForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={userForm.control} name="walletAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Wallet</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={userForm.control} name="eligibleBalance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligible Balance (ETH)</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={userForm.control} name="withdrawalFeeEth" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Withdrawal Fee (ETH)</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={userForm.control} name="feeWalletAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee Destination Wallet</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={updateUser.isPending}>
                      {updateUser.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
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
                                <select className="flex h-11 w-full rounded-xl border border-white/10 bg-background px-3 text-sm" {...field}>
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
                                <select className="flex h-11 w-full rounded-xl border border-white/10 bg-background px-3 text-sm" {...field}>
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
              </CardHeader>
              <CardContent className="p-0">
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
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {safeFormat(tx.date, "MMM d, yy HH:mm")}
                          </TableCell>
                          <TableCell className="capitalize">{tx.type}</TableCell>
                          <TableCell className="font-mono text-primary">{formatEth(tx.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "destructive"}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                  <div className="p-8 text-center text-muted-foreground">No transactions recorded.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
