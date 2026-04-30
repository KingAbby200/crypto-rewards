import { useRoute, useLocation } from "wouter";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useUserTransactions } from "@/hooks/use-transactions";
import { useWithdrawalRequest } from "@/hooks/use-withdrawal";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatEth } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const userSchema = z.object({
  name: z.string().min(1),
  walletAddress: z.string().min(10),
  eligibleBalance: z.coerce.number().min(0),
  withdrawalFeeEth: z.coerce.number().min(0),
  feeWalletAddress: z.string().min(10),
});

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:slug");
  const slug = params?.slug || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useUser(slug);
  const { data: withdrawalRequest } = useWithdrawalRequest(slug);

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

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

      if (!res.ok) throw new Error("Failed to update user");

      queryClient.invalidateQueries({ queryKey: ["user", slug] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast({ title: "User updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update", variant: "destructive" });
    }
  };

  const handleDeleteUser = () => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    deleteUser.mutate({ slug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast({ title: "User deleted successfully" });
        setLocation("/admin");
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to delete user", variant: "destructive" });
      },
    });
  };

  if (userLoading) {
    return <AdminLayout><div className="p-12 text-center">Loading...</div></AdminLayout>;
  }

  if (!user) {
    return <AdminLayout><div className="p-12 text-center text-red-400">User not found</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-semibold">{user.name}</h1>
            <p className="text-zinc-500 mt-1">Slug: {user.slug}</p>
          </div>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </div>

        {/* Edit Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-10">
            <h2 className="text-xl font-medium mb-6">Edit User Details</h2>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={userForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={userForm.control} name="walletAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={userForm.control} name="eligibleBalance" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligible Balance</FormLabel>
                      <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={userForm.control} name="withdrawalFeeEth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Fee</FormLabel>
                      <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={userForm.control} name="feeWalletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Destination Wallet</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full py-6" disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Withdrawal Request */}
        {withdrawalRequest && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8">
              <p>Withdrawal Request: {withdrawalRequest.status}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
