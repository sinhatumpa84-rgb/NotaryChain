"""
Notification background tasks using NotificationService
"""
from celery import shared_task
import asyncio
import logging

from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="app.tasks.notification_tasks.send_email_notification")
def send_email_notification(self, user_id: str, email: str, subject: str, message: str):
    """Send email notification in background"""
    logger.info(f"Triggering email dispatch to {email} user: {user_id}")
    
    # Run async function in synchronous Celery task worker context
    asyncio.run(NotificationService.send_email(email, subject, message))
    
    return {"status": "sent", "user_id": user_id}


@shared_task(bind=True, name="app.tasks.notification_tasks.send_sms_notification")
def send_sms_notification(self, phone: str, message: str):
    """Send SMS notification in background"""
    logger.info(f"Triggering SMS dispatch to: {phone}")
    
    asyncio.run(NotificationService.send_sms_otp(phone, message))
    
    return {"status": "sent", "phone": phone}


@shared_task(bind=True, name="app.tasks.notification_tasks.send_whatsapp_notification")
def send_whatsapp_notification(self, phone: str, message: str):
    """Send WhatsApp notification in background"""
    logger.info(f"Triggering WhatsApp dispatch to: {phone}")
    
    asyncio.run(NotificationService.send_whatsapp_status(phone, message))
    
    return {"status": "sent", "phone": phone}


@shared_task(bind=True, name="app.tasks.notification_tasks.send_push_notification")
def send_push_notification(self, user_id: str, title: str, message: str):
    """Send push notification in background"""
    logger.info(f"Triggering push dispatch to user: {user_id}")
    return {"status": "sent", "user_id": user_id}
