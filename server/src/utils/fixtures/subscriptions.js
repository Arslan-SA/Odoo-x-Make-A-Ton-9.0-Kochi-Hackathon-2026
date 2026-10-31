/**
 * Subscriptions & Benchmark Generator Fixture for Brightloop / Odoo Hackathon
 */

const demoSubscriptions = [
  {
    subNumber: 'SUB-DEMO-001',
    customerEmail: 'customer@brightloop.com',
    planName: 'Monthly SMB Starter',
    status: 'ACTIVE',
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
        status: 'CONFIRMED',
        daysAgoIssued: 10,
        daysUntilDue: 5,
        paidAmount: 0,
      },
      {
        invNumber: 'INV-DEMO-002',
        status: 'PAID',
        daysAgoIssued: 40,
        daysUntilDue: -25,
        paidAmount: 6041.6,
      },
    ],
  },
  {
    subNumber: 'SUB-DEMO-002',
    customerEmail: 'customer@brightloop.com',
    planName: 'Monthly SMB Starter',
    status: 'ACTIVE',
    isPaused: true, // Demonstrates pause/resume capability in UI
    paymentTerms: 'Net 15',
    lineItems: [
      {
        productName: 'Brightloop Enterprise ERP',
        variantAttribute: 'Brand',
        variantValue: 'Odoo',
        quantity: 1,
      },
      {
        productName: 'Cloud Analytics Add-on',
        variantAttribute: 'Tier',
        variantValue: 'Pro',
        quantity: 1,
      },
    ],
    invoices: [],
  },
  {
    subNumber: 'SUB-DEMO-003',
    customerEmail: 'customer@brightloop.com',
    planName: 'Yearly Enterprise Contract',
    status: 'CLOSED',
    isPaused: false,
    paymentTerms: 'Immediate Payment',
    lineItems: [
      {
        productName: 'Dedicated Team Seat Pack',
        variantAttribute: 'Tier',
        variantValue: '5-Seat Pack',
        quantity: 2,
      },
    ],
    invoices: [],
  },
];

const benchmarkConfig = {
  defaultCount: 3000,
  quickCount: 60,
  statuses: ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'],
  paymentTerms: ['Immediate Payment', 'Net 15', 'Net 30'],
};

module.exports = {
  demoSubscriptions,
  benchmarkConfig,
};
