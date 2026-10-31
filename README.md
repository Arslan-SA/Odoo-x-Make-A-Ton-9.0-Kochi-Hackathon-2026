# Brightloop Subscription Management & Recurring Billing System

A MERN subscription operations and automated recurring billing platform built for the Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026.

## Overview

Growing recurring revenue businesses often battle fragmented spreadsheets, missed renewal cycles, delayed manual invoicing, error-prone payment matching, and blind spots in cash flow reporting. 

Brightloop replaces these manual bottlenecks with an automated operations engine: catalog management with product variants, reusable quotation templates, strict subscription state management, an idempotent billing engine with tax/discount calculation, payment reconciliation, and a dedicated customer self-service portal.

## Demo

- **Live Deployment:** Currently self-hosted / run locally (see Getting Started below).
- **Demo Video:** Link available on the hackathon submission portal / upon evaluator request.
- **Screenshots:** Interface walkthrough available in the 2-Minute Judge Walkthrough section below.

## Key Features

- **RBAC with 3 Roles:** Strict separation of Admin, Staff, and Customer privileges.
- **Product Variants & Recurring Plans:** Base product pricing with dynamic attribute modifiers and configurable recurring cycles (Daily, Weekly, Monthly, Yearly).
- **Quotation Templates:** Pre-configured product bundles and payment terms for rapid sales quotation creation.
- **5-Stage Subscription State Machine:** Controlled lifecycle transitions (`DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `CLOSED`) with pause and resume controls.
- **Idempotent Billing Engine:** Automated invoice generation keyed by `billingCycleKey` to guarantee zero duplicate billing on identical cycles.
- **Taxes & Discount Rules:** Configurable percentage/fixed discounts, target-product scoping, and system-wide default tax rules.
- **Payment Reconciliation & Overdue Tracking:** Partial and full payment settlement against invoices with automated status updates (`DRAFT` → `CONFIRMED` → `PAID`).
- **Finance Analytics Dashboard:** Optimized MongoDB aggregation pipeline delivering active subscriptions, MRR/ARR, collection rates, and an overdue invoice watchlist.
- **Customer Self-Service Portal:** Customer-scoped portal to view subscriptions, inspect invoices, and manage subscription lifecycle actions.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide Icons |
| **Backend** | Node.js, Express 5, Mongoose 9, JWT, bcryptjs, Nodemailer, Resend |
| **Database** | MongoDB (indexed for compound lifecycle and financial aggregation queries) |
| **Testing** | Node Test Runner (`node --test`) |

## Architecture

```text
.
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI widgets & protected route guards
│   │   ├── context/            # Global Auth and Theme state management
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register (OTP), Forgot/Reset Password
│   │   │   ├── catalog/        # Product variants and plan management
│   │   │   ├── finance/        # Financial analytics reports
│   │   │   ├── internal/       # Operations dashboard
│   │   │   ├── invoices/       # Invoicing ledger and status progression
│   │   │   ├── payments/       # Payment recording and reconciliation
│   │   │   ├── portal/         # Customer self-service portal
│   │   │   ├── settings/       # Workspace settings, staff & tax/discount rules
│   │   │   └── subscriptions/  # Subscription creation and pipeline management
│   │   └── services/           # Axios API client
│   ├── .env.example
│   └── package.json
├── server/                     # Backend REST API
│   ├── src/
│   │   ├── config/             # Database connection and auth secrets
│   │   ├── middlewares/        # JWT verification and RBAC authorization
│   │   ├── models/             # Mongoose schemas (User, Product, Plan, etc.)
│   │   ├── modules/
│   │   │   ├── auth/           # Registration, login, OTP, password recovery
│   │   │   ├── billing/        # Billing engine, invoices, payments, dashboard
│   │   │   ├── catalog/        # Products, plans, quotation templates
│   │   │   ├── portal/         # Customer self-service endpoints
│   │   │   ├── subscriptions/  # Subscription CRUD and lifecycle handlers
│   │   │   └── users/          # Staff management and customer listing
│   │   └── utils/              # Seed scripts, fixtures, validators, mailers
│   ├── test/                   # Native test suites
│   ├── .env.example
│   └── package.json
├── DESIGN.md                   # Visual design contract and tokens
├── LICENSE                     # MIT License
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ installed
- MongoDB instance running locally (`mongodb://localhost:27017/brightloop`) or MongoDB Atlas connection URI

### 1. Clone Repository

```bash
git clone https://github.com/Arslan-SA/Odoo-x-Make-A-Ton-9.0-Kochi-Hackathon-2026.git
cd Odoo-x-Make-A-Ton-9.0-Kochi-Hackathon-2026
```

### 2. Configure Environment Files

Generate a secure 32-byte JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set up the backend environment:

```bash
cd server
cp .env.example .env
```

Ensure `server/.env` contains your MongoDB URI and the generated `JWT_SECRET`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/brightloop
JWT_SECRET=your_generated_secret_key_here
JWT_EXPIRES_IN=7d
RESEND_API_KEY=
RESEND_FROM=Brightloop <onboarding@resend.dev>
```

Set up the frontend environment:

```bash
cd ../client
cp .env.example .env
```

Ensure `client/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Server Setup & Database Seeding

Run the following commands in order from the `server/` directory:

```bash
cd ../server
npm install
npm run seed:auth      # Seeds default Admin, Staff, and Customer accounts
npm run seed:catalog   # Seeds products, variants, plans, templates, and 3,000 benchmark records
npm run dev            # Starts API server on http://localhost:5000
```

*(Note: The server also auto-seeds initial demo records on startup if an empty database is detected).*

### 4. Client Setup

In a separate terminal, run from the `client/` directory:

```bash
cd client
npm install
npm run dev            # Starts client on http://localhost:5173
```

## Demo Accounts

Seeded by `npm run seed:auth`:

| Role | Email | Password | Access Scope |
| --- | --- | --- | --- |
| **Admin** | `admin@brightloop.com` | `Admin@12345` | Full system access: staff management, tax/discount rules, catalog, operations |
| **Staff** | `staff@brightloop.com` | `Staff@12345` | Catalog viewing, quotation & subscription management, billing operations |
| **Customer** | `customer@brightloop.com` | `Customer@12345` | Customer self-service portal: view own subscriptions, invoices, lifecycle actions |

*Note: The demo customer account owns 3 seeded subscriptions (Active, Paused, Closed) and 2 invoices (Confirmed, Paid).*

## Roles and Permissions

| Capability | Admin | Staff | Customer |
| --- | :---: | :---: | :---: |
| Staff Account Provisioning & Status Toggle | ✅ | — | — |
| Create & Manage Tax Rules & Discount Rules | ✅ | — | — |
| Create & Update Products and Recurring Plans | ✅ | — | — |
| View Catalog Products, Plans & Templates | ✅ | ✅ | — |
| Create Quotations & Manage Subscriptions | ✅ | ✅ | — |
| Trigger Automated Billing Runs (`/api/billing/run`) | ✅ | ✅ | — |
| Update Invoice Statuses & Record Payments | ✅ | ✅ | — |
| View Financial Analytics & Overdue Watchlist | ✅ | ✅ | — |
| View Own Subscriptions & Invoices in Portal | — | — | ✅ |
| Execute Self-Service Actions (Pause / Resume / Renew) | — | — | ✅ |

**Password Policy:** Minimum 9 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character.

## API Reference

### Authentication API (`/api/auth`)

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register new user account; sends verification OTP |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token (requires verified email) |
| `POST` | `/api/auth/send-otp` | Public | Request a 6-digit email verification code |
| `POST` | `/api/auth/verify-otp` | Public | Validate 6-digit code and activate user account |
| `POST` | `/api/auth/forgot-password` | Public | Dispatch password reset email link |
| `POST` | `/api/auth/reset-password` | Public | Reset account password with valid token |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user details |
| `POST` | `/api/auth/logout` | Authenticated | Client-side session termination |

### Internal Workspace API (`/api/users` & `/api/catalog`)

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/users/customers` | Admin, Staff | Retrieve customer list for subscription assignment |
| `GET` | `/api/users/staff` | Admin | List all staff members |
| `POST` | `/api/users/staff` | Admin | Provision a new staff user |
| `PATCH` | `/api/users/staff/:id/status` | Admin | Activate or deactivate staff member |
| `GET` | `/api/catalog/products` | Admin, Staff | List catalog products and attribute variants |
| `POST` | `/api/catalog/products` | Admin | Create product with variant price modifiers |
| `PATCH` | `/api/catalog/products/:id` | Admin | Update product details and pricing |
| `GET` | `/api/catalog/plans` | Admin, Staff | List recurring plan intervals and auto-close flags |
| `POST` | `/api/catalog/plans` | Admin | Create new recurring plan |
| `PATCH` | `/api/catalog/plans/:id` | Admin | Modify recurring plan parameters |
| `GET` | `/api/catalog/templates` | Admin, Staff | List quotation templates |
| `POST` | `/api/catalog/templates` | Admin | Create quotation template with prefilled lines |

### Subscriptions API (`/api/subscriptions`)

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/subscriptions` | Admin, Staff | List subscriptions with status and plan filters |
| `POST` | `/api/subscriptions` | Admin, Staff | Create subscription or draft quotation |
| `GET` | `/api/subscriptions/:id` | Admin, Staff | Fetch subscription detail and associated line items |
| `PATCH` | `/api/subscriptions/:id` | Admin, Staff | Update line items, terms, or discounts |
| `PATCH` | `/api/subscriptions/:id/status` | Admin, Staff | Advance state machine (`DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `CLOSED`) |
| `PATCH` | `/api/subscriptions/:id/lifecycle` | Admin, Staff | Execute operational actions (`PAUSE`, `RESUME`, `RENEW`, `CLOSE`) |

### Billing & Invoicing API (`/api/billing`)

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/billing/run` | Admin, Staff | Execute recurring billing engine; generates due invoices with idempotency check |
| `GET` | `/api/billing/invoices` | Admin, Staff | List invoices with status, overdue filters, and pagination |
| `GET` | `/api/billing/invoices/:id` | Admin, Staff | Fetch invoice details with tax/discount calculation and payment history |
| `PATCH` | `/api/billing/invoices/:id/status` | Admin, Staff | Transition invoice state (`DRAFT` → `CONFIRMED` → `PAID` / `CANCELLED`) |
| `POST` | `/api/billing/payments` | Admin, Staff | Record payment and auto-update invoice balance / status |
| `GET` | `/api/billing/payments` | Admin, Staff | Retrieve payment transaction history |
| `GET` | `/api/billing/taxes` | Admin, Staff | Retrieve active tax rules |
| `POST` | `/api/billing/taxes` | Admin | Create tax rule and assign default tax rate |
| `GET` | `/api/billing/discounts` | Admin, Staff | Retrieve discount rules |
| `POST` | `/api/billing/discounts` | Admin | Create fixed/percentage discount rule |
| `GET` | `/api/billing/dashboard` | Admin, Staff | Fetch finance KPIs, MRR, collection stats, and overdue watchlist |

### Customer Portal API (`/api/portal`)

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/portal/overview` | Customer | Retrieve customer's own subscriptions, invoices, and summaries |
| `PATCH` | `/api/portal/subscriptions/:id/lifecycle` | Customer | Execute self-service action (`PAUSE`, `RESUME`, `RENEW`, `CLOSE`) on owned subscription |

## App Routes

| Route | Allowed Roles | Description |
| --- | --- | --- |
| `/` | Public | Marketing landing page with feature breakdown |
| `/login` | Public | User authentication screen |
| `/signup`, `/register` | Public | User registration screen with 6-digit verification modal |
| `/forgot-password` | Public | Password recovery request form |
| `/reset-password` | Public | Password reset entry with token validation |
| `/portal` | Customer | Self-service portal for subscriptions and invoices |
| `/internal`, `/dashboard` | Admin, Staff | Main operational dashboard and system summary |
| `/subscriptions` | Admin, Staff | Subscription pipeline and quotation generation |
| `/catalog` | Admin, Staff | Product variants, billing plans, and quotation templates |
| `/invoices` | Admin, Staff | Invoice ledger, filtering, and status advancement |
| `/payments` | Admin, Staff | Payment collection, recording, and reconciliation |
| `/finance-reports` | Admin, Staff | Financial analytics, MRR breakdown, and overdue watchlist |
| `/settings` | Admin | Workspace configuration, staff provisioning, tax & discount management |

## 2-Minute Judge Walkthrough

Follow these 5 steps to verify the end-to-end functionality of Brightloop:

1. **Explore the Catalog & Product Variants:**
   - Sign in as `admin@brightloop.com` (`Admin@12345`).
   - Navigate to `/catalog` to view products, variant price modifiers (e.g., brand additions), and recurring plans (Daily, Weekly, Monthly, Yearly).
2. **Generate a Quotation & Activate Subscription:**
   - Navigate to `/subscriptions` and click **New Subscription**.
   - Select a customer (`Demo Customer`), load a quotation template, verify line calculations and taxes, and click **Create**.
   - Advance the state from `DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE`.
3. **Trigger the Idempotent Billing Engine:**
   - Navigate to `/invoices` and trigger the billing run (or send `POST /api/billing/run`).
   - Observe newly generated invoices for due active subscriptions.
   - Trigger the billing run a second time: verify `skippedDuplicates` matches the processed count, confirming zero duplicate billing.
4. **Record Payment & Auto-Reconciliation:**
   - Open an invoice in `CONFIRMED` status.
   - Click **Record Payment**, enter the balance due amount, and submit.
   - Verify the invoice balance drops to `0` and status automatically transitions to `PAID`.
5. **Inspect High-Scale Finance Dashboard & Customer Portal:**
   - Navigate to `/finance-reports` to inspect aggregated ARR/MRR, collection metrics, and the overdue watchlist across the 3,000 seeded subscriptions.
   - Sign out and sign in as `customer@brightloop.com` (`Customer@12345`).
   - Navigate to `/portal` to inspect customer self-service isolation and test pausing/resuming an owned subscription.

## Tests

Run the test suite using Node's native test runner:

```bash
cd server
npm test
```

The test suite executes 21 automated tests covering:
- **Email Validation:** RFC-compliant formatting, domain/TLD checks, space rejection, length boundaries.
- **OTP Verification Flow:** 6-digit code format, 10-minute expiry windows, and fallback development logging.
- **Password Policy:** Minimum 9-character length, uppercase, lowercase, and special character enforcement.
- **RBAC Authorization:** Strict route guarding for Admin-only settings, Staff operations access, and Customer isolation.

## Team

| Name | GitHub |
| --- | --- |
| Arslan SA (Team Leader) | [@Arslan-SA](https://github.com/Arslan-SA) |
| Ayush Shaurya | [@ayushshaury](https://github.com/ayushshaury) |
| Muhammed Nazal K | [@Zallu4435](https://github.com/Zallu4435) |
| Rishabh Kumar | [@rizzabhdwaj](https://github.com/rizzabhdwaj) |

## License

This project is licensed under the [MIT License](LICENSE).
