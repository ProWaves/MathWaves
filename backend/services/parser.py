"""Parse LaTeX / plain math into SymPy expressions with LLM fallback."""
import os
import re
import sympy as sp
from sympy.parsing.latex import parse_latex
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
_GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _llm_normalize_to_plain(latex: str) -> str:
    """Ask Groq to convert LaTeX into plain Pythonic math SymPy can parse."""
    prompt = f"""Convert this LaTeX math expression into a plain, single-line math expression that Python's SymPy can parse.

Rules:
- Use ** for powers (x^2 is also fine)
- Use * for multiplication
- Use standard function names: sin(x), cos(x), tan(x), sqrt(x), log(x), exp(x)
- Replace \\pm with `+` (drop the minus alternative)
- Return ONLY the expression, no explanation, no code fences
- If it's an equation like `x = ...`, return just the right side after the `=`
- Keep symbols as letters: x, y, z, t, theta, a, b, c, etc.

LaTeX input: {latex}

Plain output:"""

    try:
        response = _groq_client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=200,
        )
        result = response.choices[0].message.content.strip()

        # Strip code fences if the LLM added them
        if result.startswith("```"):
            result = "\n".join(result.splitlines()[1:])
        if result.endswith("```"):
            result = "\n".join(result.splitlines()[:-1])

        return result.strip()
    except Exception:
        return ""


def parse_formula(raw: str):
    """
    Return (sympy_expr, error_message).
    Robust chain: LaTeX → plain → LLM normalize → retry.
    """
    if not raw or not raw.strip():
        return None, "Empty input."

    cleaned = raw.strip()

    # Strip "y =", "z =", "f(x) =" prefixes
    for prefix in ["y =", "z =", "f(x) =", "f(x)=", "y=", "z="]:
        if cleaned.lower().startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
            break

    # If it's an equation "x = ..." (e.g. quadratic formula),
    # pick the richer side to plot/derive
    if "=" in cleaned and not cleaned.startswith("\\"):
        left, right = cleaned.split("=", 1)
        if left.strip() in {"x", "y", "z", "t", "theta"}:
            cleaned = right.strip()
        elif right.strip() in {"x", "y", "z", "t", "theta"}:
            cleaned = left.strip()

    cleaned = cleaned.rstrip(".")

    # Auto-insert parentheses for "sin x" → "sin(x)"
    cleaned = re.sub(
        r"\b(sin|cos|tan|log|exp|sqrt)\s+([a-zA-Z0-9_]+)",
        r"\1(\2)",
        cleaned,
    )

    # ---- Attempt 1: SymPy's LaTeX parser ----
    try:
        expr = parse_latex(cleaned)
        if expr is not None:
            return expr, None
    except Exception:
        pass

    # ---- Attempt 2: sympify plain math ----
    x, y, z, t, theta = sp.symbols("x y z t theta")
    local_math = {
        "x": x, "y": y, "z": z, "t": t, "theta": theta,
        "sin": sp.sin, "cos": sp.cos, "tan": sp.tan,
        "exp": sp.exp, "log": sp.log, "sqrt": sp.sqrt,
        "pi": sp.pi, "e": sp.E,
    }

    try:
        expr = sp.sympify(cleaned.replace("^", "**"), locals=local_math)
        return expr, None
    except Exception:
        pass

    # ---- Attempt 3: LLM normalization, then retry ----
    try:
        plain = _llm_normalize_to_plain(cleaned)
        if plain:
            # If LLM returned "x = ...", keep only RHS
            if "=" in plain:
                plain = plain.split("=", 1)[1].strip()
            plain = plain.replace("^", "**")
            expr = sp.sympify(plain, locals=local_math)
            return expr, None
    except Exception:
        pass

    # ---- Attempt 4: sanitize hard and retry ----
    try:
        sanitized = re.sub(r"[^a-zA-Z0-9+\-*/^().,\s]", "", cleaned)
        sanitized = re.sub(r"\s+", "", sanitized)
        expr = sp.sympify(sanitized.replace("^", "**"), locals=local_math)
        return expr, None
    except Exception:
        return None, "Could not parse formula. Try a simpler form like 'x^2 + 3x'."


def detect_variables(expr):
    if expr is None:
        return []
    return sorted(expr.free_symbols, key=lambda s: s.name)


def detect_type(expr) -> str:
    if expr is None:
        return "unknown"
    vars_ = detect_variables(expr)
    names = {v.name for v in vars_}

    if len(vars_) == 0:
        return "constant"
    if len(vars_) == 1 and "theta" in names:
        return "polar"
    if len(vars_) == 1:
        return "2d"
    if len(vars_) == 2:
        return "3d"
    return "multi"