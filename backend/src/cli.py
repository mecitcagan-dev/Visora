"""CLI entry point: validate → enrich prompt → generate image → print paths."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from src.errors import ImageGenerationError, PromptEnrichmentError, ValidationError
from src.image_generator import generate_and_save
from src.prompt_engine import enrich_prompt

# Light per-variation framing so Pollinations returns distinct images.
VARIATION_HINTS: tuple[str, ...] = (
    "wide establishing shot, calm balanced mood",
    "closer crop on the subject, warmer light",
    "dynamic angle, cooler color grade, more contrast",
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="visora",
        description="Blog görseli üret: açıklama → zengin prompt → PNG",
    )
    parser.add_argument(
        "description",
        nargs="?",
        default=None,
        help="Görsel konusu / kısa açıklama",
    )
    parser.add_argument(
        "--prompt",
        dest="prompt",
        default=None,
        help="Açıklama (pozisyonel description alternatifi)",
    )
    parser.add_argument(
        "--style",
        required=True,
        help='Stil (ör. "minimal", "photorealism", "illustration")',
    )
    parser.add_argument(
        "--ratio",
        required=True,
        choices=("landscape", "square"),
        help="En-boy oranı: landscape (yatay kapak) veya square (kare)",
    )
    parser.add_argument(
        "--variations",
        type=int,
        default=1,
        metavar="N",
        help="Aynı açıklama için N varyasyon üret (varsayılan 1)",
    )
    parser.add_argument(
        "--watermark",
        default=None,
        metavar="TEXT",
        help="Üretilen PNG üzerine başlık/marka yazısı ekle",
    )
    parser.add_argument(
        "--from-blog",
        default=None,
        metavar="PATH",
        help="Blog metni dosyasından 1 kapak + 2 bölüm fikri çıkar ve üret",
    )
    return parser


def resolve_description(args: argparse.Namespace) -> str | None:
    """Return description, or None when --from-blog supplies ideas instead."""
    if args.from_blog:
        return None
    text = args.prompt if args.prompt is not None else args.description
    if text is None:
        raise ValidationError(
            "Açıklama gerekli: pozisyonel argüman veya --prompt kullanın "
            "(veya --from-blog)."
        )
    if not text.strip():
        raise ValidationError("Açıklama boş olamaz.")
    return text.strip()


def _jobs_from_args(args: argparse.Namespace) -> list[tuple[str, str]]:
    """Return list of (label, description) jobs to generate."""
    if args.from_blog:
        from src.blog_ideas import extract_visual_ideas

        path = Path(args.from_blog)
        if not path.is_file():
            raise ValidationError(f"Blog dosyası bulunamadı: {path}")
        text = path.read_text(encoding="utf-8")
        ideas = extract_visual_ideas(text)
        return [(idea.role, idea.description) for idea in ideas]

    description = resolve_description(args)
    assert description is not None
    return [("image", description)]


def _prompt_for_variation(enriched: str, index: int, total: int) -> str:
    if total <= 1:
        return enriched
    hint = VARIATION_HINTS[(index - 1) % len(VARIATION_HINTS)]
    return f"{enriched}, {hint}"


def _generate_one(
    *,
    description: str,
    style: str,
    ratio: str,
    variations: int,
    watermark_text: str | None,
) -> list[tuple[Path, Path]]:
    enriched = enrich_prompt(description, style)
    results: list[tuple[Path, Path]] = []
    for i in range(1, variations + 1):
        prompt = _prompt_for_variation(enriched, i, variations)
        variation = i if variations > 1 else None
        image_path, prompt_path = generate_and_save(
            prompt,
            user_description=description,
            style=style,
            ratio=ratio,
            variation=variation,
        )
        if watermark_text:
            from src.watermark import apply_watermark

            apply_watermark(image_path, watermark_text)
        results.append((image_path, prompt_path))
    return results


def run(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.variations < 1:
            raise ValidationError("--variations en az 1 olmalı.")
        jobs = _jobs_from_args(args)
        all_paths: list[tuple[Path, Path]] = []
        for _role, description in jobs:
            all_paths.extend(
                _generate_one(
                    description=description,
                    style=args.style,
                    ratio=args.ratio,
                    variations=args.variations,
                    watermark_text=args.watermark,
                )
            )
    except ValidationError as exc:
        print(f"Hata (doğrulama): {exc}", file=sys.stderr)
        return 2
    except (PromptEnrichmentError, ImageGenerationError) as exc:
        print(f"Hata (API): {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Hata (beklenmeyen): {exc}", file=sys.stderr)
        return 1

    for image_path, prompt_path in all_paths:
        print(image_path)
        print(prompt_path)
    return 0


def main() -> None:
    sys.exit(run())


if __name__ == "__main__":
    main()
