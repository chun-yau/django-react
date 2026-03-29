"""
config/urls.py

--- Learning notes ---
This is the project-level URL configuration — the "switchboard" that routes
an incoming request to the correct app.

Two URL namespaces are defined:

  /customers/   → Traditional Django views (HTML templates, function-based)
  /api/         → DRF REST API (JSON responses consumed by React)

The DRF DefaultRouter automatically creates the following URL patterns for
every ViewSet registered with it:

  GET    /api/customers/       list all customers
  POST   /api/customers/       create a new customer
  GET    /api/customers/{id}/  retrieve one customer
  PUT    /api/customers/{id}/  replace a customer
  PATCH  /api/customers/{id}/  partially update a customer
  DELETE /api/customers/{id}/  delete a customer

  GET    /api/                 the browsable API root (try it in a browser!)
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from customers.views import CustomerViewSet

# DRF router — replaces the manual urlpatterns you would write for each
# CRUD action.  Compare it to the traditional patterns in customers/urls.py.
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Traditional HTML views
    path('customers/', include('customers.urls')),

    # DRF JSON API  (also includes the browsable API at /api/)
    path('api/', include(router.urls)),
]

