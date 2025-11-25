"use client";

import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { JournalEditor } from "@/app/components/features/journal-editor";
import { PlayerSidebar } from "@/app/components/features/player-sidebar";
import { TimelineDock } from "@/app/components/features/timeline-dock";

export default function EtherealPage() {
  const [isDark, setIsDark] = useState(true);

  // Dynamic Theme Classes (Global Page Level)
  const theme = {
    bg: isDark ? "bg-zinc-950" : "bg-[#e8e6e1]",
    text: isDark ? "text-white" : "text-zinc-900",
    selection: isDark ? "selection:bg-pink-500/30" : "selection:bg-orange-500/30",
    
    // Focus Rings (for the theme toggle)
    focusRing: isDark 
      ? "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
      : "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e6e1]",
  };

  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-700 ${theme.bg} ${theme.text} ${theme.selection}`}>
      
      {/* --- Semantic Header (Theme Toggle) --- */}
      <header className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsDark(!isDark)}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`rounded-full p-3 transition-all duration-500 outline-none cursor-pointer ${theme.focusRing} ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-zinc-900 hover:bg-black/10"}`}
        >
          {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>
      </header>

      {/* Decorative Backgrounds (Aria Hidden) */}
      <div aria-hidden="true" className={`absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-indigo-600/30" : "bg-blue-400/20"}`} />
      <div aria-hidden="true" className={`absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-rose-600/20" : "bg-orange-300/20"}`} />

      <main className="z-10 flex h-full flex-col items-center justify-center gap-8 p-6">
        
        {/* --- Main Content Area --- */}
        <GlassContainer 
          isDark={isDark}
          as="section"
          ariaLabel="Journal Editor"
          className="flex h-[70vh] w-full max-w-6xl overflow-hidden rounded-[3rem] lg:flex-row"
        >
          {/* Left: Editor Component */}
          <JournalEditor isDark={isDark} />

          {/* Right: Player Component */}
          <PlayerSidebar isDark={isDark} />
        </GlassContainer>

        {/* --- Timeline Dock --- */}
        <TimelineDock isDark={isDark} />

      </main>
    </div>
  );
}