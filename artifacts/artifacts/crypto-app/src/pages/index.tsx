import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wallet, Shield, ArrowRight } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 max-w-lg relative z-10"
      >
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,212,255,0.2)]">
          <Wallet className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">CryptoRewards</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Your personalized rewards portal
          </p>
        </div>

        {/* Info box */}
        <div className="glass-panel rounded-xl p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              This portal is accessible only via a personalized link.
              If you received one, visit <span className="text-primary font-mono">/u/your-name</span> to view your rewards.
            </p>
          </div>
        </div>

        {/* Admin link */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation("/admin/secret-login")}
          className="flex items-center gap-2 mx-auto text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          Admin access
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </motion.div>
    </div>
  );
}
