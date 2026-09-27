from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class TranslateRequest(BaseModel):
    formula: str = Field(..., min_length=1)
    language: str = "Python"
    mode: str = "numerical"


class TranslateResponse(BaseModel):
    latex: str
    code: str
    language: str
    derivative: Optional[str] = None
    integral: Optional[str] = None


class PlotRequest(BaseModel):
    formula: str
    kind: str = "auto"  # auto | 2d | 3d | polar
    x_min: float = -10
    x_max: float = 10


class PlotResponse(BaseModel):
    figure_json: Dict[str, Any]
    latex: str
    kind: str


class ExplainRequest(BaseModel):
    formula: str


class ExplainResponse(BaseModel):
    explanation: str