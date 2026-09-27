"""Build 2D / 3D / polar plots from SymPy expressions."""
import json
import numpy as np
import plotly.graph_objects as go
import sympy as sp


def make_2d_plot(expr, x_range=(-10, 10), points=600):
    syms = sorted(expr.free_symbols, key=lambda s: s.name)
    x = syms[0] if syms else sp.Symbol("x")

    f = sp.lambdify(x, expr, "numpy")
    xs = np.linspace(x_range[0], x_range[1], points)
    with np.errstate(all="ignore"):
        ys = f(xs)
    ys = np.asarray(ys, dtype=float)

    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=xs, y=ys, mode="lines",
            line=dict(color="#6366f1", width=3),
            name=f"f({x}) = {sp.latex(expr)}",
        )
    )
    fig.add_hline(y=0, line_dash="dot", line_color="gray")
    fig.add_vline(x=0, line_dash="dot", line_color="gray")
    fig.update_layout(
        title=f"y = {sp.latex(expr)}",
        xaxis_title=str(x), yaxis_title="y",
        template="plotly_white", height=500,
    )
    return fig


def make_3d_plot(expr, xy_range=(-5, 5), points=60):
    syms = sorted(expr.free_symbols, key=lambda s: s.name)
    if len(syms) < 2:
        return None
    x, y = syms[0], syms[1]

    f = sp.lambdify((x, y), expr, "numpy")
    xs = np.linspace(xy_range[0], xy_range[1], points)
    ys = np.linspace(xy_range[0], xy_range[1], points)
    X, Y = np.meshgrid(xs, ys)
    with np.errstate(all="ignore"):
        Z = f(X, Y)
    Z = np.asarray(Z, dtype=float)

    fig = go.Figure(data=[go.Surface(x=X, y=Y, z=Z, colorscale="Viridis")])
    fig.update_layout(
        title=f"z = {sp.latex(expr)}",
        scene=dict(xaxis_title=str(x), yaxis_title=str(y), zaxis_title="z"),
        height=600, template="plotly_white",
    )
    return fig


def make_polar_plot(expr, theta_range=(0, 2 * np.pi), points=800):
    theta = sp.Symbol("theta")
    if theta not in expr.free_symbols:
        free = sorted(expr.free_symbols, key=lambda s: s.name)
        if not free:
            return None
        theta = free[0]

    f = sp.lambdify(theta, expr, "numpy")
    ts = np.linspace(theta_range[0], theta_range[1], points)
    with np.errstate(all="ignore"):
        rs = np.asarray(f(ts), dtype=float)

    fig = go.Figure()
    fig.add_trace(
        go.Scatterpolar(
            r=rs, theta=np.degrees(ts), mode="lines",
            line=dict(color="#ec4899", width=3),
        )
    )
    fig.update_layout(
        title=f"r = {sp.latex(expr)}",
        template="plotly_white", height=600,
    )
    return fig


def compute_derivative(expr, var_name="x"):
    x = sp.Symbol(var_name)
    return sp.diff(expr, x)


def compute_integral(expr, var_name="x"):
    x = sp.Symbol(var_name)
    return sp.integrate(expr, x)


def fig_to_json(fig: go.Figure) -> dict:
    return json.loads(fig.to_json())