/**
 * painAnalysis.ts
 * Maps a free-text pain description -> suggested trigger-point regions.
 * Uses Gemini with clinically informed trigger-point referral knowledge;
 * falls back to keyword heuristics if the AI request fails.
 */

import type { BodyRegionId, BodyView } from "../types";

export interface PainSuggestion {
  regionId: BodyRegionId;
  label: string;
  view: BodyView;
  confidence: "high" | "medium" | "low";
  /** Short clinical summary for the card */
  reason: string;
  /** Detailed explanation of why this muscle can produce pain elsewhere */
  referralPattern: string;
  /** Practical self-release / massage guidance */
  massageTip: string;
}

/**
 * IMPORTANT:
 * For production, DO NOT keep a Gemini API key in the client app.
 * Move this request to your backend.
 */
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─────────────────────────────────────────────────────────────────────────────
// Deep clinical prompt knowledge
// ─────────────────────────────────────────────────────────────────────────────
const CLINICAL_KNOWLEDGE = `
=== CLINICAL KNOWLEDGE: MYOFASCIAL TRIGGER POINT REFERRAL PATTERNS ===

CORE PRINCIPLE:
Pain is often NOT felt where the dysfunctional muscle is located.
Myofascial trigger points commonly refer pain to distant zones.
The key clinical insight is to identify the DRIVER muscle, not just the painful area.
Massage and release are typically applied to the CAUSATIVE muscle, not the pain site.

HEAD, NECK, TEMPLE, EYE PAIN
• Tension headache, temple pain, occipital pain, eye pain
  -> UPPER TRAPEZIUS:
     One of the most common muscular sources of headache.
     Trigger points near the top of the shoulder can refer pain toward the temple, jaw, behind the eye, ear, and occiput.
     Patients often massage the head, but the source is frequently the shoulder-neck junction.
  -> LEVATOR SCAPULAE:
     Often causes pain at the base of the skull and neck stiffness, especially with head rotation.

NECK STIFFNESS / "LOCKED" NECK
• Pain when turning the head, torticollis, cervical stiffness
  -> LEVATOR SCAPULAE:
     Signature muscle for limited cervical rotation and sharp upper neck pain.
     Common referral: angle of neck, upper medial scapula, base of skull.
  -> UPPER TRAPEZIUS:
     May contribute to lateral neck tightness and headache.

SHOULDER / ARM PAIN
• Front shoulder pain, difficulty raising the arm, deep shoulder ache
  -> PECTORAL REGION:
     A tight pectoral complex can create anterior shoulder loading, rounded shoulders, and neurovascular irritation.
     Patients may experience pain in the front of the shoulder even though the dysfunctional tissue is on the chest wall.
  -> UPPER TRAPEZIUS:
     Distal trigger points can refer into the shoulder and upper arm.

BETWEEN THE SHOULDER BLADES
• Interscapular pain, pain along the medial border of the scapula
  -> RHOMBOID:
     Classic source of pain “between the shoulder blades”.
     Referral often stays along the medial scapular border.
  -> LEVATOR SCAPULAE:
     Often produces pain near the superior angle of the scapula.

CHEST / ANTERIOR TORSO
• Chest tightness, front chest pain, sternum-area tension
  -> PECTORAL REGION:
     Can mimic local chest discomfort and contribute to forward shoulder posture.
     Important: chest pain must always be medically evaluated if there is any concern for cardiac or urgent causes.

LOW BACK / LUMBAR PAIN
• Low back pain, pain after prolonged sitting, difficulty standing upright
  -> LUMBAR PARASPINAL / QUADRATUS-LIKE PATTERN:
     One of the most common muscular drivers of “mechanical” low back pain.
     Referral can spread toward the iliac crest, lateral hip, upper gluteal region, or groin.
     Many people massage directly over the spine, but the driver may be lateral to it.

HIP / GLUTE / SCIATICA-LIKE PAIN
• Deep buttock pain, sciatic-like symptoms, pain down the leg
  -> PIRIFORMIS:
     Deep gluteal trigger points can mimic sciatica by irritating tissues around the sciatic nerve pathway.
     Pain can travel from the buttock into the posterior thigh and sometimes lower.
     This often feels like a spinal problem, but the local driver can be in the deep gluteal region.
  -> GLUTEUS MEDIUS-LIKE PATTERN:
     Frequently refers toward the lateral hip, sacral area, and outer thigh.
     Often mistaken for low back pain or local hip joint pain.

LATERAL HIP PAIN
• Outer hip pain, pain with walking, pain lying on one side
  -> GLUTEUS MEDIUS:
     One of the most common non-joint causes of lateral hip pain.
     Trigger points can refer pain over the greater trochanter and lateral thigh.

POSTERIOR KNEE / POSTERIOR THIGH
• Back of knee pain, hamstring-area pain
  -> HAMSTRING REGION:
     Trigger points in the hamstrings can refer into the posterior knee.
     Patients often treat the knee directly even when the main driver is higher in the posterior thigh.
  -> CALF REGION:
     Upper calf trigger points can also contribute to posterior knee discomfort.

CALF / HEEL / ACHILLES / FOOT ARCH
• Calf tightness, cramps, heel pain, “plantar fasciitis”-like pain
  -> CALF / SOLEUS-LIKE PATTERN:
     Extremely important and often missed.
     Trigger points in the deeper calf can refer into the heel, Achilles region, and plantar surface.
     Many cases of “heel pain” improve when the calf is treated instead of only the foot.

GOLDEN RULES
1. Look for a proximal driver when the pain seems confusing.
2. Head pain can come from shoulder/neck muscles.
3. Shoulder pain can come from chest muscles.
4. Sciatica-like pain can come from deep gluteal muscles.
5. Heel pain can come from the calf.
6. Posterior knee pain often comes from hamstrings or upper calf.
`.trim();

