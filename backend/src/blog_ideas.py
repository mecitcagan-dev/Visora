"""Extract cover + section visual ideas from a blog article (text-AI layer)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import quote

import httpx

from src.errors import PromptEnrichmentError, ValidationError

TEXT_TIMEOUT = 60.0
TEXT_API_BASE = "https://text.pollinations.ai"

_MD_HEADING = re.compile(r"(?m)^(#{1,3}[ \t]+)(.+)$")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?…])\s+")


@dataclass(frozen=True)
class VisualIdea:
    role: str  # cover | section_1 | section_2
    description: str


def extract_visual_ideas(blog_text: str) -> list[VisualIdea]:
    """Return exactly 1 cover + 2 section image ideas from blog copy."""
    text = blog_text.strip()
    if not text:
        raise ValidationError("Blog metni boş olamaz.")

    try:
        ideas = _extract_via_text_api(text)
        if len(ideas) == 3 and all(i.description.strip() for i in ideas):
            return ideas
    except Exception:
        pass

    return _extract_via_heuristic(text)


_PERSON_CUES = (
    "person",
    "people",
    "human",
    "worker",
    "professional",
    "woman",
    "man",
    "someone",
    "figure",
    "employee",
    "colleague",
    "napper",
    "sleeper",
    "kişi",
    "çalışan",
    "insan",
)


def _extract_via_text_api(blog_text: str) -> list[VisualIdea]:
    clipped = blog_text[:2500]
    body_heads = [h for h, _ in parse_blog_sections(blog_text) if h]
    body_heads = _prefer_content_sections([(h, "") for h in body_heads])
    head_names = [h for h, _ in body_heads]
    mapping_hint = ""
    if len(head_names) >= 2:
        mapping_hint = (
            f" FIRST body section heading is exactly '{head_names[0]}'; "
            f"SECOND body section heading is exactly '{head_names[1]}'. "
            "SECTION1 must illustrate the FIRST heading; SECTION2 the SECOND."
        )
    instruction = (
        "Read this blog article and propose exactly 3 short English visual "
        "subjects for AI image generation: (1) one cover image for the whole "
        "article, (2) section image A for the FIRST body section, (3) section "
        "image B for the SECOND body section. "
        f"{mapping_hint} "
        "CRITICAL for EVERY line (cover + section1 + section2): each subject "
        "MUST include ONE clear HUMAN figure performing the section's main "
        "action — e.g. if a section is about short lunchtime naps / power "
        "naps, show a person actually napping or resting at a desk/sofa, "
        "NOT a generic empty kitchenette, lobby, or room with only a timer. "
        "Each subject: one concrete scene under 30 words with a human action. "
        "Reply with exactly 3 lines:\n"
        "COVER: ...\n"
        "SECTION1: ...\n"
        "SECTION2: ...\n"
        f"Article:\n{clipped}"
    )
    url = f"{TEXT_API_BASE}/{quote(instruction, safe='')}"
    with httpx.Client(timeout=TEXT_TIMEOUT, follow_redirects=True) as client:
        response = client.get(url)
        if response.status_code != 200:
            raise PromptEnrichmentError(
                f"Blog fikir text API HTTP {response.status_code}"
            )
        body = response.text.strip()
        if not body:
            raise PromptEnrichmentError("Blog fikir text API boş yanıt")
    return _parse_idea_lines(body)


def ensure_concrete_subject(description: str) -> str:
    """
    Safety net: if a visual idea has no human/subject cue, require one.
    Keeps cover/section1 that already name a person unchanged.
    """
    text = description.strip()
    if not text:
        return text
    lower = text.lower()
    if any(cue in lower for cue in _PERSON_CUES):
        return text
    return (
        f"{text.rstrip('.')} — include one clear person as the focal subject "
        f"performing the related action, not an empty room"
    )


def _parse_idea_lines(body: str) -> list[VisualIdea]:
    cover = section1 = section2 = None
    for raw in body.splitlines():
        line = raw.strip()
        upper = line.upper()
        if upper.startswith("COVER:"):
            cover = line.split(":", 1)[1].strip()
        elif upper.startswith("SECTION1:"):
            section1 = line.split(":", 1)[1].strip()
        elif upper.startswith("SECTION2:"):
            section2 = line.split(":", 1)[1].strip()
    if not (cover and section1 and section2):
        raise PromptEnrichmentError("Blog fikir yanıtı beklenen formatta değil")
    return [
        VisualIdea("cover", ensure_concrete_subject(cover)),
        VisualIdea("section_1", ensure_concrete_subject(section1)),
        VisualIdea("section_2", ensure_concrete_subject(section2)),
    ]


def parse_blog_sections(blog_text: str) -> list[tuple[str, str]]:
    """
    Split article into (heading, body) pairs.
    Prefers markdown headings; falls back to paragraph blocks.
    Leading H1 title is omitted when H2/H3 body sections exist (cover-only).
    """
    leveled = _parse_blog_sections_leveled(blog_text)
    if not leveled:
        return []
    has_body_level = any(level >= 2 for level, _, _ in leveled)
    pairs: list[tuple[str, str]] = []
    for level, heading, body in leveled:
        if has_body_level and level == 1 and not pairs:
            # Skip article title H1 — cover uses preamble / title separately
            continue
        pairs.append((heading, body))
    return pairs


def _parse_blog_sections_leveled(
    blog_text: str,
) -> list[tuple[int, str, str]]:
    """Split into (heading_level, heading, body). Level 0 = unheaded block."""
    text = blog_text.strip()
    matches = list(_MD_HEADING.finditer(text))
    if matches:
        sections: list[tuple[int, str, str]] = []
        for i, match in enumerate(matches):
            level = len(match.group(1).strip())
            heading = match.group(2).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            body = text[start:end].strip()
            sections.append((level, heading, body))
        return sections

    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    sections: list[tuple[int, str, str]] = []
    for block in blocks:
        lines = block.splitlines()
        if len(lines) >= 2 and len(lines[0]) <= 80:
            sections.append((0, lines[0].strip(), "\n".join(lines[1:]).strip()))
        else:
            sections.append((0, "", block))
    return sections


def concrete_scene_from_section(heading: str, body: str) -> str:
    """
    Build a concrete English-leaning visual subject from a section heading
    and its first 1–2 sentences — always anchors on a human action, not rooms.
    """
    title = (heading or "").strip()
    opener = _first_sentences(body, 2)
    focus = title or _first_sentences(body, 1) or "blog section topic"
    detail = opener if opener and opener.lower() != focus.lower() else ""

    # Keep original language cues in the subject so enrichment stays on-topic
    if detail:
        scene = (
            f"concrete editorial scene about '{focus}': {detail[:180]}. "
            f"Show one person clearly performing the main action of this "
            f"section, not an empty room or vague interior."
        )
    else:
        scene = (
            f"concrete editorial scene about '{focus}', showing one person "
            f"performing the main action of this section clearly, "
            f"not a generic empty interior"
        )
    return ensure_concrete_subject(scene)


def _first_sentences(text: str, count: int) -> str:
    cleaned = " ".join((text or "").split())
    if not cleaned:
        return ""
    parts = _SENTENCE_SPLIT.split(cleaned)
    return " ".join(parts[:count]).strip()


def _extract_via_heuristic(blog_text: str) -> list[VisualIdea]:
    """
    Fallback when text API fails: cover from intro; sections from real
    H2/paragraph blocks (index-aligned — section_2 is the 2nd body section).
    """
    leveled = _parse_blog_sections_leveled(blog_text)
    sections = parse_blog_sections(blog_text)
    preamble = ""
    body_sections = sections

    # H1 title body + text before first heading feed the cover
    if leveled and leveled[0][0] == 1 and any(lv >= 2 for lv, _, _ in leveled):
        preamble = leveled[0][2]
        before = blog_text[: blog_text.find("#")].strip() if "#" in blog_text else ""
        if before:
            preamble = f"{before}\n{preamble}".strip()
    elif sections and not sections[0][0]:
        preamble = sections[0][1]
        body_sections = sections[1:]
    elif sections:
        first_heading_at = blog_text.find("#")
        if first_heading_at > 0:
            preamble = blog_text[:first_heading_at].strip()

    # Skip trailing "Sonuç"/"Conclusion" when earlier body sections exist
    body_sections = _prefer_content_sections(body_sections)

    cover_focus = _first_sentences(preamble, 1) or (
        body_sections[0][0] if body_sections else ""
    ) or _first_sentences(blog_text, 1) or "blog topic"

    cover = VisualIdea(
        "cover",
        ensure_concrete_subject(
            f"editorial blog cover scene with one clear human subject "
            f"representing: {cover_focus[:140]}"
        ),
    )

    # Prefer the first two *headed* sections; if fewer, pad from remaining text
    s1 = body_sections[0] if len(body_sections) >= 1 else ("", blog_text)
    s2 = body_sections[1] if len(body_sections) >= 2 else (
        body_sections[-1] if body_sections else ("", blog_text)
    )

    # Avoid duplicating the same block for section_1 and section_2 when only one
    if len(body_sections) == 1:
        heading, body = body_sections[0]
        mid = max(len(body) // 2, 1)
        s2 = (heading, body[mid:].strip() or body)

    return [
        cover,
        VisualIdea("section_1", concrete_scene_from_section(*s1)),
        VisualIdea("section_2", concrete_scene_from_section(*s2)),
    ]


_TRAILING_SKIP = re.compile(
    r"^(sonuç|sonuc|conclusion|summary|özet|ozet|kaynaklar|resources)$",
    re.IGNORECASE,
)


def _prefer_content_sections(
    sections: list[tuple[str, str]],
) -> list[tuple[str, str]]:
    """Drop trailing conclusion-only headings when other body sections remain."""
    if len(sections) <= 2:
        return sections
    filtered = [
        (h, b)
        for h, b in sections
        if not (h and _TRAILING_SKIP.match(h.strip()))
    ]
    return filtered if len(filtered) >= 2 else sections
