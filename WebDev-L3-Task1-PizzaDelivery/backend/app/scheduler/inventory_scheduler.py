import logging
from datetime import datetime, timedelta
from typing import Set, Dict
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.config import settings
from app.services.inventory_service import get_all_inventory_items
from app.services.email_service import send_low_stock_alert_email

logger = logging.getLogger("pizzahub.scheduler")

scheduler: BackgroundScheduler = None
# Cache of item_key -> last_alerted_datetime to prevent spamming admin
alert_history: Dict[str, datetime] = {}

def check_low_inventory():
    logger.info("Executing scheduled inventory check...")
    db = SessionLocal()
    try:
        items = get_all_inventory_items(db)
        now = datetime.utcnow()
        for item in items:
            item_key = f"{item.category}:{item.id}"
            if item.stock < item.threshold:
                last_sent = alert_history.get(item_key)
                # Only alert once every 4 hours per low-stock item
                if not last_sent or (now - last_sent) > timedelta(hours=4):
                    logger.warning(f"Low stock detected for {item.name} ({item.stock} < {item.threshold})")
                    send_low_stock_alert_email(
                        admin_email=settings.ADMIN_EMAIL,
                        item_name=item.name,
                        category=item.category,
                        current_stock=item.stock,
                        threshold=item.threshold
                    )
                    alert_history[item_key] = now
    except Exception as e:
        logger.error(f"Error during scheduled inventory check: {e}")
    finally:
        db.close()

def start_scheduler():
    global scheduler
    if scheduler is None or not scheduler.running:
        scheduler = BackgroundScheduler()
        # Run check every 30 minutes
        scheduler.add_job(check_low_inventory, 'interval', minutes=30, id="low_stock_checker", replace_existing=True)
        scheduler.start()
        logger.info("APScheduler started successfully for inventory monitoring.")

def stop_scheduler():
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")
