from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Literal
import math

ViewMode = Literal["front", "side"]


@dataclass
class Landmark2D:
    x: float
    y: float
    z: float
    visibility: float


def _deg_from_points(a: Landmark2D, b: Landmark2D) -> float:
    dy = b.y - a.y
    dx = b.x - a.x
    return math.degrees(math.atan2(dy, dx))


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _label_from_score(score: float) -> str:
    if score < 0.20:
        return "ok"
    if score < 0.40:
        return "ușor"
    if score < 0.70:
        return "moderat"
    return "pronunțat"


def _avg(a: Landmark2D, b: Landmark2D) -> Landmark2D:
    return Landmark2D(
        x=(a.x + b.x) / 2,
        y=(a.y + b.y) / 2,
        z=(a.z + b.z) / 2,
        visibility=(a.visibility + b.visibility) / 2,
    )


def analyze_front(landmarks: Dict[str, Landmark2D]) -> dict:
    left_shoulder = landmarks["left_shoulder"]
    right_shoulder = landmarks["right_shoulder"]
    left_hip = landmarks["left_hip"]
    right_hip = landmarks["right_hip"]
    nose = landmarks["nose"]

    shoulder_mid = _avg(left_shoulder, right_shoulder)
    hip_mid = _avg(left_hip, right_hip)

    shoulder_tilt_deg = abs(_deg_from_points(left_shoulder, right_shoulder))
    hip_tilt_deg = abs(_deg_from_points(left_hip, right_hip))

    torso_height = abs(hip_mid.y - shoulder_mid.y)
    trunk_shift_norm = abs(nose.x - shoulder_mid.x) / max(torso_height, 0.001)

    shoulder_score = _clamp01(shoulder_tilt_deg / 8.0)
    hip_score = _clamp01(hip_tilt_deg / 8.0)
    trunk_score = _clamp01(trunk_shift_norm / 0.35)

    combined = 0.45 * shoulder_score + 0.35 * hip_score + 0.20 * trunk_score

    if shoulder_score >= hip_score and shoulder_score >= trunk_score:
        recommended_region = "shoulder"
    elif hip_score >= trunk_score:
        recommended_region = "hip"
    else:
        recommended_region = "upper_back"

    summary_parts: List[str] = []

    if shoulder_score < 0.20:
        summary_parts.append("umerii par aproape drepți")
    elif shoulder_score < 0.40:
        summary_parts.append("există o ușoară asimetrie la nivelul umerilor")
    else:
        summary_parts.append("umerii par vizibil asimetrici")

    if hip_score < 0.20:
        summary_parts.append("bazinul pare aproape aliniat")
    elif hip_score < 0.40:
        summary_parts.append("există o ușoară înclinare a bazinului")
    else:
        summary_parts.append("bazinul pare vizibil înclinat")

    if trunk_score >= 0.40:
        summary_parts.append("există și o deviație laterală a trunchiului")

    return {
        "view": "front",
        "summary": ". ".join(summary_parts).capitalize() + ".",
        "scores": {
            "shoulder_asymmetry": round(shoulder_score, 3),
            "hip_asymmetry": round(hip_score, 3),
            "trunk_shift": round(trunk_score, 3),
            "overall_posture_risk": round(combined, 3),
        },
        "labels": {
            "shoulder_asymmetry": _label_from_score(shoulder_score),
            "hip_asymmetry": _label_from_score(hip_score),
            "trunk_shift": _label_from_score(trunk_score),
            "overall_posture_risk": _label_from_score(combined),
        },
        "metrics": {
            "shoulder_tilt_deg": round(shoulder_tilt_deg, 2),
            "hip_tilt_deg": round(hip_tilt_deg, 2),
            "trunk_shift_norm": round(trunk_shift_norm, 3),
        },
        "recommended_region": recommended_region,
        "medical_disclaimer": "Acesta este un screening postural orientativ, nu un diagnostic medical.",
    }


def analyze_side(landmarks: Dict[str, Landmark2D], side_hint: Literal["left", "right"] = "left") -> dict:
    prefix = "left" if side_hint == "left" else "right"

    ear = landmarks[f"{prefix}_ear"]
    shoulder = landmarks[f"{prefix}_shoulder"]
    hip = landmarks[f"{prefix}_hip"]
    knee = landmarks[f"{prefix}_knee"]
    ankle = landmarks[f"{prefix}_ankle"]

    torso_height = abs(hip.y - shoulder.y)
    lower_chain = abs(ankle.y - hip.y)

    ear_to_shoulder = abs(ear.x - shoulder.x) / max(torso_height, 0.001)
    shoulder_to_hip = abs(shoulder.x - hip.x) / max(torso_height, 0.001)
    hip_to_ankle = abs(hip.x - ankle.x) / max(lower_chain, 0.001)
    knee_to_ankle = abs(knee.x - ankle.x) / max(lower_chain, 0.001)

    trunk_angle = abs(_deg_from_points(shoulder, hip) + 90.0)

    forward_head_score = _clamp01(ear_to_shoulder / 0.22)
    thoracic_rounding_score = _clamp01(shoulder_to_hip / 0.22)
    pelvic_score = _clamp01((hip_to_ankle / 0.20) * 0.7 + (trunk_angle / 18.0) * 0.3)
    swayback_score = _clamp01((hip_to_ankle / 0.20) * 0.5 + (knee_to_ankle / 0.16) * 0.5)

    combined = (
        0.30 * forward_head_score
        + 0.30 * thoracic_rounding_score
        + 0.25 * pelvic_score
        + 0.15 * swayback_score
    )

    if pelvic_score >= thoracic_rounding_score and pelvic_score >= forward_head_score:
        recommended_region = "lower_back"
    elif thoracic_rounding_score >= forward_head_score:
        recommended_region = "upper_back"
    else:
        recommended_region = "shoulder"

    summary_parts: List[str] = []

    if forward_head_score < 0.20:
        summary_parts.append("capul pare relativ bine aliniat")
    elif forward_head_score < 0.40:
        summary_parts.append("există o ușoară proiecție anterioară a capului")
    else:
        summary_parts.append("capul pare proiectat anterior")

    if thoracic_rounding_score >= 0.40:
        summary_parts.append("se observă rotunjire toracică")
    if pelvic_score >= 0.40:
        summary_parts.append("există semne de înclinare pelvină anterioară")
    if swayback_score >= 0.40:
        summary_parts.append("există un pattern de tip swayback")

    return {
        "view": "side",
        "summary": ". ".join(summary_parts).capitalize() + ".",
        "scores": {
            "forward_head": round(forward_head_score, 3),
            "thoracic_rounding": round(thoracic_rounding_score, 3),
            "anterior_pelvic_tilt": round(pelvic_score, 3),
            "swayback_pattern": round(swayback_score, 3),
            "overall_posture_risk": round(combined, 3),
        },
        "labels": {
            "forward_head": _label_from_score(forward_head_score),
            "thoracic_rounding": _label_from_score(thoracic_rounding_score),
            "anterior_pelvic_tilt": _label_from_score(pelvic_score),
            "swayback_pattern": _label_from_score(swayback_score),
            "overall_posture_risk": _label_from_score(combined),
        },
        "metrics": {
            "ear_to_shoulder_norm": round(ear_to_shoulder, 3),
            "shoulder_to_hip_norm": round(shoulder_to_hip, 3),
            "hip_to_ankle_norm": round(hip_to_ankle, 3),
            "trunk_angle_deg": round(trunk_angle, 2),
        },
        "recommended_region": recommended_region,
        "medical_disclaimer": "Acesta este un screening postural orientativ, nu un diagnostic medical.",
    }
