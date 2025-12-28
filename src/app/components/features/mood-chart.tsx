"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PenTool } from "lucide-react";

interface MoodChartProps {
  entries: any[];
  onClose: () => void;
  isDark: boolean;
}

// 1. MAP MOODS TO NUMERIC VALUES (0-100)
const MOOD_VALUES: Record<string, number> = {
  "Sad": 20,       // Low Energy
  "Dreamy": 50,    // Neutral / Mellow
  "Floating": 75,  // Focused / Flow State
  "Energetic": 100 // High Energy
};

// 2. Y-AXIS LABELS (To replace numbers)
const formatYAxis = (tickItem: number) => {
  if (tickItem <= 25) return "Low";
  if (tickItem <= 50) return "Mellow";
  if (tickItem <= 75) return "Flow";
  return "High";
};

export function MoodChart({ entries, onClose, isDark }: MoodChartProps) {
  
  const data = [...entries].reverse().map((entry) => ({
    date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood,
    value: MOOD_VALUES[entry.mood] || 50,
    fullDate: new Date(entry.created_at).toLocaleDateString()
  }));

  const theme = {
    text: isDark ? "text-white" : "text-zinc-900",
    subText: isDark ? "text-zinc-500" : "text-zinc-600",
    gridStroke: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    tooltipBg: isDark ? "bg-black/80 border-white/20" : "bg-white/90 border-black/10",
    axisText: isDark ? "#71717a" : "#52525b",
    backButton: isDark 
      ? "border-white/10 hover:bg-white/10 text-zinc-300" 
      : "border-black/10 hover:bg-black/5 text-zinc-700",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`${theme.tooltipBg} border p-3 rounded-lg shadow-xl backdrop-blur-md`}>
          <p className="text-xs text-zinc-500 mb-1">{data.fullDate}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{data.mood}</span>
            {/* Show value for context if needed */}
            {/* <span className="text-xs text-zinc-500">({data.value}%)</span> */}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="flex flex-1 flex-col p-8 lg:p-12 h-full relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-light mb-1 ${theme.text}`}>Emotional Vibe</h2>
          <p className={`${theme.subText} text-sm`}>Tracking your energy frequency.</p>
        </div>
        <button 
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${theme.backButton}`}
        >
          <PenTool size={14} /> Back to Journal
        </button>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-[300px]">
        {data.length < 2 ? (
          <div className={`h-full flex items-center justify-center italic ${theme.subText}`}>
            Create at least 2 entries to see your trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* 
                   DYNAMIC GRADIENT DEFINITION
                   This gradient spans from Top (1) to Bottom (0).
                   We map colors to the Y-axis values.
                */}
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  {/* High Energy (100) -> Gold/Orange */}
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/> 
                  
                  {/* Mid Energy (50) -> Purple/Pink */}
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.5}/> 
                  
                  {/* Low Energy (20) -> Blue/Teal */}
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/> 
                </linearGradient>
                
                {/* Stroke Gradient (Optional, usually solid color looks cleaner for line, but let's try gradient) */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#F59E0B" />
                   <stop offset="50%" stopColor="#8B5CF6" />
                   <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridStroke} />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.axisText, fontSize: 10 }} 
                dy={10}
                padding={{ left: 10, right: 10 }}
              />
              
              <YAxis 
                hide={false} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.axisText, fontSize: 10 }}
                ticks={[20, 50, 75, 100]} // Force these ticks
                tickFormatter={formatYAxis} // Use text labels instead of numbers
                domain={[0, 110]} 
                width={40}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)" // Gradient Line
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#moodGradient)"   // Gradient Fill
                activeDot={{ r: 6, fill: isDark ? "white" : "black", strokeWidth: 0 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </article>
  );
}