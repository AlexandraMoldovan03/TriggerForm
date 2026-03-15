from __future__ import annotations

from io import BytesIO
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel


app = FastAPI(title="TriggerForm Posture API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()


class ExerciseItem(BaseModel):
    title: str
    reason: str


class PostureResult(BaseModel):
    view_detected: Literal["front", "side", "unclear"]
    body_visible_enough: bool
    shoulder_alignment: Literal[
        "good", "mild_asymmetry", "moderate_asymmetry", "severe_asymmetry", "unclear"
    ]
    hip_alignment: Literal[
        "good", "mild_asymmetry", "moderate_asymmetry", "severe_asymmetry", "unclear"
    ]
    forward_head: Literal["none", "mild", "moderate", "severe", "unclear"]
    thoracic_rounding: Literal["none", "mild", "moderate", "severe", "unclear"]
    pelvic_tilt: Literal[
        "neutral",
        "mild_anterior",
        "moderate_anterior",
        "severe_anterior",
        "mild_posterior",
        "unclear",
    ]
    swayback_pattern: Literal["none", "mild", "moderate", "severe", "unclear"]
    confidence: float
    summary: str
    recommended_region: Literal["shoulder", "upper_back", "lower_back", "hip", "none"]
    user_guidance: str
    posture_tips: list[str]
    recommended_exercises: list[ExerciseItem]
    medical_disclaimer: str


def normalize_to_jpeg(image_bytes: bytes) -> bytes:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    out = BytesIO()
    image.save(out, format="JPEG", quality=90)
    return out.getvalue()


@app.get("/")
def health():
    return {"status": "ok", "message": "TriggerForm Gemini Posture API is running"}


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
        jpeg_bytes = normalize_to_jpeg(content)

        prompt = f"""
Analyze this posture screening photo for a mobile recovery/fitness app.

User selected intended view: {view}
If side view, intended visible side: {side_hint}

Important rules:
- This is NOT a medical diagnosis.
- Only do posture screening / visual estimation.
- If the person is too close, too far, partly cut off, blurry, or the body is not visible enough,
  set body_visible_enough=false and explain how to retake the photo.
- For front view, focus mostly on shoulder and hip symmetry.
- For side view, focus mostly on forward head, thoracic rounding, pelvic tilt, and swayback pattern.
- Keep the summary concise and practical.
- Keep user_guidance short and actionable.
- confidence must be a number between 0 and 1.
- medical_disclaimer must clearly say it is not a diagnosis.
- recommended_region must be one of: shoulder, upper_back, lower_back, hip, none.
- posture_tips must contain 3 short practical tips.
- recommended_exercises must contain 3 to 5 simple corrective exercises.

Exercise examples allowed:
- Chin tucks
- Wall angels
- Thoracic extension on wall
- Doorway chest stretch
- Hip flexor stretch
- Glute bridge
- Dead bug
- Cat-cow
- Child's pose
- Hamstring stretch
- Scapular retractions

For each exercise:
- title = short name
- reason = one short sentence for why it helps

Avoid medical claims and avoid diagnosing scoliosis or structural pathology from one photo.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=jpeg_bytes,
                    mime_type="image/jpeg",
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=PostureResult,
            ),
        )

        if not response.parsed:
            raise HTTPException(
                status_code=502,
                detail="Gemini nu a returnat un răspuns valid."
            )

        result: PostureResult = response.parsed

        return {
            "ok": True,
            "result": result.model_dump(),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Eroare la procesarea imaginii: {exc}",
        )
