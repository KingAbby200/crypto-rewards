import { Link, useRoute } from "wouter";
import { Home, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserLayout({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [isHome] = useRoute(`/u/:slug`);
  const [isHistory] = useRoute(`/u/:slug/history`);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none" 
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/crypto-bg.png)` }}
      />
      <div className="relative z-10">
        {children}
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">
        <Link href={`/u/${slug}`} className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300",
          isHome ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-muted-foreground hover:text-foreground hover:scale-105"
        )}>
          <Home size={24} strokeWidth={isHome ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </Link>
        <div className="w-px h-8 bg-white/10" />
        <Link href={`/u/${slug}/history`} className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300",
          isHistory ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-muted-foreground hover:text-foreground hover:scale-105"
        )}>
          <History size={24} strokeWidth={isHistory ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">History</span>
        </Link>
      </nav>
    </div>
  );
}
