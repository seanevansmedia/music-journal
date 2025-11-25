"use client";

import React from "react";
import { Plus } from "lucide-react";
import { GlassContainer } from "@/app/components/ui/glass-container";

interface TimelineDockProps {
  isDark: boolean;
}

// Mock Data (Moved from page.tsx)
const ENTRIES = [
  { day: "24", month: "OCT", title: "Rainy Days", img: "bg-indigo-500" },
  { day: "23", month: "OCT", title: "High Energy", img: "bg-orange-500" },
  { day: "22", month: "OCT", title: "Deep Focus", img: "bg-teal-500" },
  { day: "21", month: "OCT", title: "Night Drive", img: "bg-purple-600" },
];

export function TimelineDock({ isDark }: TimelineDockProps) {
  
  // Theme logic specific to the dock
  const theme = {
    // Background colors (passed to GlassContainer className)
    containerBg: isDark ? "bg-black/40" : "bg-white/50",
    
    // Text
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    inputText: isDark ? "text-white" : "text-zinc-900",

    // Interactive Elements
    dockItem: isDark 
      ? "bg-white/5 hover:bg-white/10" 
      : "bg-white/60 hover:bg-white/80",
      
    // The "New Entry" Plus Button
    plusBtn: isDark 
      ? "border-zinc-600 text-zinc-500 hover:border-white hover:text-white" 
      : "border-zinc-400 text-zinc-400 hover:border-zinc-800 hover:text-zinc-800",

    // Separator Line
    separator: isDark ? "bg-zinc-800" : "bg-zinc-300",
    
    // Accessibility Focus Rings
    focusRing: isDark 
      ? "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
      : "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e6e1]",
  };

  return (
    <GlassContainer
      isDark={isDark}
      as="nav"
      ariaLabel="Journal Timeline"
      className={`flex h-24 w-full max-w-4xl items-center gap-4 rounded-2xl px-6 ${theme.containerBg}`}
    >
      {/* New Entry Button */}
      <button 
        aria-label="Create New Entry"
        className={`flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed transition outline-none ${theme.plusBtn} ${theme.focusRing}`}
      >
        <Plus size={24} aria-hidden="true" />
      </button>
       
      {/* Vertical Separator */}
      <div className={`h-8 w-[1px] mx-2 ${theme.separator}`} role="separator" />
       
      {/* Scrollable List */}
      <div className="flex flex-1 gap-4 overflow-x-auto scrollbar-hide items-center">
        {ENTRIES.map((entry, i) => (
          <button 
            key={i} 
            aria-label={`View entry for ${entry.month} ${entry.day}: ${entry.title}`}
            className={`group flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-xl p-2 pr-4 transition outline-none ${theme.dockItem} ${theme.focusRing}`}
          >
             {/* Decorative visual block for image placeholder */}
             <div aria-hidden="true" className={`h-10 w-10 rounded-lg ${entry.img} opacity-80`} />
             
             <div className="flex flex-col text-left">
                <span className={`text-[10px] font-bold tracking-wider ${theme.subText}`}>{entry.month} {entry.day}</span>
                <span className={`text-xs font-medium ${theme.inputText}`}>{entry.title}</span>
             </div>
          </button>
        ))}
      </div>
    </GlassContainer>
  );
}