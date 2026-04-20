# Spec and build

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

Assess the task's difficulty, as underestimating it leads to poor outcomes.

- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:

- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `c:\Users\franc\Students-Registration-Portal\.zencoder\chats\d9e126a8-5f0e-45c4-932e-9293e7307c5c/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `c:\Users\franc\Students-Registration-Portal\.zencoder\chats\d9e126a8-5f0e-45c4-932e-9293e7307c5c/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `c:\Users\franc\Students-Registration-Portal\.zencoder\chats\d9e126a8-5f0e-45c4-932e-9293e7307c5c/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

**Stop here.** Present the specification (and plan, if created) to the user and wait for their confirmation before proceeding.

---

### [x] Step 1: Server bootstrap & database setup

Set up the Express server project and Prisma + MySQL connection.

**Files to create:**
- `server/package.json` — dependencies: express, prisma, @prisma/client, jsonwebtoken, bcryptjs, cors, dotenv
- `server/.env` — DATABASE_URL, JWT_SECRET, PORT
- `server/prisma/schema.prisma` — MySQL provider, `Student` and `Admin` models per spec
- `server/src/app.js` — Express app with cors, json middleware, route mounts
- `server/server.js` — listens on PORT

**Verification:** `npx prisma migrate dev --name init` succeeds; `node server.js` starts without errors.

---

### [x] Step 2: Backend auth route (admin login)

Implement `POST /api/admin/login`.

**Files to create:**
- `server/src/middleware/auth.js` — JWT verification middleware
- `server/src/routes/auth.js` — POST `/admin/login` route
- `server/src/controllers/authController.js` — look up admin by username, bcrypt compare, sign JWT

**Verification:** `curl -X POST /api/admin/login` with valid credentials returns a JWT; invalid credentials return 401.

---

### [x] Step 3: Backend student routes (register + admin CRUD)

Implement all student API endpoints.

**Files to create:**
- `server/src/routes/students.js` — POST `/register`; GET/GET:id/PUT:id/DELETE:id under `/admin/students`
- `server/src/controllers/studentController.js` — Prisma queries for each operation; `GET` supports `?q=` search across name, email, phone, courseCategory

**Verification:** POST `/api/register` inserts a row in MySQL; admin CRUD endpoints return correct data and modify DB rows; unauthenticated requests to admin routes return 401.

---

### [x] Step 4: Client bootstrap & shared infrastructure

Scaffold the React + Vite frontend with Tailwind, routing, auth context, and Axios.

**Files to create:**
- `client/` — `npm create vite` scaffold with React template
- `client/tailwind.config.js`, `client/postcss.config.js`, `client/src/index.css`
- `client/vite.config.js` — proxy `/api` → `http://localhost:5000`
- `client/src/api/axios.js` — Axios instance; request interceptor attaches JWT from localStorage
- `client/src/context/AuthContext.jsx` — provides `{ token, login, logout }` via React context
- `client/src/components/ProtectedRoute.jsx` — redirects to `/admin/login` if no token
- `client/src/components/Modal.jsx` — generic modal: `title`, `message`, `onConfirm`, `onClose`, optional confirm/cancel buttons
- `client/src/components/Navbar.jsx` — links: Home / Register / Admin Login; highlights active route
- `client/src/components/Footer.jsx` — copyright, placeholder contact info
- `client/src/App.jsx` — React Router routes: `/`, `/register`, `/admin/login`, `/admin/dashboard`
- `client/src/main.jsx` — wraps app in `AuthProvider`

**Verification:** `npm run dev` in `client/` renders Navbar and routes without errors.

---

### [x] Step 5: Home page

Build the GI-KACE landing page.

**Files to create:**
- `client/src/pages/Home.jsx`
  - Hero: headline "GI-KACE Course Registration", subtext, "Register Now" button → `/register`
  - About: short institution description
  - Courses grid: 8 cards (one per course category from spec), each with an icon and title
  - Uses Navbar + Footer

**Verification:** `/` renders with all sections; "Register Now" navigates to `/register`.

---

### [x] Step 6: Registration page & Zod schema

Build the 7-section registration form with full validation and dialogs.

**Files to create:**
- `client/src/schemas/registrationSchema.js` — Zod schema covering all fields and conditional rules per spec
- `client/src/pages/Register.jsx`
  - `useForm` with `zodResolver`
  - All 7 sections with correct field types (text, radio, select, textarea)
  - Conditional "Other" inputs via `watch()`
  - On valid submit: show confirmation Modal
  - On confirm: POST `/api/register`; show success Modal (with student name) or error Modal
  - Success Modal close: `reset()` form

**Verification:** Required field errors show inline; "Other" fields appear/disappear correctly; successful POST stores row in MySQL and shows success dialog.

---

### [x] Step 7: Admin login page

Build the admin login page.

**Files to create:**
- `client/src/pages/AdminLogin.jsx`
  - Username + password form (basic `useState`, no RHF needed)
  - POST `/api/admin/login`; on success call `login(token)` from AuthContext → redirect to `/admin/dashboard`
  - Inline error message on 401

**Verification:** Valid credentials redirect to dashboard; invalid credentials show error; JWT appears in localStorage.

---

### [x] Step 8: Admin dashboard (search, table, CRUD modals)

Build the protected admin dashboard.

**Files to create:**
- `client/src/pages/AdminDashboard.jsx`
  - Fetch `GET /api/admin/students?q=` on load and on search input change (debounced 300 ms)
  - Table: Name, Email, Phone, Course Category, Registered Date, Actions (View / Edit / Delete)
  - **View modal**: display all student fields read-only
  - **Edit modal**: pre-filled form (reuse field components or inline), PUT on save
  - **Delete modal**: confirmation, DELETE on confirm, refresh list
  - Pagination: client-side, 10 rows per page
  - Logout button: calls `logout()` from AuthContext → redirect to `/admin/login`

**Verification:** Search filters results; edit saves changes visible in DB; delete removes row; logout clears JWT and blocks dashboard access.

---

### [x] Step 9: Polish, lint, and manual end-to-end verification

Final quality pass.

- Run `npm run lint` in `client/`; fix any ESLint errors
- Confirm all Tailwind styles render correctly in browser
- Manual E2E walk-through:
  1. Home page loads, course cards visible
  2. Register → fill form → confirm → success dialog → row in MySQL
  3. Admin login → dashboard → search → view/edit/delete → logout
- Write report to `c:\Users\franc\Students-Registration-Portal\.zencoder\chats\d9e126a8-5f0e-45c4-932e-9293e7307c5c/report.md`
