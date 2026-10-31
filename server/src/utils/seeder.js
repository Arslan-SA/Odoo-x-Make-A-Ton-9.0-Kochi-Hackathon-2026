require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const TaxRule = require('../models/TaxRule');
const DiscountRule = require('../models/DiscountRule');
const QuotationTemplate = require('../models/QuotationTemplate');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// Fixtures
const productFixtures = require('./fixtures/products');
const planFixtures = require('./fixtures/plans');
const { taxRules: taxRuleFixtures, discountRules: discountRuleFixtures } = require('./fixtures/rules');
const templateFixtures = require('./fixtures/templates');
const { demoSubscriptions, benchmarkConfig } = require('./fixtures/subscriptions');

const DEMO_USERS = [
  {
    name: 'Brightloop Admin',
    email: 'admin@brightloop.com',
    password: 'Admin@12345',
    role: 'admin',
    company: 'Brightloop',
  },
  {
    name: 'Demo Customer',
    email: 'customer@brightloop.com',
    password: 'Customer@12345',
    role: 'customer',
    company: 'Acme Retail',
  },
  {
    name: 'Demo Staff',
    email: 'staff@brightloop.com',
    password: 'Staff@12345',
    role: 'staff',
    company: 'Brightloop',
  },
];

/**
 * Ensure default demo users exist
 */
async function ensureAuthUsers(log = console.log) {
  let createdCount = 0;
  for (const demo of DEMO_USERS) {
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = new User(demo);
      await user.save();
      createdCount++;
    }
  }
  if (createdCount > 0) {
    log(`👤 Seeded ${createdCount} auth demo accounts`);
  }
}

/**
 * Main Seeding Pipeline
 */
