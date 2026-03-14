import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Switch, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { C } from "../../src/utils/colors";
import { Card } from "../../src/components/UI";
import { useAuth } from "../../src/context/AuthContext";
import { supabase } from "../../src/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────
type Profile = {
  name:           string;
  pain_areas:     string[];
  goals:          string[];
  activity_level: string;
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Mostly sitting',
  moderate:  'Moderately active',
  active:    'Very active',
};

const STATS = [
  { label: "Sessions",  value: "12", icon: "🗓" },
  { label: "Exercises", value: "34", icon: "🧘" },
  { label: "Active days", value: "7", icon: "🔥" },
];

const SETTINGS = [
  "Daily notifications",
  "Session reminders",
  "Cloud sync",
  "Dark mode",
];

// ── Initials from name ────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [toggles,  setToggles]  = useState(
    Object.fromEntries(SETTINGS.map((s) => [s, true]))
  );

  // ── Fetch profile from Supabase ───────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('name, pain_areas, goals, activity_level')
      .eq('id', user.id)
      .single();

    if (!error && data) setProfile(data as Profile);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  const displayName = profile?.name ?? user?.email?.split('@')[0] ?? 'User';
  const initials    = getInitials(displayName);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Avatar card ──────────────────────────────────────── */}
      <Card style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
          {profile?.activity_level && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>
                {ACTIVITY_LABELS[profile.activity_level]}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {STATS.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* ── Pain areas ────────────────────────────────────────── */}
      {profile?.pain_areas?.length > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your pain areas</Text>
          <View style={styles.pillRow}>
            {profile.pain_areas.map(area => (
              <View key={area} style={styles.pill}>
                <Text style={styles.pillText}>{area}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ── Goals ─────────────────────────────────────────────── */}
      {profile?.goals?.length > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your goals</Text>
          <View style={styles.pillRow}>
            {profile.goals.map(goal => (
              <View key={goal} style={[styles.pill, styles.pillTeal]}>
                <Text style={[styles.pillText, styles.pillTextTeal]}>{goal}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ── Settings ──────────────────────────────────────────── */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {SETTINGS.map((s, i) => (
          <View
            key={s}
            style={[
              styles.settingRow,
              i < SETTINGS.length - 1 && styles.settingBorder,
            ]}
          >
            <Text style={styles.settingLabel}>{s}</Text>
            <Switch
              value={toggles[s]}
              onValueChange={() => toggle(s)}
              trackColor={{ false: C.border, true: C.accent }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </Card>

      {/* ── Sign out ──────────────────────────────────────────── */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  scroll:           { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },

  avatarCard:       { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar:           { width: 56, height: 56, borderRadius: 99, backgroundColor: C.accent + "33", justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText:       { fontSize: 20, fontWeight: "800", color: C.accent },
  name:             { fontSize: 18, fontWeight: "800", color: C.text },
  subtitle:         { fontSize: 12, color: C.textMuted, marginTop: 2 },
  activityBadge:    { alignSelf: 'flex-start', marginTop: 6, backgroundColor: C.accent + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  activityBadgeText:{ fontSize: 11, color: C.accent, fontWeight: '600' },

  statsRow:         { flexDirection: "row", gap: 10, marginBottom: 0 },
  statCard:         { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue:        { fontSize: 22, fontWeight: "900", color: C.text, marginTop: 4 },
  statLabel:        { fontSize: 10, color: C.textMuted, marginTop: 2 },

  sectionCard:      { marginTop: 0 },
  sectionTitle:     { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },

  pillRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:             { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: C.accent + '22', borderWidth: 0.5, borderColor: C.accent + '55' },
  pillText:         { fontSize: 12, color: C.accent, fontWeight: '500' },
  pillTeal:         { backgroundColor: C.surface, borderColor: C.border },
  pillTextTeal:     { color: C.textMuted, fontWeight: '400' },

  settingRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  settingBorder:    { borderBottomWidth: 1, borderBottomColor: C.border },
  settingLabel:     { fontSize: 13, color: C.text },

  signOutBtn:       { marginTop: 8, borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E24B4A' },
  signOutText:      { fontSize: 15, color: '#E24B4A', fontWeight: '600' },
});