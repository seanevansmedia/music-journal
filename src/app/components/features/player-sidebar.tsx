"use client";

import React, { useState, useRef } from "react";
import { Disc, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";

interface PlayerSidebarProps {
  isDark: boolean;
}

const TRACKS = [
  { 
    title: "Weightless", 
    artist: "Marconi Union", 
    videoId: "qYnA9wWFHLI" // YouTube ID only
  },
  { 
    title: "Gymnopédie No.1", 
    artist: "Erik Satie", 
    videoId: "S-Xm7s9eGxU" 
  },
  { 
    title: "Daydreaming", 
    artist: "Radiohead", 
    videoId: "TTAU7lLDZYU" 
  },
];

export function PlayerSidebar({ isDark }: PlayerSidebarProps) {
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // This ref holds the raw YouTube Player object provided by Google
  const playerRef = useRef<any>(null);

  // --- CONTROLS ---

  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (track: typeof TRACKS[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // Note: The YouTube component will auto-detect the ID change and play
  };

  const nextTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.videoId === currentTrack.videoId);
    const nextIndex = (currentIndex + 1) % TRACKS.length;
    setCurrentTrack(TRACKS[nextIndex]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.videoId === currentTrack.videoId);
    const prevIndex = currentIndex === 0 ? TRACKS.length - 1 : currentIndex - 1;
    setCurrentTrack(TRACKS[prevIndex]);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  // --- YOUTUBE EVENTS ---

  const onReady: YouTubeProps['onReady'] = (event) => {
    console.log("System: YouTube Engine Ready");
    playerRef.current = event.target; // Store the player
    event.target.setVolume(100);      // Max volume immediately
    event.target.unMute();            // Force unmute
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // Event ID 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
    if (event.data === 0) nextTrack();
  };

  // --- THEME ---
  const theme = {
    sidebar: isDark 
      ? "bg-black/20 border-l border-white/5" 
      : "bg-white/40 border-l border-zinc-200/20",
    inputText: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-400" : "text-zinc-600",
    discBg: isDark 
      ? "bg-gradient-to-tr from-indigo-500 to-rose-500" 
      : "bg-gradient-to-tr from-blue-200 to-pink-200",
    discIcon: isDark ? "text-white/80" : "text-white",
    playButton: isDark 
      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-black" 
      : "bg-black/5 text-black group-hover:bg-black group-hover:text-white",
    focusRing: isDark 
      ? "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
      : "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e6e1]",
    activeTrack: isDark ? "bg-white/10" : "bg-black/5",
  };

  // Options for the YouTube Iframe
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      controls: 0, // Hide YouTube controls
      modestbranding: 1,
      playsinline: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  };

  return (
    <aside 
      aria-label="Generated Playlist" 
      className={`relative w-full p-8 lg:w-96 flex flex-col transition-colors duration-700 ${theme.sidebar}`}
    >
      {/* 
         HIDDEN YOUTUBE PLAYER 
         Using opacity 0.01 and z-index trick to keep it active but invisible.
         We place it in the bottom-right corner of the sidebar.
      */}
      <div 
        style={{ 
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "200px",
          height: "150px",
          zIndex: 0,        // Must be non-negative to interact if needed
          opacity: 0.01,    // Invisible to eye
          pointerEvents: "none"
        }}
      >
        <YouTube 
          videoId={currentTrack.videoId} 
          opts={opts} 
          onReady={onReady}
          onStateChange={onStateChange}
          // Force re-render if track changes to ensure autoplay picks up
          key={currentTrack.videoId}
        />
      </div>

      {/* Visualizer (Spinning Disc) */}
      <div className={`mb-8 flex aspect-square w-full items-center justify-center rounded-2xl shadow-lg transition-all duration-700 ${theme.discBg} relative z-10`}>
         <div className={`transition-transform duration-[5s] ease-linear ${isPlaying ? "animate-[spin_6s_linear_infinite]" : ""}`}>
             <Disc size={64} className={`${theme.discIcon}`} aria-hidden="true" />
         </div>
      </div>

      {/* Header Info */}
      <div className="mb-6 text-center lg:text-left relative z-10">
        <h2 className={`text-2xl font-medium ${theme.inputText} truncate`}>{currentTrack.title}</h2>
        <p className={`text-sm ${theme.subText}`}>{currentTrack.artist}</p>
      </div>

      {/* Main Controls */}
      <div className="mb-8 flex items-center justify-center gap-6 relative z-10">
        <button 
          onClick={prevTrack}
          className={`p-2 transition hover:scale-110 outline-none cursor-pointer ${theme.subText} hover:${theme.inputText} ${theme.focusRing} rounded-full`}
        >
          <SkipBack size={28} />
        </button>

        <button 
          onClick={togglePlay}
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition hover:scale-105 active:scale-95 outline-none cursor-pointer ${isDark ? "bg-white text-black" : "bg-zinc-900 text-white"} ${theme.focusRing}`}
        >
          {isPlaying ? (
             <Pause size={28} fill="currentColor" />
          ) : (
             <Play size={28} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button 
          onClick={nextTrack}
          className={`p-2 transition hover:scale-110 outline-none cursor-pointer ${theme.subText} hover:${theme.inputText} ${theme.focusRing} rounded-full`}
        >
          <SkipForward size={28} />
        </button>

        {/* DEBUG MUTE TOGGLE */}
        <button
           onClick={toggleMute}
           className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 ${theme.subText} hover:${theme.inputText}`}
           title="Toggle Mute (Debug)"
        >
           {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Track List */}
      <ul className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {TRACKS.map((track, i) => {
          const isActive = currentTrack.videoId === track.videoId;
          return (
            <li 
              key={i} 
              onClick={() => playTrack(track)}
              tabIndex={0}
              className={`flex items-center justify-between group cursor-pointer rounded-lg p-2 transition outline-none ${theme.focusRing} ${isActive ? theme.activeTrack : "hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isActive ? (isDark ? "bg-white text-black" : "bg-black text-white") : theme.playButton}`}>
                  {isActive && isPlaying ? (
                     <div className="flex gap-1 h-3 items-end">
                       <div className="w-1 bg-current animate-[bounce_1s_infinite] h-2" />
                       <div className="w-1 bg-current animate-[bounce_1.2s_infinite] h-3" />
                       <div className="w-1 bg-current animate-[bounce_0.8s_infinite] h-1" />
                     </div>
                  ) : (
                     <Play size={12} fill="currentColor" aria-hidden="true" />
                  )}
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