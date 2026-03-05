from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .database.db import engine, Base
from .routes import detect
from .utils.logger import get_logger

logger = get_logger("main")


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized")
    yield


app = FastAPI(
    title="AI Phishing Email Detector",
    description="Production-ready API for detecting phishing emails using Machine Learning.",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detect.router)


@app.get("/")
def root():
    return {
        "message": "Phishing Detector API is running",
        "version": "1.1.0",
        "status": "healthy",
    }


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
