"use client";

import React from "react";
import { Calendar, Sparkles } from "lucide-react";

interface JournalEditorProps {
  isDark: boolean;
}

export function JournalEditor({ isDark }: JournalEditorProps) {
  
  // Theme logic specific to the editor
  const theme = {
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    inputPlaceholder: isDark ? "placeholder-zinc-500" : "placeholder-zinc-400",
    inputText: isDark ? "text-white" : "text-zinc-900",
    
    // Accessibility Focus Rings
    focusRing: isDark 
      ? "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
      : "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e6e1]",

    // Buttons & Tags
    actionButton: isDark 
      ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
      : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg",
    
    tag: isDark
      ? "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
      : "border-black/5 bg-black/5 text-zinc-600 hover:bg-black/10",
  };

  return (
    <article className="flex flex-1 flex-col p-10 lg:p-16">
      <div className={`mb-8 flex items-center gap-3 text-sm font-medium tracking-widest uppercase ${theme.subText}`}>
        <Calendar size={14} aria-hidden="true" />
        <time dateTime="2025-10-25">October 25, 2025</time>
      </div>
      
      <label htmlFor="entry-title" className="sr-only">Journal Entry Title</label>
      <input 
        id="entry-title"
        type="text" 
        placeholder="Title your day..."
        className={`mb-6 bg-transparent text-4xl font-light focus:outline-none rounded-lg ${theme.inputText} ${theme.inputPlaceholder} ${theme.focusRing}`}
      />
      
      <label htmlFor="entry-body" className="sr-only">Journal Entry Text</label>
      <textarea 
        id="entry-body"
        className={`flex-1 resize-none bg-transparent text-lg font-light leading-loose focus:outline-none rounded-lg ${theme.inputText} ${theme.inputPlaceholder} ${theme.focusRing}`}
        placeholder="Breathe in. Write it out. What is the texture of your thoughts today?"
      />

      {/* Action Bar */}
      <div className="mt-8 flex items-center justify-between">
         <button className={`group flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition outline-none cursor-pointer ${theme.actionButton} ${theme.focusRing}`}>
           <Sparkles size={16} className={isDark ? "text-purple-600" : "text-yellow-400"} />
           <span>Create Mix</span>
         </button>

         <div className="flex gap-2" role="group" aria-label="Select Mood">
           {['Dreamy', 'Sad', 'Floating'].map(tag => (
             <button 
              key={tag} 
              aria-label={`Select mood: ${tag}`}
              className={`rounded-full border px-3 py-1 text-xs transition outline-none cursor-pointer ${theme.tag} ${theme.focusRing}`}
             >
               {tag}
             </button>
           ))}
         </div>
      </div>
    </article>
  );
}