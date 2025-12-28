import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ClientPageRoot } from "./client-page";

// ⚡ FORCE DYNAMIC: This ensures we fetch fresh data on every reload/refresh
export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Fetch Entries
  const { data: entries, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  // Debug Log (Check your VS Code Terminal when you refresh the page)
  console.log("SERVER FETCH:", entries?.length ? `Found ${entries.length} entries` : "No entries found");
  if (error) console.error("SERVER ERROR:", error.message);

  return (
    <ClientPageRoot 
      user={user} 
      initialEntries={entries || []} 
    />
  );
}