"""Enrich a simple subject description into a detailed image prompt."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Literal
from urllib.parse import quote

import httpx

from src.errors import PromptEnrichmentError, ValidationError

TEXT_TIMEOUT = 60.0
TEXT_API_BASE = "https://text.pollinations.ai"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

EnrichmentSource = Literal["groq", "pollinations", "template"]

STYLE_TEMPLATES: dict[str, dict[str, str]] = {
    "minimal": {
        "style": "minimal flat illustration, clean vector shapes, sparse detail",
        "light": "soft even ambient light, gentle shadows",
        "composition": "centered subject, generous negative space, simple background",
        "color": "limited muted palette, two accent colors max",
    },
    "minimal illustration": {
        "style": "minimal flat illustration, clean vector shapes, sparse detail",
        "light": "soft even ambient light, gentle shadows",
        "composition": "centered subject, generous negative space, simple background",
        "color": "limited muted palette, two accent colors max",
    },
    "photorealism": {
        "style": (
            "photorealistic photography, sharp detail, natural textures, "
            "avoid deformed hands or faces, prefer one clear subject"
        ),
        "light": "natural window light, subtle rim light, realistic shadows",
        "composition": "rule of thirds, shallow depth of field, editorial framing",
        "color": "natural color grading, balanced contrast",
    },
    "photo": {
        "style": (
            "photorealistic photography, sharp detail, natural textures, "
            "avoid deformed hands or faces, prefer one clear subject"
        ),
        "light": "natural window light, subtle rim light, realistic shadows",
        "composition": "rule of thirds, shallow depth of field, editorial framing",
        "color": "natural color grading, balanced contrast",
    },
    "illustration": {
        "style": "digital illustration, painted textures, blog-friendly artwork",
        "light": "warm directional key light, soft fill",
        "composition": "clear focal point, balanced negative space for headline overlay",
        "color": "harmonious mid-saturation palette, cohesive tones",
    },
}

DEFAULT_TEMPLATE = {
    "style": "high-quality digital art suitable for a blog cover",
    "light": "clear readable lighting, soft shadows",
    "composition": "strong focal subject, uncluttered background",
    "color": "cohesive complementary color palette",
}

QUALITY_SUFFIX = (
    "high quality, coherent anatomy, clean edges, no watermark text artifacts"
)

# Deterministic series skeleton appended after every enrichment so cover /
# section_1 / section_2 cannot drift into unrelated palettes or empty rooms.
SERIES_PALETTE = (
    "shared series palette: soft pastel blue, warm beige, and muted gray "
    "with at most two accent colors — do not invent a conflicting green/teal "
    "or unrelated palette"
)

SUBJECT_CONSTRAINT = (
    "one clear human subject performing the section's main action "
    "(or one large unmistakable focal object if a person truly does not fit), "
    "never an empty room or generic interior without a narrative subject"
)

SERIES_STYLE_MARKER = "shared series palette:"


@dataclass(frozen=True)
class EnrichmentResult:
    prompt: str
    source: EnrichmentSource


def shared_style_suffix(template: dict[str, str]) -> str:
    """
    Common style skeleton for a blog image set (cover + sections).
    Built from the chosen style template plus fixed series palette/subject rules.
    """
    return (
        f"{template['style']}, {template['light']}, "
        f"{template['composition']}, {template['color']}, "
        f"{SERIES_PALETTE}, {SUBJECT_CONSTRAINT}"
    )


def enrich_prompt(description: str, style: str) -> str:
    """CLI-compatible helper: returns only the enriched prompt string."""
    return enrich_prompt_detailed(description, style).prompt


def enrich_prompt_detailed(
    description: str,
    style: str,
    groq_api_key: str | None = None,
) -> EnrichmentResult:
    """Groq → Pollinations text → template. Does not download images.

    Prefer an explicit per-request Groq key (BYOK); fall back to env for CLI.
    """
    subject = description.strip()
    if not subject:
        raise ValidationError("Açıklama boş olamaz.")

    style_key = style.strip().lower()
    template = STYLE_TEMPLATES.get(style_key, DEFAULT_TEMPLATE)

    groq_key = (groq_api_key or "").strip() or os.environ.get(
        "GROQ_API_KEY", ""
    ).strip()
    if groq_key:
        try:
            enriched = _enrich_via_groq(subject, style_key, template, groq_key)
            if _is_strong_enough(enriched, subject):
                return EnrichmentResult(
                    _finalize(enriched.strip(), template), "groq"
                )
        except Exception:
            pass

    try:
        enriched = _enrich_via_text_api(subject, style_key, template)
        if _is_strong_enough(enriched, subject):
            return EnrichmentResult(
                _finalize(enriched.strip(), template), "pollinations"
            )
    except Exception:
        pass

    return EnrichmentResult(
        _finalize(_enrich_via_template(subject, template), template), "template"
    )


def _finalize(prompt: str, template: dict[str, str]) -> str:
    """Append shared style skeleton + quality suffix (idempotent)."""
    text = prompt.strip()
    if SERIES_STYLE_MARKER not in text.lower():
        text = f"{text}, {shared_style_suffix(template)}"
    return _with_quality(text)


def _with_quality(prompt: str) -> str:
    if QUALITY_SUFFIX in prompt.lower():
        return prompt
    return f"{prompt}, {QUALITY_SUFFIX}"


def _instruction(subject: str, style: str, template: dict[str, str]) -> str:
    return (
        "Rewrite the following blog image subject into ONE detailed English "
        "image-generation prompt. Include style, lighting, composition, and "
        f"color. Target style: {style}. "
        f"Style hints: {template['style']}. "
        f"Light: {template['light']}. "
        f"Composition: {template['composition']}. "
        f"Color: {template['color']}. "
        f"Series lock: {SERIES_PALETTE}. "
        "CRITICAL: keep the MAIN ACTION and SUBJECT from the description as "
        "the clear focal point — do not replace them with a generic empty "
        "room, lobby, or unrelated interior. Prefer ONE human figure doing "
        "the section action (working, resting/napping, focusing, etc.); if "
        "the subject mentions a nap, rest break, or work, show that activity. "
        "Avoid deformed hands/faces; keep subjects coherent. "
        "Return ONLY the prompt text, no quotes or explanation. "
        f"Subject: {subject}"
    )


def focal_keywords(text: str) -> list[str]:
    """
    Extract concrete topic/action cues from a section blurb (heading + opener).
    Used to keep template enrichment anchored; also unit-tested.
    """
    lowered = text.lower()
    # Multi-word phrases first
    phrases = [
        "öğle uykusu",
        "ogle uykusu",
        "power nap",
        "lunchtime nap",
        "short nap",
        "siesta",
        "şekerleme",
        "sekerleme",
        "napping",
        "nap",
        "resting at desk",
        "desk nap",
    ]
    found: list[str] = []
    for phrase in phrases:
        if phrase in lowered and phrase not in found:
            found.append(phrase)

    # Token cues (skip tiny/stop-ish words)
    stop = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "this",
        "that",
        "about",
        "scene",
        "concrete",
        "editorial",
        "showing",
        "section",
        "bir",
        "ve",
        "ile",
        "için",
        "olan",
    }
    for token in re.findall(r"[a-zA-ZçğıöşüÇĞİÖŞÜ]{4,}", text):
        t = token.lower()
        if t not in stop and t not in found:
            found.append(t)
        if len(found) >= 8:
            break
    return found


def _enrich_via_template(subject: str, template: dict[str, str]) -> str:
    keys = focal_keywords(subject)
    anchor = ", ".join(keys[:4]) if keys else subject[:80]
    return (
        f"{subject}, focal subject must clearly depict: {anchor}, "
        f"one clear human subject performing that action, "
        f"{template['style']}, {template['light']}, "
        f"{template['composition']}, {template['color']}, "
        "high quality, blog cover artwork"
    )


def _enrich_via_groq(
    subject: str,
    style: str,
    template: dict[str, str],
    api_key: str,
) -> str:
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": _instruction(subject, style, template),
            }
        ],
        "temperature": 0.7,
        "max_tokens": 400,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=TEXT_TIMEOUT, follow_redirects=True) as client:
        response = client.post(GROQ_API_URL, json=payload, headers=headers)
        if response.status_code != 200:
            raise PromptEnrichmentError(f"Groq HTTP {response.status_code}")
        data = response.json()
        text = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not text:
            raise PromptEnrichmentError("Groq returned empty body")
        return text


def _enrich_via_text_api(
    subject: str,
    style: str,
    template: dict[str, str],
) -> str:
    url = f"{TEXT_API_BASE}/{quote(_instruction(subject, style, template), safe='')}"
    with httpx.Client(timeout=TEXT_TIMEOUT, follow_redirects=True) as client:
        response = client.get(url)
        if response.status_code != 200:
            raise PromptEnrichmentError(
                f"Text API HTTP {response.status_code}"
            )
        text = response.text.strip()
        if not text:
            raise PromptEnrichmentError("Text API returned empty body")
        return text


def _is_strong_enough(enriched: str, subject: str) -> bool:
    cleaned = enriched.strip()
    if len(cleaned) < max(40, len(subject) + 20):
        return False
    if cleaned.lower() == subject.lower():
        return False
    return True
