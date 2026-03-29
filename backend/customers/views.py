"""
customers/views.py

--- Learning notes ---
This file contains TWO sets of views so you can compare them side by side.

PART 1 — Traditional Django function-based views (HTML templates)
─────────────────────────────────────────────────────────────────
These are the views you already know: fetch data, render a template, return
an HttpResponse.  URLs live under /customers/.

PART 2 — Django REST Framework (DRF) ViewSet (JSON API)
────────────────────────────────────────────────────────
A ViewSet is a class that bundles all CRUD actions into one place.
ModelViewSet gives you list/create/retrieve/update/destroy for free — you
just wire it up to a Router in urls.py.  URLs live under /api/customers/.

The React frontend calls Part 2; Part 1 is there to remind you that the
underlying model and DB interactions are identical.
"""

# ──────────────────────────────────────────────────────────────────────────────
# Standard library / Django imports
# ──────────────────────────────────────────────────────────────────────────────

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages

# ──────────────────────────────────────────────────────────────────────────────
# DRF imports
# ──────────────────────────────────────────────────────────────────────────────

from rest_framework import viewsets, filters

# ──────────────────────────────────────────────────────────────────────────────
# Local imports
# ──────────────────────────────────────────────────────────────────────────────

from .models import Customer
from .serializers import CustomerSerializer
from .forms import CustomerForm


# ==============================================================================
# PART 1 — Traditional function-based views (HTML templates)
# ==============================================================================
# These feel identical to what you already write.  They exist here purely as
# a familiar reference point; the React app does NOT use them.

def customer_list(request):
    """List all customers.

    Traditional: fetch queryset → pass to template → return HTML.
    DRF equivalent: CustomerViewSet.list() does the same but returns JSON.
    """
    customers = Customer.objects.all()
    return render(request, 'customers/customer_list.html', {'customers': customers})


def customer_detail(request, pk):
    """Show a single customer.

    get_object_or_404 works the same way in both traditional and DRF views.
    DRF equivalent: CustomerViewSet.retrieve()
    """
    customer = get_object_or_404(Customer, pk=pk)
    return render(request, 'customers/customer_detail.html', {'customer': customer})


def customer_create(request):
    """Create a new customer using a ModelForm.

    Notice the POST/Redirect/GET pattern — this is the standard way to
    prevent duplicate form submissions when the browser is refreshed.

    DRF equivalent: CustomerViewSet.create() — but instead of a form, the
    client sends JSON in the request body, and the serializer validates it.
    """
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer.name}" created successfully.')
            return redirect('customers:customer_detail', pk=customer.pk)
    else:
        form = CustomerForm()
    return render(request, 'customers/customer_form.html', {'form': form, 'action': 'Create'})


def customer_update(request, pk):
    """Update an existing customer.

    Passing instance=customer to the form pre-populates the fields — the
    DRF equivalent is passing instance= to the serializer.

    DRF equivalent: CustomerViewSet.update() / partial_update()
    """
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            form.save()
            messages.success(request, f'Customer "{customer.name}" updated successfully.')
            return redirect('customers:customer_detail', pk=customer.pk)
    else:
        form = CustomerForm(instance=customer)
    return render(request, 'customers/customer_form.html', {'form': form, 'action': 'Update', 'customer': customer})


def customer_delete(request, pk):
    """Delete a customer after a confirmation step.

    DRF equivalent: CustomerViewSet.destroy() — React shows a confirm dialog
    instead of a separate confirmation page.
    """
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == 'POST':
        name = customer.name
        customer.delete()
        messages.success(request, f'Customer "{name}" deleted.')
        return redirect('customers:customer_list')
    return render(request, 'customers/customer_confirm_delete.html', {'customer': customer})


# ==============================================================================
# PART 2 — DRF ViewSet (JSON API consumed by React)
# ==============================================================================
# ModelViewSet automatically provides:
#   GET    /api/customers/       → list()
#   POST   /api/customers/       → create()
#   GET    /api/customers/{id}/  → retrieve()
#   PUT    /api/customers/{id}/  → update()
#   PATCH  /api/customers/{id}/  → partial_update()
#   DELETE /api/customers/{id}/  → destroy()
#
# Compare that to writing six separate function-based views above — this is
# the productivity win DRF gives you for standard CRUD endpoints.

class CustomerViewSet(viewsets.ModelViewSet):
    """API endpoint for Customer CRUD operations.

    The React frontend calls these endpoints via the Axios API layer
    (frontend/src/api/customers.js).
    """

    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    # DRF's built-in search and ordering — no extra code needed!
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company']   # ?search=acme
    ordering_fields = ['name', 'created_at']        # ?ordering=-created_at

