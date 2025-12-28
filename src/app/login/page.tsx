"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Music2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassContainer } from "@/app/components/ui/glass-container";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign Up Logic
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Success! Check your email for the confirmation link.");
      } else {
        // Sign In Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/"); // Send to Dashboard
        router.refresh(); // Refresh to update middleware state
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    input: "bg-white/5 border border-white/10 text-white placeholder-zinc-500 rounded-xl p-4 outline-none focus:bg-white/10 focus:border-white/20 transition w-full focus:ring-2 focus:ring-indigo-500/50",
    button: "w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl p-4 transition shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
    label: "text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block"
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white selection:bg-pink-500/30 p-6">
      
      {/* Background Ambiance */}
      <div aria-hidden="true" className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
      <div aria-hidden="true" className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-rose-600/20 blur-[120px] animate-pulse delay-700" />

      {/* Login Card */}
      <GlassContainer isDark={true} className="w-full max-w-md p-8 md:p-12 flex flex-col gap-8 rounded-[2.5rem]">
        
        <div className="text-center flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-lg">
            <Music2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Sonic Journal</h1>
          <p className="text-zinc-400">Log in to sync your timeline.</p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className={theme.label}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={theme.input}
            />
          </div>

          <div>
            <label htmlFor="password" className={theme.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={theme.input}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200 text-center animate-pulse">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-200 text-center">
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className={theme.button}>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500 border-t border-white/5 pt-6">
          {isSignUp ? "Already have an account?" : "First time here?"}{" "}
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-white hover:text-indigo-400 font-medium transition hover:underline underline-offset-4"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </div>

      </GlassContainer>
    </div>
  );
}