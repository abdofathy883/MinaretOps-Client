# The Minaret Agency — Operations Client (Angular)

A production-ready, role-aware Operations Web App for managing clients, services, tasks, KPIs, announcements, attendance, leave requests, complaints, and embedded analytics. Built with Angular 19, designed for performance, reliability, and a polished RTL-first UX for Arabic.

- Live-ready PWA with offline caching and web push notifications
- Role-based access control with route guards
- Embedded analytics via Microsoft Power BI
- Clean API abstraction and modular service architecture
- Bootstrap 5 UI with Bootstrap Icons and RTL-optimized design

## Why it matters

- Accelerate your operations: Centralize service delivery, client ops, and workforce activities in one place.
- Reduce errors: Role-based access, proper guards, and safe API contracts.
- Increase visibility: KPI and Power BI dashboards available right on the home screen.
- Delight teams: Polished UI, fast navigation, offline support, and push notifications.

---

## Features

- Authentication and Accounts
  - Secure login with JWT persistence (localStorage) and token validation
  - Session-aware guards route users appropriately (`authGuard`, `noauthGuard`)
  - Role-based permissions (`roleGuard`) with fine-grained route `data.roles` and optional `requireAll`

- User Management
  - Add users, view all users, single user view, and self-profile (`my-account`)
  - Admin and Account Manager privileges respected

- Clients and Services
  - Add clients and services; browse all; view single entities
  - Per-client task groups and tasks with modals for add/edit
  - Permissions enforced by role guards where needed

- Tasks and Internal Tasks
  - Task hubs for teams and admins
  - Dedicated internal tasks with add/view/single flows

- Attendance, Leave Requests, Complaints
  - Attendance and leave approvals restricted to Admins
  - Log complaints and track entries

- Announcements and Contact Form
  - Post and manage announcements
  - View contact form entries and drill down to individual items

- KPIs and Analytics
  - KPI Management restricted to Admins
  - Power BI embedded dashboard on the main `Dashboard`, configured via backend-issued embed tokens

- Progressive Web App (PWA)
  - Angular Service Worker caching configured via `ngsw-config.json`
  - Custom `service-worker.js` extends Angular SW to handle push events
  - Web Push via VAPID public key (configure your key)

- UX Details
  - RTL-first experience (`lang="ar"` and `dir="rtl"`)
  - Bootstrap 5 + Bootstrap Icons
  - Noto Sans Arabic font
  - Mobile-friendly and installable

---

## Screens and Routes

- Public
  - `/login`

- Authenticated
  - `/dashboard` — embedded analytics dashboard
  - `/users`, `/users/add`, `/users/:id`, `/users/my-account/:id` — user ops
  - `/services`, `/services/add`, `/services/:id`
  - `/clients`, `/clients/add`, `/clients/:id` — includes task groups and task modals
  - `/tasks`, `/tasks/:id`
  - `/internal-tasks`, `/internal-tasks/add`, `/internal-tasks/:id`
  - `/attendance` (Admin)
  - `/announcements`, `/announcements/add`
  - `/leave-requests` (Admin)
  - `/complaints`, `/complaints/add` (Admin for listing)
  - `/contact-form-entries`, `/contact-form-entries/:id`
  - `/kpis-management` (Admin)
  - `/access-denied`, `/**` (not found)

Guards: `noauthGuard` protects private routes, `authGuard` prevents logged-in users from seeing `/login`, `roleGuard` enforces roles (e.g., Admin, AccountManager).

---

## Architecture

- Angular 19 Standalone App
  - Bootstrap via `bootstrapApplication(AppComponent, appConfig)`
  - Routing and providers configured in `app.config.ts` and `app.routes.ts`
  - Service Worker registered with `registerWhenStable:30000` to minimize initial load impact

- Service Layer
  - `ApiService` wraps `HttpClient` with environment-based base URL
  - Domain services per feature area (`auth`, `clients`, `tasks`, `announcements`, `power-bi`, etc.)
  - Clear endpoints; adjust base URL in `src/environments/*.ts`

- Auth and State
  - `AuthService` manages JWT, refresh token storage, current user state via `BehaviorSubject`
  - Token validity checks (exp) and error handling with `HttpErrorResponse` mapping
  - `roleGuard` fetches user by id to evaluate roles (supports `requireAll`)

- PWA and Push
  - `ngsw-config.json` configures asset caching (app shell and lazy assets)
  - Custom `src/service-worker.js` extends Angular SW and handles push display/click
  - `PushNotificationService` uses `SwPush` to request subscriptions (set your VAPID key and backend endpoint)

- UI/UX
  - Bootstrap 5 + Bootstrap Icons
  - RTL HTML and Noto Sans Arabic
  - Modular pages with standalone components and shared UI (`shared/header`)

---

## Technology and Packages

- Angular Core: `@angular/*` 19.x
- HTTP: `HttpClient`
- Routing: `@angular/router`
- PWA: `@angular/service-worker`, custom `service-worker.js`
- State/Async: `rxjs`
- UI: `bootstrap@5.3`, `bootstrap-icons`
- Analytics: `powerbi-client`
- Uploads: `dropzone` (ready for file uploads, optional integration)

---

## Environments

- `src/environments/environment.ts`
  - `apiBaseUrl: 'https://localhost:5001/api'`
- `src/environments/environment.prod.ts`
  - `apiBaseUrl: 'https://internal-api.theminaretagency.com/api'`

Switching occurs automatically via Angular’s build configurations.

---

## Security and Access

- JWT stored in `localStorage` with exp validation
- `noauthGuard` and `authGuard` gate routes and redirect appropriately
- `roleGuard` enforces route `data.roles`:
  - Example:
    ```ts
    {
      path: 'users/add',
      component: AddUserComponent,
      canActivate: [noauthGuard, roleGuard],
      data: { roles: ['Admin', 'AccountManager'] }
    }
    ```

---

## Project Structure

```
src/
  app/
    core/
      guards/                // auth, noauth, role
    model/                   // typed interfaces for API contracts
    pages/                   // feature pages (users, clients, services, tasks, etc.)
    services/                // ApiService and domain-specific services
    shared/                  // shared UI (header)
    app.config.ts            // providers, router, SW registration
    app.routes.ts            // route table
  environments/
    environment.ts
    environment.prod.ts
  index.html                 // RTL, manifests, fonts
  main.ts                    // bootstrap
  service-worker.js          // custom push handler (extends ngsw)
ngsw-config.json             // SW asset caching
angular.json                 // builder configs, assets, styles, scripts
```

---

## 🛠️ CI/CD Workflow (Automatic Deployment)

This project is ready for automated delivery using a standard CI pipeline (e.g., GitHub Actions or Azure DevOps):

- **Triggers**
  - On `push` to `main` or `release/*`
  - On pull requests for validation

- **Jobs**
  - Setup Node.js
  - Install Dependencies via npm ci
  - Build application for production
  - Deploy to VPS

---

<!--
## 📹 Live Demo (Video)

- [Add your demo video link here]

---
-->
## 🖥️ Backend

- Source repo: [MinaretOps -- Backend Repo](https://github.com/abdofathy883/MinaretOps)
- The backend integrates with this frontend via REST endpoints and uses JWT for secure sessions.

---

## 🧑‍💻 Developer

- **Name**: Abdelrahman Fathy
- **Role**: Full-Stack/.NET Engineer
- **About**: I build scalable, maintainable systems using clean architecture, OOP best practices, and reliable integrations that accelerate business outcomes.
- **Contact**: [LinkedIn Account](https://www.linkedin.com/in/abdelrahman-fathy-dev/)

---
