"""Shared exception types for Visora CLI."""

from __future__ import annotations


class ValidationError(Exception):
    """Invalid user input (empty prompt, bad flags, etc.)."""


class PromptEnrichmentError(Exception):
    """Prompt enrichment failed after text API and fallback attempts."""


class ImageGenerationError(Exception):
    """Image API call failed or returned unexpected content."""
