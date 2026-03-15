import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { useAuth } from "../../src/context/AuthContext";
import { logExercise } from "../../src/lib/db";
import { EXERCISES } from "../../src/data";
import { TypeBadge, Card, Button } from "../../src/components/UI";

// ── Per-exercise benefit text ─────────────────────────────────────────────────
const BENEFITS: Record<string, string> = {
  ex_chin_tucks:
    "Repositions the head over the spine, reducing stress on the cervical vertebrae. Essential for forward head posture — one of the most common postural issues in desk workers.",
  ex_upper_trap_stretch:
    "Relaxes and lengthens the upper trapezius, the muscle most often responsible for tension at the base of the neck and tension-type headaches. Reduces compression on C3–C5 vertebrae.",
  ex_wall_angels:
    "Simultaneously activates the shoulder external rotators, rhomboids and scapular stabilisers, counteracting the effects of rounded shoulders. One of the most complete postural correction exercises.",
  ex_levator_stretch:
    "Lengthens the levator scapulae — the muscle most commonly responsible for cervical stiffness and restricted head rotation. Often overlooked, but clinically significant.",
  ex_doorway_chest:
    "Opens shortened pectorals that pull the shoulders forward, allowing the scapulae to return to a neutral position. Directly counters the postural effects of computer work.",
  ex_cat_cow:
    "Mobilises the entire spine through flexion and extension, lubricating the intervertebral discs. Improves pelvic neutral awareness and reduces morning lumbar stiffness.",
  ex_child_pose:
    "Decompresses the lumbar spine through gentle traction, relaxes the paraspinal muscles and opens the facet joints. One of the most effective active recovery exercises for low back pain.",
  ex_dead_bug:
    "Trains neutral lumbar stabilisation through deep core activation (transverse abdominis + multifidus) without compressing the discs. Superior to the classic plank for lumbar issues.",
  ex_glute_bridge:
    "Activates the posterior chain (glutes + hamstrings) and pelvic stabilisers, correcting anterior-posterior pelvic imbalance. Essential for anterior pelvic tilt and lower back pain.",
  ex_clamshell:
    "Isolates and activates the gluteus medius — the critical muscle for lateral hip stability. Its weakness is a major cause of knee pain, hip pain and functional low back pain.",
  ex_piriformis_stretch:
    "Releases the piriformis, a deep gluteal muscle that, when tight, can compress the sciatic nerve and produce sciatica-like pain. The figure-4 stretch is the gold-standard technique.",
  ex_figure4:
    "The functional variant of the piriformis stretch — targets the hip external rotator muscles. More accessible than the floor version and can also be performed seated.",
  ex_hamstring_stretch:
    "Lengthens the hamstrings, whose chronic shortening contributes to anterior pelvic tilt, low back pain and restricted movement. Active stretching is superior to forced passive stretching.",
  ex_calf_stretch:
    "Addresses the gastrocnemius and soleus — frequently shortened muscles that affect ankle and knee biomechanics and global posture. The double stretch (straight + bent knee) is essential.",
};

