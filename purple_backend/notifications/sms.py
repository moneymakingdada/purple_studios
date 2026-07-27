"""
Thin SMS-sending layer. Default provider is Arkesel (a Ghana-based SMS
gateway that handles local +233 numbers well and supports custom sender IDs).

Swapping providers later just means adding a new branch in send_sms() —
nothing calling send_sms() needs to change.
"""
import logging

import requests
from django.conf import settings

logger = logging.getLogger("notifications.sms")

ARKESEL_SEND_URL = "https://sms.arkesel.com/api/v2/sms/send"


def send_sms(to: str, message: str) -> bool:
    """
    Send an SMS. Returns True on success, False on any failure — never raises,
    so a notification problem can never break the booking flow that triggered it.
    """
    if not settings.SMS_ENABLED:
        logger.info("SMS disabled (SMS_ENABLED=False) — skipping send to %s", to)
        return False

    if not to:
        logger.warning("send_sms called with no phone number — skipping")
        return False

    if settings.SMS_PROVIDER == "arkesel":
        return _send_via_arkesel(to, message)

    logger.error("Unknown SMS_PROVIDER '%s' — message not sent", settings.SMS_PROVIDER)
    return False


def _send_via_arkesel(to: str, message: str) -> bool:
    if not settings.ARKESEL_API_KEY:
        logger.warning("ARKESEL_API_KEY not set — skipping SMS to %s. Message was: %s", to, message)
        return False

    payload = {
        "sender": settings.ARKESEL_SENDER_ID,
        "message": message,
        "recipients": [to],
    }
    headers = {
        "api-key": settings.ARKESEL_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(ARKESEL_SEND_URL, json=payload, headers=headers, timeout=8)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success" or data.get("code") == "ok":
            logger.info("SMS sent to %s", to)
            return True
        logger.error("Arkesel rejected SMS to %s: %s", to, data)
        return False
    except requests.RequestException as exc:
        logger.error("SMS send to %s failed: %s", to, exc)
        return False
