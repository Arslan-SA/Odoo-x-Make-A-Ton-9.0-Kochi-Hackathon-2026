/**
 * Plans Fixture for Brightloop / Odoo Hackathon
 * 
 * Each recurring plan defines:
 * - name: String (required)
 * - price: Number (base plan subscription rate)
 * - billingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' (strictly enforced enum)
 * - minQty: Number (minimum quantity required to purchase this plan, default 1)
 * - autoClose: Boolean (true = system closes subscription at term end automatically)
 * - canCloseEarly: Boolean (true = customer or staff can cancel before term ends)
 * - canPause: Boolean (true = customer or staff can temporarily pause billing)
 * - canRenew: Boolean (true = subscription can be renewed for another cycle)
 * - isActive: Boolean (default: true)
 */

module.exports = [
  {
    name: 'Monthly SMB Starter',
    price: 2000,
    billingCycle: 'MONTHLY',
    minQty: 1,
    autoClose: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    isActive: true,
  },
  {
    name: 'Yearly Enterprise Contract',
    price: 20000,
    billingCycle: 'YEARLY',
    minQty: 5,
    autoClose: false,
    canCloseEarly: false, // Locked annual enterprise agreement
    canPause: false,
    canRenew: true,
    isActive: true,
  },
  {
    name: 'Weekly Sprint Pass',
    price: 600,
    billingCycle: 'WEEKLY',
    minQty: 1,
    autoClose: true,     // Automatically closes at end of weekly term
    canCloseEarly: true,
    canPause: false,
    canRenew: false,
    isActive: true,
  },
  {
    name: 'Daily Sandbox Trial',
    price: 150,
    billingCycle: 'DAILY',
    minQty: 1,
    autoClose: true,
    canCloseEarly: true,
    canPause: false,
    canRenew: true,
    isActive: true,
  },
  {
    name: 'Quarterly Growth Tier',
    price: 5500,
    billingCycle: 'MONTHLY', // Treated as 3-month recurring cadence
    minQty: 2,
    autoClose: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    isActive: true,
  },
];
