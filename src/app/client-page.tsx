"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Trash2, AlertCircle, BarChart2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { GlassContainer } from "@/app/components/ui/glass-container";
import { JournalEditor } from "@/app/components/features/journal-editor";
import { PlayerSidebar } from "@/app/components/features/player-sidebar";
import { TimelineDock } from "@/app/components/features/timeline-dock";
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
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setHasMounted(true);
    const id = user?.id || getSessionId();
    setSessionId(id);

    // If guest (no user), fetch browser-specific guest entries
    if (!user) {
      const fetchGuestData = async () => {
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
      fetchGuestData();
    }
  }, [user]);

  const refreshData = async () => {
    const id = user?.id || sessionId;
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq(user ? "user_id" : "session_id", id)
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
  };

  const handleSelectEntry = (entry: any) => setActiveEntry(entry);

  if (!hasMounted) return <div className="h-screen w-full bg-zinc-950" />;

  return (
    <div className={`relative flex flex-col min-h-screen lg:h-screen w-full lg:overflow-hidden transition-colors duration-700 ${isDark ? "bg-zinc-950 text-white" : "bg-[#e8e6e1] text-zinc-900"}`}>
      <main className="z-10 flex flex-col items-center justify-center gap-6 p-6 pt-6 lg:h-full w-full">
        
        <div className="flex gap-4 z-50">
          <button onClick={() => setIsDark(!isDark)} className="rounded-full p-3 bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          {entries.length > 0 && (
            <button onClick={() => setShowClearHistoryConfirm(true)} className="rounded-full p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer">
              <Trash2 size={24} />
            </button>
          )}
        </div>

        <GlassContainer isDark={isDark} as="section" className="flex flex-col h-auto w-full max-w-6xl rounded-[2rem] xl:h-[75vh] xl:flex-row xl:overflow-hidden xl:rounded-[3rem] mt-4">
          <JournalEditor 
            isDark={isDark} 
            entry={activeEntry} 
            onCreateNew={() => setActiveEntry(null)} 
            onSuccess={refreshData}
            sessionId={sessionId}
            onDelete={() => { setActiveEntry(null); refreshData(); }}
          />
          <PlayerSidebar 
            isDark={isDark} 
            playlist={activeEntry?.playlist || []}
            mood={activeEntry?.mood || "Create"}
            entryId={activeEntry?.id} 
          />
        </GlassContainer>

        <TimelineDock 
          isDark={isDark} 
          entries={entries} 
          activeId={activeEntry?.id} 
          onSelect={handleSelectEntry} 
        />
      </main>

      {/* Clear History Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
           <AlertCircle size={48} className="text-red-500 mb-4" />
           <h2 className="text-2xl font-bold mb-2">Clear all entries?</h2>
           <div className="flex gap-4 mt-6">
              <button onClick={() => setShowClearHistoryConfirm(false)} className="px-6 py-2 text-zinc-400">Cancel</button>
              <button onClick={async () => {
                await supabase.from("entries").delete().eq(user ? "user_id" : "session_id", sessionId);
                setEntries([]); setActiveEntry(null); setShowClearHistoryConfirm(false);
              }} className="px-6 py-2 bg-red-600 text-white rounded-full">Clear All</button>
           </div>
        </div>
      )}
    </div>
  );
}