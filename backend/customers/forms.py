"""
customers/forms.py

--- Learning notes ---
A ModelForm is still the right tool for the traditional (HTML) views.
In the DRF / React world you don't need forms at all — the serializer
handles validation instead.  But keeping this file lets you see the
direct correspondence:

  ModelForm field validation  ↔  Serializer field validation
  form.save()                 ↔  serializer.save()
  form.errors                 ↔  serializer.errors
"""

from django import forms
from .models import Customer


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'email', 'phone', 'company', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 4}),
        }
