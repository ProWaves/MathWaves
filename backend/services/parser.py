"""Parse LaTeX / plain math into SymPy expressions."""
import sympy as sp
from sympy.parsing.latex import parse_latex


def parse_formula(raw: str):
    """Return (sympy_expr, error_message)."""
    if not raw or not raw.strip():
        return None, "Empty input."

    cleaned = raw.strip()

    # Strip "y =", "z =", "f(x) =" prefixes
    for prefix in ["y =", "z =", "f(x) =", "f(x)=", "y=", "z="]:
        if cleaned.lower().startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
            break

    # Try LaTeX first
    try:
        expr = parse_latex(cleaned)
        if expr is not None:
            return expr, None
    except Exception:
        pass

    # Fallback: sympify
    try:
        x, y, z, t, theta = sp.symbols("x y z t theta")
        expr = sp.sympify(
            cleaned.replace("^", "**"),
            locals={
                "x": x, "y": y, "z": z, "t": t, "theta": theta,
                "sin": sp.sin, "cos": sp.cos, "tan": sp.tan,
                "exp": sp.exp, "log": sp.log, "sqrt": sp.sqrt,
                "pi": sp.pi, "e": sp.E,
            },
        )
        return expr, None
    except Exception as e:
        return None, f"Could not parse formula: {e}"


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