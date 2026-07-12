"""FastAPI thin wrapper around backend/src logic modules."""

from __future__ import annotations

import base64
import os
import re
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from src.blog_ideas import extract_visual_ideas
from src.cli import VARIATION_HINTS, _prompt_for_variation
from src.errors import ImageGenerationError, PromptEnrichmentError, ValidationError
from src.image_generator import generate_and_save
from src.prompt_engine import enrich_prompt_detailed
from src.watermark import apply_watermark_bytes

load_dotenv()

# IP rate limit: 8 requests / minute (protect free-tier quotas)
RATE_LIMIT = "8/minute"

# Never echo secrets in client-facing error text.
_SENSITIVE_RE = re.compile(
    r"(?i)(x-groq-api-key|groq[_-]?api[_-]?key|authorization)\s*[:=]\s*\S+"
)


def _redact_secrets(text: str) -> str:
    return _SENSITIVE_RE.sub(r"\1=[REDACTED]", text)


limiter = Limiter(key_func=get_remote_address, default_limits=[RATE_LIMIT])
app = FastAPI(title="Visora API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_cors_raw = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
# Whitelist only; never allow wildcard.
_cors_origins = [
    o.strip().rstrip("/")
    for o in _cors_raw.split(",")
    if o.strip() and o.strip() != "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Enables default_limits on all routes (decorator alone skips pre-handler 400s).
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RequestValidationError)
async def request_validation_handler(
    _request: Request, _exc: RequestValidationError
) -> JSONResponse:
    # 400 (not 422): no body dump / stack — avoids echoing groq_api_key or paths.
    return JSONResponse(
        status_code=400,
        content={"detail": "Geçersiz istek. Alan uzunluğu veya tipi hatalı."},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request, _exc: Exception
) -> JSONResponse:
    # Typed HTTPException / RateLimitExceeded use their own handlers (MRO).
    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucu hatası. Lütfen daha sonra tekrar deneyin."},
    )


class GenerateRequest(BaseModel):
    description: str | None = Field(default=None, max_length=2000)
    style: str = Field(..., min_length=1, max_length=64)
    ratio: Literal["landscape", "square"]
    variations: int = Field(default=1, ge=1, le=5)
    watermark: str | None = Field(default=None, max_length=120)
    blog_text: str | None = Field(default=None, max_length=50000)
    # Optional BYOK — prefer X-Groq-Api-Key header; body accepted as fallback
    groq_api_key: str | None = Field(default=None, max_length=256)


class ImageResult(BaseModel):
    data: str
    filename: str
    prompt: str
    label: str


class GenerateResponse(BaseModel):
    images: list[ImageResult]
    enrichment_source: Literal["groq", "pollinations", "template"]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
@limiter.limit(RATE_LIMIT)
def generate(request: Request, body: GenerateRequest) -> GenerateResponse:
    try:
        # BYOK: optional per-request key (never logged). Env key remains CLI fallback.
        header_key = (request.headers.get("x-groq-api-key") or "").strip()
        body_key = (body.groq_api_key or "").strip() if body.groq_api_key else ""
        groq_key = header_key or body_key or None
        return _run_generate(body, groq_api_key=groq_key)
    except ValidationError as exc:
        raise HTTPException(
            status_code=400, detail=_redact_secrets(str(exc))
        ) from exc
    except (PromptEnrichmentError, ImageGenerationError) as exc:
        raise HTTPException(
            status_code=502, detail=_redact_secrets(str(exc))
        ) from exc


def _run_generate(
    body: GenerateRequest,
    groq_api_key: str | None = None,
) -> GenerateResponse:
    jobs = _jobs(body)
    images: list[ImageResult] = []
    last_source: Literal["groq", "pollinations", "template"] = "template"

    for label_base, description in jobs:
        # One enrichment per subject; variations only differ by framing hints.
        result = enrich_prompt_detailed(
            description, body.style, groq_api_key=groq_api_key
        )
        last_source = result.source
        count = body.variations if body.blog_text is None else 1

        for i in range(1, count + 1):
            prompt = _prompt_for_variation(result.prompt, i, count)
            variation = i if count > 1 else None
            png_bytes, filename = generate_and_save(
                prompt,
                user_description=description,
                style=body.style,
                ratio=body.ratio,
                variation=variation,
                return_bytes=True,
            )
            assert isinstance(png_bytes, bytes)
            assert isinstance(filename, str)

            if body.watermark and body.watermark.strip():
                png_bytes = apply_watermark_bytes(png_bytes, body.watermark)

            if body.blog_text:
                label = label_base
            elif count > 1:
                label = f"v{i}"
            else:
                label = "image"

            images.append(
                ImageResult(
                    data=base64.b64encode(png_bytes).decode("ascii"),
                    filename=filename,
                    prompt=prompt,
                    label=label,
                )
            )

    if not images:
        raise ValidationError("Üretilecek görsel bulunamadı.")
    return GenerateResponse(images=images, enrichment_source=last_source)


def _jobs(body: GenerateRequest) -> list[tuple[str, str]]:
    if body.blog_text and body.blog_text.strip():
        ideas = extract_visual_ideas(body.blog_text)
        return [(idea.role, idea.description) for idea in ideas]

    text = (body.description or "").strip()
    if not text:
        raise ValidationError("Açıklama boş olamaz (veya blog_text gönderin).")
    return [("image", text)]
