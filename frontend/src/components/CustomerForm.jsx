/**
 * CustomerForm.jsx  — Create & Edit in one component
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LEARNING NOTES — Read this before the code!
 * ════════════════════════════════════════════════════════════════════════════
 *
 * You already know Django's ModelForm pattern:
 *
 *   # Django view
 *   def customer_create(request):
 *       if request.method == 'POST':
 *           form = CustomerForm(request.POST)
 *           if form.is_valid():
 *               form.save()
 *               return redirect(...)
 *       else:
 *           form = CustomerForm()
 *       return render(request, 'form.html', {'form': form})
 *
 * The React equivalent is this component.  Here is the mapping:
 *
 *   Django concept                      React equivalent
 *   ──────────────────────────────      ──────────────────────────────────────
 *   request.method == 'POST'            form's onSubmit event handler
 *   form = CustomerForm(request.POST)   formData state updated by onChange
 *   form.is_valid()                     client-side validation + server errors
 *   form.save()                         createCustomer(formData) / updateCustomer()
 *   redirect(...)                       navigate('/customers/' + id)
 *   form = CustomerForm(instance=c)     pre-filling formData from the API
 *   form.errors                         errors state from the API response
 *
 * NEW CONCEPT — Controlled components
 * ─────────────────────────────────────
 * In a Django template you write:
 *   <input name="email" value="{{ form.email.value }}">
 * Django owns the data on the server between submissions.
 *
 * In React we make the <input> a "controlled component":
 *   <input value={formData.email} onChange={e => setFormData(...)} />
 *                ↑ React state drives the value
 *                                ↑ every keystroke updates state
 *
 * This way React always has the current field values in memory, without
 * needing a round-trip to the server.
 *
 * NEW CONCEPT — One component, two modes (create vs edit)
 * ─────────────────────────────────────────────────────────
 * We detect whether we are editing by checking if :id is present in
 * the URL (via useParams).  If it is, we fetch the existing customer and
 * pre-fill the form — exactly like CustomerForm(instance=customer) in Django.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomer, createCustomer, updateCustomer } from '../api/customers';

// The fields we want in the form.  Each key matches a field in the
// DRF serializer (customers/serializers.py).
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  notes: '',
};

export default function CustomerForm() {
  // useParams() — reads :id from the URL, e.g. /customers/3/edit → id = '3'
  // If we are creating a new customer the URL is /customers/new, so id is undefined.
  const { id } = useParams();
  const isEditing = Boolean(id); // true  → edit mode,  false → create mode

  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  //
  // formData holds all the field values — one key per form field.
  // This is the "controlled component" pattern: React owns the form state.
  const [formData, setFormData] = useState(EMPTY_FORM);

  // errors comes from the DRF serializer's validation response.
  // Shape: { email: ['This field must be unique.'], name: ['...'], ... }
  // Compare to Django's form.errors dictionary.
  const [errors, setErrors]   = useState({});

  const [loading, setLoading] = useState(isEditing); // fetch existing data when editing
  const [saving, setSaving]   = useState(false);

  // ── Effect: load existing customer when editing ───────────────────────────
  //
  // Equivalent to:
  //   form = CustomerForm(instance=get_object_or_404(Customer, pk=pk))
  useEffect(() => {
    if (!isEditing) return;   // nothing to load for create mode

    getCustomer(id)
      .then(res => {
        // Pre-fill formData with the values from the API response.
        // We only pick the editable fields (not id, created_at, updated_at).
        const { name, email, phone, company, notes } = res.data;
        setFormData({ name, email, phone, company, notes });
      })
      .catch(() => navigate('/customers')) // customer not found → go back to list
      .finally(() => setLoading(false));
  }, [id, isEditing, navigate]);

  // ── Generic change handler ─────────────────────────────────────────────────
  //
  // One function handles ALL input fields by reading event.target.name.
  // In Django you don't need this because the template engine handles it,
  // but in React we manage state ourselves.
  //
  // The spread operator ({ ...prev, [name]: value }) creates a NEW object
  // with the updated field — React requires immutable state updates.
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  //
  // Equivalent to the `if request.method == 'POST':` block in the Django view.
  async function handleSubmit(e) {
    e.preventDefault();  // prevent the browser's default form submission (full page reload)
    setSaving(true);
    setErrors({});

    try {
      if (isEditing) {
        // PUT /api/customers/:id/  — full replacement (all fields sent)
        await updateCustomer(id, formData);
        navigate(`/customers/${id}`);
      } else {
        // POST /api/customers/  — create new record
        const res = await createCustomer(formData);
        navigate(`/customers/${res.data.id}`);
      }
    } catch (err) {
      // If the server returns 400 Bad Request, err.response.data contains
      // the serializer's validation errors — just like form.errors in Django.
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ['An unexpected error occurred. Please try again.'] });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="status">Loading…</p>;

  return (
    <div>
      {/* Breadcrumb navigation */}
      <nav className="breadcrumb">
        <Link to="/customers">Customers</Link>
        {isEditing && (
          <>
            {' '} › <Link to={`/customers/${id}`}>{formData.name || `#${id}`}</Link>
          </>
        )}
        {' '} › {isEditing ? 'Edit' : 'New Customer'}
      </nav>

      {/* ── Learning tip ────────────────────────────────────────────────────── */}
      <div className="learn-box">
        <strong>📖 Learning tip:</strong>{' '}
        {isEditing
          ? <>This form sends a <code>PUT</code> request to <code>/api/customers/{id}/</code> — the DRF serializer validates it, just like <code>CustomerForm(request.POST, instance=customer).is_valid()</code>.</>
          : <>This form sends a <code>POST</code> request to <code>/api/customers/</code> — the DRF serializer validates it, just like <code>CustomerForm(request.POST).is_valid()</code>.</>
        }
      </div>

      <form onSubmit={handleSubmit} className="customer-form">
        <h2>{isEditing ? 'Edit Customer' : 'New Customer'}</h2>

        {/* Non-field / server errors */}
        {errors.non_field_errors && (
          <div className="field-error global-error">{errors.non_field_errors.join(' ')}</div>
        )}

        {/* ── Name ──────────────────────────────────────────────────────────── */}
        {/*
          Controlled input pattern:
            value={formData.name}         → React drives the displayed value
            onChange={handleChange}       → every keystroke updates formData.name
          This is different from a traditional HTML form where the browser holds
          the value until it's submitted.
        */}
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
          />
          {errors.name && <span className="field-error">{errors.name.join(' ')}</span>}
        </div>

        {/* ── Email ─────────────────────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="field-error">{errors.email.join(' ')}</span>}
        </div>

        {/* ── Phone ─────────────────────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="field-error">{errors.phone.join(' ')}</span>}
        </div>

        {/* ── Company ───────────────────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
          />
          {errors.company && <span className="field-error">{errors.company.join(' ')}</span>}
        </div>

        {/* ── Notes ─────────────────────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
          />
          {errors.notes && <span className="field-error">{errors.notes.join(' ')}</span>}
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Customer')}
          </button>
          <Link
            to={isEditing ? `/customers/${id}` : '/customers'}
            className="btn"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
