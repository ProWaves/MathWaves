from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import translate, plot, voice

app = FastAPI(
    title="MathWaves API",
    version="0.1.0",
    description="AI-powered math formula → code + graph translator.",
)

# Allow the Next.js frontend (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate.router)
app.include_router(plot.router)
app.include_router(voice.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to MathWaves API 🌊🚀",
        "status": "ok",
        "docs": "/docs",
        "endpoints": [
    "POST /api/translate",
    "POST /api/plot",
    "POST /api/explain",
    "POST /api/transcribe",
],
    }


@app.get("/health")
def health():
    return {"status": "healthy"}