import React, { useState } from "react";
import {
  View, Text, ScrollView, Switch, StyleSheet,
} from "react-native";
import { C } from "../../src/utils/colors";
import { Card } from "../../src/components/UI";

const STATS = [
  { label: "Sesiuni",      value: "12", icon: "🗓" },
  { label: "Exerciții",    value: "34", icon: "🧘" },
  { label: "Zile active",  value: "7",  icon: "🔥" },
];

const SETTINGS = [
  "Notificări zilnice",
  "Amintiri sesiune",
  "Sincronizare cloud",
  "Mod întunecat",
];

export default function ProfileScreen() {
  const [toggles, setToggles] = useState(
    Object.fromEntries(SETTINGS.map((s) => [s, true]))
  );

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Avatar card ───────────────────────────────────── */}
      <Card style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 26 }}>🏃</Text>
        </View>
        <View>
          <Text style={styles.name}>Alexandra M.</Text>
          <Text style={styles.subtitle}>Sport & Recuperare</Text>
        </View>
      </Card>

      {/* ── Stats ─────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {STATS.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* ── Settings ──────────────────────────────────────── */}
      <Card>
        <Text style={styles.sectionTitle}>Setări</Text>
        {SETTINGS.map((s, i) => (
          <View
            key={s}
            style={[styles.settingRow, i < SETTINGS.length - 1 && styles.settingBorder]}
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

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16 },

  avatarCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 99,
    backgroundColor: C.accent + "33",
    justifyContent: "center", alignItems: "center",
  },
  name:     { fontSize: 18, fontWeight: "800", color: C.text },
  subtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 0 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue:{ fontSize: 22, fontWeight: "900", color: C.text, marginTop: 4 },
  statLabel:{ fontSize: 10, color: C.textMuted, marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },
  settingRow:   {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 12,
  },
  settingBorder:{ borderBottomWidth: 1, borderBottomColor: C.border },
  settingLabel: { fontSize: 13, color: C.text },
});
