import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { C } from "../src/utils/colors";
import { Card } from "../src/components/UI";

// ── Types ────────────────────────────────────────────────────────────────────
type SpecialistId = "physio" | "posture" | "ortho" | "manual";

interface Specialist {
  id: SpecialistId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  /** Which keywords in the query boost this specialist's score */
  keywords: string[];
  baseScore: number;
}

// ── Specialist catalogue ─────────────────────────────────────────────────────
const SPECIALISTS: Specialist[] = [
  {
    id: "physio",
    title: "Physiotherapist",
    subtitle: "Kinetoterapeut",
    icon: "🏥",
    color: C.blue,
    description:
      "Evaluates movement patterns, muscle imbalances and pain through clinical assessment. Creates personalised rehabilitation programs combining manual techniques with therapeutic exercise.",
    keywords: [
      "shoulder", "hip", "alignment", "asymmetry", "pain",
      "exercise", "rehabilitation", "lumbar", "lower_back",
      "hamstring", "calf", "knee", "mobility", "strength",
      "durere", "spate", "genunchi", "umăr", "șold",
    ],
    baseScore: 3,
  },
  {
    id: "posture",
    title: "Posture Specialist",
    subtitle: "Specialist în postură",
    icon: "🧍",
    color: C.accent,
    description:
      "Analyses spinal alignment, weight distribution and compensatory patterns. Works on correcting forward head, rounded shoulders, pelvic tilt and swayback through postural re-education.",
    keywords: [
      "forward_head", "thoracic_rounding", "pelvic_tilt", "swayback",
      "posture", "alignment", "rounded", "head", "thoracic",
      "cervical", "lordosis", "kyphosis", "moderate", "severe",
      "neck", "gât", "postură",
    ],
    baseScore: 2,
  },
  {
    id: "ortho",
    title: "Orthopedic Specialist",
    subtitle: "Medic ortoped",
    icon: "🦴",
    color: C.teal,
    description:
      "Assesses structural and skeletal issues including joint degeneration, disc problems and scoliosis. Determines whether imaging or medical intervention is required alongside physiotherapy.",
    keywords: [
      "hip_alignment", "shoulder_alignment", "severe", "moderate_asymmetry",
      "severe_asymmetry", "pelvic", "disc", "structural", "scoliosis",
      "ortho", "joint", "bone", "articulație", "coloană",
    ],
    baseScore: 1,
  },
  {
    id: "manual",
    title: "Manual Therapist",
    subtitle: "Terapeut manual",
    icon: "🙌",
    color: C.amber,
    description:
      "Specialises in hands-on soft tissue release, myofascial techniques and trigger-point therapy. Highly effective for muscle tension, restricted range of motion and referred pain patterns.",
    keywords: [
      "tension", "tight", "muscle", "trigger", "stiff", "restricted",
      "upper_trap", "levator", "rhomboid", "piriformis",
      "masaj", "tensiune", "blocat", "crampe",
    ],
    baseScore: 2,
  },
];

// ── Ranking logic ────────────────────────────────────────────────────────────
function rankSpecialists(query: string): (Specialist & { score: number; matchedReason: string })[] {
  const lower = (query ?? "").toLowerCase();

  return SPECIALISTS
    .map((s) => {
      const hits = s.keywords.filter((kw) => lower.includes(kw));
      const score = s.baseScore + hits.length * 2;
      const matchedReason = buildReason(s.id, hits, lower);
      return { ...s, score, matchedReason };
    })
    .sort((a, b) => b.score - a.score);
}

