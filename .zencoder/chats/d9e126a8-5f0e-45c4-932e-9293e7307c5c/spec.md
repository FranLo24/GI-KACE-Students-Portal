# Technical Specification: GI-KACE Students Registration Portal

## Difficulty Assessment: **Medium**

Multi-page React app with a REST API backend, MySQL database persistence, admin JWT authentication, and full CRUD — well-defined requirements with moderate complexity.

---

## Technical Context

| Concern | Choice | Rationale |
|---|---|---|
| Frontend framework | React 18 + Vite | Modern, fast DX |
| Styling | Tailwind CSS v3 | Utility-first, rapid UI |
| Routing | React Router v6 | Standard SPA routing |
| Form management | React Hook Form + Zod | Declarative validation |
| HTTP client | Axios | API calls from React |
| Backend | Node.js + Express | Lightweight REST API |
| ORM | Prisma | Type-safe DB access |
| Database | MySQL | Per user requirement |
| Admin auth | JWT (jsonwebtoken) | Stateless, standard |
| Password hashing | bcryptjs | Secure password storage |
| Admin provisioning | Manual (no seed) | Admin credentials created externally |
| Deployment target | Local development only | No Docker or production config required |

---

## Project Structure

```
Students-Registration-Portal/
├── client/                        # React + Vite frontend
│   ├── public/
│   │   └── gikace-logo.svg        # Placeholder logo
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with base URL + JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Modal.jsx          # Reusable confirmation/success/error dialog
│   │   │   └── ProtectedRoute.jsx # Admin route guard (checks JWT)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Admin auth state (JWT + logout)
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Register.jsx       # Student registration form
│   │   │   ├── AdminLogin.jsx     # Admin login
│   │   │   └── AdminDashboard.jsx # Admin CRUD/search
│   │   ├── schemas/
│   │   │   └── registrationSchema.js  # Zod validation schema
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js             # Proxy /api → localhost:5000
│
├── server/                        # Express backend
│   ├── prisma/
│   │   └── schema.prisma          # Prisma schema (MySQL provider)
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── students.js        # POST /register + admin student routes
│   │   │   └── auth.js            # POST /admin/login
│   │   ├── controllers/
│   │   │   ├── studentController.js
│   │   │   └── authController.js
│   │   └── app.js                 # Express app (cors, json, routes)
│   ├── server.js                  # Entry point (listens on PORT)
│   ├── .env                       # DATABASE_URL, JWT_SECRET, PORT
│   └── package.json
│
└── client/package.json
```

---

## Data Model

### `Student` (Prisma → MySQL table `students`)

```prisma
model Student {
  id                    Int      @id @default(autoincrement())
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // 1. Personal Information
  fullName              String
  gender                String
  nationality           String
  idType                String
  idTypeOther           String?
  idNumber              String

  // 2. Contact Information
  phoneNumber           String
  alternativePhone      String?
  emailAddress          String
  residentialAddress    String
  cityTown              String

  // 3. Educational Background
  highestEducation      String
  highestEducationOther String?
  fieldOfStudy          String

  // 4. Employment Information
  employmentStatus      String
  organizationName      String?
  jobTitle              String?
  yearsOfExperience     String?

  // 5. Course Details
  courseTitle           String
  courseCategory        String
  courseCategoryOther   String?

  // 6. ICT Skills & Experience
  computerLiteracy      String
  relevantSkills        String?

  // 7. Emergency Contact
  emergencyName         String
  emergencyRelationship String
  emergencyPhone        String
}
```

### `Admin` (Prisma → MySQL table `admins`)

```prisma
model Admin {
  id           Int    @id @default(autoincrement())
  username     String @unique
  passwordHash String
}
```

> **Admin provisioning**: No seed script. The admin must insert their own record directly into MySQL (e.g., via MySQL Workbench or CLI) using a bcrypt-hashed password.

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | None | Submit student registration |
| POST | `/api/admin/login` | None | Validate credentials → return JWT |
| GET | `/api/admin/students` | JWT | List all students; optional `?q=` search |
| GET | `/api/admin/students/:id` | JWT | Get single student record |
| PUT | `/api/admin/students/:id` | JWT | Update student record |
| DELETE | `/api/admin/students/:id` | JWT | Delete student record |

---

## Pages & UI Features

### Home (`/`)
- Navbar: logo + "GI-KACE", links to Home / Register / Admin Login
- Hero section: headline, subheadline, "Register Now" CTA button
- About section: brief description of GI-KACE and its mission
- Courses section: grid of cards, one per course category (8 categories from the form)
- Footer: contact info placeholder, copyright

### Registration (`/register`)
- 7-section form exactly mirroring `GI_KACE Registration.txt`
- Required fields enforced; optional fields labeled "(optional)"
- Conditional "Other" text inputs: rendered only when "Other" option is selected (via `watch()`)
- On submit:
  1. Zod validation runs client-side; inline errors shown per field
  2. Confirmation modal: "Submit your registration?" with Cancel / Confirm buttons
  3. On confirm: POST `/api/register`
  4. Success modal: "Registration Successful! Welcome, [fullName]." with Close button that resets form
  5. API error shown in an error modal

### Admin Login (`/admin/login`)
- Username + password fields, Login button
- JWT stored in `localStorage`
- Redirect to `/admin/dashboard` on success
- Error message on invalid credentials

### Admin Dashboard (`/admin/dashboard`) — JWT-protected
- Search bar: filters by name, email, phone, course (debounced, hits `?q=`)
- Paginated table: Name, Email, Phone, Course Category, Registered Date, Actions
- **View**: modal showing all fields of a student record
- **Edit**: modal form pre-filled with student data, PUT on save
- **Delete**: confirmation modal, DELETE on confirm
- Logout button: clears JWT, redirects to `/admin/login`

---

## Validation Rules (Zod — `registrationSchema.js`)

| Field | Rule |
|---|---|
| fullName | Required, min 2 chars |
| gender | Required, one of `["Male", "Female"]` |
| nationality | Required |
| idType | Required, one of `["Ghana Card", "Passport", "Other"]` |
| idTypeOther | Required when `idType === "Other"` |
| idNumber | Required |
| phoneNumber | Required, matches `/^\d{10,15}$/` |
| alternativePhone | Optional, matches `/^\d{10,15}$/` if provided |
| emailAddress | Required, valid email |
| residentialAddress | Required |
| cityTown | Required |
| highestEducation | Required, enum |
| highestEducationOther | Required when `highestEducation === "Other"` |
| fieldOfStudy | Required |
| employmentStatus | Required, enum |
| courseTitle | Required |
| courseCategory | Required, enum |
| courseCategoryOther | Required when `courseCategory === "Other"` |
| computerLiteracy | Required, one of `["Beginner", "Intermediate", "Advanced"]` |
| emergencyName | Required |
| emergencyRelationship | Required |
| emergencyPhone | Required, matches `/^\d{10,15}$/` |

---

## Environment Variables (`server/.env`)

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/gikace_portal"
JWT_SECRET="replace_with_strong_secret"
PORT=5000
```

---

## Verification Approach

1. **Lint**: `eslint` on both client (`npm run lint`) and server
2. **Runtime validation**: Zod on client before submit; Express request body check server-side
3. **Manual verification**:
   - Submit form → verify row in MySQL via `mysql` CLI or Workbench
   - Admin login → inspect JWT in localStorage
   - Admin CRUD → verify changes reflected in DB and UI
4. **Dev proxy**: Vite proxies `/api` → `http://localhost:5000` — no CORS config needed in dev
