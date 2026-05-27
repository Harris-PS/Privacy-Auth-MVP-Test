from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.redis import close_redis
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers import auth, session, consent

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=60, window_seconds=60)

app.include_router(auth.router)
app.include_router(session.router)
app.include_router(consent.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
