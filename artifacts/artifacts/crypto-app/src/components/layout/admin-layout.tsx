import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: auth, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!auth?.authenticated) {
    setLocation("/admin/secret-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-950 border-r border-white/10 flex flex-col fixed h-screen">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-black font-bold text-2xl">S</span>
            </div>
            <div>
              <div className="font-semibold tracking-tight text-2xl">SFC</div>
              <div className="text-xs text-zinc-500 -mt-1">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Users size={20} />
            <span className="font-medium">All Users</span>
          </Link>

          <Link 
            href="/admin/users/new" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Users size={20} />
            <span className="font-medium">Create New User</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut size={20} className="mr-3" />
            {logout.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen bg-black">
        <div className="p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
