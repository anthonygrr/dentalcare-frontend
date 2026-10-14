# DentalCare — Dental Clinic Management Dashboard

A modern, full-featured dental clinic management SPA built with React 19, TanStack Router, TanStack Query, and Tailwind CSS. Connects to a Spring Boot backend secured with Spring Security and JWT authentication.
[dentalcare-backend](https://github.com/anthonygrr/dentalcare-backend)

SPring Boot Backend in: 
---

## Tech Stack

| Category        | Technology                          | Version    |
|-----------------|-------------------------------------|------------|
| **Framework**   | React                               | 19.2.0     |
| **Language**    | TypeScript                          | 5.8.3      |
| **Routing**     | TanStack Router                     | 1.168.25   |
| **Data Fetch**  | TanStack Query (React Query)        | 5.83.0     |
| **SSR/SSG**     | TanStack Start                      | 1.167.50   |
| **Styling**     | Tailwind CSS                        | 4.2.1      |
| **UI Library**  | shadcn/ui (Radix primitives)        | —          |
| **Icons**       | Lucide React                        | 0.575.0    |
| **HTTP Client** | Axios                               | 1.16.1     |
| **Date Picker** | React Day Picker                    | 9.14.0     |
| **Toast**       | Sonner                              | 2.0.7      |
| **Build Tool**  | Vite                                | 7.3.1      |
| **Auth**        | JWT (access + refresh tokens)       | —          |

---

## Features

### Authentication
- **JWT-based login** — username/email + password against Spring Security backend
- **Persisted sessions** — tokens stored in `localStorage`
- **Auto‑attach** — Bearer token injected on every API request via Axios interceptor
- **401 redirect** — expired / invalid tokens automatically redirect to login
- **Logout** — clears tokens and returns to login page

### Patients
- Full CRUD (Create, Read, Update, Delete)
- Client-side search by name (fetches all patients once, filters in memory)
- View dialog with computed age from birth date
- Edit dialog with email / phone uniqueness validation
- Sort by name ascending

### Doctors
- Full CRUD
- Specialty selection from enum (`GENERAL_DENTIST`, `ORTHODONTIST`, `ENDODONTIST`, `ORAL_SURGEON`, `PERIODONTIST`, `PROSTHODONTIST`, `PEDIATRIC_DENTIST`, `COSMETIC_DENTIST`)
- Email / phone uniqueness validation
- Client-side name search
- Sort by name ascending

### Appointments
- Full CRUD
- Status tabs: All, Scheduled, Confirmed, In Progress, Started, Completed, Cancelled
- Filters: date, procedure, patient name search
- Doctor‑time conflict detection (prevents double‑booking)
- Diagnosis & treatment fields appear only when status is `COMPLETED`
- 12‑hour time formatting (AM/PM)
- Client‑side pagination and search

### Medical Records
- Read, Update, Delete (created automatically when an appointment is completed)
- Search by patient name or diagnosis
- View dialog with full record details (appointment date, time, procedure, diagnosis, treatment)
- Edit diagnosis and treatment fields

### Calendar
- Interactive month view with date picker
- Click a date to view all appointments for that day
- Color‑coded status badges
- "New Appointment" button pre‑fills the selected date
- Client‑side exact-date filtering

### Dashboard
- Stats tiles: total patients, pending appointments, today's schedule, upcoming count
- Upcoming appointments list (next 6)
- Inline Create Appointment dialog with patient/doctor autocomplete
- Personalized greeting with logged-in user's name

### Settings
- View profile information (name, email, roles)
- Change password with confirmation validation
- Real data from `GET /api/users/me`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  TanStack Start (SSR)                                           │
├─────────────────────────────────────────────────────────────────┤
│  TanStack Router (file-based routing)                           │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────┐   │
│  │Dashboard│ │Patients  │ │Doctors    │ │Calendar  │ │Login │   │
│  │         │ │Appt's    │ │Med Records│ │Settings  │ │      │   │
│  └────┬────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘ └──┬───┘   │
│       └───────────┴─────────────┴────────────┴──────────┘       │
├─────────────────────────────────────────────────────────────────┤
│  TanStack Query (server state management)                       │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐       │
│  │useQuery  │  │useMutation│  │queryClient│  │staleTime │       │
│  └────┬─────┘  └────┬──────┘  └───────────┘  └──────────┘       │
│       └─────────────┴───────────────────────────────────────────│
├─────────────────────────────────────────────────────────────────┤
│  Axios API Layer                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐   │
│  │Patients  │ │Doctors   │ │Appt's    │ │MedRecords│ │Auth  │   │
│  │ API      │ │ API      │ │ API      │ │ API      │ │API   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘   │
│       └────────────┴────────────┴────────────┴──────────┘       │
│  Interceptors: [ Bearer Token ] [ 401 → / login ]               │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot Backend (separate project)                         │
│  /api/auth  /api/patients  /api/doctors  /api/appointments      │
│  /api/medical-records  /api/users                               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Patterns

- **Separation of concerns**: API calls live in `src/api/`, action wrappers in `src/actions/`, hooks in `src/hooks/`, route pages in `src/routes/`.
- **One API instance per entity** — each has its own Axios instance with the auth interceptor attached via `setupAuthInterceptor()`.
- **Client‑side search** — patients, doctors, medical records, and calendar fetch all records once (up to 10,000) and filter in memory for instant typing feedback.
- **Pessimistic uniqueness validation** — email and phone are checked against the full in‑memory list before creating or updating patients / doctors.
- **Reusable components** — `SearchableSelect<T>` (generic autocomplete combobox), `DataPagination`, `CreateAppointmentDialog` are shared across pages.
- **TanStack Query keys** follow a `["entity", "scope"]` pattern (e.g. `["patients", "all"]`, `["patients", { page, size, sort }]`) to avoid cache collisions.

---

## Project Structure

```
src/
├── api/                # Axios instances & interceptors
│   ├── interceptors.ts
│   ├── auth.api.ts
│   ├── dentalcare.api.ts       # patients
│   ├── doctor.api.ts
│   ├── appointment.api.ts
│   └── medical-record.api.ts
├── actions/            # API action functions
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   └── medical-records/
├── hooks/              # TanStack Query hooks
│   ├── useCreate*.ts
│   ├── useUpdate*.ts
│   ├── useDelete*.ts
│   └── usePaginated*.ts
├── contexts/           # React contexts
│   └── auth.tsx
├── types/              # TypeScript interfaces & enums
├── routes/             # Page components (file-based routing)
│   ├── __root.tsx      # Layout shell + auth guard
│   ├── login.tsx
│   ├── index.tsx       # Dashboard
│   ├── patients.tsx
│   ├── doctors.tsx
│   ├── appointments.tsx
│   ├── calendar.tsx
│   ├── medical-records.tsx
│   └── settings.tsx
├── components/         # UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── AppSidebar.tsx
│   ├── DataPagination.tsx
│   └── AppointmentDialog.tsx
└── lib/                # Utilities
    └── utils.ts
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A running Spring Boot backend with the required endpoints

### Environment Variables
Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

### Install & Run

```bash
# Install dependencies
pnpm install

# Start development server (defaults to port 5173)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Available Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `pnpm run dev`    | Start Vite dev server              |
| `pnpm run build`  | Build for production               |
| `pnpm run preview`| Preview production build           |
| `pnpm run lint`   | Run ESLint                         |
| `pnpm run format` | Format with Prettier               |

---

## Authentication

The app uses JWT-based authentication with Spring Security.

1. Navigate to `/login`
2. Enter your username or email and password
3. On success, the app stores the JWT tokens and redirects to the dashboard
4. All subsequent API requests include the `Authorization: Bearer <accessToken>` header
5. When the token expires, the 401 interceptor clears the session and redirects to `/login`

### API Endpoints (Backend)

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | `/api/auth/login`           | Authenticate user    |
| GET    | `/api/users/me`             | Get current user     |
| PUT    | `/api/users/me`             | Update password      |
| GET    | `/api/patients`             | List patients        |
| POST   | `/api/patients`             | Create patient       |
| PUT    | `/api/patients/{id}`        | Update patient       |
| DELETE | `/api/patients/{id}`        | Delete patient       |
| GET    | `/api/doctors`              | List doctors         |
| POST   | `/api/doctors`              | Create doctor        |
| PUT    | `/api/doctors/{id}`         | Update doctor        |
| DELETE | `/api/doctors/{id}`         | Delete doctor        |
| GET    | `/api/appointments`         | List appointments    |
| POST   | `/api/appointments`         | Create appointment   |
| PUT    | `/api/appointments/{id}`    | Update appointment   |
| DELETE | `/api/appointments/{id}`    | Delete appointment   |
| GET    | `/api/medical-records`      | List medical records |
| PUT    | `/api/medical-records/{id}` | Update medical record|
| DELETE | `/api/medical-records/{id}` | Delete medical record|

---

## License

MIT License

Copyright (c) 2026 DentalCare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
