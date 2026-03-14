from __future__ import annotations

from io import BytesIO
from typing import Dict, Literal, List

import mediapipe as mp
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from posture import Landmark2D, analyze_front, analyze_side

app = FastAPI(title="TriggerForm Posture API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POSE = mp.solutions.pose

LANDMARK_NAMES = {
    "nose": 0,
    "left_ear": 7,
    "right_ear": 8,
    "left_shoulder": 11,
    "right_shoulder": 12,
    "left_hip": 23,
    "right_hip": 24,
    "left_knee": 25,
    "right_knee": 26,
    "left_ankle": 27,
    "right_ankle": 28,
}

FRONT_REQUIRED = [
    "left_shoulder", "right_shoulder",
    "left_hip", "right_hip",
]

SIDE_REQUIRED_LEFT = [
    "left_ear", "left_shoulder", "left_hip", "left_knee", "left_ankle"
]

SIDE_REQUIRED_RIGHT = [
    "right_ear", "right_shoulder", "right_hip", "right_knee", "right_ankle"
]


def load_image_as_rgb_numpy(image_bytes: bytes) -> np.ndarray:
    pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(pil_image, dtype=np.uint8)


def extract_landmarks(image_rgb: np.ndarray) -> Dict[str, Landmark2D]:
    with POSE.Pose(
        static_image_mode=True,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(image_rgb)

    if not results.pose_landmarks:
        raise HTTPException(status_code=422, detail="Nu am putut detecta corpul în imagine.")

    lm = results.pose_landmarks.landmark
    out: Dict[str, Landmark2D] = {}

    for name, idx in LANDMARK_NAMES.items():
        point = lm[idx]
        out[name] = Landmark2D(
            x=float(point.x),
            y=float(point.y),
            z=float(point.z),
            visibility=float(point.visibility),
        )

    return out


def validate_front_pose(landmarks: Dict[str, Landmark2D]) -> None:
    missing: List[str] = []
    for key in FRONT_REQUIRED:
        if landmarks[key].visibility < 0.55:
            missing.append(key)

    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                "Pentru analiza frontală trebuie să se vadă umerii și șoldurile. "
                "Pune telefonul mai departe și încadrează mai mult din corp."
            ),
        )

    shoulder_y = (landmarks["left_shoulder"].y + landmarks["right_shoulder"].y) / 2
    hip_y = (landmarks["left_hip"].y + landmarks["right_hip"].y) / 2

    if abs(hip_y - shoulder_y) < 0.08:
        raise HTTPException(
            status_code=422,
            detail=(
                "Se vede prea puțin din corp pentru analiza frontală. "
                "Fă un cadru în care se văd clar trunchiul și bazinul."
            ),
        )


def validate_side_pose(
    landmarks: Dict[str, Landmark2D],
    side_hint: Literal["left", "right"],
) -> None:
    required = SIDE_REQUIRED_LEFT if side_hint == "left" else SIDE_REQUIRED_RIGHT

    missing: List[str] = []
    for key in required:
        if landmarks[key].visibility < 0.55:
            missing.append(key)

    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                "Pentru analiza laterală trebuie să se vadă urechea, umărul, șoldul, "
                "genunchiul și glezna de pe aceeași parte. Depărtează telefonul și "
                "arată tot profilul."
            ),
        )

    prefix = "left" if side_hint == "left" else "right"
    shoulder = landmarks[f"{prefix}_shoulder"]
    hip = landmarks[f"{prefix}_hip"]
    ankle = landmarks[f"{prefix}_ankle"]

    body_height = abs(ankle.y - shoulder.y)
    if body_height < 0.18:
        raise HTTPException(
            status_code=422,
            detail=(
                "Se vede prea puțin din corp pentru analiza laterală. "
                "Încadrează corpul mai complet, ideal de la cap până sub genunchi."
            ),
        )

    if abs(shoulder.x - hip.x) < 0.01:
        raise HTTPException(
            status_code=422,
            detail=(
                "Poziția nu pare suficient de laterală. Întoarce corpul mai clar în profil."
            ),
        )


@app.get("/")
def health():
    return {"status": "ok", "message": "TriggerForm Posture API is running"}


@app.post("/analyze-posture")
async def analyze_posture(
    image: UploadFile = File(...),
    view: Literal["front", "side"] = Form(...),
    side_hint: Literal["left", "right"] = Form("left"),
):
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Imagine lipsă sau goală.")

    try:
        image_rgb = load_image_as_rgb_numpy(content)
        landmarks = extract_landmarks(image_rgb)

        if view == "front":
            validate_front_pose(landmarks)
            result = analyze_front(landmarks)
        else:
            validate_side_pose(landmarks, side_hint)
            result = analyze_side(landmarks, side_hint=side_hint)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Eroare la procesarea imaginii: {exc}")

    return {
        "ok": True,
        "result": result,
    }