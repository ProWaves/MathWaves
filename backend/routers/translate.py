from fastapi import APIRouter, HTTPException
from models import (
    TranslateRequest, TranslateResponse,
    ExplainRequest, ExplainResponse,
)
from services.parser import parse_formula, detect_variables
from services.codegen import generate_code, explain_formula
from services.plotter import compute_derivative, compute_integral
import sympy as sp

router = APIRouter(prefix="/api", tags=["translate"])


@router.post("/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest):
    expr, err = parse_formula(req.formula)
    if err:
        raise HTTPException(400, err)

    try:
        code = generate_code(req.formula, req.language, req.mode)
    except Exception as e:
        raise HTTPException(500, f"LLM error: {e}")

    derivative = None
    integral = None
    vars_ = detect_variables(expr)
    if len(vars_) == 1:
        var_name = vars_[0].name
        try:
            derivative = sp.latex(compute_derivative(expr, var_name))
        except Exception:
            pass
        try:
            integral = sp.latex(compute_integral(expr, var_name))
        except Exception:
            pass

    return TranslateResponse(
        latex=sp.latex(expr),
        code=code,
        language=req.language,
        derivative=derivative,
        integral=integral,
    )


@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    try:
        return ExplainResponse(explanation=explain_formula(req.formula))
    except Exception as e:
        raise HTTPException(500, f"LLM error: {e}")