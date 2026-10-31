# 🚀 Brightloop Database Seeder Guide (For Teammates)

Welcome to the **Brightloop Seeding System**! If you need to add, customize, or update mock data for **Products, Plans, Taxes, Discounts, Quotation Templates, Subscriptions, or Invoices**, everything is modularized so you **do NOT need to write complex MongoDB scripts or handle ObjectIds manually**.

---

## 📁 1. Where to Implement & Edit Data

All seed data lives inside clean JavaScript fixture files in `server/src/utils/fixtures/`:

```text
server/src/utils/
├── fixtures/
│   ├── products.js       👈 Add/edit Products & Variants (e.g. +560 Odoo variant)
│   ├── plans.js          👈 Add/edit Recurring Plans (Daily, Weekly, Monthly, Yearly)
│   ├── rules.js          👈 Add/edit Tax Rules & Discount Promo Codes
│   ├── templates.js      👈 Add/edit Sales Quotation Templates
│   └── subscriptions.js  👈 Add/edit Customer Portal Subscriptions & Invoices
├── seeder.js             👈 Master Seeder Engine (runs relational linking)
├── seedCatalogAndSubs.js 👈 Backwards-compatible alias for npm run seed:catalog
├── seedAuth.js           👈 Seeds Admin, Staff, and Customer user accounts
└── SEEDING_GUIDE.md      👈 This guide!
```

---

## ⚡ 2. How to Run the Seeders

From the `server/` directory, run any of the following commands:

| Command | What it does | Typical Execution Time |
| :--- | :--- | :--- |
| `npm run seed` | Seeds **everything**: Users, Products, Plans, Rules, Templates, and **3,000 benchmark subscriptions** | ~3 - 4 seconds |
| `npm run seed:quick` | Seeds all catalog models + 60 subscriptions (lightweight for fast local testing) | ~1.5 seconds |
| `npm run seed:catalog` | Alias for `npm run seed` | ~3 - 4 seconds |
| `npm run seed:auth` | Seeds default demo users (`admin`, `staff`, `customer`) | ~0.5 seconds |

> **Pro-Tip**: When you start the backend server with `npm start` or `npm run dev`, if the database is empty, it will **auto-seed** catalog & demo records automatically!

---

## 📋 3. Data Formats & Schemas (Copy-Paste Ready)

### A. Products (`server/src/utils/fixtures/products.js`)

Each product is a plain JavaScript object:

```javascript
{
  name: 'Brightloop Enterprise ERP',
  type: 'SERVICE', // 'SERVICE' | 'CONSUMABLE' | 'DIGITAL' | 'ADDON'
  salesPrice: 2000,
  costPrice: 600,
  notes: 'Core business management suite with brand variants',
  variants: [
    // 💡 PriceModifier adds to or subtracts from base salesPrice:
    // Base 2000 + 560 = 2560 for Odoo brand
    { attribute: 'Brand', value: 'Odoo', priceModifier: 560 },
    { attribute: 'Brand', value: 'Brightloop Native', priceModifier: 0 },
  ],
  isActive: true,
}
```

#### Field Rules:
- `name`: Must be unique and descriptive.
- `type`: Must be one of `'SERVICE'`, `'CONSUMABLE'`, `'DIGITAL'`, or `'ADDON'`.
- `variants`: Array of objects with `attribute` (e.g. `'Brand'`, `'Tier'`, `'Coverage'`), `value` (e.g. `'Odoo'`, `'Pro'`), and `priceModifier` (number).

---

### B. Plans (`server/src/utils/fixtures/plans.js`)

Recurring subscription plans:

```javascript
{
  name: 'Monthly SMB Starter',
  price: 2000,
  billingCycle: 'MONTHLY', // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  minQty: 1,
  autoClose: false,     // Closes automatically at term end
  canCloseEarly: true,  // Can customer or staff cancel before term end
  canPause: true,       // Can customer pause billing
  canRenew: true,       // Can renew for next term
  isActive: true,
}
```

#### Field Rules:
- `billingCycle`: Must strictly be one of `'DAILY'`, `'WEEKLY'`, `'MONTHLY'`, `'YEARLY'`.
- Boolean flags govern lifecycle actions in the UI (e.g., if `canPause: false`, the Pause button in the portal is disabled).

