"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Loader2 } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";
import { getMoodGradient } from "@/lib/utils";

const getYouTubeID = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
};

interface PlayerSidebarProps {
  isDark: boolean;
  playlist?: any[];
  mood?: string;
  entryId?: string;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

const GHOST_TRACKS = Array(5).fill({ title: "Pending Track", artist: "Waiting for entry...", url: "" });

export function PlayerSidebar({ isDark, playlist = [], mood = "Chill", entryId = "", isPlaying, setIsPlaying }: PlayerSidebarProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(100);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const playerRef = useRef<any>(null);
  const errorSkipCount = useRef(0); 

  const barData = useMemo(() => [...Array(24)].map((_, i) => ({
    delay: Math.random() * 2,
    color: `hsl(${200 + (i * 7)}, 85%, 75%)`, 
    speed: 0.5 + Math.random() * 0.5
  })), []);

  useEffect(() => { setHasMounted(true); }, []);

  // 🎵 EFFECT 1: Autoplay when playlist initially loads
  useEffect(() => {
    if (playlist.length > 0 && playerRef.current) {
       if (!isPlaying) {
         setIsLoading(true);
         setIsPlaying(true);
       }
    }
  }, [playlist]); 

  // 🎵 EFFECT 2: Handle Play/Pause Toggle
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const playerState = playerRef.current.getPlayerState();
      if (playerState !== -1 && playerState !== 5) {
         if (isPlaying) playerRef.current.playVideo();
         else playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn("Player state sync warning");
    }
  }, [isPlaying]);

  // 🎵 EFFECT 3: Handle Track Change
  useEffect(() => {
    if (playerRef.current && playlist[currentTrackIndex]?.url) {
      const videoId = getYouTubeID(playlist[currentTrackIndex].url);
      
      if (!videoId) {
        handleSkip('next');
        return;
      }

      if (isPlaying) {
        // ⚡ FIX: Use Object Syntax for better reliability.
        // This forces YouTube to treat this as a "Load and Play" command.
        playerRef.current.loadVideoById({ videoId: videoId });
      } else {
        playerRef.current.cueVideoById({ videoId: videoId });
      }
    }
  }, [currentTrackIndex, playlist]); 

  const hasTracks = playlist && playlist.length > 0;
  const displayList = hasTracks ? playlist : GHOST_TRACKS;
  const currentTrack = hasTracks ? playlist[currentTrackIndex] : { title: "Create a Mix", artist: "Write thoughts...", url: "" };
  const discGradient = getMoodGradient(mood, entryId);

  const togglePlay = () => {
    if (!hasTracks || !playerRef.current) return;
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    if (!hasTracks) return;
    errorSkipCount.current = 0;
    setIsLoading(true); // Set loading ON
    setIsPlaying(true); // Ensure Play state is TRUE
    setCurrentTrackIndex(index); // Trigger Effect 3
  };

  const handleSkip = (direction: 'next' | 'prev') => {
    if (!hasTracks) return;
    setIsLoading(true);
    setIsPlaying(true);
    setCurrentTrackIndex((prev) => {
      if (direction === 'next') return (prev + 1) % playlist.length;
      return prev === 0 ? playlist.length - 1 : prev - 1;
    });
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    event.target.unMute();
    
    if (hasTracks) {
      setIsLoading(true);
      setIsPlaying(true);
      setTimeout(() => {
         event.target.playVideo();
      }, 100);
    }
  };

  const onError: YouTubeProps['onError'] = (event) => {
    console.warn("Track unavailable. Skipping:", playlist[currentTrackIndex]?.title);
    setIsLoading(false);
    
    if (errorSkipCount.current > 5) {
      setIsPlaying(false);
      errorSkipCount.current = 0;
      return;
    }
    errorSkipCount.current += 1;
    handleSkip('next');
  };

  const onStateChange: YouTubeProps['onStateChange'] = (e) => {
    if (e.data === 1) { // Playing
      setIsLoading(false); 
      setIsPlaying(true);
      errorSkipCount.current = 0; 
    }
    // Removed buffering check to prevent resume flicker
    
    if (e.data === 2) { // Paused
       setIsPlaying(false);
       setIsLoading(false);
    }
    if (e.data === 0) handleSkip('next');  // Ended
  };

  const theme = {
    sidebar: isDark ? "bg-black/20 border-l border-white/5" : "bg-white/40 border-l border-zinc-200/20",
    inputText: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    activeTrack: isDark ? "bg-white/10" : "bg-black/5",
    playButton: isDark ? "bg-white/10 text-white" : "bg-black/5 text-black",
    iconButton: `p-2 text-zinc-400 cursor-pointer transition-colors ${isDark ? "hover:text-white" : "hover:text-black"}`,
  };

  if (!hasMounted) return <div className={`w-full p-8 lg:w-96 flex flex-col ${theme.sidebar}`} />;

  const sliderFillColor = isDark ? "#fff" : "#000";
  const sliderTrackColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
  
  const sliderStyle = {
    backgroundImage: `linear-gradient(to right, ${sliderFillColor} 0%, ${sliderFillColor} ${volume}%, ${sliderTrackColor} ${volume}%, ${sliderTrackColor} 100%)`,
    backgroundSize: '100% 4px', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat'
  };

  return (
    <aside className={`relative w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 h-full ${theme.sidebar}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveform-play { 0%, 100% { transform: scaleY(0.6); } 50% { transform: scaleY(2.8); } }
        @keyframes waveform-rest { 0%, 100% { transform: scaleY(1); opacity: 0.3; } 50% { transform: scaleY(1.2); opacity: 0.6; } }
        .animate-playing { animation: waveform-play var(--speed) ease-in-out infinite; }
        .animate-resting { animation: waveform-rest 3s ease-in-out infinite; }
        .playlist-scroll::-webkit-scrollbar { width: 4px; }
        .playlist-scroll::-webkit-scrollbar-track { background: transparent; }
        .playlist-scroll::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; border-radius: 10px; }
        
        input[type='range'] { 
          -webkit-appearance: none; 
          appearance: none; 
          height: 12px; 
          background: transparent;
          outline: none;
          cursor: pointer;
          width: 100%;
        }
        
        input[type='range']::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          appearance: none; 
          height: 12px; 
          width: 12px; 
          border-radius: 50%; 
          background: ${sliderFillColor}; 
          cursor: pointer; 
          border: none;
          transition: transform 0.1s;
        }
        
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type='range']::-moz-range-thumb { 
          height: 12px; 
          width: 12px; 
          border-radius: 50%; 
          background: ${sliderFillColor}; 
          cursor: pointer; 
          border: none;
          transition: transform 0.1s;
        }
        
        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}} />

      <div style={{ position: "fixed", opacity: 0.001, pointerEvents: "none", zIndex: -1 }}>
        <YouTube 
          opts={{ 
            height: '1', 
            width: '1', 
            playerVars: { 
              autoplay: 1, 
              controls: 0, 
              modestbranding: 1, 
              playsinline: 1, 
              origin: typeof window !== 'undefined' ? window.location.origin : undefined 
            } 
          }} 
          onReady={onReady} 
          onError={onError}
          onStateChange={onStateChange}
        />
      </div>

      <div className={`mb-6 mx-auto h-65 w-full flex items-center justify-center rounded-2xl shadow-xl transition-all duration-1000 ${hasTracks ? discGradient : (isDark ? "bg-white/5" : "bg-black/5")} relative z-10 overflow-hidden`}>
         {/* ⚡ FIX: Visualizer only animates if playing AND NOT loading */}
         {isPlaying && !isLoading && <div className="absolute inset-0 bg-white/10 blur-3xl animate-pulse" />}
         
         <div className="flex items-center justify-center gap-[6px] h-16 relative z-20">
            {barData.map((bar, i) => (
              <div key={i} className={`w-1.5 rounded-full transition-all duration-700 ${isPlaying && !isLoading ? 'animate-playing shadow-lg' : 'animate-resting'}`}
                style={{
                  height: `${Math.max(4, 32 - (Math.abs(11.5 - i) * 2.5))}px`,
                  backgroundColor: isPlaying && !isLoading ? bar.color : "rgba(255, 255, 255, 0.7)",
                  boxShadow: isPlaying && !isLoading ? `0 0 12px ${bar.color}` : "none",
                  // @ts-ignore
                  '--speed': `${bar.speed}s`,
                  animationDelay: isPlaying ? `${bar.delay}s` : `${i * 0.1}s`,
                }}
              />
            ))}
         </div>
      </div>

      <div className="mb-4 text-center lg:text-left">
        <h2 className={`text-2xl font-medium ${theme.inputText} truncate`}>
           {isLoading ? "Loading Track..." : currentTrack.title}
        </h2>
        <p className={`text-sm ${theme.subText} uppercase tracking-widest`}>{hasTracks ? `${currentTrack.artist} • ${mood}` : currentTrack.artist}</p>
      </div>

      <div className="mb-6 flex flex-col items-center gap-4 w-full">
        <div className="flex items-center justify-center gap-8 w-full">
          <button onClick={() => handleSkip('prev')} className={theme.iconButton}><SkipBack size={28} /></button>
          
          <button onClick={togglePlay} className={`flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all cursor-pointer ${isDark ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>
            {isLoading ? <Loader2 size={28} className="animate-spin" /> : isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button onClick={() => handleSkip('next')} className={theme.iconButton}><SkipForward size={28} /></button>
        </div>

        <div className="w-full flex items-center gap-4 px-2 group py-2">
            <button 
              onClick={() => { const v = volume === 0 ? 50 : 0; setVolume(v); playerRef.current?.setVolume(v); }}
              className={`${theme.subText} cursor-pointer hover:text-current`}
            >
              {volume === 0 ? <VolumeX size={22} /> : volume < 50 ? <Volume1 size={22} /> : <Volume2 size={22} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              style={sliderStyle}
              onChange={(e) => { const v = parseInt(e.target.value); setVolume(v); playerRef.current?.setVolume(v); }} 
              className="w-full cursor-pointer transition-all" 
            />
        </div>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto pr-2 playlist-scroll">
        {displayList.map((track, i) => {
          const isActive = hasTracks && i === currentTrackIndex;
          return (
            <li key={i} onClick={() => playTrack(i)} className={`flex items-center justify-between group rounded-lg p-2 transition cursor-pointer ${hasTracks ? (isActive ? theme.activeTrack : "hover:bg-white/5") : "opacity-30 cursor-default"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? (isDark ? "bg-white text-black" : "bg-black text-white") : theme.playButton}`}>
                   {isActive && isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                   ) : isActive && isPlaying ? (
                      <div className="flex gap-0.5 h-3 items-end"><div className="w-1 bg-current animate-bounce h-2" /><div className="w-1 bg-current animate-bounce h-3 [animation-delay:0.2s]" /><div className="w-1 bg-current animate-bounce h-1 [animation-delay:0.4s]" /></div> 
                   ) : (
                      <Play size={12} fill="currentColor" />
                   )}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-medium truncate ${theme.inputText}`}>{track.title}</p>
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