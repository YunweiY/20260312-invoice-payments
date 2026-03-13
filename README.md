# 20260312-invoice-payments

## Contents

1. [Project Overview](#1-project-overview)
2. [Setup Guide](#2-setup-guide)
3. [Project Structure](#3-project-structure)
4. [Database Overview](#4-database-overview)
5. [API Overview](#5-api-overview)
6. [Key Design Decisions](#6-key-design-decisions)
7. [Testing](#7-testing)
8. [Possible Improvements](#8-possible-improvements)

## 1. Project Overview

`invoice-payments` is a full-stack demo project for managing customers, invoices, and payments.
It models a realistic payment flow where invoices can be paid in multiple installments and automatically transition to `PAID` once fully settled.

### What this project does

- Browse customers, invoices, and payments in table views with pagination, and filter invoices by status and issue date.
- View detailed customer and invoice records, along with their related entries.
- Create new invoices.
- Pay invoices with full or partial payments.

### Tech stack

- **Frontend:** React + Vite, React Router, Axios, Tailwind CSS (with shadcn/ui components).
- **Backend:** Node.js + Express, Prisma ORM, PostgreSQL.
- **Quality:** ESLint + Prettier; backend tests powered by Jest + Supertest.

### API documentation notes

Swagger docs are generated from OpenAPI annotations in route files and mounted at `/api/docs`. To keep the docs maintainable, schemas are split by domain under `server/src/docs/schemas`:

- `common.schemas.js`: shared response envelopes (`SuccessResponse`, `ErrorResponse`)
- `customer.schemas.js`: customer and customer-invoice response schemas
- `invoice.schemas.js`: invoice list/detail/request schemas (including `_count.payments` and `remaining_amount`)
- `payment.schemas.js`: payment list response schemas

## 2. Setup Guide

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL (local or remote)

### 1) Configure environment variables

Create the environment files from the examples:

- `server/.env` (based on `server/.env.example`)
- `client/.env` (based on `client/.env.example`)

Minimum required values:

- `server/.env`
  - `PORT=5000`
  - `NODE_ENV=development`
  - `DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public`
- `client/.env`
  - `VITE_API_BASE_URL=http://localhost:5000/api`

### 2) Install dependencies

From the project root:

```bash
cd server && npm install
cd ../client && npm install
```

### 3) Prepare the database (server)

From the `server` directory:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4) Start backend and frontend

Open two terminals:

```bash
# Terminal 1
cd server
npm run dev
```

```bash
# Terminal 2
cd client
npm run dev
```

### 5) Verify the setup

- Backend health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- API docs (Swagger UI): [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- Frontend app: the URL shown by Vite (usually [http://localhost:5173](http://localhost:5173))

## 3. Project Structure

```text
.
├─ client/
│  ├─ src/
│  │  ├─ api/                # HTTP client and API wrappers
│  │  ├─ components/         # Reusable UI and feature components
│  │  ├─ layout/             # App-level layout components
│  │  ├─ pages/              # Route pages (customers, invoices, payments)
│  │  ├─ router/             # Router configuration
│  │  └─ lib/                # Shared frontend helpers
│  └─ package.json
├─ server/
│  ├─ prisma/
│  │  ├─ schema.prisma       # DB schema and relations
│  │  ├─ migrations/         # Prisma migration history
│  │  └─ seed/               # Seed scripts
│  ├─ src/
│  │  ├─ config/             # Env and Prisma setup
│  │  ├─ controllers/        # Request/response handling
│  │  ├─ services/           # Business logic layer
│  │  ├─ models/             # Data access layer
│  │  ├─ routes/             # API routes
│  │  ├─ middlewares/        # Error handling and middleware
│  │  ├─ errors/             # Custom error classes
│  │  └─ utils/              # Validation and utility functions
│  ├─ tests/                 # Integration tests
│  └─ package.json
└─ README.md
```

### Structure notes

- The frontend uses a feature-oriented page structure with reusable UI components.
- The backend follows a layered architecture: `routes -> controllers -> services -> models`.
- Prisma manages the database schema, migration history, and seed data under `server/prisma`.

## 4. Database Overview

The backend uses PostgreSQL with Prisma models defined in `server/prisma/schema.prisma`.
The data model is centered around customers, invoices, and payments.

### Entity relationships

- One `Customer` can have many `Invoices`.
- One `Invoice` belongs to one `Customer`.
- One `Invoice` can have many `Payments`.
- One `Payment` belongs to one `Invoice`.

### Core tables

- `Customers`
  - `id` (UUID, primary key)
  - `name` (string)
- `Invoices`
  - `id` (UUID, primary key)
  - `customer_id` (UUID, foreign key -> `Customers.id`)
  - `amount` (decimal)
  - `currency` (string)
  - `issued_at` (datetime)
  - `due_at` (datetime)
  - `status` (enum: `DRAFT`, `PENDING`, `PAID`, `VOID`)
- `Payments`
  - `id` (UUID, primary key)
  - `invoice_id` (UUID, foreign key -> `Invoices.id`)
  - `amount` (decimal)
  - `paid_at` (datetime)

### Data integrity and behavior

- UUIDs are used as primary keys across all core entities.
- Foreign keys enforce valid customer-invoice and invoice-payment relationships.
- Monetary fields use decimal types to avoid floating-point precision issues.
- Invoice settlement status is derived by business logic: invoices move to `PAID` when total payments reach the invoice amount.

### Indexes for paginated list queries

To support paginated list endpoints efficiently, the database includes additional indexes for common filter/sort patterns. These indexes also align with the default API sort orders documented in the API section.

- `Invoices(customer_id, issued_at DESC)` for customer-scoped invoice lists.
- `Invoices(status, issued_at DESC)` for status-filtered invoice lists.
- `Invoices(issued_at DESC)` for global invoice list ordering.
- `Payments(invoice_id, paid_at DESC)` for invoice payment history lookups.
- `Payments(paid_at DESC)` for global payment list ordering.

## 5. API Overview

### Base URL

- Local base URL: `http://localhost:5000/api`

### Endpoints

Default sorting order in list APIs:

- Customers: `name ASC`
- Invoices: `issued_at DESC`
- Payments: `paid_at DESC`

#### Health

- `GET /health`
  - Description: Health check endpoint for backend availability.

#### Customers

- `GET /customers`
  - Description: List all customers.
- `GET /customers/:id/invoices`
  - Description: List invoices for one customer.
  - Query params:
    - `status` (optional): `DRAFT | PENDING | PAID | VOID`
    - `from` (optional): ISO 8601 date
    - `to` (optional): ISO 8601 date

#### Invoices

- `GET /invoices`
  - Description: List invoices.
  - Query params:
    - `status` (optional): `DRAFT | PENDING | PAID | VOID`
    - `from` (optional): ISO 8601 date
    - `to` (optional): ISO 8601 date
- `GET /invoices/:id`
  - Description: Get one invoice with related customer/payments and computed `remaining_amount`.
- `POST /invoices`
  - Description: Create a new invoice.
  - Request body:
    - `customer_id` (required, UUID)
    - `amount` (required, decimal string, up to 2 decimal places)
    - `currency` (required, ISO 4217 currency code)
    - `due_at` (required, ISO 8601 date)
- `POST /invoices/:id/payments`
  - Description: Pay an invoice (full or partial amount).
  - Request body:
    - `amount` (required, decimal string, up to 2 decimal places)
- `PATCH /invoices/:id/status`
  - Description: Transition invoice status based on lifecycle rules.
  - Request body:
    - `status` (required): `PENDING | VOID`

#### Payments

- `GET /payments`
  - Description: List all payments.

### Response format

- Success:
  - `status: "success"`
  - `data: ...`
- Error:
  - `status: "error"`
  - `error: { code, message }`

## 6. Key Design Decisions

### 1) JavaScript-first stack for faster delivery

The project intentionally uses a JavaScript-based stack end-to-end (`React + Node.js + Express`) to reduce context switching and speed up iteration. The backend uses modern ESM modules so import/export patterns stay consistent with the frontend ecosystem. Prisma uses `prisma-client-js`, which fits smoothly into the current JavaScript + ESM setup and helps keep delivery speed high.

### 2) Layered backend architecture with clear responsibilities

The backend follows `routes -> controllers -> services -> models` to keep responsibilities explicit and easy to maintain.

- `routes` register endpoint mappings and define how requests enter the system.
- `controllers` parse `req.params`, `req.query`, and `req.body`, apply request-level validation (required fields, type checks, and basic range/format checks), and delegate to services.
- `services` enforce business rules and domain behavior (for example, payment eligibility and invoice settlement logic).
- `models` handle data access only (how to query and update the database).

### 3) Centralized error handling and standardized error payloads

A custom `AppError` abstraction is used to unify error shape, error codes, and HTTP status handling. A global error handler then converts operational errors into consistent API responses with `status`, `error.code`, and `error.message`.

### 4) Invoice lifecycle design

New invoices are created as `DRAFT`, and lifecycle changes are controlled by `PATCH /invoices/:id/status` plus payment settlement rules. Payments are only accepted while an invoice is `PENDING`, and `PAID`/`VOID` are terminal statuses kept for historical records.

All status transitions:

- `DRAFT -> PENDING`
- `DRAFT -> VOID`
- `PENDING -> VOID` (only when the invoice has no payments)
- `PENDING -> PAID` (when `sum(payments) === invoice.amount`)
- `PAID ->` no further transitions (terminal)
- `VOID ->` no further transitions (terminal)

### 5) Concurrency control for payment and status updates

To avoid race conditions (for example, two payments arriving at the same time or a payment and status update competing on the same invoice), critical write paths run inside `prisma.$transaction(...)` and acquire a row-level lock with a Prisma raw query:

- `SELECT * FROM "Invoices" WHERE id = ${id} FOR UPDATE`

This design ensures only one transaction can mutate a target invoice at a time, so invariant checks (status, remaining amount, overpayment prevention) are evaluated against a consistent state before writes are committed.

### 6) Modular OpenAPI documentation design

API documentation is implemented with `swagger-jsdoc` + `swagger-ui-express` and exposed at `/api/docs`.
Instead of keeping all schemas in one file, OpenAPI schemas are organized by domain (`common`, `customer`, `invoice`, `payment`) and composed in `server/src/docs/schemas/index.js`.
This keeps route annotations concise, makes contracts easier to evolve, and ensures non-trivial response fields (for example, `_count.payments` in invoice list and `remaining_amount` in invoice detail) are explicitly documented for frontend/backend alignment.

### 7) Currency precision strategy (2-decimal contract)

Amounts are validated as decimal strings (up to 2 decimal places) at API boundaries, while backend calculations use `Prisma.Decimal` for comparisons and arithmetic to avoid floating-point precision loss. This design mirrors real-world currency handling and prevents subtle overpay/comparison bugs caused by binary floating-point math.

### 8) Single-currency payment scope

The current flow assumes invoice currency and payment currency are the same. This keeps the first version simpler and reduces complexity in settlement and reconciliation logic.

## 7. Testing

### Test stack

- Backend tests use `Jest` + `Supertest`.
- Test commands (from `server`):
  - `npm test`
  - `npm run test:watch`
  - `npm run test:coverage`

### Current coverage focus

- Invoice APIs:
  - list invoices with filters (`status`, `from`, `to`)
  - get invoice details
  - create invoice
  - update invoice status
  - pay invoice (including partial payment and overpay protection)
- Customer APIs:
  - list invoices by customer with status/date filters
- Error paths:
  - invalid UUIDs, invalid dates/statuses, missing/invalid amount inputs, and not-found scenarios

### Testing notes

- **Tests require a running PostgreSQL instance and seeded data before execution.**
- Integration tests hit the Express app directly and verify response payload shape and status codes.
- Tests rely on seeded database data; run setup and seed steps in `server/prisma` before executing the test suite.
- API contracts are documented in Swagger and can be validated manually against integration test responses.

## 8. Possible Improvements

### 1) Code cleanup: validation and controller boilerplate

Validation is currently spread across many `if` checks in controllers and services, and controller handlers still repeat `try/catch` boilerplate. A code-cleanup pass can introduce validation middleware/schema at route boundaries (for example, Zod/Joi/Yup) and an async wrapper utility for controllers, reducing duplication and making request-handling code easier to maintain.

### 2) Align table naming conventions

Current Prisma models/tables use plural names (`Customers`, `Invoices`, `Payments`). A future migration to singular names could better match common ORM conventions and improve readability.

### 3) Add stronger type safety where it matters

The JavaScript-first stack keeps development lightweight and fast, but transaction-heavy and money-sensitive domains benefit from stronger typing. Introducing TypeScript (or another strongly typed approach) can reduce runtime mistakes and improve refactoring safety.

### 4) Split large pages into smaller feature components

Some pages are currently component-heavy (for example, table pages). Splitting them into smaller feature components can improve maintainability and testability; where prop passing becomes noisy, lightweight shared state (context or co-located hooks) can be introduced selectively.

### 5) Externalize currency metadata

Supported currencies are currently hardcoded in the frontend. A better approach is to maintain a currency reference table (or config endpoint) and load options dynamically. If cross-currency payments are introduced later, the same domain can be extended with an exchange-rate table (source, target, rate, effective time), payment fields for original and settled currency/amount, and a persisted FX-rate snapshot at payment time for auditability.
