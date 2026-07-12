"""Apply a simple title/brand watermark onto an existing PNG file or bytes."""

from __future__ import annotations

import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from src.errors import ImageGenerationError


def apply_watermark(image_path: Path, text: str) -> Path:
    """Draw semi-transparent label text onto a saved PNG. Mutates the file in place."""
    if not image_path.is_file():
        raise ImageGenerationError(f"Watermark için görsel bulunamadı: {image_path}")
    png_bytes = apply_watermark_bytes(image_path.read_bytes(), text)
    image_path.write_bytes(png_bytes)
    return image_path


def apply_watermark_bytes(png_bytes: bytes, text: str) -> bytes:
    """Return new PNG bytes with a corner watermark (no disk I/O)."""
    label = text.strip()
    if not label:
        raise ImageGenerationError("Watermark metni boş olamaz.")
    try:
        with Image.open(io.BytesIO(png_bytes)).convert("RGBA") as base:
            overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            font = _load_font(max(18, base.width // 40))
            bbox = draw.textbbox((0, 0), label, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            pad = max(8, base.width // 80)
            x = base.width - text_w - pad * 3
            y = base.height - text_h - pad * 3
            box = (x - pad, y - pad, x + text_w + pad, y + text_h + pad)
            draw.rounded_rectangle(box, radius=pad // 2, fill=(0, 0, 0, 140))
            draw.text((x, y), label, font=font, fill=(255, 255, 255, 230))
            composed = Image.alpha_composite(base, overlay).convert("RGB")
            out = io.BytesIO()
            composed.save(out, format="PNG")
            return out.getvalue()
    except ImageGenerationError:
        raise
    except Exception as exc:
        raise ImageGenerationError(f"Watermark uygulanamadı: {exc}") from exc


def _load_font(size: int) -> ImageFont.ImageFont | ImageFont.FreeTypeFont:
    for name in (
        "arial.ttf",
        "Arial.ttf",
        "DejaVuSans.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
    ):
        try:
            return ImageFont.truetype(name, size=size)
        except OSError:
            continue
    return ImageFont.load_default()
