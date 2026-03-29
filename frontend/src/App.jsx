/**
 * App.jsx  — Root component & client-side routing
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LEARNING NOTES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * NEW CONCEPT — Client-side routing with React Router
 * ─────────────────────────────────────────────────────
 * In traditional Django each URL maps to a view function in urls.py:
 *
 *   path('customers/',           views.customer_list,   name='customer_list')
 *   path('customers/<pk>/',      views.customer_detail, name='customer_detail')
 *   path('customers/new/',       views.customer_create, name='customer_create')
 *   path('customers/<pk>/edit/', views.customer_update, name='customer_update')
 *
 * When the user clicks a link, the browser makes a new HTTP request to the
 * server, which returns a brand new HTML page.
 *
 * React Router works differently:
 *   • The server always returns the SAME index.html (a Single Page Application).
 *   • React Router intercepts link clicks and swaps what's rendered on screen
 *     WITHOUT a full page reload — this feels instant to the user.
 *   • The <Routes> + <Route> elements below mirror Django's urlpatterns exactly.
 *
 *   Django urlpatterns                React Router <Route>
 *   ──────────────────────────────    ─────────────────────────────────────────
 *   path('customers/', ...)           <Route path="/customers" ... />
 *   path('customers/<pk>/', ...)      <Route path="/customers/:id" ... />
 *   path('customers/new/', ...)       <Route path="/customers/new" ... />
 *   path('customers/<pk>/edit/', ...) <Route path="/customers/:id/edit" ... />
 *
 * KEY DIFFERENCE: React Router's :id is like Django's <int:pk>, but the
 * component reads it with useParams() instead of receiving it as an argument.
 *
 * NEW CONCEPT — Components are functions
 * ────────────────────────────────────────
 * Every React component is a JavaScript function that returns JSX (HTML-like
 * syntax).  Think of a component as a reusable Django template fragment
 * (like {% include 'partial.html' %}) — but with its own data and logic built in.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import CustomerList   from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import CustomerForm   from './components/CustomerForm';
import './App.css';

export default function App() {
  return (
    /*
     * BrowserRouter — wraps the whole app so React Router can intercept
     * link clicks.  You only need one, at the very top level.
     */
    <BrowserRouter>
      <div className="app-shell">

        {/* ── Top navigation bar ─────────────────────────────────────────── */}
        <nav className="top-nav">
          <span className="brand">📋 Customer Manager</span>
          <div className="nav-links">
            {/*
              NavLink is a <Link> that automatically adds an "active" CSS
              class when its `to` path matches the current URL.
              Compare: {{ request.path }} checks in Django templates.
            */}
            <NavLink to="/customers">Customers</NavLink>
            <a href="http://localhost:8000/customers/" target="_blank" rel="noreferrer">
              Django HTML ↗
            </a>
            <a href="http://localhost:8000/api/customers/" target="_blank" rel="noreferrer">
              DRF API ↗
            </a>
            <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">
              Admin ↗
            </a>
          </div>
        </nav>

        {/* ── Main content area ──────────────────────────────────────────── */}
        <main className="main-content">
          <Routes>
            {/* Redirect root "/" to "/customers" — like Django's redirect() */}
            <Route path="/"                   element={<Navigate to="/customers" replace />} />
            <Route path="/customers"          element={<CustomerList />} />
            <Route path="/customers/new"      element={<CustomerForm />} />
            <Route path="/customers/:id"      element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
          </Routes>
        </main>

        {/* ── Learning sidebar ───────────────────────────────────────────── */}
        {/*
          This sidebar maps React concepts back to Django equivalents.
          Use it as a reference while you explore the code.
          Remove it once you feel confident!
        */}
        <aside className="learn-sidebar">
          <h4>🎓 Concept Map</h4>
          <p>Open these alongside the React app to compare:</p>
          <ul>
            <li>
              <strong>HTML list view</strong><br />
              <a href="http://localhost:8000/customers/" target="_blank" rel="noreferrer">
                /customers/ ↗
              </a>
            </li>
            <li>
              <strong>DRF JSON list</strong><br />
              <a href="http://localhost:8000/api/customers/" target="_blank" rel="noreferrer">
                /api/customers/ ↗
              </a>
            </li>
            <li>
              <strong>DRF browsable root</strong><br />
              <a href="http://localhost:8000/api/" target="_blank" rel="noreferrer">
                /api/ ↗
              </a>
            </li>
            <li>
              <strong>Django Admin</strong><br />
              <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">
                /admin/ ↗
              </a>
            </li>
          </ul>
          <hr />
          <h4>🔑 React hooks</h4>
          <dl className="concept-dl">
            <dt>useState</dt>
            <dd>Like a template context variable — React re-renders whenever it changes.</dd>
            <dt>useEffect</dt>
            <dd>Runs after render. Use it for API calls (replaces the view's queryset fetch).</dd>
            <dt>useParams</dt>
            <dd>Reads <code>:id</code> from the URL — like Django's <code>&lt;int:pk&gt;</code>.</dd>
            <dt>useNavigate</dt>
            <dd>Programmatic redirect — like Django's <code>redirect()</code>.</dd>
          </dl>
          <hr />
          <h4>🔑 DRF concepts</h4>
          <dl className="concept-dl">
            <dt>Serializer</dt>
            <dd>DRF's ModelForm — validates JSON input &amp; converts models → JSON.</dd>
            <dt>ViewSet</dt>
            <dd>One class = all CRUD actions. Router auto-creates the URLs.</dd>
            <dt>CORS</dt>
            <dd>Allows the React dev server (port 5173) to call the Django API (port 8000).</dd>
          </dl>
        </aside>

      </div>
    </BrowserRouter>
  );
}
