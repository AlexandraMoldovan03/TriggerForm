import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { C } from "../../src/utils/colors";
import { EXERCISES } from "../../src/data";
import { TypeBadge, Card } from "../../src/components/UI";
import type { ExerciseType } from "../../src/types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ── Tutorial videos ─────────────────────────────────────────────────────────

type Tutorial = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  source: any;
};

const TUTORIALS: Tutorial[] = [
  {
    id: "t1",
    title: "Neck & Shoulder\nRelease",
    subtitle: "Upper trap · Levator · Chin tucks",
    tag: "Tutorial 1",
    color: "#1A2B3C",
    source: require("../../src/assets/body/IMG_8614.mov"),
  },
  {
    id: "t2",
    title: "Lower Back\nReset",
    subtitle: "Lumbar · Core · Hip flexors",
    tag: "Tutorial 2",
    color: "#1C2B1A",
    source: require("../../src/assets/body/IMG_8616.mov"),
  },
  {
    id: "t3",
    title: "Hip & Glute\nMobility",
    subtitle: "Piriformis · Glute med · Hamstring",
    tag: "Tutorial 3",
    color: "#2B1A2A",
    source: require("../../src/assets/body/IMG_8617.mov"),
  },
];

// ── Filters ─────────────────────────────────────────────────────────────────

type Filter = "all" | ExerciseType;

const FILTERS: { id: Filter; label: string; icon: string }[] = [
  { id: "all",      label: "All",      icon: "⚡" },
  { id: "massage",  label: "Release",  icon: "💆" },
  { id: "stretch",  label: "Stretch",  icon: "🧘" },
  { id: "mobility", label: "Mobility", icon: "🔄" },
];

function getTypeColor(type: ExerciseType): string {
  switch (type) {
    case "massage":  return "#4ECDC4";
    case "stretch":  return "#A78BFA";
    case "mobility": return C.accent;
    default:         return C.accent;
  }
}

