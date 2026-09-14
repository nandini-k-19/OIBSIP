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
        
        # Auto-seed initial catalog and admin if empty
        from app.database import SessionLocal
        from app.models.pizza import Pizza
        from app.models.user import User
        db = SessionLocal()
        try:
            if db.query(Pizza).count() == 0 or db.query(User).count() == 0:
                logger.info("Database empty on startup. Running initial seed...")
                try:
                    from seed import seed_database
                    seed_database()
                    logger.info("Database auto-seeded successfully on startup.")
                except Exception as seed_err:
                    logger.warning(f"Could not run seed_database: {seed_err}")
        except Exception as query_err:
            logger.warning(f"Auto-seed check note: {query_err}")
        finally:
            db.close()
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
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.render\.com|https://.*\.vercel\.app|https://.*\.netlify\.app|http://localhost:\d+",
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