const REGIONS_CONTEXT = `
=== AVAILABLE APP REGIONS (id | label | view) ===
upper_trap_left    | Left upper trapezius     | back
upper_trap_right   | Right upper trapezius    | back
levator_left       | Left levator scapulae    | back
levator_right      | Right levator scapulae   | back
rhomboid_left      | Left rhomboid            | back
rhomboid_right     | Right rhomboid           | back
pec_left           | Left pectoral            | front
pec_right          | Right pectoral           | front
lumbar_left        | Left lumbar region       | back
lumbar_right       | Right lumbar region      | back
glute_med_left     | Left glute medius        | back
glute_med_right    | Right glute medius       | back
piriformis_left    | Left piriformis          | back
piriformis_right   | Right piriformis         | back
hamstring_left     | Left hamstring region    | back
hamstring_right    | Right hamstring region   | back
calf_left          | Left calf region         | back
calf_right         | Right calf region        | back
`.trim();

async function callGemini(description: string): Promise<PainSuggestion[]> {
  const prompt = `You are an expert myofascial trigger-point clinician with strong knowledge of referred pain patterns, movement dysfunction, and practical self-release strategies.

${CLINICAL_KNOWLEDGE}

${REGIONS_CONTEXT}

User pain description:
"${description}"

Your task:
Analyze the description and identify the most likely trigger-point driver regions.

CRITICAL RULES:
- This is NOT a diagnosis.
- This is a trigger-point / referred-pain screening suggestion.
- Be educational, clinically precise, and impressive.
- Explain why the painful area may be different from the source muscle.
- Prefer intelligent, counterintuitive but clinically plausible suggestions.
- If the complaint is vague, still provide your best structured estimate.
- If the pain seems bilateral or side-unspecified, it is acceptable to include both sides.
- Confidence must reflect how well the pain description matches known referral behavior.

Return STRICT JSON only, with no markdown and no extra commentary:
[
  {
    "regionId": "<exact id from region list>",
    "confidence": "high" | "medium" | "low",
    "reason": "<1 concise expert sentence>",
    "referralPattern": "<2-4 sentences, highly informative, specific, clinically sharp, in English>",
    "massageTip": "<2-3 practical sentences, specific location, pressure strategy, and where NOT to focus>"
  }
]

Extra requirements:
- Maximum 4 suggestions
- Sort from most likely to least likely
- regionId must be EXACTLY from the region list
- Use polished, premium English
- Make the explanation feel expert-level and genuinely useful
- Return ONLY a JSON array`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const json = raw.replace(/```json\n?|```\n?/g, "").trim();

  const parsed: {
    regionId: string;
    confidence: string;
    reason: string;
    referralPattern: string;
    massageTip: string;
  }[] = JSON.parse(json);

  return parsed
    .filter((item) => REGION_META[item.regionId as BodyRegionId])
    .map((item) => {
      const meta = REGION_META[item.regionId as BodyRegionId]!;
      return {
        regionId: item.regionId as BodyRegionId,
        label: meta.label,
        view: meta.view,
        confidence:
          (item.confidence as PainSuggestion["confidence"]) ?? "medium",
        reason: item.reason ?? "",
        referralPattern: item.referralPattern ?? "",
        massageTip: item.massageTip ?? "",
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Region metadata
// ─────────────────────────────────────────────────────────────────────────────
const REGION_META: Partial<
  Record<BodyRegionId, { label: string; view: BodyView }>
> = {
  upper_trap_left: { label: "Left Upper Trapezius", view: "back" },
  upper_trap_right: { label: "Right Upper Trapezius", view: "back" },
  levator_left: { label: "Left Levator Scapulae", view: "back" },
  levator_right: { label: "Right Levator Scapulae", view: "back" },
  rhomboid_left: { label: "Left Rhomboid", view: "back" },
  rhomboid_right: { label: "Right Rhomboid", view: "back" },
  pec_left: { label: "Left Pectoral", view: "front" },
  pec_right: { label: "Right Pectoral", view: "front" },
  lumbar_left: { label: "Left Lumbar Region", view: "back" },
  lumbar_right: { label: "Right Lumbar Region", view: "back" },
  glute_med_left: { label: "Left Glute Medius", view: "back" },
  glute_med_right: { label: "Right Glute Medius", view: "back" },
  piriformis_left: { label: "Left Piriformis", view: "back" },
  piriformis_right: { label: "Right Piriformis", view: "back" },
  hamstring_left: { label: "Left Hamstring Region", view: "back" },
  hamstring_right: { label: "Right Hamstring Region", view: "back" },
  calf_left: { label: "Left Calf Region", view: "back" },
  calf_right: { label: "Right Calf Region", view: "back" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Keyword fallback
// ─────────────────────────────────────────────────────────────────────────────
type KwRegion = {
  id: BodyRegionId;
  confidence: PainSuggestion["confidence"];
  reason: string;
  referralPattern: string;
  massageTip: string;
};

type KwRule = {
  keywords: string[];
  regions: KwRegion[];
};

const KW_RULES: KwRule[] = [
  {
    keywords: ["knee", "back of knee", "posterior knee", "kneecap"],
    regions: [
      {
        id: "hamstring_left",
        confidence: "high",
        reason:
          "Posterior knee pain is very often driven by trigger points higher up in the hamstring chain.",
        referralPattern:
          "Trigger points in the distal hamstrings can project pain directly into the back of the knee, which makes the knee itself look guilty even when the real driver sits in the posterior thigh. This pattern is common in people who sit a lot, sprint, or overload the posterior chain.",
        massageTip:
          "Work the lower third of the back of the thigh rather than only rubbing the knee. Search for a dense, tender band in the hamstring tissue and hold pressure there for 30-60 seconds.",
      },
      {
        id: "hamstring_right",
        confidence: "high",
        reason:
          "The hamstring region is a classic source of referred pain into the posterior knee.",
        referralPattern:
          "When the hamstrings become overloaded or shortened, their trigger points can refer pain downward into the knee crease. This is one of the most overlooked reasons why the knee hurts even when local knee treatment does not help.",
        massageTip:
          "Massage the lower posterior thigh, especially the tender bands just above the knee line. Avoid focusing exclusively on the knee joint if the tissue above it is clearly irritable.",
      },
      {
        id: "calf_left",
        confidence: "medium",
        reason:
          "Upper calf trigger points can also contribute to pain behind the knee.",
        referralPattern:
          "The proximal calf can refer upward toward the posterior knee, especially when the calf is chronically tight from walking, running, heels, or standing. This can blend with hamstring-driven pain.",
        massageTip:
          "Work the top portion of the calf just below the knee crease. Slow, deep pressure is usually more effective than aggressive rubbing.",
      },
    ],
  },
  {
    keywords: [
      "head",
      "headache",
      "migraine",
      "temple",
      "eye pain",
      "occipital",
      "neck base",
      "tension headache",
    ],
    regions: [
      {
        id: "upper_trap_left",
        confidence: "high",
        reason:
          "Upper trapezius trigger points are one of the most common muscular drivers of headache patterns.",
        referralPattern:
          "A person may feel the pain in the temple, around the eye, or at the back of the head, while the actual driver sits at the shoulder-neck junction. This happens because upper trapezius trigger points commonly project pain superiorly into the head instead of keeping it local to the shoulder.",
        massageTip:
          "Release the top of the shoulder and the upper neck-shoulder junction, not just the head. If pressing the upper trap reproduces the familiar headache, you are probably on the right structure.",
      },
      {
        id: "upper_trap_right",
        confidence: "high",
        reason:
          "The right upper trapezius commonly refers pain into the head and temple region.",
        referralPattern:
          "Unilateral headache patterns are often driven by the same-side upper trapezius, especially in people with desk posture, shoulder elevation, or stress-related guarding. The referred pain can feel surprisingly 'cranial' even though the source is muscular and lower.",
        massageTip:
          "Use sustained pressure over the most tender point along the top of the shoulder for 30-60 seconds. Do not chase the pain only in the temple if the upper trap is clearly reactive.",
      },
      {
        id: "levator_left",
        confidence: "medium",
        reason:
          "Levator scapulae can contribute to base-of-skull and upper neck headache patterns.",
        referralPattern:
          "This muscle often becomes a strong contributor when headaches come with neck stiffness or pain when turning the head. Its trigger points can create a deep ache at the base of the skull and into the upper cervical region.",
        massageTip:
          "Target the upper inner shoulder-blade corner and the neck angle rather than only rubbing the neck directly. Slightly side-bending the head away may help expose the tissue.",
      },
    ],
  },
  {
    keywords: [
      "neck",
      "stiff neck",
      "locked neck",
      "can't turn head",
      "cervical",
      "torticollis",
    ],
    regions: [
      {
        id: "levator_left",
        confidence: "high",
        reason:
          "Levator scapulae is a hallmark muscle in painful neck rotation and 'locked neck' complaints.",
        referralPattern:
          "This muscle frequently creates pain that feels like it is 'in the neck joint', when in reality the irritated trigger point sits between the upper neck and the superior angle of the scapula. It becomes especially suspicious when rotation is limited and the neck feels mechanically blocked.",
        massageTip:
          "Work the upper inside corner of the shoulder blade and the neck-shoulder angle, not just the side of the neck. Gentle sustained pressure works better than fast rubbing.",
      },
      {
        id: "levator_right",
        confidence: "high",
        reason:
          "Right levator scapulae dysfunction often presents as sharp cervical stiffness and painful turning.",
        referralPattern:
          "Patients often assume this is purely a cervical spine issue, but the referral pattern is strongly muscular in many cases. The levator can create a deep, stubborn ache from the upper neck down toward the top of the scapula.",
        massageTip:
          "Massage the superior medial border of the scapula and the tissue running up toward the neck. Pairing self-release with a gentle stretch can improve the effect.",
      },
    ],
  },
  {
    keywords: [
      "shoulder",
      "front shoulder",
      "can't lift arm",
      "arm raise",
      "anterior shoulder",
    ],
    regions: [
      {
        id: "pec_left",
        confidence: "high",
        reason:
          "A tight pectoral region can create front-of-shoulder pain that feels local but is often chest-driven.",
        referralPattern:
          "Many people massage the painful shoulder itself, yet the real mechanical driver is the shortened pectoral tissue pulling the shoulder forward and loading the front joint structures. The discomfort is then perceived in the shoulder even though the chest wall is a major contributor.",
        massageTip:
          "Work the chest tissue near the front shoulder and under the clavicular area rather than focusing only on the shoulder joint. Release should be gradual and precise, not aggressive.",
      },
      {
        id: "pec_right",
        confidence: "high",
        reason:
          "Right-sided pectoral trigger patterns commonly contribute to anterior shoulder pain and restricted arm elevation.",
        referralPattern:
          "When the pectoral complex is shortened, it drags the shoulder into a more forward, internally rotated position. This changes the mechanics of elevation and can create a very convincing 'shoulder problem' even when the chest is the main driver.",
        massageTip:
          "Massage from the upper chest toward the front of the shoulder, especially the dense tissue bands that feel sore under pressure. Think 'release the chest to free the shoulder'.",
      },
      {
        id: "upper_trap_left",
        confidence: "medium",
        reason:
          "Upper trapezius overload can also refer into the shoulder and upper arm.",
        referralPattern:
          "When the upper trapezius is chronically overactive, pain may radiate downward into the shoulder area. This is common when people shrug during stress or compensate for poor scapular support.",
        massageTip:
          "Release the upper trapezius along the top of the shoulder if pressing there reproduces the familiar shoulder ache.",
      },
    ],
  },
  {
    keywords: ["chest", "sternum", "front chest", "tight chest", "pec"],
    regions: [
      {
        id: "pec_left",
        confidence: "high",
        reason:
          "The left pectoral region is a very plausible muscular source of front chest tension and anterior shoulder pull.",
        referralPattern:
          "Pectoral trigger points can create a deep ache, local tenderness, and postural collapse across the front of the torso. The discomfort may feel structural or even alarming, which is why chest pain should always be medically ruled out when appropriate.",
        massageTip:
          "Work the chest wall directly, especially the dense tissue from the sternum toward the shoulder. If symptoms feel unusual or concerning, do not rely on self-treatment alone.",
      },
      {
        id: "pec_right",
        confidence: "high",
        reason:
          "The right pectoral region often contributes to chest tightness, rounded shoulders, and front-of-shoulder symptoms.",
        referralPattern:
          "As the chest becomes shorter and more dominant, it can create local discomfort and also drive broader shoulder dysfunction. The painful zone is often not just the chest itself but the whole anterior shoulder chain.",
        massageTip:
          "Release the pectoral tissue slowly from the chest toward the front shoulder. Avoid only chasing the discomfort at the shoulder if the chest is clearly tight and tender.",
      },
    ],
  },
  {
    keywords: [
      "low back",
      "lower back",
      "lumbar",
      "back pain",
      "can't stand straight",
      "pain after sitting",
    ],
    regions: [
      {
        id: "lumbar_left",
        confidence: "high",
        reason:
          "The left lumbar region is a strong candidate in mechanically driven low-back pain patterns.",
        referralPattern:
          "Many low-back complaints come from irritable trigger points in the muscular wall beside the spine rather than from the spine itself. These points can refer into the iliac crest, upper glute area, side of the low back, or even toward the hip, making the pain feel broader than its true source.",
        massageTip:
          "Work slightly lateral to the spine, especially above the top of the pelvis, instead of pressing directly on the bony spinal column. Sustained pressure and slow breathing usually work best.",
      },
      {
        id: "lumbar_right",
        confidence: "high",
        reason:
          "The right lumbar region is a classic source of persistent low-back tension, especially after sitting or asymmetrical loading.",
        referralPattern:
          "The pain may feel central, but the more relevant tissue is often off to the side of the spine. This is one reason why direct spinal rubbing may feel unsatisfying while lateral lumbar release can produce a clearer change.",
        massageTip:
          "Massage the thick muscular tissue just off the spine and above the pelvis, not the midline bones. Move slowly and search for a dense, reproducing point.",
      },
    ],
  },
  {
    keywords: [
      "sciatica",
      "sciatic",
      "buttock pain down leg",
      "pain down leg",
      "tingling leg",
      "numbness leg",
    ],
    regions: [
      {
        id: "piriformis_left",
        confidence: "high",
        reason:
          "Piriformis is one of the most important non-spinal drivers of sciatic-like pain.",
        referralPattern:
          "Deep gluteal trigger points can mimic sciatica by irritating the tissue environment around the sciatic nerve pathway. That is why the pain may feel like it 'comes from the back' even when the dominant driver is actually in the buttock.",
        massageTip:
          "Work deep in the buttock rather than only treating the low back. The target is usually in the central-to-deep gluteal area, not the surface skin or the spine itself.",
      },
      {
        id: "piriformis_right",
        confidence: "high",
        reason:
          "Right piriformis referral can create a striking sciatica-like presentation down the posterior leg.",
        referralPattern:
          "This pattern is often mistaken for a purely spinal disorder because the pain can travel well beyond the buttock. However, when deep gluteal pressure reproduces the familiar leg pain, that is a major clue that the driver is local to the piriformis region.",
        massageTip:
          "Use a ball or sustained thumb/elbow pressure into the deep buttock, not aggressive rubbing of the lumbar spine. The release should feel deep and specific, not broad and superficial.",
      },
      {
        id: "glute_med_left",
        confidence: "medium",
        reason:
          "Glute medius can contribute to lateral hip and posterior chain pain that overlaps with sciatica-like symptoms.",
        referralPattern:
          "Its referral pattern can extend toward the lateral hip, sacral area, and outer thigh, which can blend into a larger sciatic-like picture. It is not always the primary driver, but it often contributes to the pain map.",
        massageTip:
          "If the outer upper buttock is very tender, release that zone as well. Work the lateral glute, not just the deep center buttock.",
      },
    ],
  },
  {
    keywords: [
      "hip",
      "lateral hip",
      "outer hip",
      "hip pain",
      "pain walking",
      "trochanter",
    ],
    regions: [
      {
        id: "glute_med_left",
        confidence: "high",
        reason:
          "Glute medius is one of the most common muscular drivers of lateral hip pain.",
        referralPattern:
          "People often assume the painful outer hip is a joint problem, but trigger points in the glute medius commonly project pain right over that area. This is especially likely if side-lying, walking, or single-leg loading aggravates symptoms.",
        massageTip:
          "Target the upper outer buttock above the lateral hip, not just the bony side of the hip itself. The tender zone is usually in the gluteal muscle mass, not on the bone.",
      },
      {
        id: "glute_med_right",
        confidence: "high",
        reason:
          "Right glute medius dysfunction frequently presents as stubborn outer-hip pain.",
        referralPattern:
          "The pain may feel local to the side of the hip, but the real trigger point often sits slightly above and behind it in the gluteal tissue. This is why direct pressure only on the painful side-hip spot may miss the driver.",
        massageTip:
          "Release the lateral upper buttock with slow pressure, a ball, or a massage tool. Search for points that reproduce the familiar hip pain rather than only pressing where it hurts most.",
      },
      {
        id: "piriformis_left",
        confidence: "medium",
        reason:
          "Piriformis can contribute to deep posterior hip pain and gluteal restriction.",
        referralPattern:
          "When the complaint feels deeper and more posterior than lateral, the piriformis becomes more plausible. It may also coexist with glute medius overload.",
        massageTip:
          "If the pain feels deep in the buttock, add focused gluteal release rather than only working the outer hip.",
      },
    ],
  },
  {
    keywords: [
      "buttock",
      "glute",
      "deep butt pain",
      "sacrum",
      "pain sitting",
    ],
    regions: [
      {
        id: "piriformis_left",
        confidence: "high",
        reason:
          "Deep buttock pain with sitting strongly points toward piriformis involvement.",
        referralPattern:
          "Piriformis referral often feels deeper than general glute soreness and may radiate into the posterior thigh. If sitting compresses the symptoms, that further strengthens the suspicion of a deep gluteal driver.",
        massageTip:
          "Work the deep central buttock with a ball or sustained pressure. Do not just rub the sacrum or low back if the deep glute reproduces the pain more clearly.",
      },
      {
        id: "glute_med_left",
        confidence: "high",
        reason:
          "Glute medius is highly plausible when the pain is more upper-lateral buttock than deep central buttock.",
        referralPattern:
          "This muscle can refer pain toward the sacrum, lateral hip, and upper outer buttock, so patients may describe it broadly as 'buttock pain'. The exact pain map helps distinguish it from piriformis.",
        massageTip:
          "Target the upper outer glute rather than the center of the buttock if that area is the clear tender reproducing zone.",
      },
    ],
  },
  {
    keywords: ["calf", "cramp", "tight calf", "calf cramps"],
    regions: [
      {
        id: "calf_left",
        confidence: "high",
        reason:
          "Calf trigger points are a major source of cramping, tightness, and lower-leg discomfort.",
        referralPattern:
          "The calf can create symptoms that feel local, but deeper trigger points may also refer toward the heel or posterior knee. People often stretch aggressively when what they really need is focused release of the trigger zone.",
        massageTip:
          "Work the upper and middle posterior calf slowly, especially the dense rope-like bands. A ball, thumb pressure, or controlled foam rolling can all work well.",
      },
      {
        id: "calf_right",
        confidence: "high",
        reason:
          "Right calf tissue is a strong candidate in cramps, tightness, and lower-leg overload patterns.",
        referralPattern:
          "Chronically loaded calf tissue can stay irritable and produce recurring tightness, nighttime cramping, or discomfort with ankle motion. The pain may not stay limited to the exact spot you press.",
        massageTip:
          "Use slow sustained pressure on the most tender points rather than fast rolling only. If the middle calf reproduces heel symptoms, the calf is probably more relevant than the foot itself.",
      },
    ],
  },
  {
    keywords: [
      "heel",
      "achilles",
      "plantar fasciitis",
      "foot arch",
      "sole of foot",
      "heel pain",
    ],
    regions: [
      {
        id: "calf_left",
        confidence: "high",
        reason:
          "Heel and plantar-like pain often comes from the calf complex more than people expect.",
        referralPattern:
          "One of the most clinically impressive patterns is when deeper calf trigger points project pain into the heel, Achilles area, or sole of the foot. Patients often treat only the foot even though the true driver sits much higher in the posterior lower leg.",
        massageTip:
          "Work the middle-to-deep calf first, especially if pressing there recreates heel or arch pain. This is one of those cases where treating the source can feel surprisingly indirect but very effective.",
      },
      {
        id: "calf_right",
        confidence: "high",
        reason:
          "Right calf referral can convincingly mimic local heel or plantar pain.",
        referralPattern:
          "If the heel hurts but the calf is dense, tender, and reproduces the same symptoms, the pain may be driven by referred trigger-point behavior rather than by a purely local foot problem. This is a classic 'source is higher than the pain' scenario.",
        massageTip:
          "Prioritize deep calf release before overworking the foot itself. Slow pressure into the mid-calf often gives better results than aggressive local heel massage.",
      },
    ],
  },
  {
    keywords: [
      "between shoulder blades",
      "scapula",
      "shoulder blade",
      "upper back",
      "rhomboid",
    ],
    regions: [
      {
        id: "rhomboid_left",
        confidence: "high",
        reason:
          "Rhomboid trigger points are a classic source of pain along the inner shoulder blade border.",
        referralPattern:
          "This pain often feels like it is 'stuck under the shoulder blade' or exactly between the shoulder blades. The driver usually sits in the tissue between the spine and the medial scapular border, not in the spine itself.",
        massageTip:
          "Release the tissue between the spine and the shoulder blade rather than pressing on the spine. Reaching the arm across the chest can help expose the area.",
      },
      {
        id: "rhomboid_right",
        confidence: "high",
        reason:
          "Right rhomboid dysfunction is highly plausible in focal interscapular pain.",
        referralPattern:
          "If the pain feels local to the inner shoulder blade border and worsens with desk posture, loading, or prolonged sitting, the rhomboid region is a strong candidate. This is a very common postural referral pattern.",
        massageTip:
          "Search for the dense tender tissue just medial to the scapula. Use slow direct pressure, not broad superficial rubbing.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Keyword fallback engine
// ─────────────────────────────────────────────────────────────────────────────
function keywordFallback(description: string): PainSuggestion[] {
  const lower = description.toLowerCase().trim();

  const scored = new Map<BodyRegionId, { score: number; region: KwRegion }>();

  for (const rule of KW_RULES) {
    const matched = rule.keywords.some((kw) => lower.includes(kw));
    if (!matched) continue;

    for (const region of rule.regions) {
      const score =
        region.confidence === "high"
          ? 3
          : region.confidence === "medium"
          ? 2
          : 1;

      const existing = scored.get(region.id);
      if (!existing || score > existing.score) {
        scored.set(region.id, { score, region });
      }
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ region }) => {
      const meta = REGION_META[region.id]!;
      return {
        regionId: region.id,
        label: meta.label,
        view: meta.view,
        confidence: region.confidence,
        reason: region.reason,
        referralPattern: region.referralPattern,
        massageTip: region.massageTip,
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzePain(
  description: string
): Promise<PainSuggestion[]> {
  if (!description.trim()) return [];

  try {
    const suggestions = await callGemini(description);
    if (suggestions.length > 0) return suggestions;
    return keywordFallback(description);
  } catch {
    return keywordFallback(description);
  }
}

