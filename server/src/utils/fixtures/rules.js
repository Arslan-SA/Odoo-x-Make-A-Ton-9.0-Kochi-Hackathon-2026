/**
 * Tax & Discount Rules Fixture for Brightloop / Odoo Hackathon
 */

const taxRules = [
  {
    name: 'GST 18%',
    ratePercent: 18,
    isDefault: true,
    isActive: true,
  },
  {
    name: 'Reduced GST 5%',
    ratePercent: 5,
    isDefault: false,
    isActive: true,
  },
  {
    name: 'Zero Tax (Export / Exempt)',
    ratePercent: 0,
    isDefault: false,
    isActive: true,
  },
];

const discountRules = [
  {
    name: 'Welcome Starter Discount',
    code: 'WELCOME10',
    type: 'PERCENT',
    value: 10, // 10% off
    minPurchaseAmount: 1000,
    minQuantity: 1,
    maxUses: 500,
    usedCount: 12,
    scope: 'SUBSCRIPTION',
    isActive: true,
  },
  {
    name: 'Flat Enterprise Credit',
    code: 'ENTERPRISE500',
    type: 'FIXED',
    value: 500, // ₹500 flat deduction
    minPurchaseAmount: 5000,
    minQuantity: 1,
    maxUses: null, // Unlimited
    usedCount: 3,
    scope: 'SUBSCRIPTION',
    isActive: true,
  },
  {
    name: 'Odoo Hackathon Promo',
    code: 'ODOOHACK20',
    type: 'PERCENT',
    value: 20, // 20% off
    minPurchaseAmount: 2000,
    minQuantity: 1,
    maxUses: 100,
    usedCount: 45,
    scope: 'SUBSCRIPTION',
    isActive: true,
  },
  {
    name: 'Analytics Add-on Bundle Deal',
    code: 'ANALYTICS50',
    type: 'PERCENT',
    value: 50, // 50% off target add-on product
    minPurchaseAmount: 0,
    minQuantity: 1,
    maxUses: 200,
    usedCount: 8,
    scope: 'PRODUCT',
    targetProductNames: ['Cloud Analytics Add-on'],
    isActive: true,
  },
];

module.exports = {
  taxRules,
  discountRules,
};
