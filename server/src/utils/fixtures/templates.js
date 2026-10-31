/**
 * Quotation Templates Fixture for Brightloop / Odoo Hackathon
 * 
 * Sales reps can select a pre-configured template to immediately populate
 * recurring plan, validity window, payment terms, and product lines with variants.
 * 
 * The Seeder dynamically maps `planName` and `productName` to MongoDB ObjectIds.
 */

module.exports = [
  {
    name: 'Standard Odoo Monthly Offer',
    planName: 'Monthly SMB Starter',
    validityDays: 15,
    paymentTerms: 'Net 15',
    lines: [
      {
        productName: 'Brightloop Enterprise ERP',
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
  },
  {
    name: 'Enterprise 10-Seat Yearly Bundle',
    planName: 'Yearly Enterprise Contract',
    validityDays: 30,
    paymentTerms: 'Immediate Payment',
    lines: [
      {
        productName: 'Brightloop Enterprise ERP',
        variantAttribute: 'Brand',
        variantValue: 'Odoo',
        quantity: 10,
      },
      {
        productName: 'Dedicated Team Seat Pack',
        variantAttribute: 'Tier',
        variantValue: '10-Seat Pack',
        quantity: 1,
      },
      {
        productName: 'Priority 24/7 Support SLA',
        variantAttribute: 'Coverage',
        variantValue: '24/7 Global',
        quantity: 1,
      },
    ],
    isActive: true,
  },
  {
    name: 'Fast-Track Weekly Sprint Pass',
    planName: 'Weekly Sprint Pass',
    validityDays: 7,
    paymentTerms: 'Immediate Payment',
    lines: [
      {
        productName: 'Brightloop Enterprise ERP',
        variantAttribute: 'Brand',
        variantValue: 'Brightloop Native',
        quantity: 1,
      },
    ],
    isActive: true,
  },
];