function buildReason(
  id: SpecialistId,
  hits: string[],
  query: string
): string {
  // Custom contextual reason per specialist + detected signals
  if (id === "posture") {
    if (query.includes("forward_head") || query.includes("head"))
      return "Forward head posture detected — postural re-education recommended.";
    if (query.includes("thoracic") || query.includes("rounding"))
      return "Thoracic rounding pattern detected — spinal alignment work indicated.";
    if (query.includes("pelvic") || query.includes("swayback"))
      return "Pelvic or swayback pattern — postural correction focus.";
  }
  if (id === "physio") {
    if (query.includes("shoulder") || query.includes("umăr"))
      return "Shoulder asymmetry or pain — physiotherapy assessment indicated.";
    if (query.includes("hip") || query.includes("șold") || query.includes("pelvic"))
      return "Hip or pelvic involvement — kinetic chain evaluation recommended.";
    if (query.includes("pain") || query.includes("durere"))
      return "Pain pattern identified — rehabilitative physiotherapy is first-line.";
  }
  if (id === "ortho") {
    if (
      query.includes("severe") ||
      query.includes("moderate_asymmetry") ||
      query.includes("severe_asymmetry")
    )
      return "Significant structural asymmetry — orthopedic evaluation recommended.";
  }
  if (id === "manual") {
    if (query.includes("tight") || query.includes("blocat") || query.includes("stiff"))
      return "Muscular restriction detected — hands-on manual therapy indicated.";
  }

  if (hits.length > 0) {
    return `Relevant to detected pattern: ${hits.slice(0, 2).join(", ")}.`;
  }
  return "Part of a comprehensive musculoskeletal care team.";
}

// ── Badge: rank position ─────────────────────────────────────────────────────
const RANK_LABEL = ["Primary", "Secondary", "Also consider", "Complementary"];
const RANK_COLOR = [C.accent, C.blue, C.teal, C.amber];

// ── Screen ───────────────────────────────────────────────────────────────────
export default function SpecialistsScreen() {
  const router = useRouter();
  const { specialistQuery } = useLocalSearchParams<{ specialistQuery: string }>();

  const ranked = useMemo(() => rankSpecialists(specialistQuery ?? ""), [specialistQuery]);

  const queryLabel = (specialistQuery ?? "").replace(/_/g, " ").trim();

  return (
    <View style={styles.root}>
      {/* ── Header ───────────────────────────────────────────────────
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Recommended Specialists</Text>
          <Text style={styles.headerSub}>Based on your scan results</Text>
        </View>
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Detected issue pill ───────────────────────────────────── */}
        {!!queryLabel && (
          <View style={styles.queryPill}>
            <Text style={styles.queryPillIcon}>🔍</Text>
            <Text style={styles.queryPillText} numberOfLines={2}>
              {queryLabel}
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          Ordered by relevance to your condition
        </Text>

        {/* ── Specialist cards ──────────────────────────────────────── */}
        {ranked.map((s, index) => {
          const rankColor = RANK_COLOR[index] ?? C.textMuted;
          const rankLabel = RANK_LABEL[index] ?? "Complementary";
          const isTop = index === 0;

          return (
            <Card
              key={s.id}
              style={[styles.card, isTop && { borderColor: s.color + "66" }]}
            >
              {/* rank badge */}
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: rankColor + "22", borderColor: rankColor + "55" },
                ]}
              >
                <Text style={[styles.rankBadgeText, { color: rankColor }]}>
                  {rankLabel}
                </Text>
              </View>

              {/* icon + title */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: s.color + "22" }]}>
                  <Text style={styles.icon}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{s.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: s.color }]}>
                    {s.subtitle}
                  </Text>
                </View>
              </View>

              {/* why relevant */}
              {!!s.matchedReason && (
                <View style={[styles.reasonBox, { borderLeftColor: s.color }]}>
                  <Text style={styles.reasonText}>{s.matchedReason}</Text>
                </View>
              )}

              {/* description */}
              <Text style={styles.cardDesc}>{s.description}</Text>
            </Card>
          );
        })}

        {/* ── Disclaimer ────────────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerText}>
            This list is informational only and based on your posture scan.
            It is not a medical diagnosis. Always consult a licensed healthcare
            professional for a proper evaluation.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
    gap: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: C.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
  },

  headerSub: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  scroll: {
    padding: 16,
  },

  queryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  queryPillIcon: {
    fontSize: 14,
  },

  queryPillText: {
    flex: 1,
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
    fontStyle: "italic",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  card: {
    marginBottom: 12,
    gap: 10,
  },

  rankBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 2,
  },

  rankBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  icon: {
    fontSize: 22,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
  },

  cardSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  reasonBox: {
    backgroundColor: C.surface,
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  reasonText: {
    fontSize: 12,
    color: C.text,
    lineHeight: 18,
    fontWeight: "500",
  },

  cardDesc: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 19,
  },

  disclaimer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    alignItems: "flex-start",
  },

  disclaimerIcon: {
    fontSize: 16,
    marginTop: 1,
  },

  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 17,
  },
});
