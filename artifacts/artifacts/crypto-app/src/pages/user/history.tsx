import { useRoute } from "wouter";
import { useUser } from "@/hooks/use-users";
import { useUserTransactions } from "@/hooks/use-transactions";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatEth } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function UserHistory() {
  const [, params] = useRoute("/u/:slug/history");
  const slug = params?.slug || "";
  const { data: user, isLoading: userLoading } = useUser(slug);
  const { data: transactions, isLoading: txLoading } = useUserTransactions(slug);

  const isLoading = userLoading || txLoading;

  if (isLoading) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    return (
      <UserLayout slug={slug}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-destructive">Account Not Found</h2>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout slug={slug}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle>Payment History</CardTitle>
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
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {format(new Date(tx.date), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{tx.type}</span>
                        </TableCell>
                        <TableCell className="font-mono text-primary font-medium">
                          {formatEth(tx.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            tx.status === "completed" ? "success" : 
                            tx.status === "pending" ? "warning" : "destructive"
                          }>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                          {tx.note || tx.txHash || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No transactions found for this account.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UserLayout>
  );
}
