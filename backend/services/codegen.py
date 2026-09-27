"""Generate code in multiple languages via Groq LLM."""
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = """You are an expert scientific programmer.
Convert math formulas into clean, executable code.
Rules:
- Use standard scientific libraries (NumPy/SciPy for Python, <cmath> for C++, etc.)
- Add brief comments
- Wrap logic in a function when appropriate
- Return ONLY code inside a single code block, no prose before or after
"""

LANG_HINTS = {
    "Python": "Use NumPy/SciPy. Include imports at top.",
    "C++": "Use <cmath>, <iostream>. Include main() function.",
    "Java": "Use java.lang.Math. Include public class Main with main().",
    "MATLAB": "Use vectorized operations.",
    "R": "Use base R or stats package.",
    "Julia": "Use Base and LinearAlgebra if needed.",
}


def _strip_fences(text: str) -> str:
    lines = text.strip().splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines)


def generate_code(formula: str, language: str, mode: str = "numerical") -> str:
    prompt = f"""Convert this formula to {language}:

Formula (LaTeX): {formula}
Mode: {mode}
Hints: {LANG_HINTS.get(language, '')}

Requirements:
1. Include all necessary imports
2. Add brief comments
3. Make it directly runnable
4. Return code only
"""
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=1500,
    )
    return _strip_fences(completion.choices[0].message.content)


def explain_formula(formula: str) -> str:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Explain math formulas concisely for students. Max 5 bullet points.",
            },
            {"role": "user", "content": f"Explain: {formula}"},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    return completion.choices[0].message.content