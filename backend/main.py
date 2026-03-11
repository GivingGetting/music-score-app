import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import transcribe, synthesize

app = FastAPI(title="Music Score API", version="1.0.0")

# Allow origins from env var (production) or fallback to localhost (development)
_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
if not _origins:
    _origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router)
app.include_router(synthesize.router)


@app.get("/health")
def health():
    return {"status": "ok"}
