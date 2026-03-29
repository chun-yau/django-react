"""
customers/urls.py

--- Learning notes ---
Traditional Django URL patterns — exactly what you're used to.
These serve the HTML-template views under /customers/.

The DRF router (which generates the /api/customers/ URLs) lives in
config/urls.py so you can see the contrast in one place.
"""

from django.urls import path
from . import views

app_name = 'customers'

urlpatterns = [
    path('',                 views.customer_list,   name='customer_list'),
    path('<int:pk>/',        views.customer_detail, name='customer_detail'),
    path('new/',             views.customer_create, name='customer_create'),
    path('<int:pk>/edit/',   views.customer_update, name='customer_update'),
    path('<int:pk>/delete/', views.customer_delete, name='customer_delete'),
]
