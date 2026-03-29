# Django + React — Customer CRUD (Learning Project)

A hands-on learning project that builds a simple Customer CRM using:

| Layer | Technology | Purpose |
|---|---|---|
| Backend | **Django 6** | Models, traditional HTML views, admin |
| API | **Django REST Framework (DRF)** | JSON API consumed by React |
| Frontend | **React 19 + Vite** | Single-Page Application (SPA) |
| HTTP client | **Axios** | Fetch data from the DRF API |
| Routing | **React Router v7** | Client-side URL navigation |

The project is deliberately **dual-stack**: every CRUD operation exists as
both a traditional Django HTML view *and* a React/DRF equivalent so you can
compare them side by side while you learn.

---

## Project layout

```
django-react/
├── backend/                    ← Django project
│   ├── config/
│   │   ├── settings.py         ← INSTALLED_APPS, DRF config, CORS
│   │   └── urls.py             ← URL routing for both HTML and API
│   ├── customers/
│   │   ├── models.py           ← Customer model (same for both stacks)
│   │   ├── serializers.py      ← DRF equivalent of ModelForm
│   │   ├── views.py            ← Part 1: FBVs  |  Part 2: DRF ViewSet
│   │   ├── forms.py            ← ModelForm used by the HTML views
│   │   ├── urls.py             ← Traditional URL patterns
│   │   ├── admin.py            ← Django admin registration
│   │   └── tests.py            ← Tests for both HTML views AND the API
│   ├── manage.py
│   └── requirements.txt
└── frontend/                   ← React application (Vite)
    ├── vite.config.js          ← Proxy /api/* to Django
    └── src/
        ├── main.jsx            ← Entry point (like manage.py)
        ├── App.jsx             ← Router + layout shell
        ├── App.css             ← All styles
        ├── api/
        │   └── customers.js    ← Axios API calls (replaces ORM in views)
        └── components/
            ├── CustomerList.jsx    ← list view
            ├── CustomerDetail.jsx  ← detail view
            └── CustomerForm.jsx    ← create + edit form
```

---

## Quick start

### 1 — Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2 — Run Django migrations and create a superuser

```bash
python manage.py migrate
python manage.py createsuperuser   # optional but useful for /admin/
```

### 3 — Start the Django development server

```bash
python manage.py runserver
```

Django is now running at **http://localhost:8000**

### 4 — Install JS dependencies and start the React dev server

```bash
# In a second terminal
cd frontend
npm install
npm run dev
```

React is now running at **http://localhost:5173**

### 5 — Explore the app

| URL | What you see |
|---|---|
| http://localhost:5173 | React app (SPA) |
| http://localhost:8000/customers/ | Same CRUD using Django HTML templates |
| http://localhost:8000/api/customers/ | DRF browsable API (JSON) |
| http://localhost:8000/api/ | DRF API root |
| http://localhost:8000/admin/ | Django admin |

---

## Learning path — read in this order

The project is designed to build your knowledge incrementally.
Work through these steps in order.

### Step 1 — The model (start here — it's familiar!)

Open **`backend/customers/models.py`**

The `Customer` model is plain Django — exactly what you already know.
Nothing about DRF or React changes the model.  It remains the single
source of truth for both stacks.

**Try it:** Add a field (e.g. `address = models.CharField(...)`) and run
`python manage.py makemigrations && python manage.py migrate`.

---

### Step 2 — Traditional Django views (your familiar ground)

Open **`backend/customers/views.py`** — PART 1 (function-based views)

These are the views you already write: fetch queryset → render template.
Browse to **http://localhost:8000/customers/** and click through the CRUD.

Key comparison table:

| Action | Django FBV | DRF ViewSet |
|---|---|---|
| List | `Customer.objects.all()` → template | `CustomerViewSet.list()` → JSON |
| Detail | `get_object_or_404(pk=pk)` → template | `CustomerViewSet.retrieve()` → JSON |
| Create | `form.save()` → redirect | `serializer.save()` → 201 JSON |
| Update | `form.save()` → redirect | `serializer.save()` → 200 JSON |
| Delete | `customer.delete()` → redirect | `customer.delete()` → 204 |

---

### Step 3 — The DRF serializer (the ModelForm of the API world)

Open **`backend/customers/serializers.py`**

A `ModelSerializer` is almost identical to a `ModelForm`:

```python
# ModelForm you already know
class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'email', ...]

# DRF Serializer — same pattern!
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['name', 'email', ...]
```

The serializer handles two jobs:
- **Input (deserialization):** JSON → validated Python object → save to DB
- **Output (serialization):** Django model instance → JSON

**Try it:** Open **http://localhost:8000/api/customers/** and use the
DRF browsable API to create a customer directly from the browser.

---

### Step 4 — The DRF ViewSet (six views in one class)

Open **`backend/customers/views.py`** — PART 2 (`CustomerViewSet`)

A `ModelViewSet` gives you all six CRUD endpoints for free:

```python
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
```

That's it.  Compare this to the six function-based views in Part 1.

Open **`backend/config/urls.py`** to see how the `DefaultRouter`
automatically generates all the URL patterns.

**Try it:** Open your browser to:
- `GET  /api/customers/`    → list
- `GET  /api/customers/1/`  → single customer (replace 1 with a real id)
- Use the DRF browsable form to `POST` / `PUT` / `DELETE`

