from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import Base, engine
from app import models
from app.routers import auth, user, pizzas, orders, payments, inventory, admin
from app.websocket import ordertracking
from app.scheduler.inventory_scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pizzahub.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure all database tables exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables on startup: {e}")

    # Startup: Start APScheduler for inventory monitoring
    try:
        start_scheduler()
    except Exception as e:
        logger.warning(f"Could not start background inventory scheduler: {e}")

    yield

    # Shutdown: Stop scheduler safely
    try:
        stop_scheduler()
    except Exception as e:
        logger.warning(f"Error stopping scheduler: {e}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PizzaHub - Production-Grade Pizza Delivery & Inventory Management System API",
    lifespan=lifespan
)

# CORS configuration to allow seamless communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(user.router, prefix=settings.API_V1_STR)
app.include_router(pizzas.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# Register WebSocket Router
app.include_router(ordertracking.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to PizzaHub API",
        "status": "running",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PizzaHub API",
        "environment": settings.ENVIRONMENT
    }