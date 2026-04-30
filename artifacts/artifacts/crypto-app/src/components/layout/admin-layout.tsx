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
      {/* Top Bar (Mobile + Desktop) */}
      <nav className="border-b border-white/10 bg-black/95 backdrop-blur-md fixed w-full z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-xl">S</span>
          </div>
          <span className="font-semibold tracking-tight">SFC Admin</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/admin" className="hover:text-white transition">Dashboard</Link>
          <Link href="/admin/users" className="hover:text-white transition">Users</Link>
          <Link href="/admin/users/new" className="hover:text-white transition">Create User</Link>
        </div>

        {/* Log Out Button - Visible on all screens */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => logout.mutate()}
          className="text-zinc-400 hover:text-white hidden md:flex"
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-zinc-950 border-white/10 w-72">
            <div className="mt-12 flex flex-col gap-6 text-lg">
              <Link href="/admin" onClick={() => setOpen(false)} className="hover:text-white">Dashboard</Link>
              <Link href="/admin/users" onClick={() => setOpen(false)} className="hover:text-white">All Users</Link>
              <Link href="/admin/users/new" onClick={() => setOpen(false)} className="hover:text-white">Create New User</Link>
              
              <div className="pt-6 border-t border-white/10">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-500"
                  onClick={() => {
                    logout.mutate();
                    setOpen(false);
                  }}
                >
                  <LogOut size={20} className="mr-3" />
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