---

### Step 5 — React entry point & routing

Open **`frontend/src/main.jsx`** then **`frontend/src/App.jsx`**

`main.jsx` bootstraps React — think of it as `manage.py`.

`App.jsx` sets up **React Router** — the client-side equivalent of
Django's `urlpatterns`.  Side by side:

```python
# Django — backend/customers/urls.py
path('customers/',           customer_list,   name='customer_list')
path('customers/<int:pk>/',  customer_detail, name='customer_detail')
path('customers/new/',       customer_create, name='customer_create')
```

```jsx
// React — frontend/src/App.jsx
<Route path="/customers"          element={<CustomerList />} />
<Route path="/customers/:id"      element={<CustomerDetail />} />
<Route path="/customers/new"      element={<CustomerForm />} />
```

Key difference: Django routes → server renders new HTML.
React Router → same HTML, different component rendered (no server round-trip).

---

### Step 6 — The API layer (replaces ORM calls in views)

Open **`frontend/src/api/customers.js`**

Every function here replaces one ORM call from your Django views:

```javascript
// Old: Customer.objects.all()
getCustomers()               // GET /api/customers/

// Old: get_object_or_404(Customer, pk=id)
getCustomer(id)              // GET /api/customers/:id/

// Old: form.save()  (new instance)
createCustomer(data)         // POST /api/customers/

// Old: form.save()  (existing instance)
updateCustomer(id, data)     // PUT /api/customers/:id/

// Old: customer.delete()
deleteCustomer(id)           // DELETE /api/customers/:id/
```

The functions return **Promises** — JavaScript's async mechanism.
We use `async/await` in components to wait for the response (see
`CustomerForm.jsx`).

---

### Step 7 — React hooks (useState + useEffect)

Open **`frontend/src/components/CustomerList.jsx`**

Two hooks do most of the work:

```jsx
// useState — like a template context variable, but re-renders the
// component automatically when the value changes.
const [customers, setCustomers] = useState([]);  // start empty

// useEffect — runs *after* the component renders.
// The [] dependency array means "run once on mount" — like the
// initial data fetch in a Django view.
useEffect(() => {
    getCustomers().then(res => setCustomers(res.data.results));
}, []);
```

Cheat sheet:
- `useState(initial)` → store a value, trigger re-render on change
- `useEffect(fn, [])` → run once on mount (initial data fetch)
- `useEffect(fn, [x])` → re-run whenever `x` changes (search/filter)

---

### Step 8 — Controlled forms (CustomerForm.jsx)

Open **`frontend/src/components/CustomerForm.jsx`**

This is the richest component — read the detailed learning notes at the top.

Key concept — **controlled components**:

```jsx
// In a Django template you do:
//   <input name="email" value="{{ form.email.value }}">
// Django owns the value on the server between submissions.

// In React we make the input "controlled":
<input
    name="email"
    value={formData.email}       // React state drives the displayed value
    onChange={e => setFormData({ ...formData, email: e.target.value })}
/>
//          ↑ every keystroke immediately updates formData.email in state
```

Form submission in React vs Django:

```python
# Django
if request.method == 'POST':
    form = CustomerForm(request.POST)
    if form.is_valid():
        customer = form.save()
        return redirect(...)
```

```jsx
// React
async function handleSubmit(e) {
    e.preventDefault();                  // prevent full page reload
    const res = await createCustomer(formData);   // POST to DRF
    navigate(`/customers/${res.data.id}`);        // redirect
}
```

---

### Step 9 — Run the tests

```bash
cd backend
python manage.py test customers -v 2
```

The test file (`customers/tests.py`) covers both HTML views and the DRF
API — read it to see how `APITestCase` mirrors `TestCase` for JSON endpoints.

---

### Step 10 — Things to try next

1. **Add authentication** — swap `AllowAny` for `IsAuthenticated` in
   `settings.py` and add `Token` or `Session` auth.
2. **Add a new field** — e.g. `status` (lead/active/inactive) — follow the
   model → serializer → form → component chain.
3. **Pagination in React** — the API already paginates (`?page=2`).
   Add previous/next buttons to `CustomerList.jsx`.
4. **Deploy** — run `npm run build` and serve the `dist/` folder from Django
   using `WhiteNoise`, so you only have one server in production.
5. **Read the DRF docs** — https://www.django-rest-framework.org/

---

## Running the tests

```bash
cd backend
python manage.py test customers
```

---

## Key file comparison table

| What you're looking at | Django file | React file |
|---|---|---|
| Data model | `customers/models.py` | *(same model, no React equivalent)* |
| Validation | `customers/forms.py` | `customers/serializers.py` |
| Business logic | `customers/views.py` (FBVs) | `customers/views.py` (ViewSet) |
| URL mapping | `customers/urls.py` + `config/urls.py` | `App.jsx` (`<Routes>`) |
| Templates/UI | `customers/templates/` | `src/components/` |
| Data fetching | `Customer.objects.all()` in view | `getCustomers()` in `useEffect` |
| Form submission | `request.POST` → `form.save()` | `formData` state → `createCustomer()` |
| Redirect after save | `redirect('customer_detail', pk=...)` | `navigate('/customers/' + id)` |
