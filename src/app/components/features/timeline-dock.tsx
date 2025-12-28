"use client";

import React from "react";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { generateGradient } from "@/lib/utils";

interface TimelineDockProps {
  isDark: boolean;
  entries: any[]; 
  activeId?: string;
  onSelect: (entry: any) => void;
}

export function TimelineDock({ isDark, entries = [], activeId, onSelect }: TimelineDockProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return { month: "", day: "" };
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const theme = {
    containerBg: isDark 
      ? "bg-black/40" 
      : "bg-white/80 shadow-2xl border border-white/60",
    
    subText: isDark ? "text-zinc-400" : "text-zinc-500 font-semibold",
    inputText: isDark ? "text-white" : "text-zinc-900 font-bold",
    
    dockItem: isDark 
      ? "bg-white/5 hover:bg-white/10" 
      : "bg-white/40 border border-transparent hover:bg-white hover:shadow-md hover:border-black/5",
      
    activeItem: isDark 
      ? "bg-white/20 ring-1 ring-white/30" 
      : "bg-white shadow-lg ring-1 ring-black/5 border border-black/5",
  };

  return (
    <GlassContainer
      isDark={isDark}
      as="nav"
      // UPDATED: Increased height to h-36 and added py-4 to center the scrollbar vertically
      className={`flex h-36 w-full max-w-4xl items-center gap-4 rounded-2xl px-6 py-4 ${theme.containerBg}`}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto items-center px-2 h-full">
        
        {entries.length === 0 ? (
           <div className="w-full flex justify-center items-center h-full">
             <span className={`text-lg font-medium ${theme.subText} italic`}>
               No entries yet. Start writing above!
             </span>
           </div>
        ) : (
          entries.map((entry) => {
            const { month, day } = formatDate(entry.created_at);
            const isActive = activeId === entry.id;
            const uniqueGradient = generateGradient(entry.id);
            
            return (
              <button 
                key={entry.id} 
                onClick={() => onSelect(entry)}
                className={`group flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-xl p-2 pr-4 transition-all duration-300 outline-none ${isActive ? theme.activeItem : theme.dockItem}`}
              >
                 <div className={`h-10 w-10 rounded-lg shadow-lg flex items-center justify-center text-[10px] font-bold text-white/90 ${uniqueGradient}`}>
                    {entry.mood?.[0] || "?"}
                 </div>
                 
                 <div className="flex flex-col text-left">
                    <span className={`text-[10px] font-bold tracking-wider ${theme.subText}`}>{month} {day}</span>
                    <span className={`text-xs font-medium truncate w-24 ${theme.inputText}`}>{entry.title || "Untitled"}</span>
                 </div>
              </button>
            );
          })
        )}
      </div>
    </GlassContainer>
  );
}