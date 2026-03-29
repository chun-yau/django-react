/**
 * frontend/src/api/customers.js
 *
 * Learning notes
 * ──────────────
 * This module is the React equivalent of Django's ORM calls.
 *
 *   Traditional Django (view)          This file (React)
 *   ──────────────────────────         ──────────────────────────────────
 *   Customer.objects.all()             getCustomers()
 *   Customer.objects.get(pk=id)        getCustomer(id)
 *   form.save() (new instance)         createCustomer(data)
 *   form.save() (existing instance)    updateCustomer(id, data)
 *   customer.delete()                  deleteCustomer(id)
 *
 * We use Axios (https://axios-http.com/) instead of the built-in fetch()
 * because it automatically converts JSON and has cleaner error handling.
 *
 * The BASE_URL points to the DRF API running on Django's dev server.
 * The Vite proxy (vite.config.js) forwards /api/* to :8000 so CORS is
 * handled transparently during development.
 */

import axios from 'axios';

const BASE_URL = '/api/customers/';

/**
 * GET /api/customers/
 * Returns a paginated list of customers.
 * Optional params: { search: 'query', ordering: 'name' }
 */
export function getCustomers(params = {}) {
  return axios.get(BASE_URL, { params });
}

/**
 * GET /api/customers/:id/
 * Returns a single customer object.
 */
export function getCustomer(id) {
  return axios.get(`${BASE_URL}${id}/`);
}

/**
 * POST /api/customers/
 * Creates a new customer from a plain JS object.
 * The serializer validates the data — just like ModelForm.is_valid().
 */
export function createCustomer(data) {
  return axios.post(BASE_URL, data);
}

/**
 * PUT /api/customers/:id/
 * Replaces all fields of an existing customer (full update).
 * Use patchCustomer() if you only want to update specific fields.
 */
export function updateCustomer(id, data) {
  return axios.put(`${BASE_URL}${id}/`, data);
}

/**
 * PATCH /api/customers/:id/
 * Partial update — only the fields you include are changed.
 * Equivalent to passing partial=True to the serializer.
 */
export function patchCustomer(id, data) {
  return axios.patch(`${BASE_URL}${id}/`, data);
}

/**
 * DELETE /api/customers/:id/
 * Returns 204 No Content on success.
 */
export function deleteCustomer(id) {
  return axios.delete(`${BASE_URL}${id}/`);
}
