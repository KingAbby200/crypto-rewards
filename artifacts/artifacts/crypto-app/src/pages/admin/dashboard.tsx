import { useUsers } from "@/hooks/use-users";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { formatEth, truncateWallet } from "@/lib/utils";
import { Link } from "wouter";
import { Users, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const { data: users, isLoading } = useUsers();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Users Overview</h2>
          <p className="text-muted-foreground mt-2">Manage personalized user pages and balances.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users && users.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link key={user.id} href={`/admin/users/${user.slug}`}>
                <Card className="hover:border-primary/50 cursor-pointer group hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{truncateWallet(user.walletAddress)}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
                        <p className="text-lg font-bold text-white">{formatEth(user.eligibleBalance)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Fee</p>
                        <p className="text-sm font-medium text-destructive">{formatEth(user.withdrawalFeeEth)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-6">Create a user to generate their personalized dashboard.</p>
              <Link href="/admin/users/new" className="text-primary hover:underline font-medium">Create First User</Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
