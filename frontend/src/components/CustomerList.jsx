/**
 * CustomerList.jsx
 *
 * Learning notes
 * ──────────────
 * Traditional Django: The list view fetches Customer.objects.all() and
 * passes it to the template via context.  The template renders a table.
 *
 * React: We use the useEffect hook to fetch data from the API when the
 * component first mounts (loads), and useState to store the result.
 *
 *   Django template variable  ↔  React state variable
 *   {{ customers }}           ↔  const [customers, setCustomers] = useState([])
 *   {% for c in customers %}  ↔  customers.map(c => ...)
 *
 * Hooks cheat-sheet
 * ─────────────────
 * useState(initial)   — Store a value; re-render when it changes.
 * useEffect(fn, deps) — Run side effects (like API calls) after rendering.
 *                       The deps array controls when it re-runs:
 *                         []         → run once on mount (like Django's page load)
 *                         [search]   → re-run whenever `search` changes
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../api/customers';

export default function CustomerList() {
  // State: the list of customers and a loading/error flag
  const [customers, setCustomers] = useState([]);
  const [count, setCount]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');

  const navigate = useNavigate();

  // Fetch customers whenever `search` changes — equivalent to
  // Django reloading the page with a GET parameter (?search=...)
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = search ? { search } : {};

    getCustomers(params)
      .then(res => {
        // DRF paginates the response: { count, next, previous, results }
        setCustomers(res.data.results);
        setCount(res.data.count);
      })
      .catch(() => setError('Failed to load customers. Is the Django server running?'))
      .finally(() => setLoading(false));
  }, [search]); // ← re-run when `search` changes

  function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;

    deleteCustomer(id)
      .then(() => {
        // Remove the deleted customer from local state without re-fetching
        setCustomers(prev => prev.filter(c => c.id !== id));
        setCount(prev => prev - 1);
      })
      .catch(() => alert('Delete failed. Please try again.'));
  }

  return (
    <div>
      <div className="list-header">
        <div>
          <h2>Customers {!loading && <span className="badge">{count}</span>}</h2>
        </div>
        <div className="list-actions">
          {/* Search input — controlled component: React owns the value */}
          <input
            type="search"
            placeholder="Search name, email, company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <Link to="/customers/new" className="btn btn-primary">+ New Customer</Link>
        </div>
      </div>

      {/* Learning tip box */}
      <div className="learn-box">
        <strong>📖 Learning tip:</strong> Open{' '}
        <a href="http://localhost:8000/api/customers/" target="_blank" rel="noreferrer">
          /api/customers/
        </a>{' '}
        in a new tab to see the raw JSON this component receives.
        Compare it with the HTML version at{' '}
        <a href="http://localhost:8000/customers/" target="_blank" rel="noreferrer">
          /customers/
        </a>.
      </div>

      {loading && <p className="status">Loading…</p>}
      {error   && <p className="status error">{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <p className="status">
          No customers found.{' '}
          <Link to="/customers/new">Add the first one!</Link>
        </p>
      )}

      {!loading && !error && customers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>
                  {/* Link component from React Router — like {% url %} in templates */}
                  <Link to={`/customers/${c.id}`}>{c.name}</Link>
                </td>
                <td>{c.email}</td>
                <td>{c.company || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td className="actions">
                  <button
                    onClick={() => navigate(`/customers/${c.id}/edit`)}
                    className="btn btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
