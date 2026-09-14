import smtplib
import logging
from email.message import EmailMessage
from app.config import settings

logger = logging.getLogger("pizzahub.email")


def _send_email(to_email: str, subject: str, content: str) -> bool:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message.set_content(content)

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(f"[EMAIL SIMULATION] To: {to_email} | Subject: {subject}\nContent:\n{content}")
        return True

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as error:
        logger.warning(f"SMTP sending failed ({error}). Logged content:\n{content}")
        return False


def send_verification_email(recipient_email: str, verification_token: str) -> bool:
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    content = f"""Hello,

Welcome to PizzaHub!

Please verify your email address by clicking the link below:
{verification_link}

This verification link will expire in 24 hours.

If you did not create this account, you can safely ignore this email.

Regards,
PizzaHub Team
"""
    return _send_email(recipient_email, "Verify your PizzaHub account", content)


def send_password_reset_email(recipient_email: str, reset_token: str) -> bool:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    content = f"""Hello,

You requested a password reset for your PizzaHub account.

Click the link below to set a new password:
{reset_link}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email.

Regards,
PizzaHub Team
"""
    return _send_email(recipient_email, "PizzaHub – Password Reset Request", content)


def send_low_stock_alert_email(admin_email: str, item_name: str, category: str, current_stock: int, threshold: int) -> bool:
    content = f"""PizzaHub – Low Inventory Alert

Attention Administrator,

The following ingredient has fallen below its safety threshold:

• Item Name: {item_name}
• Category: {category.upper()}
• Current Stock: {current_stock} units
• Configured Threshold: {threshold} units

Please login to the Admin Dashboard ({settings.FRONTEND_URL}/admin/inventory) to restock this item.

Regards,
PizzaHub Automated Inventory System
"""
    return _send_email(admin_email, f"PizzaHub – Low Inventory Alert: {item_name}", content)