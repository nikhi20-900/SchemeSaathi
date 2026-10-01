"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assistant import router as assistant_router
from app.api.demo import router as demo_router
from app.api.documents import router as documents_router
from app.api.eligibility import router as eligibility_router
from app.api.profile import router as profile_router
from app.api.schemes import router as schemes_router
from app.core.config import settings
from app.database.seed import init_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SchemeSaathi: AI Government Scheme Navigator",
)


@app.on_event("startup")
def on_startup() -> None:
    init_database()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(schemes_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(eligibility_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "phase": "Phase 2 - PostgreSQL Integration",
        "architecture_rule": "🔒 The LLM does NOT determine eligibility. Deterministic Rules Engine enforces official government criteria.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
