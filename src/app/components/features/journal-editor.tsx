"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Sparkles, Loader2, ArrowLeft, PenTool, CheckCircle2, XCircle, Trash2, BarChart2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VIBE_DB, determineMood, shuffle } from "@/lib/data";

interface JournalEditorProps {
  isDark: boolean;
  entry?: any; 
  onCreateNew?: () => void; 
  onSuccess?: () => void;
  onDelete?: (id: string) => void;
  onShowStats?: () => void;
  sessionId?: string;
  hasEntries?: boolean;
}

export function JournalEditor({ isDark, entry, onCreateNew, onSuccess, onDelete, sessionId }: JournalEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function handleSave(formData: FormData) {
    if (!sessionId) return; 
    setIsSaving(true);
    setNotification(null);

    try {
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      if (!title.trim() || !content.trim()) {
        setNotification({ type: 'error', message: "Please fill out both fields." });
        setIsSaving(false);
        return;
      }

      const mood = determineMood(content + " " + title);
      const songPool = VIBE_DB[mood] || VIBE_DB["Dreamy"];
      const generatedPlaylist = shuffle([...songPool]).slice(0, 5);

      const { error } = await supabase.from("entries").insert({
        session_id: sessionId, 
        title,
        content,
        mood,
        playlist: generatedPlaylist,
      });

      if (error) throw error;
      if (onSuccess) onSuccess();
      
      setNotification({ type: 'success', message: "Mix Generated Successfully" });
    } catch (e) {
      setNotification({ type: 'error', message: "Failed to save to cloud." });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete && entry) {
      onDelete(entry.id);
    }
    setShowDeleteConfirm(false);
  };

  const theme = {
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    inputPlaceholder: isDark ? "placeholder-zinc-500" : "placeholder-zinc-400",
    inputText: isDark ? "text-white" : "text-zinc-900",
    focusRing: isDark 
      ? "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
      : "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e6e1]",
    actionButton: isDark 
      ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
      : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg",
    secondaryButton: isDark
      ? "border border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
      : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-black",
  };

  // --- VIEW MODE ---
  if (entry) {
    const date = new Date(entry.created_at).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });

    return (
      <article className="flex flex-1 flex-col p-6 lg:p-16 h-full relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 px-4">
           <div className={`flex items-center gap-3 text-sm font-medium tracking-widest uppercase ${theme.subText}`}>
              <Calendar size={14} />
              <time>{date}</time>
           </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
           <h1 className={`text-4xl font-light mb-6 leading-tight px-4 ${theme.inputText}`}>{entry.title}</h1>
           <p className={`text-lg leading-loose whitespace-pre-wrap px-4 ${theme.subText} font-light`}>
             {entry.content}
           </p>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-row justify-between items-center gap-4 relative px-4">
           
           {/* Left: Write New Entry Button */}
           <button 
             onClick={onCreateNew}
             className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-4 md:px-6 py-3 rounded-full text-[11px] md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${theme.secondaryButton}`}
           >
             <ArrowLeft size={16} /> Write New Entry
           </button>
           
           {/* Right: Trash Can (Updated styling for both Mobile and Desktop) */}
           {onDelete && (
              <button 
                onClick={handleDeleteClick} 
                /* 
                   FIX: Unified red styling. 
                   bg-red-500/10 provides a soft glow.
                   border-red-500/20 adds subtle definition.
                   text-red-500 makes the icon pop.
                */
                className={`
                  p-3 md:p-2.5 rounded-full flex-shrink-0 transition-all cursor-pointer
                  bg-red-500/10 hover:bg-red-500/20 
                  border border-red-500/20 hover:border-red-500/40
                  text-red-500 shadow-sm
                `}
                title="Delete Entry"
              >
                <Trash2 size={24} />
              </button>
            )}
        </div>

        {/* DELETE MODAL */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-200 z-50">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Delete this entry?</h3>
            <p className="text-zinc-400 mb-8 max-w-xs">This action cannot be undone.</p>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center px-8">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-8 py-4 md:py-3 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:scale-105 transition-all shadow-lg cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }

  // --- CREATE MODE ---
  return (
    <article className="flex flex-1 flex-col p-6 lg:p-16 relative">
      <div className="flex items-center justify-between mb-8 px-4">
        <div className={`flex items-center gap-3 text-sm font-medium tracking-widest uppercase ${theme.subText}`}>
          <PenTool size={14} aria-hidden="true" />
          <span>New Entry</span>
        </div>
      </div>
      
      <form action={handleSave} className="flex flex-col flex-1 h-full">
        <label htmlFor="entry-title" className="sr-only">Journal Entry Title</label>
        <input 
          id="entry-title"
          name="title" 
          type="text" 
          placeholder="Title your day..."
          className={`mb-2 bg-transparent text-4xl font-light focus:outline-none rounded-lg px-4 py-2 ${theme.inputText} ${theme.inputPlaceholder}`}
        />
        
        <label htmlFor="entry-body" className="sr-only">Journal Entry Text</label>
        <textarea 
          id="entry-body"
          name="content" 
          className={`flex-1 min-h-[30vh] lg:min-h-0 resize-none bg-transparent text-lg font-light leading-loose focus:outline-none rounded-lg p-4 ${theme.inputText} ${theme.inputPlaceholder}`}
          placeholder="Breathe in. Write it out. What is the texture of your thoughts today?"
        />

        <div className="mt-8 flex items-center justify-center lg:justify-start relative px-4 w-full">
           <button 
            type="submit"
            disabled={isSaving}
            className={`group flex items-center justify-center gap-2 rounded-full w-full lg:w-auto flex-shrink-0 px-8 py-4 lg:py-3 font-semibold transition-all hover:scale-[1.02] outline-none cursor-pointer whitespace-nowrap ${theme.actionButton} disabled:opacity-50`}
           >
             {isSaving ? (
               <Loader2 size={16} className="animate-spin" />
             ) : (
               <Sparkles size={16} className={isDark ? "text-purple-600" : "text-yellow-400"} />
             )}
             <span>{isSaving ? "Generating..." : "Save Entry & Create Mix"}</span>
           </button>

           {notification && (
             <div className={`
                absolute left-4 -top-20 md:-top-16 flex items-center gap-3 px-6 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-300 z-10
                ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
             `}>
                {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span className="text-sm font-medium">{notification.message}</span>
             </div>
           )}
        </div>
      </form>
    </article>
  );
}