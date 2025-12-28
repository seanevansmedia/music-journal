"use client";

import React, { useState, useRef, useEffect } from "react";
import { Disc, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1 } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";
import { generateGradient } from "@/lib/utils";

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

// Helper: Extract ID
const getYouTubeID = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
};

export function PlayerSidebar({ isDark, playlist = [], mood = "Chill", entryId = "" }: PlayerSidebarProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [hasMounted, setHasMounted] = useState(false);
  
  const playerRef = useRef<any>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // RESET logic
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

  const safePlaylist = playlist || [];
  
  // Fallback text
  const currentTrack = safePlaylist[currentTrackIndex] || { 
    title: "Create a Mix", 
    artist: "Write your thoughts to generate a soundtrack.", 
    url: "" 
  };
  
  const currentVideoId = getYouTubeID(currentTrack.url);
  const discGradient = generateGradient(entryId);

  // --- CONTROLS ---

  const togglePlay = () => {
    if (safePlaylist.length === 0) return;
    
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (safePlaylist.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % safePlaylist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (safePlaylist.length === 0) return;
    setCurrentTrackIndex((prev) => (prev === 0 ? safePlaylist.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && playerRef.current.isMuted()) {
        playerRef.current.unMute();
      }
    }
  };

  // --- YOUTUBE EVENTS ---

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    event.target.unMute();
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
    discIcon: isDark ? "text-white/90" : "text-white",
    playButton: isDark ? "bg-white/10 text-white" : "bg-black/5 text-black",
    activeTrack: isDark ? "bg-white/10" : "bg-black/5",
    sliderTrack: isDark ? "bg-white/20" : "bg-black/10",
    sliderThumb: isDark ? "accent-white" : "accent-black",
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  };

  if (!hasMounted) return <div className={`w-full p-8 lg:w-96 flex flex-col ${theme.sidebar}`} />;

  const fillCol = isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)";
  const emptyCol = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
  const sliderStyle = {
    background: `linear-gradient(to right, ${fillCol} 0%, ${fillCol} ${volume}%, ${emptyCol} ${volume}%, ${emptyCol} 100%)`
  };

  return (
    <aside className={`relative w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 ${theme.sidebar}`}>
      
      {/* GHOST PLAYER */}
      <div style={{ position: "fixed", bottom: "10px", right: "10px", width: "1px", height: "1px", opacity: 0.001, zIndex: 9999, pointerEvents: "none" }}>
        {currentVideoId && (
          <YouTube 
            videoId={currentVideoId} 
            opts={opts} 
            onReady={onReady}
            onStateChange={onStateChange}
            key={currentVideoId} 
          />
        )}
      </div>

      {/* VISUALIZER */}
      <div className={`mb-6 mx-auto h-70 w-80 flex items-center justify-center rounded-2xl shadow-lg transition-all duration-1000 ${safePlaylist.length > 0 ? discGradient : (isDark ? "bg-white/5" : "bg-black/5")} relative z-10`}>
         <div 
            className={`relative flex items-center justify-center transition-transform ${isPlaying ? "animate-spin" : ""}`} 
            style={{ 
              animationDuration: '3s', 
              animationTimingFunction: 'linear',
              animationPlayState: isPlaying ? 'running' : 'paused'
            }}
         >
             <Disc 
                size={120} 
                strokeWidth={1} 
                className={`${theme.discIcon} drop-shadow-2xl opacity-90`} 
             />
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white/30 rounded-full blur-[1px]" />
         </div>
      </div>

      {/* Header Info */}
      <div className="mb-6 text-center lg:text-left relative z-10">
        {/* INCREASED SIZE HERE: text-3xl font-bold */}
        <h2 className={`text-3xl font-bold ${theme.inputText} truncate leading-tight`}>{currentTrack.title}</h2>
        {/* INCREASED SIZE HERE: text-base font-medium */}
        <p className={`text-base font-medium ${theme.subText} mt-2`}>
          {safePlaylist.length > 0 ? `${currentTrack.artist} • ${mood}` : currentTrack.artist}
        </p>
      </div>

      {/* Controls Container */}
      <div className="mb-6 flex flex-col items-center gap-4 relative z-10 w-full">
        
        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-8 w-full">
          <button 
            onClick={prevTrack} 
            disabled={safePlaylist.length === 0}
            className={`p-2 hover:scale-110 transition-transform cursor-pointer ${theme.subText} hover:${theme.inputText} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <SkipBack size={28} />
          </button>
          
          <button 
            onClick={togglePlay} 
            disabled={safePlaylist.length === 0}
            className={`flex h-16 w-16 items-center justify-center rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${isDark ? "bg-white text-black" : "bg-zinc-900 text-white"} disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed`}
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={nextTrack} 
            disabled={safePlaylist.length === 0}
            className={`p-2 hover:scale-110 transition-transform cursor-pointer ${theme.subText} hover:${theme.inputText} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <SkipForward size={28} />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="w-full flex items-center gap-4 px-2 group mt-2">
          <button 
            onClick={() => { if(volume > 0) setVolume(0); else setVolume(50); }} 
            className={`${theme.subText} hover:text-current transition-colors cursor-pointer`}
          >
            {volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={sliderStyle}
            className={`
              w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all duration-300 opacity-60 group-hover:opacity-100
              ${theme.sliderThumb}
            `}
          />
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {safePlaylist.map((track, i) => {
          const isActive = i === currentTrackIndex;
          return (
            <li key={i} onClick={() => playTrack(i)} tabIndex={0} className={`flex items-center justify-between group cursor-pointer rounded-lg p-2 transition ${isActive ? theme.activeTrack : "hover:bg-white/5"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isActive ? (isDark ? "bg-white text-black" : "bg-black text-white") : theme.playButton}`}>
                  {isActive && isPlaying ? (
                     <div className="flex gap-1 h-3 items-end">
                       <div className="w-1 bg-current animate-bounce h-2" />
                       <div className="w-1 bg-current animate-bounce h-3" />
                       <div className="w-1 bg-current animate-bounce h-1" />
                     </div>
                  ) : <Play size={12} fill="currentColor" />}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-medium truncate ${theme.inputText} ${isActive ? "font-bold" : ""}`}>{track.title}</p>
                  <p className={`text-xs truncate ${theme.subText}`}>{track.artist}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}