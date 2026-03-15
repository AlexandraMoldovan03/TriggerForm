import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { C } from "../../src/utils/colors";
import { Card } from "../../src/components/UI";
import { useAuth } from "../../src/context/AuthContext";
import {
  fetchProfile,
  fetchUserStats,
  fetchExerciseLogs,
} from "../../src/lib/db";

type Profile = {
  name: string;
  pain_areas: string[];
  goals: string[];
  activity_level: string;
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Mostly sitting",
  moderate: "Moderately active",
  active: "Very active",
};

const SETTINGS = [
  "Daily notifications",
  "Session reminders",
  "Cloud sync",
  "Dark mode",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sessions: 0,
    activeDays: 0,
    scans: 0,
  });
  const [toggles, setToggles] = useState(
    Object.fromEntries(SETTINGS.map((s) => [s, true]))
  );
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [profileData, statsData, logsData] = await Promise.all([
        fetchProfile(user.id),
        fetchUserStats(user.id),
        fetchExerciseLogs(user.id),
      ]);

      if (profileData) setProfile(profileData as Profile);
      setStats(statsData);
      setExerciseLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  const displayName = profile?.name ?? user?.email?.split("@")[0] ?? "User";
  const initials = getInitials(displayName);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
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

      <View style={styles.statsRow}>
        {[
          { label: "Sessions", value: String(stats.sessions), icon: "🗓" },
          { label: "Active days", value: String(stats.activeDays), icon: "🔥" },
          { label: "Scans", value: String(stats.scans), icon: "📸" },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {(profile?.pain_areas?.length ?? 0) > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your pain areas</Text>
          <View style={styles.pillRow}>
            {profile!.pain_areas.map((area) => (
              <View key={area} style={styles.pill}>
                <Text style={styles.pillText}>{area}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {(profile?.goals?.length ?? 0) > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your goals</Text>
          <View style={styles.pillRow}>
            {profile!.goals.map((goal) => (
              <View key={goal} style={[styles.pill, styles.pillTeal]}>
                <Text style={[styles.pillText, styles.pillTextTeal]}>
                  {goal}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Completed exercises</Text>

        {exerciseLogs.length === 0 ? (
          <Text style={styles.emptyText}>
            You have not completed any exercises yet.
          </Text>
        ) : (
          exerciseLogs.slice(0, 10).map((log, i) => (
            <View
              key={log.id ?? i}
              style={[
                styles.logRow,
                i < Math.min(exerciseLogs.length, 10) - 1 && styles.logBorder,
              ]}
            >
              <View style={styles.logIcon}>
                <Text style={{ fontSize: 16 }}>🏋️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.logName}>{log.exercise_name}</Text>
                <Text style={styles.logMeta}>
                  {log.completed_at
                    ? new Date(log.completed_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                  {log.duration_sec
                    ? `  ·  ${Math.round(log.duration_sec / 60)} min`
                    : ""}
                </Text>
              </View>

              <View style={styles.logDone}>
                <Text style={styles.logDoneText}>✓</Text>
              </View>
            </View>
          ))
        )}

        {exerciseLogs.length > 10 && (
          <Text style={styles.moreText}>
            + {exerciseLogs.length - 10} more
          </Text>
        )}
      </Card>

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

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
  avatarCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor: C.accent + "33",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: C.accent },
  name: { fontSize: 18, fontWeight: "800", color: C.text },
  subtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  activityBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: C.accent + "22",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activityBadgeText: { fontSize: 11, color: C.accent, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 0 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: C.text,
    marginTop: 4,
  },
  statLabel: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  sectionCard: { marginTop: 0 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.accent + "22",
    borderWidth: 0.5,
    borderColor: C.accent + "55",
  },
  pillText: { fontSize: 12, color: C.accent, fontWeight: "500" },
  pillTeal: { backgroundColor: C.surface, borderColor: C.border },
  pillTextTeal: { color: C.textMuted, fontWeight: "400" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  settingLabel: { fontSize: 13, color: C.text },
  signOutBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E24B4A",
  },
  signOutText: { fontSize: 15, color: "#E24B4A", fontWeight: "600" },

  emptyText: { fontSize: 13, color: C.textMuted, fontStyle: "italic" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  logBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  logIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.accent + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  logName: { fontSize: 13, fontWeight: "600", color: C.text },
  logMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  logDone: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  logDoneText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  moreText: { fontSize: 12, color: C.textMuted, marginTop: 8, textAlign: "center" },
});