import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🎨 DETERMINISTIC GRADIENT GENERATOR
// Returns a full Tailwind class string so the compiler can detect it.
export function generateGradient(id: string) {
  if (!id) return "bg-gradient-to-br from-zinc-700 to-zinc-900";

  // 1. Hash the ID to get a number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 2. Pre-defined Gradients (Tailwind needs full strings)
  const gradients = [
    "bg-gradient-to-br from-red-500 to-orange-500",
    "bg-gradient-to-br from-orange-500 to-amber-500",
    "bg-gradient-to-br from-amber-500 to-yellow-500",
    "bg-gradient-to-br from-lime-500 to-green-500",
    "bg-gradient-to-br from-emerald-500 to-teal-500",
    "bg-gradient-to-br from-teal-500 to-cyan-500",
    "bg-gradient-to-br from-sky-500 to-blue-500",
    "bg-gradient-to-br from-blue-600 to-indigo-600",
    "bg-gradient-to-br from-indigo-500 to-purple-500",
    "bg-gradient-to-br from-purple-500 to-fuchsia-500",
    "bg-gradient-to-br from-fuchsia-500 to-pink-500",
    "bg-gradient-to-br from-pink-500 to-rose-500",
    "bg-gradient-to-br from-rose-500 to-red-600",
    "bg-gradient-to-br from-slate-500 to-slate-800",
    "bg-gradient-to-br from-blue-800 to-black",
    "bg-gradient-to-br from-purple-900 to-black",
  ];

  // 3. Pick one deterministically
  return gradients[Math.abs(hash) % gradients.length];
}