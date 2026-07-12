"""Generate images via Pollinations and save PNG + prompt sidecar files."""

from __future__ import annotations

import io
import re
import time
from pathlib import Path
from urllib.parse import quote

import httpx
from PIL import Image

from src.errors import ImageGenerationError

IMAGE_TIMEOUT = 120.0
MAX_RETRIES = 2
IMAGE_API_BASE = "https://image.pollinations.ai/prompt"

RATIO_SIZES: dict[str, tuple[int, int]] = {
    "landscape": (1344, 768),
    "square": (1024, 1024),
}

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_IMAGES_DIR = PROJECT_ROOT / "output" / "images"
DEFAULT_PROMPTS_DIR = PROJECT_ROOT / "output" / "prompts"


def generate_and_save(
    enriched_prompt: str,
    *,
    user_description: str,
    style: str,
    ratio: str,
    variation: int | None = None,
    images_dir: Path | None = None,
    prompts_dir: Path | None = None,
    return_bytes: bool = False,
) -> tuple[Path, Path] | tuple[bytes, str]:
    """Fetch an image for an already-enriched prompt.

    Default (return_bytes=False): write PNG + .txt to disk, return paths.
    When return_bytes=True: do not write to disk; return (png_bytes, filename).
    """
    if ratio not in RATIO_SIZES:
        raise ImageGenerationError(
            f"Geçersiz oran: {ratio!r}. landscape veya square olmalı."
        )

    width, height = RATIO_SIZES[ratio]
    slug = _slugify(user_description)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    base_name = f"{timestamp}_{slug}_{ratio}"
    if variation is not None:
        base_name = f"{base_name}_v{variation}"
    filename = f"{base_name}.png"

    raw_bytes = _fetch_image_bytes(enriched_prompt, width, height)
    png_bytes = _to_png_bytes(raw_bytes)

    if return_bytes:
        return png_bytes, filename

    images_dir = images_dir or DEFAULT_IMAGES_DIR
    prompts_dir = prompts_dir or DEFAULT_PROMPTS_DIR
    images_dir.mkdir(parents=True, exist_ok=True)
    prompts_dir.mkdir(parents=True, exist_ok=True)

    image_path = images_dir / filename
    prompt_path = prompts_dir / f"{base_name}.txt"
    image_path.write_bytes(png_bytes)
    if not image_path.is_file() or image_path.stat().st_size == 0:
        raise ImageGenerationError("PNG kaydı başarısız veya dosya boş")
    prompt_path.write_text(
        _prompt_log_body(user_description, style, ratio, enriched_prompt),
        encoding="utf-8",
    )
    return image_path, prompt_path


def _fetch_image_bytes(prompt: str, width: int, height: int) -> bytes:
    encoded = quote(prompt, safe="")
    url = (
        f"{IMAGE_API_BASE}/{encoded}"
        f"?width={width}&height={height}"
        f"&nologo=true&enhance=true&model=flux"
    )
    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            with httpx.Client(timeout=IMAGE_TIMEOUT, follow_redirects=True) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ImageGenerationError(
                        f"Görsel API HTTP {response.status_code}"
                    )
                content = response.content
                if not content or len(content) < 100:
                    raise ImageGenerationError(
                        "Görsel API boş veya çok küçük yanıt döndü"
                    )
                content_type = (response.headers.get("content-type") or "").lower()
                if "html" in content_type:
                    raise ImageGenerationError("Görsel API HTML hata sayfası döndü")
                return content
        except ImageGenerationError as exc:
            last_error = exc
        except httpx.HTTPError as exc:
            last_error = ImageGenerationError(f"Ağ hatası: {exc}")
        if attempt < MAX_RETRIES:
            time.sleep(1.5 * (attempt + 1))
    assert last_error is not None
    raise last_error


def _to_png_bytes(raw_bytes: bytes) -> bytes:
    """Pollinations often returns JPEG; normalize to PNG bytes."""
    try:
        with Image.open(io.BytesIO(raw_bytes)) as img:
            buf = io.BytesIO()
            img.convert("RGB").save(buf, format="PNG")
            return buf.getvalue()
    except Exception as exc:
        raise ImageGenerationError(
            f"Görsel PNG'ye çevrilemedi: {exc}"
        ) from exc


def _slugify(text: str) -> str:
    lowered = text.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "_", lowered)
    slug = slug.strip("_") or "image"
    return slug[:40]


def _prompt_log_body(
    user_description: str,
    style: str,
    ratio: str,
    enriched_prompt: str,
) -> str:
    return (
        f"user_description: {user_description}\n"
        f"style: {style}\n"
        f"ratio: {ratio}\n"
        f"enriched_prompt:\n{enriched_prompt}\n"
    )
