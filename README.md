# Brightloop Subscription Management System

Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026.

A MERN subscription operations platform: catalog, recurring plans, quotations, subscriptions, billing, role-based workspaces and a customer self-service portal.

## Stack

- **Client:** React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios
- **Server:** Node.js, Express 5, MongoDB/Mongoose, JWT, bcrypt, Nodemailer

## Run locally

```bash
# API
cd server
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm install
npm run seed:auth           # demo admin, staff and customer accounts
npm run seed:catalog        # catalog + 3,000 subscriptions + demo portal data
npm run dev                 # http://localhost:5000

# Client
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

## Demo accounts

Created by `npm run seed:auth`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@brightloop.dev` | `Admin@12345` |
| Staff | `staff@brightloop.dev` | `Staff@12345` |
| Customer | `customer@brightloop.dev` | `Customer@12345` |

The demo customer owns three seeded subscriptions (active, paused, closed) and two invoices, so the portal has data immediately after `seed:catalog`.

The first account registered on a fresh database automatically becomes an admin; later sign-ups are customers.

## Roles and permissions

| Capability | Admin | Staff | Customer |
| --- | --- | --- | --- |
| Admin settings, staff accounts, tax/discount rules | ✅ | — | — |
| Catalog, subscriptions and billing operations | ✅ | ✅ | — |
| Own subscriptions and invoices, pause/resume/renew/close | — | — | ✅ |

Password policy for sign-up, staff creation and password reset: at least 8 characters, with an uppercase letter, a lowercase letter and a special character.

## Auth API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account and return a JWT |
| `POST` | `/api/auth/login` | Public | Sign in and return a JWT |
| `POST` | `/api/auth/forgot-password` | Public | Send a password-reset link |
| `POST` | `/api/auth/reset-password` | Public | Set a new password with a valid token |
| `GET` | `/api/auth/me` | Bearer token | Return the current user |
| `POST` | `/api/auth/logout` | Bearer token | Client-side token discard |

Send the token as `Authorization: Bearer <token>`. Use `protect` and `authorize('admin', 'staff')` from `server/src/middlewares/auth.middleware.js` to guard routes.

### Password-reset email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM` in `server/.env` to send real email. Without SMTP, the server logs the reset link and, outside production, returns `devResetUrl` in the forgot-password response so the flow can be demoed locally.

## Internal API

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` / `POST` | `/api/users/staff` | Admin |
| `PATCH` | `/api/users/staff/:id/status` | Admin |
| `POST` | `/api/billing/taxes` | Admin |
| `GET` | `/api/billing/taxes` | Admin, Staff |
| `POST` | `/api/billing/discounts` | Admin |
| `GET` | `/api/billing/discounts` | Admin, Staff |
| `*` | `/api/catalog`, `/api/subscriptions` | Admin, Staff |
| `*` | `/api/billing` (invoices, payments, dashboard) | Admin, Staff |

## Customer portal API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/portal/overview` | Own subscriptions, invoices and summary |
| `PATCH` | `/api/portal/subscriptions/:id/lifecycle` | Own subscription: `PAUSE`, `RESUME`, `RENEW`, `CLOSE` |

The controller always filters by `customerId: req.user._id`, so one customer cannot read or change another customer's data.

## App routes

| Route | Access |
| --- | --- |
| `/` | Public landing page |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public |
| `/portal` | Customer only |
| `/internal` | Admin and Staff |
| `/settings` | Admin only |

## Tests

```bash
cd server
npm test
```

Covers the password policy and the role-authorization middleware.
