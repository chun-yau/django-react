/**
 * CustomerDetail.jsx
 *
 * Learning notes
 * ──────────────
 * Traditional Django (customer_detail view):
 *   customer = get_object_or_404(Customer, pk=pk)
 *   return render(request, 'customer_detail.html', {'customer': customer})
 *
 * React equivalent:
 *   1. Read the :id from the URL with useParams() — like Django's <int:pk>
 *   2. Fetch GET /api/customers/:id/ with Axios
 *   3. Store the result in state and render it
 *
 * useParams()  — equivalent of the `pk` URL capture group
 * useNavigate() — programmatic navigation; equivalent of redirect()
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomer, deleteCustomer } from '../api/customers';

export default function CustomerDetail() {
  // useParams() reads URL parameters — /customers/:id → { id: '3' }
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    getCustomer(id)
      .then(res => setCustomer(res.data))
      .catch(() => setError('Customer not found.'))
      .finally(() => setLoading(false));
  }, [id]); // re-fetch if the id in the URL changes

  function handleDelete() {
    if (!window.confirm(`Delete "${customer.name}"?`)) return;

    deleteCustomer(id)
      .then(() => navigate('/customers')) // redirect after delete — like redirect()
      .catch(() => alert('Delete failed.'));
  }

  if (loading) return <p className="status">Loading…</p>;
  if (error)   return <p className="status error">{error}</p>;

  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/customers">Customers</Link> › {customer.name}
      </nav>

      <div className="card">
        <div className="card-header">
          <h3>{customer.name}</h3>
          <div className="actions">
            <Link to={`/customers/${id}/edit`} className="btn btn-sm">Edit</Link>
            <button onClick={handleDelete} className="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>

        <dl className="detail-list">
          <dt>Email</dt>     <dd>{customer.email}</dd>
          <dt>Phone</dt>     <dd>{customer.phone    || '—'}</dd>
          <dt>Company</dt>   <dd>{customer.company  || '—'}</dd>
          <dt>Notes</dt>     <dd className="notes">{customer.notes || '—'}</dd>
          <dt>Created</dt>   <dd>{new Date(customer.created_at).toLocaleString()}</dd>
          <dt>Updated</dt>   <dd>{new Date(customer.updated_at).toLocaleString()}</dd>
        </dl>
      </div>

      {/* Learning tip */}
      <div className="learn-box" style={{ marginTop: '1rem' }}>
        <strong>📖 Learning tip:</strong> Open{' '}
        <a
          href={`http://localhost:8000/api/customers/${id}/`}
          target="_blank"
          rel="noreferrer"
        >
          /api/customers/{id}/
        </a>{' '}
        to see the raw JSON this component received.
      </div>

      <Link to="/customers" className="btn" style={{ marginTop: '1rem' }}>
        ← Back to list
      </Link>
    </div>
  );
}
