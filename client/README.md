# Brightloop Frontend Client

React 19 + Vite 8 + Tailwind CSS 4 frontend application for the Brightloop Subscription Management & Recurring Billing platform.

## Features

- **Role-Based Views:** Dedicated dashboards and interfaces for Admin, Staff, and Customer users.
- **Operations Workflow:** Product catalog with variant pricing, recurring plan setup, quotation templates, subscription lifecycle actions, invoice tracking, and payment recording.
- **Finance Dashboard:** Aggregated revenue KPIs, MRR metrics, and overdue invoice tracking.
- **Customer Portal:** Customer self-service dashboard to manage active subscriptions, pause/resume, and inspect billing history.
- **Modern UI:** "Clean Indigo Ledger" design system with responsive layouts, glassmorphic navigation, and light/dark theme toggling.

## Scripts

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Lint codebase
npm run lint
```

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the backend API URL:

```env
VITE_API_URL=http://localhost:5000/api
```
