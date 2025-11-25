import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sonic Journal",
  description: "Journal your thoughts, generate your soundtrack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* 
        FIX: Added 'suppressHydrationWarning' 
        This tells React to ignore attributes added by browser extensions 
        or theme providers, fixing the error you saw.
      */}
      <body 
        suppressHydrationWarning={true}
        className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30`}
      >
        {children}
      </body>
    </html>
  );
}