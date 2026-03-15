import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: auth, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!auth?.authenticated) {
    setLocation("/admin/secret-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-foreground flex flex-col md:flex-row relative">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none" 
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/crypto-bg.png)` }}
      />
      
      <aside className="w-full md:w-64 glass-panel md:border-r border-b md:border-b-0 border-white/10 relative z-10 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold text-gradient">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/users/new" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Users size={20} />
            <span className="font-medium">Create User</span>
          </Link>
        </nav>
        
        <div className="p-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut size={20} className="mr-3" />
            {logout.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-10 relative z-10 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
