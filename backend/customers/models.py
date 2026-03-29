"""
customers/models.py

--- Learning notes ---
This is a normal Django model — exactly like the ones you already write for
HTML-template–based projects.  Nothing changes here when you add DRF; the
model is the single source of truth for both the traditional views AND the
REST API.

The Customer model stores basic CRM-style information so you can practice
Create / Read / Update / Delete (CRUD) operations.
"""

from django.db import models


class Customer(models.Model):
    """A customer record.

    Fields
    ------
    name    : Full name (required).
    email   : Contact email address (required, unique).
    phone   : Optional phone number.
    company : Optional company / organisation name.
    notes   : Free-text notes (optional).
    created_at / updated_at : Timestamps managed automatically by Django.
    """

    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    company = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']   # Default queryset ordering

    def __str__(self):
        return f"{self.name} ({self.email})"
