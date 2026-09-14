from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import logging
from app.config import settings

logger = logging.getLogger("pizzahub.database")

db_url = settings.DATABASE_URL

# Check if MySQL can be reached, otherwise fallback safely to SQLite for local development
engine = None
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected successfully to primary database at {db_url.split('@')[-1] if '@' in db_url else db_url}")
    except Exception as e:
        logger.warning(f"Could not connect to MySQL database ({e}). Falling back to SQLite for seamless local execution.")
        fallback_url = "sqlite:///./pizzahub.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(fallback_url, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()