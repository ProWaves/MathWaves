"""Extract math formulas (as LaTeX) from images using Gemini Vision."""
import os
import io
import PIL.Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a fast, vision-capable model
MODEL_NAME = "gemini-3.8-flash"

OCR_PROMPT = """You are a math OCR expert.
Extract the mathematical formula from the image and return it as valid LaTeX.

Rules:
1. Return ONLY the LaTeX — no explanation, no markdown fences, no "$$".
2. If there is an equation with '=' sign, keep it: e.g. y = x^2 + 3x
3. If it's just an expression, return that: e.g. \\frac{\\sin x}{x}
4. Preserve fractions, integrals, derivatives, sums, matrices, etc.
5. If the image has no math, return exactly: ERROR: no formula detected
6. Handle both printed and handwritten math.
"""


def extract_formula_from_image(image_bytes: bytes) -> str:
    """Send image bytes to Gemini Vision, return LaTeX string."""
    try:
        image = PIL.Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Invalid image file: {e}")

    model = genai.GenerativeModel(MODEL_NAME)

    try:
        response = model.generate_content(
            [OCR_PROMPT, image],
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 500,
            },
        )
        text = response.text.strip()

        # Clean up common LLM wrapping
        text = text.strip("`").strip()
        if text.startswith("latex"):
            text = text[5:].strip()
        if text.startswith("$$") and text.endswith("$$"):
            text = text[2:-2].strip()
        if text.startswith("$") and text.endswith("$"):
            text = text[1:-1].strip()
        if text.startswith("\\[") and text.endswith("\\]"):
            text = text[2:-2].strip()

        if not text or text.startswith("ERROR"):
            raise ValueError("No formula detected in image.")

        return text
    except Exception as e:
        raise ValueError(f"Gemini OCR failed: {e}")