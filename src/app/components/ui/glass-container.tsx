"use client";

import React from "react";

interface GlassContainerProps {
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "nav"; // Semantic HTML options
  ariaLabel?: string;
}

export function GlassContainer({
  children,
  isDark,
  className = "",
  as: Component = "div",
  ariaLabel,
}: GlassContainerProps) {
  
  // Base styles shared by both themes (transitions, blurs)
  const baseStyles = "transition-all duration-700 backdrop-blur-2xl border";

  // Specific Theme Logic
  // We use slightly different opacity for 'default' usage, but this can be overridden by className
  const themeStyles = isDark
    ? "bg-white/5 border-white/10 shadow-2xl" // Dark Mode: Sharp, clear glass
    : "bg-white/60 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"; // Light Mode: Milky, frosted acrylic

  return (
    <Component
      className={`${baseStyles} ${themeStyles} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}