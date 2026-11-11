"""
FastAPI application for Acadza AI - Question Quality Assurance System.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from backend.config import settings
from backend.database import init_db, seed_db_from_json
from backend.routes.dashboard import router as dashboard_router
from backend.routes.reports import router as reports_router
from backend.routes.questions import router as questions_router
from backend.routes.reviews import router as reviews_router
from backend.routes.audit import router as audit_router
from backend.routes.bonus import router as bonus_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and base data is seeded
    init_db()
    seed_db_from_json()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    from backend.services.ai_service import ai_service
    is_live = ai_service.is_live()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model": settings.GEMINI_MODEL,
        "llm_live": is_live,
        "mode": "Gemini 2.5 Flash (Live LLM)" if is_live else "Offline Deterministic Solver (Dev Mode)",
        "has_api_key": bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    }

# Register API routers under /api
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(questions_router, prefix=settings.API_V1_STR)
app.include_router(reviews_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(bonus_router, prefix=settings.API_V1_STR)

# Serve frontend production build if available
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
