"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowLeft } from "lucide-react"; // Changed import

interface MoodChartProps {
  entries: any[];
  onClose: () => void;
  isDark: boolean;
}

const MOOD_VALUES: Record<string, number> = {
  "Sad": 20,
  "Dreamy": 50,
  "Floating": 75,
  "Energetic": 100
};

const TOOLTIP_LABELS: Record<string, string> = {
  "Sad": "Low Energy",
  "Dreamy": "Mellow",
  "Floating": "Flow State",
  "Energetic": "High Energy"
};

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
      const label = TOOLTIP_LABELS[data.mood] || data.mood;
      
      return (
        <div className={`${theme.tooltipBg} border p-3 rounded-lg shadow-xl backdrop-blur-md`}>
          <p className="text-xs text-zinc-500 mb-1">{data.fullDate}</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${theme.text}`}>
              {label}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="flex flex-col p-6 lg:p-12 h-full w-full relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER */}
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        
        {/* Title Group */}
        <div className="pr-12 lg:pr-0">
          <h2 className={`text-2xl lg:text-3xl font-light mb-1 ${theme.text}`}>Emotional Vibe</h2>
          <p className={`${theme.subText} text-xs lg:text-sm`}>Tracking your energy frequency.</p>
        </div>

        {/* BACK BUTTON (Updated Icon) */}
        <button 
          onClick={onClose}
          className={`
            absolute top-0 right-0 lg:static 
            flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2 
            rounded-full border text-[10px] lg:text-xs font-bold uppercase tracking-wider 
            transition-colors cursor-pointer ${theme.backButton}
          `}
        >
          {/* Bigger, Traditional Back Arrow */}
          <ArrowLeft size={18} /> 
          <span className="hidden sm:inline">Back to Journal</span>
        </button>
      </div>

      {/* CHART CONTAINER */}
      <div className="w-full h-[50vh] lg:h-auto lg:flex-1 min-h-[300px]">
        {data.length < 2 ? (
          <div className={`h-full flex items-center justify-center italic ${theme.subText}`}>
            Create at least 2 entries to see your trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/> 
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.5}/> 
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/> 
                </linearGradient>
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
                interval="preserveStartEnd" 
              />
              
              <YAxis 
                hide={false} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.axisText, fontSize: 10 }}
                ticks={[20, 50, 75, 100]} 
                tickFormatter={formatYAxis} 
                domain={[0, 110]} 
                width={40}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.4)', strokeWidth: 1 }} />
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#moodGradient)" 
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