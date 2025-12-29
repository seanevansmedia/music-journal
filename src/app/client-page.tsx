"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Trash2, AlertCircle, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { JournalEditor } from "@/app/components/features/journal-editor";
import { PlayerSidebar } from "@/app/components/features/player-sidebar";
import { TimelineDock } from "@/app/components/features/timeline-dock";
import { MoodChart } from "@/app/components/features/mood-chart";
import { getSessionId } from "@/lib/data";

export function ClientPageRoot() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [showStats, setShowStats] = useState(false);
  
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setHasMounted(true);
    const id = getSessionId();
    setSessionId(id);

    const fetchEntries = async () => {
      const { data } = await supabase
        .from("entries")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: false });

      if (data) {
        setEntries(data);
        if (data.length > 0) setActiveEntry(data[0]);
      }
    };
    fetchEntries();
  }, []);

  const refreshData = async () => {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    if (data) {
      setEntries(data);
      if (!activeEntry) setActiveEntry(data[0]);
    }
  };

  const handleCreateNew = () => {
    setShowStats(false);
    setActiveEntry(null);
  };

  const handleSelectEntry = (entry: any) => {
    setShowStats(false);
    setActiveEntry(entry);
  };

  const handleDeleteEntry = async (id: string) => {
    await supabase.from("entries").delete().eq("id", id);
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    setActiveEntry(null); 
  };

  const requestClearHistory = () => setShowClearHistoryConfirm(true);

  const performClearHistory = async () => {
    await supabase.from("entries").delete().eq("session_id", sessionId);
    setEntries([]);
    setActiveEntry(null);
    setShowClearHistoryConfirm(false);
  };

  const theme = {
    bg: isDark ? "bg-zinc-950" : "bg-[#e8e6e1]",
    text: isDark ? "text-white" : "text-zinc-900",
  };

  const headerBtnClass = `rounded-full p-3 transition-all duration-300 outline-none cursor-pointer ${
    isDark 
      ? "bg-white/10 hover:bg-white/20 text-white" 
      : "bg-black/5 hover:bg-black/10 text-zinc-900"
  }`;

  const sharedScroll = "[&_*::-webkit-scrollbar]:w-1.5 [&_*::-webkit-scrollbar]:h-1.5 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:rounded-full";
  const colorScroll = isDark 
    ? "[&_*::-webkit-scrollbar-thumb]:bg-white/10 [&_*::-webkit-scrollbar-thumb]:hover:bg-white/20"
    : "[&_*::-webkit-scrollbar-thumb]:bg-black/10 [&_*::-webkit-scrollbar-thumb]:hover:bg-black/20";

  if (!hasMounted) return <div className={`h-screen w-full ${theme.bg}`} />;

  return (
    <div className={`relative flex flex-col min-h-screen lg:h-screen w-full lg:overflow-hidden transition-colors duration-700 ${theme.bg} ${theme.text} ${sharedScroll} ${colorScroll}`}>
      
      {/* Backgrounds */}
      <div aria-hidden="true" className={`absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-indigo-600/30" : "bg-blue-600/40"}`} />
      <div aria-hidden="true" className={`absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-rose-600/20" : "bg-orange-500/30"}`} />

      {/* 
         MAIN CONTENT AREA
         - CHANGE: Reduced 'pt-20' to 'pt-6' on mobile to lessen top padding above icons.
      */}
      <main className="z-10 flex flex-col items-center justify-center gap-6 p-6 pt-6 lg:p-6 lg:h-full">
        
        {/* Header Icons */}
        <div className="flex gap-4 z-50">
           {entries.length > 0 && (
             <>
               <button 
                  onClick={() => setShowStats(!showStats)} 
                  className={`${headerBtnClass} ${showStats ? (isDark ? "bg-white/30" : "bg-black/20") : ""}`} 
                  title={showStats ? "Close Stats" : "View Vibe History"}
               >
                 <BarChart2 size={24} />
               </button>

               <button onClick={requestClearHistory} className={headerBtnClass} title="Clear All History">
                 <Trash2 size={24} />
               </button>
             </>
           )}
           <button onClick={() => setIsDark(!isDark)} className={headerBtnClass} title="Toggle Theme">
             {isDark ? <Sun size={24} /> : <Moon size={24} />}
           </button>
        </div>

        {/* Glass Container */}
        <GlassContainer 
          isDark={isDark} 
          as="section" 
          className="flex flex-col h-auto w-full max-w-6xl rounded-[2rem] mt-4 mb-4 xl:mt-0 xl:mb-0 xl:h-[75vh] xl:flex-row xl:overflow-hidden xl:rounded-[3rem]"
        >
          {showStats ? (
            <MoodChart entries={entries} onClose={() => setShowStats(false)} isDark={isDark} />
          ) : (
            <>
              <JournalEditor 
                isDark={isDark} 
                entry={activeEntry} 
                onCreateNew={handleCreateNew} 
                onSuccess={refreshData}
                sessionId={sessionId}
                onDelete={handleDeleteEntry}
                hasEntries={entries.length > 0}
              />
              
              <PlayerSidebar 
                isDark={isDark} 
                playlist={activeEntry?.playlist || []}
                mood={activeEntry?.mood || "Create"}
                entryId={activeEntry?.id} 
              />
            </>
          )}
        </GlassContainer>

        {/* Timeline */}
        <TimelineDock 
          isDark={isDark} 
          entries={entries} 
          activeId={activeEntry?.id}
          onSelect={handleSelectEntry} 
        />

      </main>

      {/* Delete Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-w-md w-full">
            <AlertCircle size={64} className="text-red-500 mb-6 mx-auto" />
            <h3 className="text-3xl font-bold text-white mb-2">Clear History?</h3>
            <p className="text-zinc-400 mb-10 text-lg">
              This will permanently delete <strong>all {entries.length} journal entries</strong>.
            </p>
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={performClearHistory}
                className="px-10 py-4 bg-red-600 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-red-500 hover:scale-105 transition-all shadow-lg cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}