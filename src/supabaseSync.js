export const SUPABASE_URL = "https://tzssykhgfxpemfotxnkp.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c3N5a2hnZnhwZW1mb3R4bmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTg0MDMsImV4cCI6MjA5MzQzNDQwM30.1xHJ4JtFOWokliEAdMgnt15BRVYiZ_4tRD2FV5nIclo";

const CONFIG_KEY = "adaptive-math-placement-supabase-config";

export function getSupabaseConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) ?? {};
    return {
      url: config.url || SUPABASE_URL,
      anonKey: config.anonKey || SUPABASE_ANON_KEY,
      enabled: Boolean(config.anonKey || SUPABASE_ANON_KEY),
    };
  } catch {
    return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, enabled: true };
  }
}

export function saveSupabaseConfig({ anonKey }) {
  const cleanKey = String(anonKey ?? "").trim();
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: SUPABASE_URL, anonKey: cleanKey }));
  return getSupabaseConfig();
}

export function clearSupabaseConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export async function testSupabaseConnection() {
  const config = requireConfig();
  const response = await fetch(`${config.url}/rest/v1/student_profiles?select=id&limit=1`, {
    headers: supabaseHeaders(config),
  });
  if (!response.ok) throw new Error(await readableSupabaseError(response));
  return true;
}

export async function pushProfilesToSupabase(profiles) {
  const config = requireConfig();
  const rows = profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    grade: String(profile.grade),
    profile_data: profile,
    last_active_at: profile.lastActiveAt ?? profile.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const response = await fetch(`${config.url}/rest/v1/student_profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(config),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(await readableSupabaseError(response));
  return { pushed: rows.length };
}

export async function pullProfilesFromSupabase() {
  const config = requireConfig();
  const response = await fetch(`${config.url}/rest/v1/student_profiles?select=profile_data&order=updated_at.desc`, {
    headers: supabaseHeaders(config),
  });
  if (!response.ok) throw new Error(await readableSupabaseError(response));
  const rows = await response.json();
  return rows.map((row) => row.profile_data).filter(Boolean);
}

export async function syncProfileToSupabase(profile) {
  const config = getSupabaseConfig();
  if (!config.enabled || !profile) return { skipped: true };
  return pushProfilesToSupabase([profile]);
}

function requireConfig() {
  const config = getSupabaseConfig();
  if (!config.anonKey) throw new Error("Add the Supabase anon public key first.");
  return config;
}

function supabaseHeaders(config) {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    "Content-Type": "application/json",
  };
}

async function readableSupabaseError(response) {
  let detail = "";
  try {
    const payload = await response.json();
    detail = payload.message || payload.details || JSON.stringify(payload);
  } catch {
    detail = await response.text();
  }
  if (response.status === 404) return "Supabase is connected, but the student_profiles table does not exist yet.";
  if (response.status === 401 || response.status === 403) return "Supabase rejected the key or table permissions. Check the anon key and table policy.";
  return detail || `Supabase request failed with status ${response.status}.`;
}
