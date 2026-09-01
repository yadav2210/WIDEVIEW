from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse

from .forms import InquiryForm


class InquiryFormTests(TestCase):
    def test_rejects_text_phone_and_short_message(self):
        form = InquiryForm({"name": "R", "email": "bad", "contact": "telephone", "message": "xx"})
        self.assertFalse(form.is_valid())
        self.assertIn("name", form.errors)
        self.assertIn("email", form.errors)
        self.assertIn("contact", form.errors)
        self.assertIn("message", form.errors)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_HOST_USER="info@example.com",
    EMAIL_HOST_PASSWORD="test-only-password",
    DEFAULT_FROM_EMAIL="info@example.com",
    CONTACT_RECEIVER_EMAIL="owner@example.com",
)
class InquiryViewTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_valid_submission_sends_owner_and_visitor_emails(self):
        response = self.client.post(
            reverse("website:submit_inquiry"),
            {
                "name": "Rahul Shah",
                "email": "rahul@example.com",
                "contact": "9876543210",
                "message": "We need a production house for an upcoming TV commercial.",
                "website": "",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].subject, "New Website Inquiry - Rahul Shah")
        self.assertEqual(mail.outbox[0].reply_to, ["rahul@example.com"])
        self.assertEqual(mail.outbox[1].to, ["rahul@example.com"])

    def test_invalid_submission_sends_nothing(self):
        response = self.client.post(
            reverse("website:submit_inquiry"),
            {"name": "R", "email": "invalid", "contact": "abc", "message": "x"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)
