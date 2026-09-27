from fastapi import APIRouter, HTTPException
from models import PlotRequest, PlotResponse
from services.parser import parse_formula, detect_type
from services.plotter import (
    make_2d_plot, make_3d_plot, make_polar_plot, fig_to_json,
)
import sympy as sp

router = APIRouter(prefix="/api", tags=["plot"])


@router.post("/plot", response_model=PlotResponse)
def plot(req: PlotRequest):
    expr, err = parse_formula(req.formula)
    if err:
        raise HTTPException(400, err)

    kind = req.kind
    if kind == "auto":
        kind = detect_type(expr)

    try:
        if kind == "2d":
            fig = make_2d_plot(expr, (req.x_min, req.x_max))
        elif kind == "3d":
            fig = make_3d_plot(expr)
        elif kind == "polar":
            fig = make_polar_plot(expr)
        else:
            raise HTTPException(400, f"Unsupported plot kind: {kind}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Plot failed: {e}")

    if fig is None:
        raise HTTPException(400, "Could not build plot for this formula.")

    return PlotResponse(
        figure_json=fig_to_json(fig),
        latex=sp.latex(expr),
        kind=kind,
    )