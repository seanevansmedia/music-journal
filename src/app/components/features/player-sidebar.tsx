"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1 } from "lucide-react";
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

export function PlayerSidebar({ isDark, playlist = [], mood = "Chill", entryId = "" }: PlayerSidebarProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [hasMounted, setHasMounted] = useState(false);
  
  const playerRef = useRef<any>(null);

  // Generate unique properties for each waveform bar once
  const barData = useMemo(() => [...Array(24)].map((_, i) => ({
    delay: Math.random() * 2,
    color: `hsl(${200 + (i * 7)}, 85%, 75%)`, 
    speed: 0.5 + Math.random() * 0.5
  })), []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle Track Changes without remounting the iframe (Crucial for Mobile)
  useEffect(() => {
    if (playerRef.current && playlist[currentTrackIndex]?.url) {
      const videoId = getYouTubeID(playlist[currentTrackIndex].url);
      if (isPlaying) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
    }
  }, [currentTrackIndex]);

  const hasTracks = playlist && playlist.length > 0;
  const currentTrack = hasTracks 
    ? playlist[currentTrackIndex] 
    : { title: "Create a Mix", artist: "Write your thoughts...", url: "" };
  
  const currentVideoId = getYouTubeID(currentTrack.url);
  const discGradient = getMoodGradient(mood, entryId);

  const togglePlay = () => {
    if (!hasTracks || !playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      // Mobile requires explicit unMute on a user-click event
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0) playerRef.current.unMute();
    }
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    // On mobile, we start unmuted but wait for user click to play
    event.target.unMute(); 
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) setIsPlaying(true); // Playing
    if (event.data === 2) setIsPlaying(false); // Paused
    if (event.data === 0) nextTrack(); // Ended
  };

  const opts = {
    height: '1',
    width: '1',
    playerVars: { 
      autoplay: 0, 
      controls: 0, 
      modestbranding: 1, 
      playsinline: 1, // REQUIRED FOR MOBILE
      origin: typeof window !== 'undefined' ? window.location.origin : undefined 
    },
  };

  const theme = {
    sidebar: isDark ? "bg-black/20 border-l border-white/5" : "bg-white/40 border-l border-zinc-200/20",
    inputText: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    sliderThumb: isDark ? "accent-white" : "accent-black",
  };

  if (!hasMounted) return <div className={`w-full p-8 lg:w-96 flex flex-col ${theme.sidebar}`} />;

  const fillCol = isDark ? "#fff" : "#000";
  const emptyCol = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
  const sliderStyle = { background: `linear-gradient(to right, ${fillCol} 0%, ${fillCol} ${volume}%, ${emptyCol} ${volume}%, ${emptyCol} 100%)` };

  return (
    <aside className={`relative w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 ${theme.sidebar}`}>
      
      {/* 🧬 WAVEFORM ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveform-play {
          0%, 100% { transform: scaleY(0.6); filter: brightness(1); }
          50% { transform: scaleY(2.8); filter: brightness(1.4); }
        }
        @keyframes waveform-rest {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.2); opacity: 0.6; }
        }
        .animate-playing { animation: waveform-play var(--speed) ease-in-out infinite; }
        .animate-resting { animation: waveform-rest 3s ease-in-out infinite; }
      `}} />

      {/* GHOST PLAYER (Hidden but active) */}
      <div style={{ position: "fixed", opacity: 0.001, pointerEvents: "none", zIndex: -1 }}>
        <YouTube videoId={currentVideoId} opts={opts} onReady={onReady} onStateChange={onStateChange} />
      </div>

      {/* 🌊 DYNAMIC WAVEFORM VISUALIZER */}
      <div className={`mb-6 mx-auto h-70 w-full flex items-center justify-center rounded-2xl shadow-xl transition-all duration-1000 ${hasTracks ? discGradient : (isDark ? "bg-white/5" : "bg-black/5")} relative z-10 overflow-hidden`}>
         {isPlaying && <div className="absolute inset-0 bg-white/10 blur-3xl animate-pulse" />}
         <div className="flex items-center justify-center gap-[6px] h-32 relative z-20">
            {barData.map((bar, i) => {
              const centerDist = Math.abs(11.5 - i); 
              const baseHeight = Math.max(10, 48 - (centerDist * 3.5));
              return (
                <div key={i} className={`w-1.5 rounded-full transition-all duration-700 ${isPlaying ? 'animate-playing shadow-lg' : 'animate-resting'}`}
                  style={{
                     height: `${baseHeight}px`,
                     backgroundColor: isPlaying ? bar.color : "rgba(255, 255, 255, 0.7)",
                     boxShadow: isPlaying ? `0 0 12px ${bar.color}` : "none",
                     // @ts-ignore
                     '--speed': `${bar.speed}s`,
                     animationDelay: isPlaying ? `${bar.delay}s` : `${i * 0.1}s`,
                  }}
                />
              )
            })}
         </div>
      </div>

      <div className="mb-6 text-center lg:text-left relative z-10">
        <h2 className={`text-2xl font-medium ${theme.inputText} truncate`}>{currentTrack.title}</h2>
        <p className={`text-sm ${theme.subText} uppercase tracking-widest`}>
          {hasTracks ? `${currentTrack.artist} • ${mood}` : currentTrack.artist}
        </p>
      </div>

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
          <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={sliderStyle} className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all duration-300 opacity-60 group-hover:opacity-100 ${theme.sliderThumb}`} />
        </div>
      </div>
    </aside>
  );
}