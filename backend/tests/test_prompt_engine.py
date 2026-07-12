"""Unit tests for prompt enrichment helpers (no live API calls)."""

from __future__ import annotations

import pytest

from src.errors import ValidationError
from src.prompt_engine import (
    SERIES_PALETTE,
    STYLE_TEMPLATES,
    SUBJECT_CONSTRAINT,
    enrich_prompt_detailed,
    focal_keywords,
    shared_style_suffix,
)


def test_empty_description_raises_validation_error() -> None:
    with pytest.raises(ValidationError):
        enrich_prompt_detailed("   ", "minimal")


def test_focal_keywords_from_nap_section_text() -> None:
    """Section copy about short lunch naps must yield nap/rest action cues."""
    blurb = (
        "Kısa Süreli Öğle Uykuları. "
        "Öğle arasında 15–20 dakikalık kısa bir şekerleme, "
        "öğleden sonra odaklanmayı güçlendirebilir."
    )
    keys = focal_keywords(blurb)
    joined = " ".join(keys)
    assert any(
        cue in joined
        for cue in ("öğle uykusu", "ogle uykusu", "şekerleme", "sekerleme", "nap")
    ), f"expected nap-related keyword, got {keys}"


def test_shared_style_suffix_locks_series_palette_and_subject() -> None:
    """All blog-set prompts share the same style skeleton + palette constraint."""
    template = STYLE_TEMPLATES["minimal"]
    suffix = shared_style_suffix(template)
    lower = suffix.lower()
    assert "minimal flat illustration" in lower
    assert "shared series palette" in lower
    assert "pastel blue" in lower
    assert "one clear human subject" in lower
    assert SERIES_PALETTE.split(":")[0] in lower
    assert "empty room" in lower


def test_template_enrichment_includes_shared_style_and_concrete_subject(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Template path appends series style suffix and keeps a concrete subject."""
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    def boom(*_a, **_k):
        raise RuntimeError("skip remote")

    monkeypatch.setattr("src.prompt_engine._enrich_via_text_api", boom)

    subject = (
        "concrete editorial scene about 'Kısa Süreli Öğle Uykuları': "
        "kısa bir şekerleme masada dinlenen kişi."
    )
    result = enrich_prompt_detailed(subject, "minimal")
    assert result.source == "template"
    lower = result.prompt.lower()
    assert "öğle" in lower or "sekerleme" in lower or "şekerleme" in lower
    assert "focal subject must clearly depict" in lower
    assert "shared series palette" in lower
    assert "pastel blue" in lower
    assert "one clear human subject" in lower
    assert "empty room" in lower
    # Style template bits from the shared skeleton
    assert "minimal flat illustration" in lower or "clean vector" in lower


def test_template_enrichment_keeps_section_action_anchor(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """When LLM paths are skipped, template prompt still anchors on section action."""
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    def boom(*_a, **_k):
        raise RuntimeError("skip remote")

    monkeypatch.setattr("src.prompt_engine._enrich_via_text_api", boom)

    subject = (
        "concrete editorial scene about 'Kısa Süreli Öğle Uykuları': "
        "kısa bir şekerleme masada dinlenen kişi."
    )
    result = enrich_prompt_detailed(subject, "photorealism")
    assert result.source == "template"
    lower = result.prompt.lower()
    assert "öğle" in lower or "sekerleme" in lower or "şekerleme" in lower
    assert "focal subject must clearly depict" in lower
    assert SUBJECT_CONSTRAINT.split("(")[0].strip().lower() in lower
