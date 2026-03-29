"""
customers/tests.py

Tests cover both the traditional views and the DRF API endpoints so you can
see how testing works in both contexts.

Run with:
    python manage.py test customers
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Customer


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def make_customer(**kwargs):
    """Return a saved Customer with sensible defaults."""
    defaults = {
        'name': 'Alice Smith',
        'email': 'alice@example.com',
        'phone': '555-1234',
        'company': 'Acme Corp',
        'notes': 'VIP client',
    }
    defaults.update(kwargs)
    return Customer.objects.create(**defaults)


# ──────────────────────────────────────────────────────────────────────────────
# Model tests
# ──────────────────────────────────────────────────────────────────────────────

class CustomerModelTests(TestCase):

    def test_str(self):
        c = make_customer()
        self.assertEqual(str(c), 'Alice Smith (alice@example.com)')

    def test_default_ordering(self):
        make_customer(name='Zara', email='z@example.com')
        make_customer(name='Aaron', email='a@example.com')
        names = list(Customer.objects.values_list('name', flat=True))
        self.assertEqual(names, ['Aaron', 'Zara'])


# ──────────────────────────────────────────────────────────────────────────────
# Traditional view tests  (HTML responses)
# ──────────────────────────────────────────────────────────────────────────────

class CustomerHTMLViewTests(TestCase):

    def setUp(self):
        self.customer = make_customer()

    def test_list_view(self):
        url = reverse('customers:customer_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Alice Smith')

    def test_detail_view(self):
        url = reverse('customers:customer_detail', args=[self.customer.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'alice@example.com')

    def test_create_view_get(self):
        url = reverse('customers:customer_create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_create_view_post(self):
        url = reverse('customers:customer_create')
        data = {
            'name': 'Bob Jones',
            'email': 'bob@example.com',
            'phone': '',
            'company': '',
            'notes': '',
        }
        response = self.client.post(url, data)
        self.assertEqual(Customer.objects.count(), 2)
        self.assertRedirects(
            response,
            reverse('customers:customer_detail', args=[Customer.objects.get(name='Bob Jones').pk])
        )

    def test_update_view_post(self):
        url = reverse('customers:customer_update', args=[self.customer.pk])
        data = {
            'name': 'Alice Updated',
            'email': 'alice@example.com',
            'phone': '555-0000',
            'company': 'Acme Corp',
            'notes': '',
        }
        response = self.client.post(url, data)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.name, 'Alice Updated')

    def test_delete_view_post(self):
        url = reverse('customers:customer_delete', args=[self.customer.pk])
        response = self.client.post(url)
        self.assertEqual(Customer.objects.count(), 0)
        self.assertRedirects(response, reverse('customers:customer_list'))


# ──────────────────────────────────────────────────────────────────────────────
# DRF API tests  (JSON responses)
# ──────────────────────────────────────────────────────────────────────────────

class CustomerAPITests(APITestCase):
    """
    These tests exercise the same CRUD operations as the HTML view tests
    but via the JSON API that the React frontend calls.

    Notice that the test assertions are the same logic — only the transport
    (HTTP + JSON vs HTML form) differs.
    """

    def setUp(self):
        self.customer = make_customer()
        self.list_url = '/api/customers/'
        self.detail_url = f'/api/customers/{self.customer.pk}/'

    # LIST
    def test_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    # CREATE
    def test_create(self):
        data = {'name': 'Bob', 'email': 'bob@example.com', 'phone': '', 'company': '', 'notes': ''}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 2)

    def test_create_duplicate_email(self):
        data = {'name': 'Dup', 'email': 'alice@example.com', 'phone': '', 'company': '', 'notes': ''}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # RETRIEVE
    def test_retrieve(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'alice@example.com')

    # UPDATE (full)
    def test_update(self):
        data = {'name': 'Alice Updated', 'email': 'alice@example.com',
                'phone': '555-9999', 'company': 'Acme', 'notes': ''}
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.name, 'Alice Updated')

    # PARTIAL UPDATE
    def test_partial_update(self):
        response = self.client.patch(self.detail_url, {'company': 'New Co'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.company, 'New Co')

    # DELETE
    def test_delete(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Customer.objects.count(), 0)

    # SEARCH
    def test_search(self):
        make_customer(name='Bob', email='bob@example.com')
        response = self.client.get(self.list_url + '?search=bob')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Bob')

