import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { C } from "../../utils/colors";
import { REGIONS, TRIGGER_POINTS } from "../../data";
import type { BodyRegionId, BodyView, TriggerPoint3D } from "../../types";
import { BodyBack, BodyFront } from "./HumanBodySVG";

function severityColor(emoji: string): string {
  if (emoji === "🔴") return C.accent;
  if (emoji === "🟠") return C.amber;
  if (emoji === "🟡") return "#EAB308";
  return C.green;
}

type Hotspot = {
  id: BodyRegionId;
  view: BodyView;
  left: string;
  top: string;
  width: string;
  height: string;
};

const HOTSPOTS: Hotspot[] = [
  // FRONT
  {
    id: "pec_left",
    view: "front",
    left: "33%",
    top: "22%",
    width: "14%",
    height: "12%",
  },
  {
    id: "pec_right",
    view: "front",
    left: "52%",
    top: "22%",
    width: "14%",
    height: "12%",
  },

  // BACK
  {
    id: "upper_trap_left",
    view: "back",
    left: "30%",
    top: "16%",
    width: "16%",
    height: "10%",
  },
  {
    id: "upper_trap_right",
    view: "back",
    left: "54%",
    top: "16%",
    width: "16%",
    height: "10%",
  },
  {
    id: "levator_left",
    view: "back",
    left: "42%",
    top: "18%",
    width: "10%",
    height: "10%",
  },
  {
    id: "levator_right",
    view: "back",
    left: "50%",
    top: "18%",
    width: "10%",
    height: "10%",
  },
  {
    id: "rhomboid_left",
    view: "back",
    left: "34%",
    top: "29%",
    width: "16%",
    height: "13%",
  },
  {
    id: "rhomboid_right",
    view: "back",
    left: "50%",
    top: "29%",
    width: "16%",
    height: "13%",
  },
  {
    id: "lumbar_left",
    view: "back",
    left: "38%",
    top: "43%",
    width: "13%",
    height: "12%",
  },
  {
    id: "lumbar_right",
    view: "back",
    left: "49%",
    top: "43%",
    width: "13%",
    height: "12%",
  },
  {
    id: "glute_med_left",
    view: "back",
    left: "35%",
    top: "55%",
    width: "16%",
    height: "12%",
  },
  {
    id: "glute_med_right",
    view: "back",
    left: "49%",
    top: "55%",
    width: "16%",
    height: "12%",
  },
  {
    id: "piriformis_left",
    view: "back",
    left: "40%",
    top: "60%",
    width: "10%",
    height: "8%",
  },
  {
    id: "piriformis_right",
    view: "back",
    left: "50%",
    top: "60%",
    width: "10%",
    height: "8%",
  },
  {
    id: "hamstring_left",
    view: "back",
    left: "39%",
    top: "69%",
    width: "12%",
    height: "16%",
  },
  {
    id: "hamstring_right",
    view: "back",
    left: "50%",
    top: "69%",
    width: "12%",
    height: "16%",
  },
  {
    id: "calf_left",
    view: "back",
    left: "40%",
    top: "84%",
    width: "10%",
    height: "11%",
  },
  {
    id: "calf_right",
    view: "back",
    left: "51%",
    top: "84%",
    width: "10%",
    height: "11%",
  },
];

interface BodySVGProps {
  selectedRegion: BodyRegionId | null;
  onSelectRegion: (id: BodyRegionId) => void;
  selectedView: BodyView;
  selectedSubRegion?: string | null;
}

export function BodySVG({
  selectedRegion,
  onSelectRegion,
  selectedView,
  selectedSubRegion = null,
}: BodySVGProps) {
  const visibleRegions = REGIONS.filter((r) => r.view === selectedView);
  const visibleHotspots = HOTSPOTS.filter((h) => h.view === selectedView);

  const tps: TriggerPoint3D[] = selectedRegion
    ? TRIGGER_POINTS.filter(
        (tp) =>
          tp.regionId === selectedRegion &&
          tp.view === selectedView &&
          (selectedSubRegion === null || tp.subRegionId === selectedSubRegion)
      )
    : [];

  // SVG coordinate mapping: tp.x% → svgX = tp.x/100*320, tp.y% → svgY = tp.y/100*600
  const SVG_W = 320;
  const SVG_H = 600;

  return (
    <View style={styles.bodyCanvas}>
      {/* ── realistic anatomical body ── */}
      {selectedView === "back" ? <BodyBack /> : <BodyFront />}

      {/* ── hotspot tap zones (absolutely positioned) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {visibleHotspots.map((hotspot) => {
          const regionMeta = visibleRegions.find((r) => r.id === hotspot.id);
          const col = severityColor(regionMeta?.emoji ?? "🟢");
          const isSelected = selectedRegion === hotspot.id;

          return (
            <TouchableOpacity
              key={`${hotspot.view}-${hotspot.id}`}
              onPress={() => onSelectRegion(hotspot.id)}
              activeOpacity={0.85}
              style={[
                styles.hotspot,
                {
                  left: hotspot.left,
                  top: hotspot.top,
                  width: hotspot.width,
                  height: hotspot.height,
                  backgroundColor: isSelected ? col + "44" : col + "18",
                  borderColor: isSelected ? col : col + "66",
                  borderWidth: isSelected ? 2 : 1,
                } as any,
              ]}
            />
          );
        })}
      </View>

      {/* ── trigger-point dots rendered in SVG space ── */}
      {tps.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {tps.map((tp) => {
              const cx = (tp.x / 100) * SVG_W;
              const cy = (tp.y / 100) * SVG_H;
              return (
                <G key={tp.id}>
                  {/* outer pulse ring */}
                  <Circle cx={cx} cy={cy} r={14} fill="none" stroke="#E94560" strokeWidth="1" opacity={0.3} />
                  {/* inner dot */}
                  <Circle cx={cx} cy={cy} r={6} fill="#E94560" stroke="#fff" strokeWidth="1.5" opacity={0.92} />
                  {/* bright center */}
                  <Circle cx={cx} cy={cy} r={2.5} fill="#fff" opacity={0.85} />
                </G>
              );
            })}
          </Svg>
        </View>
      )}
    </View>
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
            activeOpacity={0.75}
            style={[
              styles.regionItem,
              isSelected && styles.regionItemSelected,
            ]}
          >
            <View style={styles.regionTextWrap}>
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

            <View style={styles.regionEmojiWrap}>
              <Text style={styles.regionEmoji}>{r.emoji}</Text>
            </View>
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
            activeOpacity={0.85}
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
  bodyCanvas: {
    flex: 1,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0A0E1A",
  },

  hotspot: {
    position: "absolute",
    borderRadius: 16,
  },

  tpDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: C.accent,
    marginLeft: -6,
    marginTop: -6,
    borderWidth: 2,
    borderColor: "#fff",
  },

  tpRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 999,
    marginLeft: -12,
    marginTop: -12,
    borderWidth: 1.5,
    borderColor: C.accent,
    opacity: 0.35,
  },

  regionItem: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  regionItemSelected: {
    backgroundColor: C.accent + "18",
    borderColor: C.accent + "70",
  },

  regionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },

  regionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
  },

  regionSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 3,
  },

  regionEmojiWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  regionEmoji: {
    fontSize: 16,
  },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },

  tabBtnActive: {
    backgroundColor: C.blue + "22",
    borderColor: C.blue,
  },

  tabText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  tabTextActive: {
    color: C.text,
  },
});