async function seedAll(options = {}) {
  const isCli = options.isCli ?? false;
  const clear = options.clear ?? true;
  const quick = options.quick ?? false;
  const benchmarkCount = options.count ?? (quick ? benchmarkConfig.quickCount : benchmarkConfig.defaultCount);
  const log = options.quiet ? () => {} : console.log;

  await connectDB();

  log('🚀 Starting Brightloop Database Seeder...');

  // 1. Ensure Auth Users exist
  await ensureAuthUsers(log);
  const demoCustomer = await User.findOne({ email: 'customer@brightloop.com' }).lean();
  const fallbackCustomerId = demoCustomer?._id || new mongoose.Types.ObjectId();

  // 2. Clear Collections if requested
  if (clear) {
    log('🧹 Clearing existing catalog, rules, and subscription records...');
    await Promise.all([
      Product.deleteMany({}),
      Plan.deleteMany({}),
      TaxRule.deleteMany({}),
      DiscountRule.deleteMany({}),
      QuotationTemplate.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
    ]);
  }

  // 3. Insert Tax Rules & Discount Rules
  const insertedTaxRules = await TaxRule.insertMany(taxRuleFixtures);
  const defaultTaxRule = insertedTaxRules.find((t) => t.isDefault) || insertedTaxRules[0] || { ratePercent: 18 };
  log(`⚖️  Seeded ${insertedTaxRules.length} Tax Rules (Default: ${defaultTaxRule.name} - ${defaultTaxRule.ratePercent}%)`);

  // 4. Insert Products
  const insertedProducts = await Product.insertMany(productFixtures);
  const productMap = {};
  insertedProducts.forEach((p) => {
    productMap[p.name] = p;
  });
  log(`📦 Seeded ${insertedProducts.length} Products (with dynamic variants, e.g. +560 for Odoo brand)`);

  // 5. Insert Discount Rules (linking target products if specified)
  const preparedDiscounts = discountRuleFixtures.map((rule) => {
    const copy = { ...rule };
    if (copy.targetProductNames && Array.isArray(copy.targetProductNames)) {
      copy.targetProductIds = copy.targetProductNames
        .map((name) => productMap[name]?._id)
        .filter(Boolean);
      delete copy.targetProductNames;
    }
    return copy;
  });
  const insertedDiscounts = await DiscountRule.insertMany(preparedDiscounts);
  log(`🏷️  Seeded ${insertedDiscounts.length} Discount Rules`);

  // 6. Insert Plans
  const insertedPlans = await Plan.insertMany(planFixtures);
  const planMap = {};
  insertedPlans.forEach((p) => {
    planMap[p.name] = p;
  });
  log(`📅 Seeded ${insertedPlans.length} Recurring Plans (Daily, Weekly, Monthly, Yearly)`);

  // 7. Insert Quotation Templates
  const preparedTemplates = templateFixtures
    .map((tmpl) => {
      const plan = planMap[tmpl.planName];
      if (!plan) return null;

      const lines = tmpl.lines
        .map((line) => {
          const product = productMap[line.productName];
          if (!product) return null;
          return {
            productId: product._id,
            variantAttribute: line.variantAttribute || null,
            variantValue: line.variantValue || null,
            quantity: line.quantity || 1,
          };
        })
        .filter(Boolean);

      return {
        name: tmpl.name,
        planId: plan._id,
        validityDays: tmpl.validityDays || 15,
        paymentTerms: tmpl.paymentTerms || 'Net 15',
        lines,
        isActive: tmpl.isActive !== false,
      };
    })
    .filter(Boolean);

  const insertedTemplates = await QuotationTemplate.insertMany(preparedTemplates);
  log(`📝 Seeded ${insertedTemplates.length} Quotation Templates`);

  // 8. Helper to calculate line amounts
  const calculateLineItem = (product, variantAttr, variantVal, quantity = 1, taxRate = defaultTaxRule.ratePercent) => {
    let unitPrice = product.salesPrice;
    if (variantVal && product.variants?.length > 0) {
      const v = product.variants.find((item) => item.value === variantVal);
      if (v) unitPrice += v.priceModifier;
    }
    const subtotal = unitPrice * quantity;
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const amount = Number((subtotal + taxAmount).toFixed(2));
    return {
      productId: product._id,
      productName: product.name,
      variantAttribute: variantAttr || null,
      variantValue: variantVal || null,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      amount,
    };
  };

  // 9. Seed Demo Customer Subscriptions & Invoices (for realistic customer portal testing)
  const now = new Date();
  let demoInvoicesCount = 0;
  for (const demo of demoSubscriptions) {
    const plan = planMap[demo.planName] || insertedPlans[0];
    const lines = demo.lineItems.map((item) => {
      const prod = productMap[item.productName] || insertedProducts[0];
      return calculateLineItem(prod, item.variantAttribute, item.variantValue, item.quantity);
    });

    const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
    const taxTotal = lines.reduce((acc, l) => acc + l.taxAmount, 0);
    const grandTotal = Number((subtotal + taxTotal).toFixed(2));

    const subscription = await Subscription.create({
      subNumber: demo.subNumber,
      customerId: fallbackCustomerId,
      planId: plan._id,
      status: demo.status,
      isPaused: demo.isPaused || false,
      startDate: demo.status === 'ACTIVE' ? now : null,
      expiryDate: demo.status === 'CLOSED' ? now : null,
      nextBillingDate: demo.status === 'ACTIVE' ? now : null,
      paymentTerms: demo.paymentTerms || 'Net 15',
      lines,
      subtotal,
      taxTotal,
      grandTotal,
    });

    if (demo.invoices && demo.invoices.length > 0) {
      for (const inv of demo.invoices) {
        const issueDate = new Date(now.getTime() - (inv.daysAgoIssued || 0) * 86400000);
        const dueDate = new Date(now.getTime() + (inv.daysUntilDue || 0) * 86400000);
        const invoiceLines = lines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          variantValue: l.variantValue,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          taxAmount: l.taxAmount,
          discountAmount: 0,
          amount: l.amount,
        }));

        const paidAmount = inv.paidAmount || (inv.status === 'PAID' ? grandTotal : 0);
        const balanceDue = Number(Math.max(0, grandTotal - paidAmount).toFixed(2));

        const createdInvoice = await Invoice.create({
          invNumber: inv.invNumber,
          subscriptionId: subscription._id,
          customerId: fallbackCustomerId,
          billingCycleKey: `cycle-${subscription._id}-${inv.invNumber}`,
          status: inv.status,
          issueDate,
          dueDate,
          lines: invoiceLines,
          subtotal,
          taxTotal,
          grandTotal,
          paidAmount,
          balanceDue,
        });
        demoInvoicesCount++;

        if (paidAmount > 0) {
          await Payment.create({
            invoiceId: createdInvoice._id,
            customerId: fallbackCustomerId,
            amount: paidAmount,
            method: 'BANK_TRANSFER',
            paymentDate: issueDate,
            note: 'Initial settlement via NEFT/RTGS',
          });
        }
      }
    }
  }
  log(`👤 Seeded ${demoSubscriptions.length} Demo Subscriptions & ${demoInvoicesCount} Demo Invoices for customer portal`);

  // 10. Generate Benchmark Subscriptions
  if (benchmarkCount > 0) {
    log(`⚡ Generating ${benchmarkCount} benchmark subscriptions for <2s speed SLA test...`);
    const bulkSubs = [];
    const baseProduct = insertedProducts[0];
    const statuses = benchmarkConfig.statuses;

    for (let i = 1; i <= benchmarkCount; i++) {
      const status = statuses[i % statuses.length];
      const plan = insertedPlans[i % insertedPlans.length];
      const qty = i % 2 === 0 ? 5 : 2;
      const unitPrice = baseProduct.salesPrice + 560; // Base + Odoo variant
      const subtotal = qty * unitPrice;
      const taxAmount = Number(((subtotal * defaultTaxRule.ratePercent) / 100).toFixed(2));
      const grandTotal = Number((subtotal + taxAmount).toFixed(2));

      bulkSubs.push({
        subNumber: `SUB-${String(i).padStart(5, '0')}`,
        customerId: fallbackCustomerId,
        planId: plan._id,
        status,
        isPaused: false,
        startDate: status === 'ACTIVE' ? now : null,
        nextBillingDate: status === 'ACTIVE' ? now : null,
        paymentTerms: benchmarkConfig.paymentTerms[i % benchmarkConfig.paymentTerms.length],
        lines: [
          {
            productId: baseProduct._id,
            productName: baseProduct.name,
            variantAttribute: 'Brand',
            variantValue: 'Odoo',
            quantity: qty,
            unitPrice,
            taxRate: defaultTaxRule.ratePercent,
            taxAmount,
            amount: grandTotal,
          },
        ],
        subtotal,
        taxTotal: taxAmount,
        grandTotal,
      });
    }

    // Insert in chunks of 1000 for maximum memory safety and performance
    const chunkSize = 1000;
    for (let i = 0; i < bulkSubs.length; i += chunkSize) {
      const chunk = bulkSubs.slice(i, i + chunkSize);
      await Subscription.insertMany(chunk, { ordered: false });
    }
    log(`✅ Successfully seeded ${benchmarkCount} benchmark subscriptions!`);
  }

  log('🎉 Database Seeding Complete! All collections populated and indexed.');
  return {
    products: insertedProducts.length,
    plans: insertedPlans.length,
    taxRules: insertedTaxRules.length,
    discountRules: insertedDiscounts.length,
    templates: insertedTemplates.length,
    demoSubscriptions: demoSubscriptions.length,
    benchmarkSubscriptions: benchmarkCount,
  };
}

// Allow direct CLI execution: node src/utils/seeder.js [--quick] [--no-clear]
if (require.main === module) {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick');
  const clear = !args.includes('--no-clear');

  seedAll({ isCli: true, quick, clear })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed with error:', err);
      process.exit(1);
    });
}

module.exports = {
  seedAll,
  ensureAuthUsers,
};
