import { supabase } from './supabase';

// ── Profile ────────────────────────────────────────────────────

export async function saveProfile(userId: string, data: {
  name:           string;
  pain_areas:     string[];
  goals:          string[];
  activity_level: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, pain_areas, goals, activity_level')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Exercise logs ──────────────────────────────────────────────

export async function logExercise(userId: string, data: {
  exercise_id:   string;
  exercise_name: string;
  duration_sec?: number;
}) {
  const { error } = await supabase
    .from('exercise_logs')
    .insert({ user_id: userId, ...data });
  if (error) throw error;
}

export async function fetchExerciseLogs(userId: string) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Stats pentru profile screen ────────────────────────────────

export async function fetchUserStats(userId: string) {
  // Total exercise sessions
  const { count: totalSessions } = await supabase
    .from('exercise_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Unique active days
  const { data: logDates } = await supabase
    .from('exercise_logs')
    .select('completed_at')
    .eq('user_id', userId);

  const uniqueDays = new Set(
    (logDates ?? []).map(l =>
      new Date(l.completed_at).toDateString()
    )
  ).size;

  // Total scans
  const { count: totalScans } = await supabase
    .from('scan_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    sessions:    totalSessions  ?? 0,
    activeDays:  uniqueDays,
    scans:       totalScans     ?? 0,
  };
}

// ── Scan results ───────────────────────────────────────────────

export async function saveScanResult(userId: string, result: {
  view_mode:          string;
  recommended_region: string;
  confidence:         number;
  summary:            string;
  raw_result:         object;
}) {
  const { error } = await supabase
    .from('scan_results')
    .insert({ user_id: userId, ...result });
  if (error) throw error;
}

export async function fetchScanResults(userId: string) {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}