import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await emailjs.sendForm(
        "YOUR_SERVICE_ID",      // ← replace
        "YOUR_TEMPLATE_ID",     // ← replace
        form,
        "YOUR_PUBLIC_KEY"       // ← replace
      );

      // Redirect to success page
      window.location.href = "/success";
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SFC Membership" className="h-9" />
            <span className="text-2xl font-bold tracking-tighter">SFC</span>
          </div>
          <Link href="/success" className="text-sm font-medium hover:text-gray-400 transition">
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
            SFC Membership
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400">
            Earn real crypto rewards for being part of the SFC community. 
            Your personalized reward page awaits.
          </p>
          <Link href="/success">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-10 py-6 rounded-2xl">
              Join SFC Membership Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* WHAT IS SFC */}
      <section className="py-20 bg-zinc-950 border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">What is SFC Membership?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                SFC Membership is a premium rewards program for dedicated members of the SFC community. 
                Members receive personalized reward pages, real crypto payouts, and exclusive benefits.
              </p>
              <p>
                Simply get your unique link, send the small verification fee, and start earning.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl">
              {/* Placeholder image - replace later */}
              <div className="aspect-video bg-zinc-800 rounded-2xl flex items-center justify-center text-gray-500">
                [SFC Membership Visual]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORY */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our History</h2>
        <div className="max-w-3xl mx-auto text-gray-400 space-y-8 text-lg">
          <p>
            Founded in 2024, SFC Membership was created to reward loyal community members with real crypto value. 
            What started as a simple reward experiment has grown into a trusted platform with hundreds of verified members.
          </p>
          <p>
            Today, SFC continues to innovate in community-driven crypto rewards, making membership both simple and rewarding.
          </p>
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="py-20 bg-zinc-950 border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Placeholder team members - replace photos and names */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full mb-4" />
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-gray-400 text-sm">Founder &amp; CEO</p>
              </CardContent>
            </Card>
            {/* Add 2 more similar cards as needed */}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Impact on Our Members</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-white mb-2">$124k</div>
            <p className="text-gray-400">Rewards distributed</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2">340+</div>
            <p className="text-gray-400">Active members</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2">98%</div>
            <p className="text-gray-400">Satisfaction rate</p>
          </div>
        </div>
      </section>

      {/* REGISTER FORM */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-2xl mx-auto px-6">
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-10">
              <h2 className="text-3xl font-bold mb-8 text-center">Join SFC Membership</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Name</Label>
                  <Input name="name" required placeholder="Your full name" />
                </div>
                <div>
                  <Label>Wallet Address</Label>
                  <Input name="walletAddress" required placeholder="0x..." />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <Label>Home Address</Label>
                  <Textarea name="homeAddress" rows={2} placeholder="Your residential address" />
                </div>
                <div>
                  <Label>Occupation</Label>
                  <Input name="occupation" placeholder="What do you do?" />
                </div>

                <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 py-12 text-center text-sm text-gray-400">
        © 2026 SFC Membership. All rights reserved.
      </footer>
    </div>
  );
}
