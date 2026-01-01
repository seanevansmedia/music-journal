import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ClientPageRoot } from "./client-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  let initialEntries: any[] = [];

  // Only fetch entries from the server if the user is actually logged in
  if (user) {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id) 
      .order("created_at", { ascending: false });
    
    initialEntries = data || [];
  }

  return (
    <ClientPageRoot 
      user={user} 
      initialEntries={initialEntries} 
    />
  );
}