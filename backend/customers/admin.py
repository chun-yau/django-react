"""
customers/admin.py

Registering the Customer model with Django's admin site so you can manage
records via the built-in /admin/ interface — useful for seeding test data.
"""

from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'phone', 'created_at']
    search_fields = ['name', 'email', 'company']
    list_filter = ['company']
    ordering = ['name']

