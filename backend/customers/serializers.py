"""
customers/serializers.py

--- Learning notes ---
A serializer is the DRF equivalent of a Django Form (or ModelForm).
It handles two directions:

  1. Serialization   → Python object → JSON (for API responses)
  2. Deserialization → JSON → validated Python data → saved to DB

Compare the table below to what you already know:

  Traditional Django         DRF equivalent
  ─────────────────────      ────────────────────────────────
  forms.ModelForm            serializers.ModelSerializer
  form.is_valid()            serializer.is_valid()
  form.save()                serializer.save()
  form.errors                serializer.errors

ModelSerializer is the quickest way to get started: just point it at a model
and list the fields you want to expose.
"""

from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for the Customer model.

    All listed fields are included in both requests (input) and responses
    (output).  Read-only fields like 'id', 'created_at', and 'updated_at'
    are automatically excluded from write operations.
    """

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'company',
            'notes',
            'created_at',
            'updated_at',
        ]
        # These fields are set by Django automatically; the API user should
        # not be allowed to change them directly.
        read_only_fields = ['id', 'created_at', 'updated_at']