---

### C. Tax & Discount Rules (`server/src/utils/fixtures/rules.js`)

#### Tax Rules:
```javascript
{
  name: 'GST 18%',
  ratePercent: 18,
  isDefault: true,
  isActive: true,
}
```

#### Discount Rules:
```javascript
{
  name: 'Odoo Hackathon Promo',
  code: 'ODOOHACK20',
  type: 'PERCENT', // 'PERCENT' or 'FIXED'
  value: 20,       // 20% off (or ₹20 if FIXED)
  minPurchaseAmount: 2000,
  minQuantity: 1,
  maxUses: 100,
  usedCount: 0,
  scope: 'SUBSCRIPTION', // 'SUBSCRIPTION' or 'PRODUCT'
  // If scope is 'PRODUCT', specify product names to apply to:
  // targetProductNames: ['Cloud Analytics Add-on'],
  isActive: true,
}
```

---

### D. Quotation Templates (`server/src/utils/fixtures/templates.js`)

Quotation templates allow sales reps to pre-fill an entire quote in one click. **You don't need ObjectIds!** The seeder resolves `planName` and `productName` automatically:

```javascript
{
  name: 'Standard Odoo Monthly Offer',
  planName: 'Monthly SMB Starter', // Matches name in plans.js
  validityDays: 15,
  paymentTerms: 'Net 15', // e.g. 'Immediate Payment', 'Net 15', 'Net 30'
  lines: [
    {
      productName: 'Brightloop Enterprise ERP', // Matches name in products.js
      variantAttribute: 'Brand',
      variantValue: 'Odoo',
      quantity: 2,
    },
    {
      productName: 'Cloud Analytics Add-on',
      variantAttribute: 'Tier',
      variantValue: 'Standard',
      quantity: 1,
    },
  ],
  isActive: true,
}
```

---

### E. Demo Customer Subscriptions & Invoices (`server/src/utils/fixtures/subscriptions.js`)

These power the **Customer Self-Service Portal** when logged in as `customer@brightloop.dev`:

```javascript
{
  subNumber: 'SUB-DEMO-001',
  customerEmail: 'customer@brightloop.dev',
  planName: 'Monthly SMB Starter',
  status: 'ACTIVE', // 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED'
  isPaused: false,
  paymentTerms: 'Net 15',
  lineItems: [
    {
      productName: 'Brightloop Enterprise ERP',
      variantAttribute: 'Brand',
      variantValue: 'Odoo',
      quantity: 2,
    },
  ],
  invoices: [
    {
      invNumber: 'INV-DEMO-001',
      status: 'CONFIRMED', // 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED'
      daysAgoIssued: 10,
      daysUntilDue: 5,
      paidAmount: 0,
    },
  ],
}
```

---

## 🔍 4. How to Verify Seeded Data

After running `npm run seed`:

1. **Check API Health & Data via `curl` or Postman**:
   ```bash
   curl http://localhost:5001/api/catalog/products
   curl http://localhost:5001/api/catalog/plans
   curl http://localhost:5001/api/billing/dashboard
   ```
2. **Log into the Frontend**:
   - URL: `http://localhost:5173/login`
   - **Admin/Staff Workspace**:
     - `admin@brightloop.dev` / `Admin@12345`
     - `staff@brightloop.dev` / `Staff@12345`
   - **Customer Self-Service Portal**:
     - `customer@brightloop.dev` / `Customer@12345`

---

## 🛠️ 5. What the Seeder Engine Handles For You
- **Auto-Calculates Line Math**: Calculates `unitPrice` (salesPrice + variant priceModifier), `subtotal`, `taxAmount` (via default 18% GST), and `grandTotal`.
- **Relational Mapping**: Maps strings (`planName`, `productName`, `customerEmail`) into correct MongoDB ObjectIds.
- **Prevents Duplicate Billing**: Assigns unique `billingCycleKey` index values to seeded invoices.
- **High-Performance Benchmark**: Inserts 3,000 subscriptions in chunked batches so the Finance Dashboard and Subscriptions table load in **under 200 milliseconds**!