// ── Per-exercise step-by-step instructions ────────────────────────────────────
const STEPS: Record<string, string[]> = {
  ex_chin_tucks: [
    "Sit up straight on a chair or stand tall, looking forward. Shoulders relaxed, chin parallel to the floor.",
    "Without lifting the chin, gently push the head straight back horizontally — as if making a 'double chin'. The chin retracts, it does not drop down.",
    "Feel a mild stretch at the base of the skull and in the suboccipital muscles. There should be no pain — only gentle elongation.",
    "Hold the retracted position for 3–5 seconds, breathing normally. A feeling of 'heaviness' at the back of the neck is normal.",
    "Return to start without letting the head drift forward again. The movement should be small and controlled — 1–2 cm. Repeat 12–15 times, 2–3 sets.",
  ],
  ex_upper_trap_stretch: [
    "Sit on a firm chair. With your left hand, grip the edge of the seat beneath you — this is the anchor that keeps the shoulder down.",
    "Tilt the head to the right (right ear toward right shoulder), without raising the left shoulder. The movement comes from the neck, not the trunk.",
    "With the right hand, apply gentle pressure on top of the head to deepen the stretch. Don't force it — the weight of the hand is enough.",
    "Feel the stretch along the entire left side of the neck toward the shoulder. Breathe deeply: on the exhale, let yourself sink slightly deeper.",
    "Hold 30–40 seconds, without moving the anchored shoulder. Repeat on the other side. 2–3 times per side.",
  ],
  ex_wall_angels: [
    "Stand with your back against a wall, feet 10–15 cm from the wall, knees slightly bent. Press your back, glutes and the back of the head against the wall.",
    "Raise your arms into a W shape — elbows at 90°, backs of hands and elbows touching the wall. Chin parallel to the floor — don't tilt it up.",
    "Keeping contact with the wall (back, elbows, backs of hands), slowly slide the arms up into a Y shape. Do not allow the lower back to arch away from the wall.",
    "If you cannot keep the backs of your hands on the wall — stop where contact is lost. Do NOT force higher; the limitation is your cue to work on.",
    "Slowly return to W. Feel the rhomboids and scapular stabilisers contracting. 10 slow reps, 2–3 sets. Quality over quantity.",
  ],
  ex_levator_stretch: [
    "Sit on a chair and grip the seat edge with your right hand (anchor). This keeps the right shoulder down throughout the stretch.",
    "Rotate the head 45° to the left — as if looking diagonally at the floor in front-left of you.",
    "From this rotated position, gently tilt the head forward-diagonally, with the chin dropping toward the left collarbone. Small movement — 10–15°.",
    "With the left hand, apply gentle pressure on the back of the head to deepen the stretch. Feel a deep stretch at the base of the neck, laterally and at the inner corner of the right shoulder blade.",
    "Hold 30–40 seconds, breathing. The exhale deepens the stretch. Repeat on the other side (switch anchor and direction). 2 times per side.",
  ],
  ex_doorway_chest: [
    "Stand in a doorway or at a wall corner. Raise your arm to 90° from the body (elbow at shoulder height, forearm vertical — L shape).",
    "Place the elbow and forearm against the door frame or wall. Keep the shoulder down — do not shrug.",
    "Take a small step forward with the opposite foot. Feel the chest opening and the shoulder drawing back.",
    "IMPORTANT: Keep the trunk straight and engaged — do not arch from the lower back. The stretch should be felt in the pectoral and front of the shoulder, not in the back.",
    "Hold 30–40 sec. You can vary the arm height (higher = clavicular pec, lower = sternal pec) for a complete stretch. 2–3 times per side.",
  ],
  ex_cat_cow: [
    "Start on all fours: palms directly under shoulders, knees directly under hips. Back neutral — not arched, not rounded.",
    "CAT: Exhale deeply and round the back toward the ceiling — chin to chest, tailbone down, abdomen drawn in. All vertebrae enter flexion.",
    "Hold Cat for 2–3 seconds. Feel the paraspinal muscles lengthening and the vertebral joints widening. A complete exhale intensifies the flexion.",
    "COW: Inhale and let the back drop — belly toward the floor, head and tailbone lifted, shoulder blades together. Full spinal extension.",
    "Hold Cow for 2–3 seconds. Alternate Cat–Cow slowly and continuously, 10–15 reps. Perfectly synchronise with breathing: exhale = Cat, inhale = Cow.",
  ],
  ex_child_pose: [
    "Start on all fours. Open the knees to hip-width or wider (wide child's pose variant for hip mobility).",
    "Slowly push the hips back toward the heels, keeping the arms extended forward on the floor. Forehead touches or approaches the floor.",
    "Fully relax the shoulders — let them fall toward the floor. Feel the stretch along the entire upper and lower back.",
    "Breathe deeply and slowly: on the INHALE feel the back widening laterally (posterior rib expansion). On the EXHALE, sink deeper into the position.",
    "Hold 1–2 minutes. This is not a strength exercise — it is active decompression. You can place a pillow between the hips and heels if you cannot reach fully down.",
  ],
  ex_dead_bug: [
    "Lie on your back on a firm surface. Raise the arms vertically toward the ceiling, knees bent at 90° with shins parallel to the floor (table-top position).",
    "Engage the core: press the lower back COMPLETELY into the floor — there should be no gap between your back and the floor. Maintain this throughout.",
    "Exhale slowly (4–5 sec) and SIMULTANEOUSLY lower the right arm overhead toward the floor and the LEFT leg toward the floor — without touching. Only lower as far as the back stays flat.",
    "Inhale and return to centre (table-top). Repeat with the LEFT arm and RIGHT leg. The movement is slow and controlled — not dynamic.",
    "COMMON MISTAKE: the back arching as the limbs lower. If this happens, reduce the range. 8–10 reps per side, 2–3 sets.",
  ],
  ex_glute_bridge: [
    "Lie on your back, knees bent to about 90°, feet flat on the floor at hip width. Arms at your sides, palms facing down.",
    "Engage the core and squeeze the glutes before lifting. Imagine 'squeezing a walnut' with your glutes.",
    "Push through the feet and raise the hips toward the ceiling, forming a straight line from shoulder to hip to knee. Do NOT hyperextend the lower back.",
    "Hold 2–3 seconds at the top with the glutes maximally contracted. Breathe normally — do not hold your breath.",
    "Lower vertebra by vertebra: lumbar, then thoracic, then glutes. Controlled and slow — not a free drop. 12–15 reps, 3 sets.",
  ],
  ex_clamshell: [
    "Lie on your side, knees bent to about 45°, hips stacked directly on top of each other. Head resting on the arm.",
    "Keep the feet TOGETHER throughout the exercise. Make sure the pelvis does not rotate backward on the lift.",
    "Keeping the feet together, raise the top knee as high as possible — rotating from the hip. The movement comes exclusively from the hip joint, not from pelvic rotation.",
    "Hold 1–2 seconds at the top. Feel the intense contraction in the gluteus medius (upper-outer area of the buttock). If you don't feel it there, the pelvis is rotating.",
    "Lower slowly and in control. 15–20 reps per side, 3 sets. You can add a resistance band above the knees for progression.",
  ],
  ex_piriformis_stretch: [
    "Lie on your back with both knees bent, feet flat on the floor. Place the RIGHT ankle on the LEFT thigh (near the knee) — figure-4 shape.",
    "Actively flex the right ankle (pull the right foot toward you). This protects the right knee throughout the stretch.",
    "Lift the LEFT foot off the floor and pull the left thigh toward the chest with both hands (or with a strap). Feel the deep stretch in the right glute.",
    "Hold 30–60 seconds, breathing deeply. On each exhale, sink slightly deeper. Do not force it — the piriformis is deep and responds poorly to aggressive stretching.",
    "Repeat on the other side. 2–3 times per side. If you feel numbness or referred pain, reduce the intensity.",
  ],
  ex_figure4: [
    "Sit on a chair or lie on the floor. Cross the right ankle over the left knee (figure-4). Flex the right ankle to protect the knee.",
    "Keep the trunk straight and lean slightly forward from the hips (without rounding the back) — feel the stretch appearing in the right glute.",
    "Floor alternative: lie on your back, raise both legs, and with your hands pull the thigh of the lower leg toward you.",
    "Hold 30–45 seconds per side. Breathe steadily — the exhale deepens the glute stretch.",
    "The stretch should be felt ONLY in the glute (gluteus medius, piriformis). If you feel pain in the knee, stop immediately.",
  ],
  ex_hamstring_stretch: [
    "Lie on your back on a firm surface. Bend the LEFT knee with the foot flat on the floor — this maintains lumbar stability.",
    "Raise the RIGHT leg extended. Holding the back of the thigh with both hands (or a towel/strap around the foot), draw the leg toward you.",
    "Keep the right knee as straight as possible, but do not force full extension. An angle of 70–80° from the floor is sufficient.",
    "Feel the stretch along the entire back of the thigh (hamstrings). Do not arch the lower back — if it arches, reduce the range.",
    "Hold 30–40 seconds, breathing. Repeat 2–3 times per side. Alternative: standing stretch with foot on a chair (more practical during desk breaks).",
  ],
  ex_calf_stretch: [
    "Stand facing a wall with palms resting on it. Step back with the right foot, keeping the RIGHT heel on the floor.",
    "GASTROCNEMIUS: Keep the right knee fully straight. Lean gently toward the wall — feel the strong stretch in the upper calf. Hold 30 sec.",
    "SOLEUS (deeper): From the same position, slightly bend the right knee, keeping the heel on the floor. The stretch moves lower, toward the ankle. Hold 30 sec.",
    "Total: 30 sec gastrocnemius + 30 sec soleus = 1 minute per foot. Do 2–3 sets per foot.",
    "Golden rule: THE HEEL STAYS ON THE FLOOR AT ALL TIMES. Raising the heel completely cancels the stretch. If you cannot keep it down, move the foot closer to the wall.",
  ],
  default: [
    "Prepare a clear and comfortable space with no obstacles around you.",
    "Perform the movement slowly and in control — not with speed. Control beats range.",
    "Hold the position for the indicated duration, breathing evenly and deeply.",
    "On the exhale, let yourself sink slightly deeper into the position (for stretches) or maintain the contraction (for activation exercises).",
    "Repeat 2–3 times for best results. If you feel sharp pain, stop immediately.",
  ],
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
const [startTime] = useState<number>(Date.now());
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);

  const exercise = EXERCISES.find((e) => e.id === id);
  if (!exercise) {
    return (
      <View style={styles.root}>
        <Text style={{ color: C.text, padding: 24 }}>Exercise not found.</Text>
      </View>
    );
  }

  const steps = STEPS[id] ?? STEPS.default;
  const benefit = BENEFITS[id];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      {/* ── Header card ─────────────────────────────────── */}
      <Card style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Text style={{ fontSize: 40 }}>{exercise.icon}</Text>
        </View>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.badgeRow}>
          <TypeBadge type={exercise.type} />
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⏱ {exercise.duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{exercise.level}</Text>
          </View>
        </View>

        {/* ── Benefit text ── */}
        {!!benefit && (
          <View style={styles.benefitBox}>
            <Text style={styles.benefitLabel}>Why it works</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        )}
      </Card>

      {/* ── Steps ───────────────────────────────────────── */}
      {!started ? (
        <Button
          label="▶  Start exercise"
          onPress={() => setStarted(true)}
        />
      ) : (
        <Card>
          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Step {currentStep + 1} of {steps.length}
          </Text>

          {/* Current step */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>{currentStep + 1}</Text>
            <Text style={styles.stepText}>{steps[currentStep]}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              disabled={currentStep === 0}
              onPress={() => setCurrentStep((s) => s - 1)}
              style={[styles.navBtn, currentStep === 0 && { opacity: 0.3 }]}
            >
              <Text style={styles.navBtnText}>← Back</Text>
            </TouchableOpacity>

            {currentStep < steps.length - 1 ? (
  <TouchableOpacity
    onPress={() => setCurrentStep((s) => s + 1)}
    style={[styles.navBtn, styles.navBtnPrimary]}
  >
    <Text style={[styles.navBtnText, { color: "#fff" }]}>
      Next →
    </Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    onPress={async () => {
      // Calculate duration in seconds
      const durationSec = Math.round((Date.now() - startTime) / 1000);

      // Log exercise to Supabase
      if (user) {
        try {
          await logExercise(user.id, {
            exercise_id:   exercise.id,
            exercise_name: exercise.name,
            duration_sec:  durationSec,
          });
        } catch (err) {
          console.error('Failed to log exercise:', err);
        }
      }

      router.back();
    }}
    style={[styles.navBtn, { backgroundColor: C.green }]}
  >
    <Text style={[styles.navBtnText, { color: "#fff" }]}>
      ✅ Done!
    </Text>
  </TouchableOpacity>
)}
          </View>
        </Card>
      )}

      {/* ── All steps preview ───────────────────────────── */}
      <Card>
        <Text style={styles.cardTitle}>All steps</Text>
        {steps.map((s, i) => (
          <View
            key={i}
            style={[
              styles.allStepRow,
              i < steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border },
            ]}
          >
            <View
              style={[
                styles.allStepNum,
                started && i <= currentStep && { backgroundColor: C.accent },
              ]}
            >
              <Text style={styles.allStepNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.allStepText, started && i < currentStep && { opacity: 0.4 }]}>
              {s}
            </Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ padding: 16 },

  headerCard: { alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.accent + "22",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  title:    { fontSize: 18, fontWeight: "800", color: C.text, textAlign: "center", marginBottom: 10 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 },
  metaChip: {
    backgroundColor: C.surface, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.border,
  },
  metaText: { fontSize: 10, color: C.textMuted },

  benefitBox: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    marginTop: 4,
  },
  benefitLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 19,
    textAlign: "left",
  },

  progressBg:   { height: 4, backgroundColor: C.border, borderRadius: 99, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: C.accent, borderRadius: 99 },
  progressLabel:{ fontSize: 11, color: C.textMuted, marginBottom: 14 },

  stepBox: {
    backgroundColor: C.surface, borderRadius: 14, padding: 16,
    flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  stepNum: {
    fontSize: 24, fontWeight: "900", color: C.accent, width: 28,
  },
  stepText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 22 },

  navRow:        { flexDirection: "row", gap: 10 },
  navBtn:        {
    flex: 1, borderRadius: 10, paddingVertical: 11,
    alignItems: "center", backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  navBtnPrimary: { backgroundColor: C.accent, borderColor: C.accent },
  navBtnText:    { fontSize: 13, fontWeight: "700", color: C.textMuted },

  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },
  allStepRow:{ flexDirection: "row", gap: 10, paddingVertical: 12, alignItems: "flex-start" },
  allStepNum:{
    width: 24, height: 24, borderRadius: 99,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0, marginTop: 1,
  },
  allStepNumText:{ fontSize: 11, fontWeight: "700", color: C.textMuted },
  allStepText:   { flex: 1, fontSize: 13, color: C.textMuted, lineHeight: 20 },
});