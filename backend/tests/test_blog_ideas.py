"""Unit tests for blog section → visual idea heuristics."""

from __future__ import annotations

import pytest

from src.blog_ideas import (
    concrete_scene_from_section,
    ensure_concrete_subject,
    extract_visual_ideas,
    parse_blog_sections,
)


SAMPLE_BLOG = """
Uyku ve iş verimliliği üzerine notlar.

## Masada Odaklanma
Sabahları düzenli bir çalışma rutini, dikkat süresini uzatır.

## Kısa Süreli Öğle Uykuları
Öğle arasında 15–20 dakikalık kısa bir şekerleme, öğleden sonra
odaklanmayı güçlendirebilir. Sessiz bir köşede kısa dinlenme yeterlidir.

## Sonuç
Küçük alışkanlıklar birikir.
"""

FULL_SLEEP_BLOG = """
# Uyku ve İş Verimliliği

Uyku kalitesi, gündüz odak ve üretkenliği doğrudan etkiler.

## Düzenli Uyku ve Dikkat Dağınıklığı
Düzenli uyku alışkanlığı dikkat dağınıklığını azaltır.

## Esnek Çalışma Saatleri ve Uyku
Esnek saatler uyku ritmini korumaya yardımcı olabilir.

## Kısa Süreli Öğle Uykuları
Öğle arasında 15 dakikalık kısa şekerleme odaklanmayı güçlendirir.

## Sonuç
Küçük uyku alışkanlıkları birikir.
"""


def test_parse_blog_sections_preserves_order() -> None:
    sections = parse_blog_sections(SAMPLE_BLOG)
    headings = [h for h, _ in sections]
    assert "Masada Odaklanma" in headings
    assert "Kısa Süreli Öğle Uykuları" in headings
    idx_nap = headings.index("Kısa Süreli Öğle Uykuları")
    idx_focus = headings.index("Masada Odaklanma")
    assert idx_nap == idx_focus + 1


def test_concrete_scene_includes_heading_action() -> None:
    scene = concrete_scene_from_section(
        "Kısa Süreli Öğle Uykuları",
        "Öğle arasında kısa bir şekerleme odaklanmayı güçlendirir.",
    )
    lower = scene.lower()
    assert "öğle uykuları" in lower or "kısa süreli" in lower
    assert "şekerleme" in lower or "uyku" in lower
    assert "empty room" in lower  # instruction to avoid generic room
    assert "person" in lower  # concrete human subject required


def test_ensure_concrete_subject_fills_empty_room_scene() -> None:
    """Empty-room LLM output (observed section2 failure) gets a human subject."""
    empty = (
        "minimalist office kitchenette with a comfy couch and a timer "
        "set to 15 minutes"
    )
    fixed = ensure_concrete_subject(empty)
    assert fixed != empty
    assert "person" in fixed.lower()
    assert "empty room" in fixed.lower()


def test_ensure_concrete_subject_keeps_human_scenes() -> None:
    """Cover/section1 scenes that already name a person stay unchanged."""
    good = "office worker closing a laptop at 10:00 PM at a tidy desk"
    assert ensure_concrete_subject(good) == good


def test_heuristic_section2_maps_to_second_heading(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_api(_text: str):
        raise RuntimeError("force heuristic")

    monkeypatch.setattr("src.blog_ideas._extract_via_text_api", fail_api)
    ideas = extract_visual_ideas(SAMPLE_BLOG)
    assert [i.role for i in ideas] == ["cover", "section_1", "section_2"]
    s2 = ideas[2].description.lower()
    assert "öğle uykuları" in s2 or "şekerleme" in s2
    assert "sonuç" not in s2
    assert "person" in s2


def test_heuristic_all_ideas_have_concrete_human_subject(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Cover + both sections always carry a concrete person/action subject."""
    def fail_api(_text: str):
        raise RuntimeError("force heuristic")

    monkeypatch.setattr("src.blog_ideas._extract_via_text_api", fail_api)
    ideas = extract_visual_ideas(FULL_SLEEP_BLOG)
    assert len(ideas) == 3
    for idea in ideas:
        lower = idea.description.lower()
        assert any(
            cue in lower for cue in ("person", "human", "kişi", "çalışan")
        ), f"{idea.role} missing human subject: {idea.description}"
    # Index mapping: section_2 = 2nd body heading (Esnek…), not naps (3rd)
    s2 = ideas[2].description.lower()
    assert "esnek" in s2
    assert "öğle uykuları" not in s2
