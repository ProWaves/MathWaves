"""Transcribe audio to text using Groq Whisper, then normalize to math notation."""
import os
import re
import tempfile
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
WHISPER_MODEL = "whisper-large-v3"

# Prompt primes Whisper to output math notation
WHISPER_PROMPT = (
    "Convert spoken math into symbolic notation. Examples: "
    "'x squared' becomes 'x^2'. "
    "'sine of x' becomes 'sin(x)'. "
    "'cosine theta' becomes 'cos(theta)'. "
    "'e to the negative x squared' becomes 'e^(-x^2)'. "
    "'fraction x over y' becomes 'x/y'. "
    "'square root of x' becomes 'sqrt(x)'. "
    "'integral of x squared' becomes 'integral(x^2)'. "
    "Always output compact math notation."
)

# Word-to-symbol replacements applied after transcription
REPLACEMENTS = [
    (r"\bsquared\b", "^2"),
    (r"\bcubed\b", "^3"),
    (r"\btimes\b", "*"),
    (r"\bmultiplied by\b", "*"),
    (r"\bdivided by\b", "/"),
    (r"\bover\b", "/"),
    (r"\bplus\b", "+"),
    (r"\bminus\b", "-"),
    (r"\bnegative\b", "-"),
    (r"\bequals\b", "="),
    (r"\bequal to\b", "="),
    (r"\bsine of\b", "sin"),
    (r"\bcosine of\b", "cos"),
    (r"\btangent of\b", "tan"),
    (r"\bsine\b", "sin"),
    (r"\bcosine\b", "cos"),
    (r"\btangent\b", "tan"),
    (r"\bsquare root of\b", "sqrt"),
    (r"\bpi\b", "pi"),
    (r"\btheta\b", "theta"),
    (r"\bto the power of\b", "^"),
]


def normalize_math(text: str) -> str:
    """Convert natural-language math to symbolic notation."""
    t = text.lower().strip().rstrip(".")

    for pattern, replacement in REPLACEMENTS:
        t = re.sub(pattern, replacement, t)

    # Collapse extra spaces
    t = re.sub(r"\s+", " ", t).strip()
    return t


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe audio, then normalize to math notation."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                file=(filename, f.read()),
                model=WHISPER_MODEL,
                response_format="text",
                language="en",
                prompt=WHISPER_PROMPT,
            )

        raw = result.strip() if isinstance(result, str) else result.text
        normalized = normalize_math(raw)
        return normalized
    finally:
        os.unlink(tmp_path)