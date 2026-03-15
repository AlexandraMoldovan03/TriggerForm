import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { C } from "../../utils/colors";
import { REGIONS, TRIGGER_POINTS } from "../../data";
import type { BodyRegionId, BodyView, TriggerPoint3D } from "../../types";

function severityColor(emoji: string): string {
  if (emoji === "🔴") return C.accent;
  if (emoji === "🟠") return C.amber;
  if (emoji === "🟡") return "#EAB308";
  return C.green;
}

type BodyPath = {
  id: BodyRegionId;
  view: BodyView;
  d: string;
};

const BODY_PATHS: BodyPath[] = [
  // FRONT
  {
    id: "pec_left",
    view: "front",
    d: "M83,90 Q96,78 112,88 L112,130 Q96,136 82,126 Z",
  },
  {
    id: "pec_right",
    view: "front",
    d: "M118,88 Q134,78 147,90 L148,126 Q134,136 118,130 Z",
  },

  // BACK
  {
    id: "upper_trap_left",
    view: "back",
    d: "M86,78 Q100,66 116,78 L112,100 Q98,104 86,96 Z",
  },
  {
    id: "upper_trap_right",
    view: "back",
    d: "M144,78 Q160,66 174,78 L174,96 Q162,104 148,100 Z",
  },
  {
    id: "levator_left",
    view: "back",
    d: "M108,82 Q116,76 122,88 L118,114 Q108,112 102,100 Z",
  },
  {
    id: "levator_right",
    view: "back",
    d: "M138,88 Q144,76 152,82 L158,100 Q152,112 142,114 Z",
  },
  {
    id: "rhomboid_left",
    view: "back",
    d: "M100,116 Q112,108 122,120 L120,154 Q108,158 96,146 Z",
  },
  {
    id: "rhomboid_right",
    view: "back",
    d: "M138,120 Q148,108 160,116 L164,146 Q152,158 140,154 Z",
  },
  {
    id: "lumbar_left",
    view: "back",
    d: "M108,158 Q118,154 124,164 L122,206 Q112,210 104,198 Z",
  },
  {
    id: "lumbar_right",
    view: "back",
    d: "M136,164 Q142,154 152,158 L156,198 Q148,210 138,206 Z",
  },
  {
    id: "glute_med_left",
    view: "back",
    d: "M102,214 Q118,206 128,220 L126,252 Q110,258 98,244 Z",
  },
  {
    id: "glute_med_right",
    view: "back",
    d: "M132,220 Q142,206 158,214 L162,244 Q150,258 134,252 Z",
  },
  {
    id: "piriformis_left",
    view: "back",
    d: "M114,236 Q124,232 128,242 L126,260 Q116,262 110,252 Z",
  },
  {
    id: "piriformis_right",
    view: "back",
    d: "M132,242 Q136,232 146,236 L150,252 Q144,262 134,260 Z",
  },
  {
    id: "hamstring_left",
    view: "back",
    d: "M108,262 L128,260 L126,314 Q116,320 106,314 Z",
  },
  {
    id: "hamstring_right",
    view: "back",
    d: "M132,260 L152,262 L154,314 Q144,320 134,314 Z",
  },
  {
    id: "calf_left",
    view: "back",
    d: "M108,314 L126,312 L124,346 Q114,350 106,346 Z",
  },
  {
    id: "calf_right",
    view: "back",
    d: "M134,312 L152,314 L154,346 Q146,350 136,346 Z",
  },
];

interface BodySVGProps {
  selectedRegion: BodyRegionId | null;
  onSelectRegion: (id: BodyRegionId) => void;
  selectedView: BodyView;
}

export function BodySVG({
  selectedRegion,
  onSelectRegion,
  selectedView,
}: BodySVGProps) {
  const tps: TriggerPoint3D[] = selectedRegion
    ? TRIGGER_POINTS.filter(
        (tp) => tp.regionId === selectedRegion && tp.view === selectedView
      )
    : [];

  const visiblePaths = BODY_PATHS.filter((p) => p.view === selectedView);

  const visibleRegions = REGIONS.filter((r) => r.view === selectedView);

  return (
    <Svg viewBox="0 0 260 380" width="100%" height="100%">
      <Defs>
        <RadialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#0A0E1A" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Ellipse cx="130" cy="190" rx="95" ry="145" fill="url(#bodyGlow)" />

      {/* siluetă bază */}
      <Ellipse
        cx="130"
        cy="38"
        rx="24"
        ry="28"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <Path
        d="M98,66 Q98,54 162,66 L166,220 Q130,226 94,220 Z"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <Path
        d="M72,84 L98,84 L98,182 Q84,186 72,180 Z"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <Path
        d="M162,84 L188,84 L188,180 Q176,186 162,182 Z"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <Path
        d="M104,220 L128,220 L126,350 Q116,356 106,350 Z"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />
      <Path
        d="M132,220 L156,220 L158,350 Q148,356 138,350 Z"
        fill="#1E293B"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {selectedView !== "front" && (
        <Path
          d="M130,66 L130,220"
          stroke="#334155"
          strokeWidth="0.6"
          strokeDasharray="4,4"
        />
      )}

      {visiblePaths.map((regionPath) => {
        const regionMeta = visibleRegions.find((r) => r.id === regionPath.id);
        const col = severityColor(regionMeta?.emoji ?? "🟢");
        const isSelected = selectedRegion === regionPath.id;

        return (
          <Path
            key={regionPath.id}
            d={regionPath.d}
            fill={isSelected ? col + "66" : col + "22"}
            stroke={isSelected ? col : col + "88"}
            strokeWidth={isSelected ? 2.4 : 1.1}
            onPress={() => onSelectRegion(regionPath.id)}
          />
        );
      })}

      {tps.map((tp) => {
        const cx = (tp.x * 260) / 100;
        const cy = (tp.y * 380) / 100;

        return (
          <React.Fragment key={tp.id}>
            <Circle cx={cx} cy={cy} r={6} fill={C.accent} opacity={0.95} />
            <Circle
              cx={cx}
              cy={cy}
              r={11}
              fill="none"
              stroke={C.accent}
              strokeWidth={1.5}
              opacity={0.4}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

interface RegionListProps {
  selectedRegion: BodyRegionId | null;
  onSelect: (id: BodyRegionId) => void;
  selectedView: BodyView;
}

export function RegionList({
  selectedRegion,
  onSelect,
  selectedView,
}: RegionListProps) {
  const visibleRegions = REGIONS.filter((r) => r.view === selectedView);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      {visibleRegions.map((r) => {
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
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={[
                  styles.regionLabel,
                  isSelected && { color: C.accentSoft },
                ]}
              >
                {r.label}
              </Text>
              <Text style={styles.regionSub}>{r.tp} trigger points</Text>
            </View>

            <Text style={styles.regionEmoji}>{r.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

interface BodyViewTabsProps {
  selectedView: BodyView;
  onChangeView: (view: BodyView) => void;
}

export function BodyViewTabs({
  selectedView,
  onChangeView,
}: BodyViewTabsProps) {
  const tabs: BodyView[] = ["front", "back"];

  return (
    <View style={styles.tabsRow}>
      {tabs.map((tab) => {
        const active = selectedView === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChangeView(tab)}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {tab === "front" ? "Față" : "Spate"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  regionItem: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 10,
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

  regionEmoji: {
    fontSize: 16,
  },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  tabBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabBtnActive: {
    backgroundColor: C.blue + "22",
    borderColor: C.blue,
  },

  tabText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  tabTextActive: {
    color: C.text,
  },
});
