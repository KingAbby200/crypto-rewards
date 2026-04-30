import { Link, useRoute } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function UserLayout({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [isHome] = useRoute(`/u/:slug`);
  const [isHistory] = useRoute(`/u/:slug/history`);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Top Navigation */}
      <nav className="border-b border-white/10 bg-black/95 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-xl">S</span>
            </div>
            <span className="font-semibold tracking-tight text-xl">SFC Membership</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm">
            <Link 
              href={`/u/${slug}`} 
              className={cn("hover:text-white transition", isHome && "text-white font-medium")}
            >
              Dashboard
            </Link>
            <Link 
              href={`/u/${slug}/history`} 
              className={cn("hover:text-white transition", isHistory && "text-white font-medium")}
            >
              Transaction History
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-white/10">
              <div className="flex flex-col gap-8 mt-12 text-lg">
                <Link 
                  href={`/u/${slug}`} 
                  onClick={() => setOpen(false)}
                  className="hover:text-white transition"
                >
                  Dashboard
                </Link>
                <Link 
                  href={`/u/${slug}/history`} 
                  onClick={() => setOpen(false)}
                  className="hover:text-white transition"
                >
                  Transaction History
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
