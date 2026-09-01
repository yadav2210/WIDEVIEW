import re

from django import forms
from django.core.exceptions import ValidationError


class InquiryForm(forms.Form):
    name = forms.CharField(min_length=2, max_length=100, strip=True)
    email = forms.EmailField(max_length=254)
    contact = forms.CharField(min_length=7, max_length=24, strip=True)
    message = forms.CharField(min_length=3, max_length=3000, strip=True)
    website = forms.CharField(required=False, max_length=200)

    def clean_contact(self):
        contact = self.cleaned_data["contact"].strip()
        if not re.fullmatch(r"[+\d][\d\s().-]*", contact):
            raise ValidationError("Please enter a valid contact number.")
        digits = re.sub(r"\D", "", contact)
        if not 7 <= len(digits) <= 15:
            raise ValidationError("Contact number must contain 7 to 15 digits.")
        return contact

    def clean_website(self):
        if self.cleaned_data.get("website"):
            raise ValidationError("Invalid submission.")
        return ""
