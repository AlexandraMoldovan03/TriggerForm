import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import Svg, { Path, Circle, Line, Ellipse, Defs, RadialGradient, Stop } from "react-native-svg";
import { C } from "../../utils/colors";
import { REGIONS, TRIGGER_POINTS } from "../../data";
import type { BodyRegionId, TriggerPoint } from "../../types";
// path check: src/components/BodyMap → src/utils, src/data, src/types ✓

// ─── SVG body region paths ────────────────────────────────────────
const BODY_PATHS: { id: BodyRegionId; d: string }[] = [
  { id: "neck",       d: "M115,58 Q120,50 130,50 Q140,50 145,58 L143,75 Q130,80 117,75 Z" },
  { id: "shoulder",  d: "M80,75 Q95,70 115,75 L113,100 Q95,105 82,100 Z" },
  { id: "chest",     d: "M115,75 L145,75 L148,120 Q130,125 112,120 Z" },
  { id: "upper_back",d: "M148,75 L168,75 L172,120 Q155,125 145,120 Z" },
  { id: "arm",       d: "M80,100 L95,100 L100,155 Q88,158 78,155 Z" },
  { id: "lower_back",d: "M112,120 L148,120 L150,158 Q130,163 110,158 Z" },
  { id: "hip",       d: "M110,158 Q130,155 150,158 L153,195 Q130,200 107,195 Z" },
  { id: "thigh",     d: "M108,195 L130,192 L128,248 Q118,252 106,248 Z" },
  { id: "calf",      d: "M106,248 L128,248 L126,300 Q116,305 104,300 Z" },
];

function severityColor(emoji: string): string {
  if (emoji === "🔴") return C.accent;
  if (emoji === "🟠") return C.amber;
  if (emoji === "🟡") return "#EAB308";
  return C.green;
}

// ─── SVG Body ────────────────────────────────────────────────────
interface BodySVGProps {
  selectedRegion: BodyRegionId | null;
  onSelectRegion: (id: BodyRegionId) => void;
}

export function BodySVG({ selectedRegion, onSelectRegion }: BodySVGProps) {
  const tps: TriggerPoint[] = selectedRegion
    ? (TRIGGER_POINTS[selectedRegion] ?? [])
    : [];

  return (
    <Svg viewBox="0 0 260 340" width="100%" height="100%">
      <Defs>
        <RadialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#0A0E1A" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background glow */}
      <Ellipse cx="130" cy="170" rx="90" ry="130" fill="url(#bodyGlow)" />

      {/* Body silhouette */}
      <Ellipse cx="130" cy="30"  rx="22" ry="26" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <Path d="M98,55 Q98,45 162,55 L165,215 Q130,220 95,215 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <Path d="M72,72 L98,72 L98,172 Q85,175 72,172 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <Path d="M162,72 L188,72 L188,172 Q175,175 162,172 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <Path d="M102,215 L130,212 L128,325 Q115,328 102,325 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <Path d="M130,215 L158,215 L156,325 Q143,328 130,325 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

      {/* Center line */}
      <Line x1="130" y1="55" x2="130" y2="215" stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />

      {/* Clickable regions */}
      {BODY_PATHS.map((r) => {
        const regionMeta = REGIONS.find((rd) => rd.id === r.id);
        const col = severityColor(regionMeta?.emoji ?? "🟢");
        const isSelected = selectedRegion === r.id;
        return (
          <Path
            key={r.id}
            d={r.d}
            fill={isSelected ? col + "66" : col + "22"}
            stroke={isSelected ? col : col + "77"}
            strokeWidth={isSelected ? 2.5 : 1}
            onPress={() => onSelectRegion(r.id)}
          />
        );
      })}

      {/* Trigger point dots */}
      {tps.map((tp) => (
        <React.Fragment key={tp.id}>
          <Circle
            cx={(tp.x * 260) / 100}
            cy={(tp.y * 340) / 100}
            r={6}
            fill={C.accent}
            opacity={0.9}
          />
          <Circle
            cx={(tp.x * 260) / 100}
            cy={(tp.y * 340) / 100}
            r={11}
            fill="none"
            stroke={C.accent}
            strokeWidth={1.5}
            opacity={0.4}
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ─── Region List Sidebar ──────────────────────────────────────────
interface RegionListProps {
  selectedRegion: BodyRegionId | null;
  onSelect: (id: BodyRegionId) => void;
}

export function RegionList({ selectedRegion, onSelect }: RegionListProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      {REGIONS.map((r) => {
        const isSelected = selectedRegion === r.id;
        return (
          <TouchableOpacity
            key={r.id}
            onPress={() => onSelect(r.id)}
            activeOpacity={0.7}
            style={[
              styles.regionItem,
              isSelected && styles.regionItemSelected,
            ]}
          >
            <View>
              <Text style={[styles.regionLabel, isSelected && { color: C.accentSoft }]}>
                {r.label}
              </Text>
              <Text style={styles.regionSub}>{r.tp} trigger points</Text>
            </View>
            <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  regionItem: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 9,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  regionItemSelected: {
    backgroundColor: C.accent + "18",
    borderColor: C.accent + "66",
  },
  regionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },
  regionSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 2,
  },
});
