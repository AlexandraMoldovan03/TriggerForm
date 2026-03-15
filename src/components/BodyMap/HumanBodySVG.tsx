/**
 * HumanBodySVG
 * Realistic anatomical body illustration using react-native-svg.
 * ViewBox: 0 0 320 600  → trigger-point percentages map as:
 *   svgX = tp.x / 100 * 320
 *   svgY = tp.y / 100 * 600
 */

import React from "react";
import Svg, {
  Path,
  Ellipse,
  Circle,
  Line,
  G,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

// ── palette ──────────────────────────────────────────────────────────────────
const BG           = "#0A0E1A";
const BODY_FILL    = "#14243C";
const BODY_FILL2   = "#192E4A";
const BODY_STROKE  = "#5A7FC0";
const STROKE_W     = "1.4";
const MUSCLE       = "#2A4A7A";
const DETAIL       = "#3A5E96";
const JOINT_FILL   = "#0D1928";
const JOINT_STROKE = "#6B8FC8";
const SPINE_COL    = "#3A6080";

// ── BACK view body ────────────────────────────────────────────────────────────
export function BodyBack() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 600" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="bodyGrad" cx="50%" cy="40%" r="55%">
          <Stop offset="0%" stopColor={BODY_FILL2} />
          <Stop offset="100%" stopColor={BODY_FILL} />
        </RadialGradient>
      </Defs>

      {/* ── background ── */}
      <Path d="M0 0h320v600H0z" fill={BG} />

      {/* ── LEFT ARM (upper + forearm) ── */}
      <Path
        d="M108,100 Q88,108 78,128 Q68,150 66,175 Q64,198 66,218
           Q68,235 72,248 Q74,258 72,265 Q69,270 65,268 Q61,263 60,254
           Q58,240 56,218 Q53,195 54,170 Q54,144 64,120 Q74,100 92,92 L108,100Z"
        fill="url(#bodyGrad)"
        stroke={BODY_STROKE}
        strokeWidth={STROKE_W}
      />
      {/* LEFT HAND */}
      <Ellipse cx="63" cy="276" rx="9" ry="14" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* ── RIGHT ARM ── */}
      <Path
        d="M212,100 Q232,108 242,128 Q252,150 254,175 Q256,198 254,218
           Q252,235 248,248 Q246,258 248,265 Q251,270 255,268 Q259,263 260,254
           Q262,240 264,218 Q267,195 266,170 Q266,144 256,120 Q246,100 228,92 L212,100Z"
        fill="url(#bodyGrad)"
        stroke={BODY_STROKE}
        strokeWidth={STROKE_W}
      />
      {/* RIGHT HAND */}
      <Ellipse cx="257" cy="276" rx="9" ry="14" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* ── TORSO + LEGS (main silhouette) ── */}
      <Path
        d="M148,68
           Q130,68 108,88 Q92,100 88,116
           Q96,110 108,104
           Q112,118 112,138 Q112,158 114,178 Q116,196 118,212
           Q120,226 120,238 Q120,252 122,264
           Q122,278 124,296 Q125,314 126,334 Q127,354 127,374
           Q127,392 126,410 Q125,426 125,444 Q125,462 126,480
           Q126,494 124,506 Q122,516 122,526 Q122,536 126,542
           Q130,550 138,552 Q146,554 152,548 Q158,542 156,532
           Q154,520 153,508 Q152,494 152,480 Q152,462 152,444
           Q152,426 152,408 Q152,390 153,372 Q154,352 154,332
           Q155,312 156,294 Q157,278 158,266
           Q159,255 160,252 Q161,255 162,266
           Q163,278 164,294 Q165,312 166,332
           Q166,352 167,372 Q168,390 168,408 Q168,426 168,444
           Q168,462 168,480 Q168,494 167,508 Q166,520 164,532
           Q162,542 168,548 Q174,554 182,552 Q190,550 194,542
           Q198,536 198,526 Q198,516 196,506 Q194,494 194,480
           Q195,462 196,444 Q196,426 195,410 Q194,392 193,374
           Q193,354 193,334 Q194,314 195,296 Q196,278 198,264
           Q200,252 200,238 Q200,226 202,212 Q204,196 206,178
           Q208,158 208,138 Q208,118 212,104
           Q224,110 232,116 Q228,100 212,88 Q190,68 172,68Z"
        fill="url(#bodyGrad)"
        stroke={BODY_STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />

      {/* ── HEAD ── */}
      <Ellipse cx="160" cy="36" rx="26" ry="32" fill="url(#bodyGrad)" stroke={BODY_STROKE} strokeWidth={STROKE_W} />
      {/* ears */}
      <Ellipse cx="134" cy="38" rx="5" ry="8" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.1" />
      <Ellipse cx="186" cy="38" rx="5" ry="8" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.1" />
      {/* neck */}
      <Path d="M147,67 L145,90 Q160,94 175,90 L173,67 Q160,72 147,67Z"
        fill="url(#bodyGrad)" stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* ── BACK ANATOMY DETAILS ── */}

      {/* Spine line */}
      <Line x1="160" y1="90" x2="160" y2="270" stroke={SPINE_COL} strokeWidth="1" strokeDasharray="4,4" opacity="0.55" />

      {/* Upper trapezius — fan from C7 (160,90) to acromions */}
      <Path
        d="M160,90 Q148,86 130,90 Q112,96 104,108 Q114,102 128,98 Q144,94 160,92
           Q176,94 192,98 Q206,102 216,108 Q208,96 190,90 Q172,86 160,90Z"
        fill={MUSCLE} stroke={DETAIL} strokeWidth="1" opacity="0.5"
      />

      {/* Middle trapezius (T1–T6 → scapular spine) */}
      <Path
        d="M160,118 Q144,114 128,120 Q116,126 112,138 Q120,132 132,128 Q146,124 160,122
           Q174,124 188,128 Q200,132 208,138 Q204,126 192,120 Q176,114 160,118Z"
        fill={MUSCLE} stroke={DETAIL} strokeWidth="1" opacity="0.38"
      />

      {/* Left scapula outline */}
      <Path
        d="M126,108 Q116,120 114,138 Q112,156 116,168 Q122,178 132,176
           Q140,172 142,160 Q144,146 140,130 Q136,116 130,110 Q128,108 126,108Z"
        fill="none" stroke={DETAIL} strokeWidth="1.2" opacity="0.5"
      />
      {/* Right scapula */}
      <Path
        d="M194,108 Q204,120 206,138 Q208,156 204,168 Q198,178 188,176
           Q180,172 178,160 Q176,146 180,130 Q184,116 190,110 Q192,108 194,108Z"
        fill="none" stroke={DETAIL} strokeWidth="1.2" opacity="0.5"
      />

      {/* Erector spinae left (paraspinal bundle) */}
      <Path
        d="M153,182 Q149,200 147,220 Q146,240 148,258 Q152,268 156,268 L156,182Z"
        fill={MUSCLE} stroke={DETAIL} strokeWidth="0.9" opacity="0.38"
      />
      {/* Erector spinae right */}
      <Path
        d="M167,182 Q171,200 173,220 Q174,240 172,258 Q168,268 164,268 L164,182Z"
        fill={MUSCLE} stroke={DETAIL} strokeWidth="0.9" opacity="0.38"
      />

      {/* QL left (lateral, above iliac crest) */}
      <Path
        d="M138,218 Q132,226 130,240 Q130,254 134,260 Q140,264 146,260
           Q152,254 153,240 Q153,226 148,218 Q144,214 138,218Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4"
      />
      {/* QL right */}
      <Path
        d="M182,218 Q188,226 190,240 Q190,254 186,260 Q180,264 174,260
           Q168,254 167,240 Q167,226 172,218 Q176,214 182,218Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4"
      />

      {/* Gluteal crease */}
      <Path d="M186,296 Q175,308 160,312 Q145,308 134,296"
        fill="none" stroke={DETAIL} strokeWidth="1.2" opacity="0.5" />

      {/* Left gluteus medius */}
      <Path
        d="M126,278 Q118,290 116,308 Q116,324 124,332 Q132,338 140,334
           Q148,328 150,314 Q152,298 146,284 Q140,274 132,274 Q128,274 126,278Z"
        fill="none" stroke={DETAIL} strokeWidth="1.1" opacity="0.45"
      />
      {/* Right gluteus medius */}
      <Path
        d="M194,278 Q202,290 204,308 Q204,324 196,332 Q188,338 180,334
           Q172,328 170,314 Q168,298 174,284 Q180,274 188,274 Q192,274 194,278Z"
        fill="none" stroke={DETAIL} strokeWidth="1.1" opacity="0.45"
      />

      {/* Left hamstrings – biceps femoris (lateral) */}
      <Path d="M127,332 Q124,365 125,400 Q126,415 129,420 Q133,415 133,400 Q133,365 130,332Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />
      {/* Left hamstrings – semimembranosus (medial) */}
      <Path d="M140,334 Q142,367 141,402 Q140,416 136,420 Q132,416 132,402 Q132,367 136,334Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />

      {/* Right hamstrings – biceps femoris */}
      <Path d="M193,332 Q196,365 195,400 Q194,415 191,420 Q187,415 187,400 Q187,365 190,332Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />
      {/* Right hamstrings – semimembranosus */}
      <Path d="M180,334 Q178,367 179,402 Q180,416 184,420 Q188,416 188,402 Q188,367 184,334Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />

      {/* Left gastrocnemius – lateral head */}
      <Path d="M126,434 Q122,460 122,484 Q122,500 126,508 Q130,504 130,488 Q130,462 128,436Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />
      {/* Left gastrocnemius – medial head */}
      <Path d="M138,436 Q142,462 142,486 Q142,500 138,508 Q134,504 134,488 Q134,462 136,438Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />

      {/* Right gastrocnemius – lateral head */}
      <Path d="M194,434 Q198,460 198,484 Q198,500 194,508 Q190,504 190,488 Q190,462 192,436Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />
      {/* Right gastrocnemius – medial head */}
      <Path d="M182,436 Q178,462 178,486 Q178,500 182,508 Q186,504 186,488 Q186,462 184,438Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />

      {/* Achilles tendons */}
      <Line x1="130" y1="508" x2="130" y2="530" stroke={DETAIL} strokeWidth="0.9" opacity="0.4" />
      <Line x1="190" y1="508" x2="190" y2="530" stroke={DETAIL} strokeWidth="0.9" opacity="0.4" />

      {/* ── JOINTS ── */}
      {/* Shoulders */}
      <Circle cx="92" cy="104" r="6" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.3" opacity="0.75" />
      <Circle cx="228" cy="104" r="6" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.3" opacity="0.75" />
      {/* Elbows */}
      <Circle cx="66" cy="218" r="5" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
      <Circle cx="254" cy="218" r="5" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
      {/* Knees */}
      <Circle cx="131" cy="424" r="9" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
      <Circle cx="189" cy="424" r="9" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
    </Svg>
  );
}

