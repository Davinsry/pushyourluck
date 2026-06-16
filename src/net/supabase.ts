import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

/** Is Supabase configured? (lets the UI show a friendly message if not) */
export const supabaseReady = Boolean(url && key);

/**
 * Single browser-side Supabase client. Uses the publishable (anon) key, so it
 * is safe to ship to the client. Realtime is used for room channels; the
 * optional `rooms` table powers the open-room browser.
 */
export const supabase = supabaseReady
  ? createClient(url!, key!, { realtime: { params: { eventsPerSecond: 20 } } })
  : null;
