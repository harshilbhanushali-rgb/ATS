from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Sequence

from app.core.config import settings


def send_email(subject: str, recipients: Sequence[str], text_body: str, html_body: str | None = None) -> None:
    if settings.SMTP_HOST is None or settings.SMTP_FROM_EMAIL is None:
        raise ValueError('SMTP_HOST and SMTP_FROM_EMAIL must be configured to send email')

    if isinstance(recipients, str):
        recipients = [recipients]

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = f"{settings.SMTP_FROM_NAME or settings.PROJECT_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message['To'] = ', '.join(recipients)
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype='html')

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
        if settings.SMTP_USE_TLS:
            smtp.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.send_message(message)


def send_password_reset_email(recipient_email: str, token: str) -> None:
    subject = f"{settings.PROJECT_NAME}: Password Reset Request"
    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
    text_body = (
        f"Hello,\n\n"
        f"A password reset was requested for your account.\n\n"
        f"Use the token below to reset your password:\n\n"
        f"{token}\n\n"
        f"Then visit: {reset_url}\n\n"
        f"If you did not request this, please ignore this email.\n"
    )
    html_body = (
        f"<html><body><p>Hello,</p>"
        f"<p>A password reset was requested for your account.</p>"
        f"<p><strong>Reset token:</strong><br><code>{token}</code></p>"
        f"<p>Visit <a href=\"{reset_url}\">reset password</a> and enter the token.</p>"
        f"<p>If you did not request this, please ignore this email.</p>"
        f"</body></html>"
    )
    send_email(subject, [recipient_email], text_body, html_body)
