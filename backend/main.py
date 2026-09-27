from fastapi import FastAPI

app = FastAPI(title="MathWaves API", version="0.1.0")


@app.get("/")
def root():
    return {
        "message": "Welcome to MathWaves API 🚀",
        "status": "ok",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}