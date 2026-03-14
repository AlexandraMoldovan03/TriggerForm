import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { EXERCISES } from "../../src/data";
import { TypeBadge, Card } from "../../src/components/UI";
import type { ExerciseType } from "../../src/types";

type Filter = "all" | ExerciseType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",      label: "Toate" },
  { id: "massage",  label: "Masaj" },
  { id: "stretch",  label: "Stretching" },
  { id: "mobility", label: "Mobilitate" },
];

export default function ExercisesScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();

  const filtered = EXERCISES.filter(
    (e) => filter === "all" || e.type === filter
  );

  return (
    <View style={styles.root}>
      {/* ── Filter chips ──────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[
              styles.filterChip,
              filter === f.id && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.id && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Exercise list ─────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            activeOpacity={0.85}
            onPress={() => router.push(`/exercise/${ex.id}`)}
          >
            <Card style={styles.exCard}>
              <View style={styles.exRow}>
                {/* Icon */}
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 26 }}>{ex.icon}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <View style={styles.badgeRow}>
                    <TypeBadge type={ex.type} />
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>⏱ {ex.duration}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>{ex.level}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => router.push(`/exercise/${ex.id}`)}
                  >
                    <Text style={styles.startBtnText}>Începe ▶</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  filterRow: {
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  filterChip: {
    borderRadius: 99, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  filterChipActive: {
    backgroundColor: C.accent, borderColor: C.accent,
  },
  filterLabel:      { fontSize: 12, fontWeight: "700", color: C.textMuted },
  filterLabelActive:{ color: "#fff" },

  list: { paddingHorizontal: 16, paddingTop: 4 },

  exCard: { marginBottom: 10 },
  exRow:  { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconBox:{
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.accent + "22",
    borderWidth: 1, borderColor: C.accent + "44",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  exName:    { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 8 },
  badgeRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  metaChip:  {
    backgroundColor: C.surface, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.border,
  },
  metaText:  { fontSize: 10, color: C.textMuted },
  startBtn:  {
    backgroundColor: C.accent, borderRadius: 8,
    paddingVertical: 7, paddingHorizontal: 16, alignSelf: "flex-start",
  },
  startBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