function getDuration(type: ExerciseType): string {
  switch (type) {
    case "massage":  return "Self-release";
    case "stretch":  return "Deep stretch";
    case "mobility": return "Mobility work";
    default:         return "Recovery";
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ExercisesScreen() {
  const [filter, setFilter]             = useState<Filter>("all");
  const [activeTutorial, setActive]     = useState<Tutorial | null>(null);
  const videoRef                        = useRef<Video>(null);
  const router                          = useRouter();

  const filtered = useMemo(
    () => EXERCISES.filter((e) => filter === "all" || e.type === filter),
    [filter]
  );

  const openTutorial = (t: Tutorial) => setActive(t);
  const closeTutorial = async () => {
    await videoRef.current?.pauseAsync();
    setActive(null);
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>RECOVERY PROGRAM</Text>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <Text style={styles.headerSub}>
          Guided tutorials for release, stretch & mobility
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Featured Tutorials ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>FEATURED TUTORIALS</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>3 videos</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tutorialsRow}
          decelerationRate="fast"
          snapToInterval={TUTORIAL_W + 12}
        >
          {TUTORIALS.map((t) => (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.88}
              style={[styles.tutorialCard, { backgroundColor: t.color }]}
              onPress={() => openTutorial(t)}
            >
              {/* Background video preview — muted, paused */}
              <Video
                source={t.source}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.COVER}
                isMuted
                isLooping
                shouldPlay={false}
              />

              {/* Overlay gradient */}
              <View style={styles.tutorialOverlay} />

              {/* Content */}
              <View style={styles.tutorialContent}>
                <View style={styles.tutorialTagRow}>
                  <View style={styles.tutorialTag}>
                    <Text style={styles.tutorialTagText}>{t.tag}</Text>
                  </View>
                  <View style={styles.muteTag}>
                    <Text style={styles.muteTagText}></Text>
                  </View>
                </View>

                <Text style={styles.tutorialTitle}>{t.title}</Text>
                <Text style={styles.tutorialSubtitle}>{t.subtitle}</Text>

                <View style={styles.playBtn}>
                  <Text style={styles.playIcon}>▶</Text>
                  <Text style={styles.playText}>Play tutorial</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Filter chips ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>EXERCISE LIBRARY</Text>
          <Text style={styles.countBadge}>{filtered.length} exercises</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.85}
              >
                <Text style={styles.filterIcon}>{item.icon}</Text>
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Exercise list ── */}
        {filtered.map((exercise, i) => {
          const typeColor = getTypeColor(exercise.type);
          return (
            <TouchableOpacity
              key={exercise.id}
              activeOpacity={0.88}
              style={styles.exerciseCard}
              onPress={() => router.push(`/exercise/${exercise.id}`)}
            >
              {/* Left accent bar */}
              <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

              <View style={styles.exerciseInner}>
                {/* Icon */}
                <View style={[styles.iconBox, { borderColor: typeColor + "44", backgroundColor: typeColor + "18" }]}>
                  <Text style={styles.iconText}>{exercise.icon}</Text>
                </View>

                {/* Content */}
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseTopRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={[styles.levelChip, { backgroundColor: typeColor + "22" }]}>
                      <Text style={[styles.levelText, { color: typeColor }]}>{exercise.level}</Text>
                    </View>
                  </View>

                  <Text style={styles.exerciseType}>{getDuration(exercise.type)}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏱</Text>
                      <Text style={styles.metaText}>{exercise.duration}</Text>
                    </View>
                    <TypeBadge type={exercise.type} />
                  </View>
                </View>

                {/* Arrow */}
                <View style={[styles.arrowCircle, { backgroundColor: typeColor + "22" }]}>
                  <Text style={[styles.arrowText, { color: typeColor }]}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Full-screen video modal ── */}
      <Modal
        visible={activeTutorial !== null}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeTutorial}
      >
        <View style={styles.modalRoot}>
          <StatusBar hidden />

          {activeTutorial && (
            <Video
              ref={videoRef}
              source={activeTutorial.source}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.CONTAIN}
              isMuted
              isLooping
              shouldPlay
              useNativeControls={false}
            />
          )}

          {/* Dark top bar */}
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={closeTutorial} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <View style={styles.modalTitleBlock}>
              <Text style={styles.modalTag}>{activeTutorial?.tag}</Text>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {activeTutorial?.title.replace("\n", " ")}
              </Text>
            </View>
            <View style={styles.modalMuteBadge}>
              <Text style={styles.modalMuteText}>🔇</Text>
            </View>
          </View>

          {/* Bottom subtitle */}
          <View style={styles.modalBottom}>
            <Text style={styles.modalSubtitle}>{activeTutorial?.subtitle}</Text>
            <Text style={styles.modalHint}>Follow along at your own pace</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const TUTORIAL_W = SCREEN_W * 0.78;

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: 4 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: C.accent,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.textMuted,
    letterSpacing: 1.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accent + "22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
  },
  liveText: { fontSize: 10, color: C.accent, fontWeight: "700" },
  countBadge: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "600",
  },

  // Tutorials
  tutorialsRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tutorialCard: {
    width: TUTORIAL_W,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  tutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  tutorialContent: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
  },
  tutorialTagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  tutorialTag: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tutorialTagText: { fontSize: 10, color: "#fff", fontWeight: "700", letterSpacing: 1 },
  muteTag: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  muteTagText: { fontSize: 10, color: "rgba(255,255,255,0.8)" },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 28,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  tutorialSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 14,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  playIcon: { fontSize: 10, color: "#000", fontWeight: "900" },
  playText: { fontSize: 12, color: "#000", fontWeight: "800" },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
    marginTop: 20,
  },

  // Filters
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  filterChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  filterIcon: { fontSize: 12 },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
  },
  filterLabelActive: { color: "#fff" },

  // Exercise cards
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: C.card,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  exerciseInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconText: { fontSize: 26 },
  exerciseContent: { flex: 1 },
  exerciseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    flex: 1,
  },
  levelChip: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelText: { fontSize: 10, fontWeight: "700" },
  exerciseType: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaIcon: { fontSize: 10 },
  metaText: { fontSize: 10, color: C.textMuted, fontWeight: "600" },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  arrowText: { fontSize: 16, fontWeight: "800" },

  // Modal
  modalRoot: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
  },
  modalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: { fontSize: 14, color: "#fff", fontWeight: "700" },
  modalTitleBlock: { flex: 1 },
  modalTag: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  modalMuteBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 99,
    padding: 8,
  },
  modalMuteText: { fontSize: 16 },
  modalBottom: {
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    paddingTop: 14,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});
