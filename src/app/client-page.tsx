"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { JournalEditor } from "@/app/components/features/journal-editor";
import { PlayerSidebar } from "@/app/components/features/player-sidebar";
import { TimelineDock } from "@/app/components/features/timeline-dock";
import { MoodChart } from "@/app/components/features/mood-chart";
import { getSessionId } from "@/lib/data";

export function ClientPageRoot() {
  const [isDark, setIsDark] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [showStats, setShowStats] = useState(false);

  const supabase = createClient();

  useEffect(() => {
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

  const handleClearHistory = async () => {
    if(confirm("Delete all history?")) {
      await supabase.from("entries").delete().eq("session_id", sessionId);
      setEntries([]);
      setActiveEntry(null);
    }
  }

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

  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-700 ${theme.bg} ${theme.text} ${sharedScroll} ${colorScroll}`}>
      
      {/* Header */}
      <header className="absolute top-6 right-6 z-50 flex gap-3">
        {entries.length > 0 && (
          <button onClick={handleClearHistory} className={headerBtnClass} title="Clear All History">
            <Trash2 size={24} />
          </button>
        )}
        <button onClick={() => setIsDark(!isDark)} className={headerBtnClass} title="Toggle Theme">
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      {/* Backgrounds */}
      <div aria-hidden="true" className={`absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-indigo-600/30" : "bg-blue-600/40"}`} />
      <div aria-hidden="true" className={`absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-rose-600/20" : "bg-orange-500/30"}`} />

      <main className="z-10 flex h-full flex-col items-center justify-center gap-8 p-6">
        
        <GlassContainer isDark={isDark} as="section" className="flex h-[75vh] w-full max-w-6xl overflow-hidden rounded-[3rem] lg:flex-row">
          
          {showStats ? (
            // FULL SCREEN CHART
            <MoodChart entries={entries} onClose={() => setShowStats(false)} isDark={isDark} />
          ) : (
            // SPLIT VIEW (Standard)
            <>
              <JournalEditor 
                isDark={isDark} 
                entry={activeEntry} 
                onCreateNew={handleCreateNew} 
                onSuccess={refreshData}
                sessionId={sessionId}
                onDelete={handleDeleteEntry}
                onShowStats={() => setShowStats(true)} 
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

        <TimelineDock 
          isDark={isDark} 
          entries={entries} 
          activeId={activeEntry?.id}
          onSelect={handleSelectEntry} 
        />

      </main>
    </div>
  );
}