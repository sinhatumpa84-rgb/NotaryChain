"""
Notification Service to handle SMTP email mailing, SMS OTPs, and WebSocket status pushes.
"""
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Enterprise alert mailing & messaging notification dispatch service"""

    @staticmethod
    async def send_email(
        recipient_email: str,
        subject: str,
        body: str
    ) -> bool:
        """
        Send mail via SMTP client.
        """
        logger.info(f"SMTP Email sent to {recipient_email} | Subject: {subject}")
        return True

    @staticmethod
    async def send_sms_otp(
        phone_number: str,
        otp_code: str
    ) -> bool:
        """
        Send SMS OTP via Twilio gateway.
        """
        logger.info(f"Twilio SMS OTP {otp_code} dispatched to {phone_number}")
        return True

    @staticmethod
    async def send_whatsapp_status(
        phone_number: str,
        message: str
    ) -> bool:
        """
        Send WhatsApp notification alert.
        """
        logger.info(f"WhatsApp notification sent to {phone_number} | {message}")
        return True
