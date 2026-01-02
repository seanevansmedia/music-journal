"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Trash2, AlertCircle, BarChart2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { JournalEditor } from "@/app/components/features/journal-editor";
import { PlayerSidebar } from "@/app/components/features/player-sidebar";
import { TimelineDock } from "@/app/components/features/timeline-dock";
import { MoodChart } from "@/app/components/features/mood-chart";
import { getSessionId } from "@/lib/data";

interface ClientPageRootProps {
  user: User | null;
  initialEntries: any[];
}

export function ClientPageRoot({ user, initialEntries }: ClientPageRootProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [entries, setEntries] = useState<any[]>(initialEntries);
  const [activeEntry, setActiveEntry] = useState<any>(initialEntries[0] || null);
  const [sessionId, setSessionId] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  
  // 🛠️ LIFTED STATE: Controls music globally
  const [isPlaying, setIsPlaying] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setHasMounted(true);
    const id = user?.id || getSessionId();
    setSessionId(id);

    if (!user) {
      const fetchGuestData = async () => {
        const { data } = await supabase.from("entries").select("*").eq("session_id", id).order("created_at", { ascending: false });
        if (data) {
          setEntries(data);
          if (data.length > 0 && !activeEntry) setActiveEntry(data[0]);
        }
      };
      fetchGuestData();
    }
  }, [user]);

  const refreshData = async () => {
    const id = user?.id || sessionId;
    const { data } = await supabase.from("entries").select("*").eq(user ? "user_id" : "session_id", id).order("created_at", { ascending: false });
    if (data) {
      setEntries(data);
      // 🛠️ AUTOMATICALLY play the newly generated entry
      setActiveEntry(data[0]);
      setIsPlaying(true);
    }
  };

  const handleCreateNew = () => {
    setActiveEntry(null);
    setShowStats(false);
    // 🛠️ STOP music when writing new entry
    setIsPlaying(false);
  };

  const handleSelectEntry = (entry: any) => {
    setActiveEntry(entry);
    setShowStats(false);
  };

  const theme = {
    bg: isDark ? "bg-zinc-950" : "bg-[#e8e6e1]",
    text: isDark ? "text-white" : "text-zinc-900",
    blob1: isDark ? "bg-indigo-600/20" : "bg-blue-600/30",
    blob2: isDark ? "bg-rose-600/10" : "bg-orange-500/20",
    headerBtn: isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-black/5 border-black/10 hover:bg-black/10 text-zinc-900"
  };

  if (!hasMounted) return <div className={`h-screen w-full ${theme.bg}`} />;

  return (
    <div className={`relative flex flex-col min-h-screen lg:h-screen w-full overflow-x-hidden transition-colors duration-1000 ${theme.bg} ${theme.text}`}>
      <div aria-hidden="true" className={`absolute -top-20 -left-20 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full blur-[80px] md:blur-[120px] transition-colors duration-1000 ${theme.blob1}`} />
      <div aria-hidden="true" className={`absolute bottom-0 right-0 h-[400px] w-[400px] md:h-[600px] md:w-[600px] rounded-full blur-[80px] md:blur-[120px] transition-colors duration-1000 ${theme.blob2}`} />

      <main className="z-10 flex flex-col items-center justify-start lg:justify-center gap-4 p-4 md:p-6 lg:h-full w-full">
        <div className="flex gap-4 z-50 mt-2 lg:mt-0">
          <button onClick={() => setShowStats(!showStats)} className={`rounded-full p-3 border transition-all cursor-pointer backdrop-blur-md ${showStats ? "bg-indigo-500 text-white border-indigo-400" : theme.headerBtn}`}><BarChart2 size={22} /></button>
          <button onClick={() => setIsDark(!isDark)} className={`rounded-full p-3 border backdrop-blur-md cursor-pointer transition-all ${theme.headerBtn}`}>{isDark ? <Sun size={22} /> : <Moon size={22} />}</button>
          {entries.length > 0 && (
            <button onClick={() => setShowClearHistoryConfirm(true)} className={`rounded-full p-3 border backdrop-blur-md cursor-pointer transition-all ${theme.headerBtn}`} title="Clear History"><Trash2 size={22} /></button>
          )}
        </div>

        <GlassContainer isDark={isDark} as="section" className="flex flex-col h-auto lg:h-[72vh] w-full max-w-6xl rounded-[2rem] lg:rounded-[3rem] lg:flex-row lg:overflow-hidden shadow-2xl border border-white/10">
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
                onDelete={() => { setActiveEntry(null); refreshData(); }}
              />
              <PlayerSidebar 
                isDark={isDark} 
                playlist={activeEntry?.playlist || []}
                mood={activeEntry?.mood || "Create"}
                entryId={activeEntry?.id} 
                // 🛠️ PASS state down
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </>
          )}
        </GlassContainer>

        <TimelineDock isDark={isDark} entries={entries} activeId={activeEntry?.id} onSelect={handleSelectEntry} />
      </main>

      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
           <AlertCircle size={48} className="text-red-500 mb-4" />
           <h2 className="text-2xl font-bold mb-2 text-white">Clear all entries?</h2>
           <div className="flex gap-4 mt-8">
              <button onClick={() => setShowClearHistoryConfirm(false)} className="px-8 py-3 text-zinc-400 font-bold uppercase tracking-wider text-xs cursor-pointer hover:text-white transition-colors">Cancel</button>
              <button onClick={async () => { await supabase.from("entries").delete().eq(user ? "user_id" : "session_id", sessionId); setEntries([]); setActiveEntry(null); setShowClearHistoryConfirm(false); setIsPlaying(false); }} className="px-10 py-3 bg-red-600 text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-lg cursor-pointer hover:bg-red-500 transition-all">Clear All</button>
           </div>
        </div>
      )}
    </div>
  );
}