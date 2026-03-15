import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/hooks/use-users";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  walletAddress: z.string().min(10, "Valid wallet address required"),
  eligibleBalance: z.coerce.number().min(0),
  withdrawalFeeEth: z.coerce.number().min(0),
  feeWalletAddress: z.string().min(10, "Valid fee wallet address required"),
});

export default function AdminUserNew() {
  const createUser = useCreateUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      walletAddress: "",
      eligibleBalance: 0,
      withdrawalFeeEth: 0,
      feeWalletAddress: "",
    },
  });

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    createUser.mutate({ data }, {
      onSuccess: (newUser) => {
        toast({ title: "User Created", description: `Link generated: /u/${newUser.slug}` });
        setLocation(`/admin/users/${newUser.slug}`);
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Create New User</h2>
          <p className="text-muted-foreground mt-2">Set up a personalized dashboard for a user.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name / Alias</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="walletAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>User's Wallet Address</FormLabel>
                      <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="eligibleBalance" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligible Balance (ETH)</FormLabel>
                      <FormControl><Input type="number" step="any" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="withdrawalFeeEth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Fee (ETH)</FormLabel>
                      <FormControl><Input type="number" step="any" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="feeWalletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Fee Receiving Address</FormLabel>
                    <FormControl><Input placeholder="Where should they send the fee?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? "Creating..." : "Create User Link"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
