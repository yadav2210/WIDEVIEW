import logging

from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMessage, get_connection
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .forms import InquiryForm

logger = logging.getLogger(__name__)
SUCCESS_MESSAGE = "Thank you! Your inquiry has been submitted successfully. We will get back to you shortly."
ERROR_MESSAGE = "We couldn't submit your inquiry. Please check the information and try again."


def home(request):
    return render(request, "index.html")


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "unknown")


@require_POST
def submit_inquiry(request):
    rate_key = f"inquiry-rate:{_client_ip(request)}"
    attempts = cache.get(rate_key, 0)
    if attempts >= 5:
        return JsonResponse({"ok": False, "message": "Too many attempts. Please wait a few minutes and try again."}, status=429)
    cache.set(rate_key, attempts + 1, timeout=600)

    form = InquiryForm(request.POST)
    if not form.is_valid():
        print("POST DATA:", request.POST)
        print("FORM ERRORS:", form.errors)
        errors = {field: messages[0] for field, messages in form.errors.items()}
        return JsonResponse({"ok": False, "message": ERROR_MESSAGE, "errors": errors}, status=400)

    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD or not settings.CONTACT_RECEIVER_EMAIL:
        logger.error("Email is not configured; check the required SMTP environment variables.")
        return JsonResponse({"ok": False, "message": "We couldn't send your inquiry right now. Please try again shortly."}, status=503)

    data = form.cleaned_data
    owner_body = (
        "New inquiry received from the website.\n\n"
        f"Name: {data['name']}\nEmail: {data['email']}\nContact Number: {data['contact']}\n\n"
        f"Message:\n{data['message']}\n\nSubmitted From: Website Contact Form"
    )
    visitor_body = (
        f"Hi {data['name']},\n\nThank you for reaching out to Wide View Production.\n\n"
        "We have successfully received your inquiry and appreciate your interest in working with us.\n\n"
        "Our team will review your requirements and get back to you as soon as possible.\n\n"
        "Regards,\nWide View Production"
    )

    try:
        connection = get_connection(fail_silently=False)
        owner_email = EmailMessage(
            subject=f"New Website Inquiry - {data['name']}",
            body=owner_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.CONTACT_RECEIVER_EMAIL],
            reply_to=[data["email"]],
            connection=connection,
        )
        thank_you_email = EmailMessage(
            subject="Thank You for Contacting Wide View Production",
            body=visitor_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[data["email"]],
            connection=connection,
        )
        if connection.send_messages([owner_email, thank_you_email]) != 2:
            raise RuntimeError("The SMTP server did not accept both messages.")
    except Exception:
        logger.exception("Failed to send inquiry emails")
        return JsonResponse({"ok": False, "message": "We couldn't send your inquiry right now. Please try again shortly."}, status=502)

    return JsonResponse({"ok": True, "message": SUCCESS_MESSAGE})