// ── FRONT view body ───────────────────────────────────────────────────────────
export function BodyFront() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 600" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="bodyGradF" cx="50%" cy="40%" r="55%">
          <Stop offset="0%" stopColor={BODY_FILL2} />
          <Stop offset="100%" stopColor={BODY_FILL} />
        </RadialGradient>
      </Defs>
      <Path d="M0 0h320v600H0z" fill={BG} />

      {/* LEFT ARM */}
      <Path
        d="M108,100 Q88,108 78,128 Q68,150 66,175 Q64,198 66,218
           Q68,235 72,248 Q74,258 72,265 Q69,270 65,268 Q61,263 60,254
           Q58,240 56,218 Q53,195 54,170 Q54,144 64,120 Q74,100 92,92 L108,100Z"
        fill="url(#bodyGradF)" stroke={BODY_STROKE} strokeWidth={STROKE_W}
      />
      <Ellipse cx="63" cy="276" rx="9" ry="14" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* RIGHT ARM */}
      <Path
        d="M212,100 Q232,108 242,128 Q252,150 254,175 Q256,198 254,218
           Q252,235 248,248 Q246,258 248,265 Q251,270 255,268 Q259,263 260,254
           Q262,240 264,218 Q267,195 266,170 Q266,144 256,120 Q246,100 228,92 L212,100Z"
        fill="url(#bodyGradF)" stroke={BODY_STROKE} strokeWidth={STROKE_W}
      />
      <Ellipse cx="257" cy="276" rx="9" ry="14" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* TORSO + LEGS */}
      <Path
        d="M148,68 Q130,68 108,88 Q92,100 88,116
           Q96,110 108,104
           Q110,118 110,140 Q110,162 112,182 Q114,200 116,216 Q118,230 118,244
           Q119,258 120,270 Q122,284 123,300 Q124,316 124,334 Q124,352 124,372
           Q124,390 122,408 Q121,424 122,442 Q122,460 122,478 Q122,492 120,504
           Q118,514 118,524 Q118,536 122,542 Q127,550 136,552 Q145,554 150,548
           Q156,542 154,532 Q152,520 152,506 Q152,490 152,472 Q152,454 152,436
           Q152,418 151,400 Q150,382 150,364 Q150,346 151,328 Q152,310 153,294
           Q155,278 156,266 Q158,258 160,255 Q162,258 164,266
           Q165,278 167,294 Q168,310 169,328 Q170,346 170,364 Q170,382 169,400
           Q168,418 168,436 Q168,454 168,472 Q168,490 168,506 Q166,520 166,532
           Q164,542 170,548 Q175,554 184,552 Q193,550 198,542 Q202,536 202,524
           Q202,514 200,504 Q198,492 198,478 Q198,460 198,442 Q199,424 198,408
           Q196,390 196,372 Q196,352 196,334 Q196,316 197,300 Q198,284 200,270
           Q201,258 202,244 Q202,230 204,216 Q206,200 208,182 Q210,162 210,140
           Q210,118 212,104
           Q224,110 232,116 Q228,100 212,88 Q190,68 172,68Z"
        fill="url(#bodyGradF)" stroke={BODY_STROKE} strokeWidth={STROKE_W} strokeLinejoin="round"
      />

      {/* HEAD + NECK */}
      <Ellipse cx="160" cy="36" rx="26" ry="32" fill="url(#bodyGradF)" stroke={BODY_STROKE} strokeWidth={STROKE_W} />
      <Ellipse cx="134" cy="38" rx="5" ry="8" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.1" />
      <Ellipse cx="186" cy="38" rx="5" ry="8" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="1.1" />
      <Path d="M147,67 L145,90 Q160,94 175,90 L173,67 Q160,72 147,67Z"
        fill="url(#bodyGradF)" stroke={BODY_STROKE} strokeWidth="1.2" />

      {/* ── FRONT ANATOMY DETAILS ── */}

      {/* Clavicles */}
      <Path d="M160,98 Q148,94 130,96 Q114,100 106,108"
        fill="none" stroke={DETAIL} strokeWidth="1.3" opacity="0.55" />
      <Path d="M160,98 Q172,94 190,96 Q206,100 214,108"
        fill="none" stroke={DETAIL} strokeWidth="1.3" opacity="0.55" />

      {/* Left pectoralis major */}
      <Path
        d="M124,108 Q112,116 108,132 Q106,148 110,162 Q116,174 126,176
           Q136,176 142,166 Q148,154 146,138 Q142,120 134,112 Q130,108 124,108Z"
        fill="none" stroke={DETAIL} strokeWidth="1.4" opacity="0.6"
      />
      {/* Right pectoralis major */}
      <Path
        d="M196,108 Q208,116 212,132 Q214,148 210,162 Q204,174 194,176
           Q184,176 178,166 Q172,154 174,138 Q178,120 186,112 Q190,108 196,108Z"
        fill="none" stroke={DETAIL} strokeWidth="1.4" opacity="0.6"
      />

      {/* Sternal line */}
      <Line x1="160" y1="98" x2="160" y2="228" stroke={DETAIL} strokeWidth="0.9" opacity="0.3" />

      {/* Pec minor (beneath — sub-clavicular) */}
      <Path d="M138,104 Q132,112 130,124 Q130,134 136,138 Q142,136 144,126 Q146,114 142,106 Q140,104 138,104Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />
      <Path d="M182,104 Q188,112 190,124 Q190,134 184,138 Q178,136 176,126 Q174,114 178,106 Q180,104 182,104Z"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.38" />

      {/* Costal arch */}
      <Path d="M114,172 Q136,192 160,196 Q184,192 206,172"
        fill="none" stroke={DETAIL} strokeWidth="1.1" opacity="0.38" />

      {/* Rectus abdominis segments */}
      <Line x1="160" y1="172" x2="160" y2="228" stroke={DETAIL} strokeWidth="0.8" opacity="0.3" />
      {[180, 196, 212].map(y => (
        <Path key={y} d={`M148,${y} Q154,${y+4} 160,${y+5} Q166,${y+4} 172,${y}`}
          fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.22" />
      ))}

      {/* Inguinal crease */}
      <Path d="M134,228 Q146,220 160,218 Q174,220 186,228"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />

      {/* Iliac crests */}
      <Path d="M118,244 Q128,240 142,238 Q152,236 160,236"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.35" />
      <Path d="M202,244 Q192,240 178,238 Q168,236 160,236"
        fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.35" />

      {/* Quadriceps VMO/separation */}
      <Line x1="130" y1="248" x2="132" y2="400" stroke={DETAIL} strokeWidth="0.8" opacity="0.28" />
      <Line x1="190" y1="248" x2="188" y2="400" stroke={DETAIL} strokeWidth="0.8" opacity="0.28" />

      {/* Knee caps */}
      <Ellipse cx="131" cy="420" rx="11" ry="10" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
      <Ellipse cx="189" cy="420" rx="11" ry="10" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />

      {/* Tibias (shin bone) */}
      <Line x1="131" y1="430" x2="129" y2="510" stroke={DETAIL} strokeWidth="1" opacity="0.28" />
      <Line x1="189" y1="430" x2="191" y2="510" stroke={DETAIL} strokeWidth="1" opacity="0.28" />

      {/* ── JOINTS ── */}
      <Circle cx="92" cy="104" r="6" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.3" opacity="0.75" />
      <Circle cx="228" cy="104" r="6" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.3" opacity="0.75" />
      <Circle cx="66" cy="218" r="5" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />
      <Circle cx="254" cy="218" r="5" fill={JOINT_FILL} stroke={JOINT_STROKE} strokeWidth="1.2" opacity="0.65" />

      {/* Facial features */}
      <Ellipse cx="150" cy="32" rx="4" ry="5" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      <Ellipse cx="170" cy="32" rx="4" ry="5" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      <Path d="M153,46 Q160,50 167,46" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
    </Svg>
  );
}
