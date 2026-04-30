import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: auth, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!auth?.authenticated) {
    setLocation("/admin/secret-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar - Mobile */}
      <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-md fixed w-full z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-xl">S</span>
          </div>
          <span className="font-semibold tracking-tight">SFC Admin</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-950 border-white/10 w-72">
            <div className="mt-8 space-y-6">
              <Link href="/admin" className="flex items-center gap-3 text-lg" onClick={() => setOpen(false)}>
                <LayoutDashboard size={22} />
                Dashboard
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 text-lg" onClick={() => setOpen(false)}>
                <Users size={22} />
                All Users
              </Link>
              <Link href="/admin/users/new" className="flex items-center gap-3 text-lg" onClick={() => setOpen(false)}>
                <Users size={22} />
                Create User
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-zinc-950 border-r border-white/10 flex-col fixed h-screen">
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

        <nav className="flex-1 px-6 py-10 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-white/5 transition">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-white/5 transition">
            <Users size={20} />
            <span className="font-medium">All Users</span>
          </Link>
          <Link href="/admin/users/new" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-white/5 transition">
            <Users size={20} />
            <span className="font-medium">Create New User</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5"
            onClick={() => logout.mutate()}
          >
            <LogOut size={20} className="mr-3" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen bg-black">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
