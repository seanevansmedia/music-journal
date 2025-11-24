"use client";

import React, { useState } from "react";
import { Play, Plus, Disc, Calendar, Moon, Sun } from "lucide-react";

// Mock Data
const ENTRIES = [
  { day: "24", month: "OCT", title: "Rainy Days", img: "bg-indigo-500" },
  { day: "23", month: "OCT", title: "High Energy", img: "bg-orange-500" },
  { day: "22", month: "OCT", title: "Deep Focus", img: "bg-teal-500" },
  { day: "21", month: "OCT", title: "Night Drive", img: "bg-purple-600" },
];

const TRACKS = [
  { title: "Weightless", artist: "Marconi Union" },
  { title: "Gymnopédie No.1", artist: "Erik Satie" },
  { title: "Daydreaming", artist: "Radiohead" },
];

export default function EtherealPage() {
  const [isDark, setIsDark] = useState(true);

  // Dynamic Theme Classes
  const theme = {
    bg: isDark ? "bg-zinc-950" : "bg-[#e8e6e1]",
    text: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    selection: isDark ? "selection:bg-pink-500/30" : "selection:bg-orange-500/30",
    
    // Glass Card
    card: isDark 
      ? "bg-white/5 border-white/10 shadow-2xl" 
      : "bg-white/60 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]",
    
    // Sidebar
    sidebar: isDark 
      ? "bg-black/20 border-l border-white/5" 
      : "bg-white/40 border-l border-zinc-200/20",
      
    // Inputs
    inputPlaceholder: isDark ? "placeholder-zinc-500" : "placeholder-zinc-400", // Increased contrast
    inputText: isDark ? "text-white" : "text-zinc-900",
    
    // Focus Rings (Accessibility)
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
      
    // Dock
    dock: isDark 
      ? "bg-black/40 border-white/10" 
      : "bg-white/50 border-white/40 shadow-lg",
    dockItem: isDark 
      ? "bg-white/5 hover:bg-white/10" 
      : "bg-white/60 hover:bg-white/80",
  };

  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-700 ${theme.bg} ${theme.text} ${theme.selection}`}>
      
      {/* --- Semantic Header --- */}
      <header className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsDark(!isDark)}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`rounded-full p-3 transition-all duration-500 outline-none ${theme.focusRing} ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-zinc-900 hover:bg-black/10"}`}
        >
          {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>
      </header>

      {/* Decorative Backgrounds (Hidden from Screen Readers) */}
      <div aria-hidden="true" className={`absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-indigo-600/30" : "bg-blue-400/20"}`} />
      <div aria-hidden="true" className={`absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-rose-600/20" : "bg-orange-300/20"}`} />

      <main className="z-10 flex h-full flex-col items-center justify-center gap-8 p-6">
        
        {/* --- Main Content Area --- */}
        <section 
          aria-label="Journal Editor"
          className={`flex h-[70vh] w-full max-w-6xl overflow-hidden rounded-[3rem] border backdrop-blur-2xl lg:flex-row transition-all duration-700 ${theme.card}`}
        >
          
          {/* Left: Editor */}
          <article className="flex flex-1 flex-col p-10 lg:p-16">
            <div className={`mb-8 flex items-center gap-3 text-sm font-medium tracking-widest uppercase ${theme.subText}`}>
              <Calendar size={14} aria-hidden="true" />
              <time dateTime="2025-10-25">October 25, 2025</time>
            </div>
            
            <label htmlFor="entry-title" className="sr-only">Journal Entry Title</label>
            <input 
              id="entry-title"
              type="text" 
              placeholder="How are you feeling today?"
              className={`mb-6 bg-transparent text-4xl font-light focus:outline-none rounded-lg ${theme.inputText} ${theme.inputPlaceholder} ${theme.focusRing}`}
            />
            
            <label htmlFor="entry-body" className="sr-only">Journal Entry Text</label>
            <textarea 
              id="entry-body"
              className={`flex-1 resize-none bg-transparent text-lg font-light leading-loose focus:outline-none rounded-lg p-5 ${theme.inputText} ${theme.inputPlaceholder} ${theme.focusRing}`}
              placeholder="Breathe in. Write it out. What is the texture of your thoughts today?"
            />

            {/* Action Bar */}
            <div className="mt-8 flex items-center justify-between">
               <button className={`rounded-full px-8 py-3 font-semibold transition outline-none cursor-pointer ${theme.actionButton} ${theme.focusRing}`}>
                 Create Mix
               </button>

               <div className="flex gap-2" role="group" aria-label="Select Mood">
                 {['Dreamy', 'Sad', 'Floating'].map(tag => (
                   <button 
                    key={tag} 
                    aria-label={`Select mood: ${tag}`}
                    className={`rounded-full border px-3 py-1 text-xs cursor-pointer transition outline-none ${theme.tag} ${theme.focusRing}`}
                   >
                     {tag}
                   </button>
                 ))}
               </div>
            </div>
          </article>

          {/* Right: Player Aside */}
          <aside aria-label="Generated Playlist" className={`w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 ${theme.sidebar}`}>
            <div className={`mb-8 flex aspect-square w-full items-center justify-center rounded-2xl shadow-lg ${isDark ? "bg-gradient-to-tr from-indigo-500 to-rose-500" : "bg-gradient-to-tr from-blue-200 to-pink-200"}`}>
               <Disc size={64} className={`${isDark ? "text-white/80" : "text-white"} animate-spin-slow`} aria-hidden="true" />
            </div>

            <div className="mb-6">
              <h2 className={`text-2xl font-medium ${theme.inputText}`}>Ethereal Drift</h2>
              <p className={`text-sm ${theme.subText}`}>Generated based on your entry</p>
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto">
              {TRACKS.map((track, i) => (
                <li 
                  key={i} 
                  tabIndex={0} // Make focusable
                  className={`flex items-center justify-between group cursor-pointer rounded-lg p-1 outline-none ${theme.focusRing}`}
                  aria-label={`Play track ${track.title} by ${track.artist}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isDark ? "bg-white/10 text-white group-hover:bg-white group-hover:text-black" : "bg-black/5 text-black group-hover:bg-black group-hover:text-white"}`}>
                      <Play size={12} fill="currentColor" aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.inputText}`}>{track.title}</p>
                      <p className={`text-xs ${theme.subText}`}>{track.artist}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${theme.subText}`}>3:42</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* --- Timeline Nav --- */}
        <nav 
          aria-label="Journal Timeline"
          className={`flex h-24 w-full max-w-4xl items-center gap-4 rounded-2xl border px-6 backdrop-blur-xl transition-all duration-700 ${theme.dock}`}
        >
           <button 
            aria-label="Create New Entry"
            className={`flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed transition outline-none ${theme.focusRing} ${isDark ? "border-zinc-600 text-zinc-500 hover:border-white hover:text-white" : "border-zinc-400 text-zinc-400 hover:border-zinc-800 hover:text-zinc-800"}`}
           >
              <Plus size={24} aria-hidden="true" />
           </button>
           
           <div className={`h-8 w-[1px] mx-2 ${isDark ? "bg-zinc-800" : "bg-zinc-300"}`} role="separator" />
           
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
        </nav>

      </main>
    </div>
  );
}