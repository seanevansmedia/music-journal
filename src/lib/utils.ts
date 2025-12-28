import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🎨 EXPANDED MOOD PALETTES
const MOOD_VARIANTS: Record<string, string[]> = {
  Dreamy: [
    "bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500", // Sunset
    "bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-purple-900", // Deep Berry
    "bg-gradient-to-tr from-violet-400 via-fuchsia-300 to-indigo-400", // Ethereal
    "bg-gradient-to-tr from-purple-400 via-indigo-300 to-blue-400", // Cotton Candy
  ],
  Sad: [
    "bg-gradient-to-tr from-blue-700 via-indigo-900 to-slate-900", // Midnight
    "bg-gradient-to-tr from-slate-800 via-gray-900 to-black", // Monochrome
    "bg-gradient-to-tr from-indigo-900 via-blue-900 to-cyan-900", // Deep Ocean
    "bg-gradient-to-tr from-zinc-700 via-slate-800 to-stone-900", // Overcast
  ],
  Energetic: [
    "bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600", // Fire
    "bg-gradient-to-tr from-rose-500 via-red-500 to-orange-400", // Heat
    "bg-gradient-to-tr from-lime-400 via-emerald-500 to-teal-600", // Electric Green
    "bg-gradient-to-tr from-amber-300 via-orange-400 to-pink-500", // Citrus
  ],
  Floating: [
    "bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600", // Aurora
    "bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600", // Stratosphere
    "bg-gradient-to-tr from-teal-300 via-cyan-400 to-blue-500", // Aqua
    "bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-300", // Nebula
  ],
  Default: [
    "bg-gradient-to-tr from-zinc-600 to-zinc-900",
    "bg-gradient-to-tr from-stone-500 to-stone-800",
    "bg-gradient-to-tr from-neutral-500 to-neutral-800"
  ]
};

// 🎨 SMART GRADIENT PICKER
// Uses the Entry ID to pick a consistent variation within the mood
export function getMoodGradient(mood: string = "Default", id: string = "") {
  const m = mood.trim();
  
  // Get the array of colors for this mood (or default)
  const variants = MOOD_VARIANTS[m] || MOOD_VARIANTS["Default"];

  // If no ID provided, return the first one (standard)
  if (!id) return variants[0];

  // Hash the ID to pick a variant deterministically
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Pick a color based on the ID hash
  return variants[Math.abs(hash) % variants.length];
}