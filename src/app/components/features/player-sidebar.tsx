"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Lock } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";
import { getMoodGradient } from "@/lib/utils";

/**
 * HELPER: Extracts YouTube ID from various URL formats
 */
const getYouTubeID = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
};

interface Track {
  title: string;
  artist: string;
  url: string; 
}

interface PlayerSidebarProps {
  isDark: boolean;
  playlist?: Track[];
  mood?: string;
  entryId?: string;
}

const GHOST_TRACKS = Array(5).fill({ title: "Pending Track", artist: "Waiting for entry...", url: "" });

export function PlayerSidebar({ isDark, playlist = [], mood = "Chill", entryId = "" }: PlayerSidebarProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [hasMounted, setHasMounted] = useState(false);
  
  const playerRef = useRef<any>(null);
  const isFirstMount = useRef(true);

  // Generate unique properties for the "Playing" state
  const barData = useMemo(() => [...Array(24)].map((_, i) => ({
    delay: Math.random() * 2,
    color: `hsl(${200 + (i * 7)}, 85%, 75%)`, 
    speed: 0.5 + Math.random() * 0.5
  })), []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (playlist && playlist.length > 0) {
      setCurrentTrackIndex(0);
      if (!isFirstMount.current) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        isFirstMount.current = false;
      }
    } else {
      setIsPlaying(false);
      isFirstMount.current = false; 
    }
  }, [playlist]);

  const hasTracks = playlist && playlist.length > 0;
  const displayList = hasTracks ? playlist : GHOST_TRACKS;
  const currentTrack = hasTracks ? playlist[currentTrackIndex] : { title: "Create a Mix", artist: "Write your thoughts...", url: "" };
  const currentVideoId = getYouTubeID(currentTrack.url);
  const discGradient = getMoodGradient(mood, entryId);

  const togglePlay = () => {
    if (!hasTracks || !playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    if (!hasTracks) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (!hasTracks) return;
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!hasTracks) return;
    setCurrentTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
    if (event.data === 0) nextTrack(); 
  };

  const theme = {
    sidebar: isDark ? "bg-black/20 border-l border-white/5" : "bg-white/40 border-l border-zinc-200/20",
    inputText: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    activeTrack: isDark ? "bg-white/10" : "bg-black/5",
    sliderThumb: isDark ? "accent-white" : "accent-black",
  };

  if (!hasMounted) return <div className={`w-full p-8 lg:w-96 flex flex-col ${theme.sidebar}`} />;

  const sliderStyle = { background: `linear-gradient(to right, ${isDark ? '#fff' : '#000'} 0%, ${isDark ? '#fff' : '#000'} ${volume}%, ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} ${volume}%, ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 100%)` };

  return (
    <aside className={`relative w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 ${theme.sidebar}`}>
      
      {/* 🧬 ADVANCED ANIMATION SYSTEM */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveform-play {
          0%, 100% { transform: scaleY(0.6); filter: brightness(1); }
          50% { transform: scaleY(2.8); filter: brightness(1.4); }
        }
        @keyframes resting-shimmer {
          0% { opacity: 0.3; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.8); transform: scaleY(1.1); }
          100% { opacity: 0.3; filter: brightness(1); }
        }
        @keyframes container-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-playing { animation: waveform-play var(--speed) ease-in-out infinite; }
        .animate-resting-shimmer { animation: resting-shimmer 2s ease-in-out infinite; }
        .float-container { animation: container-float 4s ease-in-out infinite; }
      `}} />

      {/* GHOST PLAYER */}
      <div style={{ position: "fixed", opacity: 0.001, pointerEvents: "none" }}>
        {currentVideoId && <YouTube videoId={currentVideoId} opts={{ height: '1', width: '1', playerVars: { autoplay: isPlaying ? 1 : 0, controls: 0 } }} onReady={onReady} onStateChange={onStateChange} key={currentVideoId} />}
      </div>

      {/* 🌊 WAVEFORM VISUALIZER */}
      <div className={`mb-6 mx-auto h-70 w-80 flex items-center justify-center rounded-3xl shadow-2xl transition-all duration-1000 ${hasTracks ? discGradient : (isDark ? "bg-white/5" : "bg-black/5")} relative z-10 overflow-hidden`}>
         
         {/* Background Glow */}
         {isPlaying && <div className="absolute inset-0 bg-white/10 blur-3xl animate-pulse" />}

         <div className={`flex items-center justify-center gap-[6px] h-32 relative z-20 ${!isPlaying ? 'float-container' : ''}`}>
            {barData.map((bar, i) => {
              // Mathematical curve for resting state (Symmetric V-Shape / Bell Curve)
              const centerDist = Math.abs(11.5 - i); 
              const restingHeight = Math.max(6, 42 - (centerDist * 3.2));
              
              return (
                <div 
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-700 
                    ${isPlaying ? 'animate-playing shadow-lg' : 'animate-resting-shimmer'}`}
                  style={{
                     height: isPlaying ? `${Math.max(10, 48 - (centerDist * 3.5))}px` : `${restingHeight}px`,
                     
                     // Playing: Neon Spectrum | Resting: Cool Silver-Blue Ghost
                     backgroundColor: isPlaying 
                        ? bar.color 
                        : (isDark ? 'rgba(200, 220, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'),
                     
                     boxShadow: isPlaying ? `0 0 15px ${bar.color}` : "none",
                     
                     // Custom Variables
                     // @ts-ignore
                     '--speed': `${bar.speed}s`,
                     
                     // In resting mode, the "shimmer" scans across the bars one by one
                     animationDelay: isPlaying ? `${bar.delay}s` : `${i * 0.1}s`,
                  }}
                />
              )
            })}
         </div>
      </div>

      {/* TRACK INFO */}
      <div className="mb-6 text-center lg:text-left relative z-10">
        <h2 className={`text-2xl font-medium ${theme.inputText} truncate`}>{currentTrack.title}</h2>
        <p className={`text-sm ${theme.subText} uppercase tracking-widest`}>
          {hasTracks ? `${currentTrack.artist} • ${mood}` : currentTrack.artist}
        </p>
      </div>

      {/* CONTROLS */}
      <div className="mb-6 flex flex-col items-center gap-4 relative z-10 w-full">
        <div className="flex items-center justify-center gap-8 w-full">
          <button onClick={prevTrack} disabled={!hasTracks} className={`p-2 hover:scale-110 transition-transform cursor-pointer ${theme.subText} hover:${theme.inputText} disabled:opacity-30`}><SkipBack size={28} /></button>
          <button onClick={togglePlay} disabled={!hasTracks} className={`flex h-16 w-16 items-center justify-center rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${isDark ? "bg-white text-black" : "bg-zinc-900 text-white"} disabled:opacity-30`}>
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={nextTrack} disabled={!hasTracks} className={`p-2 hover:scale-110 transition-transform cursor-pointer ${theme.subText} hover:${theme.inputText} disabled:opacity-30`}><SkipForward size={28} /></button>
        </div>

        <div className="w-full flex items-center gap-4 px-2 group mt-2">
          <button onClick={() => setVolume(volume === 0 ? 50 : 0)} className={`${theme.subText} hover:text-current transition-colors cursor-pointer`}>
            {volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          <input type="range" min="0" max="100" value={volume} onChange={(e) => { setVolume(parseInt(e.target.value)); playerRef.current?.setVolume(parseInt(e.target.value)); }} style={sliderStyle} className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all duration-300 opacity-60 group-hover:opacity-100 ${theme.sliderThumb}`} />
        </div>
      </div>

      {/* PLAYLIST */}
      <ul className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {displayList.map((track, i) => {
          const isActive = hasTracks && i === currentTrackIndex;
          return (
            <li 
              key={i} 
              onClick={() => playTrack(i)} 
              className={`flex items-center justify-between group rounded-lg p-2 transition ${hasTracks ? `cursor-pointer ${isActive ? theme.activeTrack : "hover:bg-white/5"}` : "opacity-30 cursor-default"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isActive ? (isDark ? "bg-white text-black" : "bg-black text-white") : "bg-black/5 dark:bg-white/10"}`}>
                  {isActive && isPlaying ? (
                    <div className="flex gap-0.5 h-3 items-end">
                      <div className="w-1 bg-current animate-bounce h-2" />
                      <div className="w-1 bg-current animate-bounce h-3 [animation-delay:0.2s]" />
                      <div className="w-1 bg-current animate-bounce h-1 [animation-delay:0.4s]" />
                    </div>
                  ) : <Play size={12} fill="currentColor" />}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-medium truncate ${theme.inputText} ${isActive ? "font-bold" : ""}`}>{track.title}</p>
                  <p className={`text-xs truncate ${theme.subText}`}>{hasTracks ? track.artist : "..."}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}