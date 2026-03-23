import { Link, useRoute } from "wouter";
import { Home, History, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function UserLayout({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [isHome] = useRoute(`/u/:slug`);
  const [isHistory] = useRoute(`/u/:slug/history`);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
      {/* Desktop Top Nav */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b bg-background/95 backdrop-blur">
        <Link href="/" className="font-display text-2xl font-bold">Crypto Rewards</Link>
        <div className="flex gap-8 text-sm">
          <Link href={`/u/${slug}`} className={cn(isHome && "text-primary font-semibold")}>Home</Link>
          <Link href={`/u/${slug}/history`} className={cn(isHistory && "text-primary font-semibold")}>History</Link>
        </div>
      </nav>

      {/* Mobile Collapsible Drawer */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur">
        <Link href="/" className="font-display text-2xl font-bold">Crypto Rewards</Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-8 mt-12 text-lg">
              <Link href={`/u/${slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3">🏠 Home</Link>
              <Link href={`/u/${slug}/history`} onClick={() => setOpen(false)} className="flex items-center gap-3">📜 History</Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
