require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const QuotationTemplate = require('../models/QuotationTemplate');
const Subscription = require('../models/Subscription');

const runSeed = async () => {
    try {
        await connectDB();
        console.log('Clearing old Catalog & Subscription data...');
        await Promise.all([
            Product.deleteMany({}),
            Plan.deleteMany({}),
            QuotationTemplate.deleteMany({}),
            Subscription.deleteMany({}),
        ]);

        // 1. Create Products with Variants (including Odoo +560 rule from PDF)
        const products = await Product.insertMany([
            {
                name: 'Brightloop Enterprise ERP',
                type: 'SERVICE',
                salesPrice: 2000,
                costPrice: 600,
                notes: 'Core business management suite with brand variants',
                variants: [
                    { attribute: 'Brand', value: 'Odoo', priceModifier: 560 },
                    { attribute: 'Brand', value: 'Brightloop Native', priceModifier: 0 },
                ],
            },
            {
                name: 'Cloud Analytics Add-on',
                type: 'ADDON',
                salesPrice: 500,
                costPrice: 120,
                notes: 'Switchable real-time finance reporting add-on',
                variants: [
                    { attribute: 'Tier', value: 'Pro', priceModifier: 300 },
                    { attribute: 'Tier', value: 'Standard', priceModifier: 0 },
                ],
            },
            {
                name: 'Dedicated Team Seat Pack',
                type: 'SERVICE',
                salesPrice: 800,
                costPrice: 200,
                notes: 'Per-seat license for growing internal teams',
                variants: [],
            },
        ]);

        // 2. Create Recurring Plans (Daily, Weekly, Monthly, Yearly + Admin flags)
        const plans = await Plan.insertMany([
            {
                name: 'Monthly SMB Starter',
                price: 2000,
                billingCycle: 'MONTHLY',
                minQty: 1,
                autoClose: false,
                canCloseEarly: true,
                canPause: true,
                canRenew: true,
            },
            {
                name: 'Yearly Enterprise Contract',
                price: 20000,
                billingCycle: 'YEARLY',
                minQty: 5,
                autoClose: false,
                canCloseEarly: false, // Locked annual contract
                canPause: false,
                canRenew: true,
            },
            {
                name: 'Weekly Sprint Pass',
                price: 600,
                billingCycle: 'WEEKLY',
                minQty: 1,
                autoClose: true, // Closes automatically at expiry
                canCloseEarly: true,
                canPause: false,
                canRenew: false,
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
            },
        ]);

        // 3. Create Quotation Templates for Sales Reps
        await QuotationTemplate.insertMany([
            {
                name: 'Standard Odoo Monthly Offer',
                planId: plans[0]._id,
                validityDays: 15,
                paymentTerms: 'Net 15',
                lines: [
                    {
                        productId: products[0]._id,
                        variantAttribute: 'Brand',
                        variantValue: 'Odoo',
                        quantity: 2,
                    },
                    {
                        productId: products[1]._id,
                        variantAttribute: 'Tier',
                        variantValue: 'Standard',
                        quantity: 1,
                    },
                ],
            },
            {
                name: 'Enterprise 10-Seat Yearly Bundle',
                planId: plans[1]._id,
                validityDays: 30,
                paymentTerms: 'Immediate Payment',
                lines: [
                    {
                        productId: products[0]._id,
                        variantAttribute: 'Brand',
                        variantValue: 'Odoo',
                        quantity: 10,
                    },
                ],
            },
        ]);

        // 4. Bulk Seed 3,000 Subscriptions to prove <2s load time SLA
        const dummyCustomerId = new mongoose.Types.ObjectId();
        const statuses = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];
        const bulkSubs = [];
        const now = new Date();

        for (let i = 1; i <= 3000; i++) {
            const status = statuses[i % statuses.length];
            const plan = plans[i % plans.length];
            const qty = i % 2 === 0 ? 5 : 2;
            const unitPrice = 2560; // 2000 base + 560 Odoo variant
            const subtotal = qty * unitPrice;
            const taxAmount = Number((subtotal * 0.18).toFixed(2));
            const grandTotal = subtotal + taxAmount;

            bulkSubs.push({
                subNumber: `SUB-${String(i).padStart(5, '0')}`,
                customerId: dummyCustomerId,
                planId: plan._id,
                status,
                isPaused: false,
                startDate: status === 'ACTIVE' ? now : null,
                nextBillingDate: status === 'ACTIVE' ? now : null, // Ready for Member 3's Billing Day run!
                paymentTerms: 'Net 15',
                lines: [
                    {
                        productId: products[0]._id,
                        productName: products[0].name,
                        variantAttribute: 'Brand',
                        variantValue: 'Odoo',
                        quantity: qty,
                        unitPrice,
                        taxRate: 18,
                        taxAmount,
                        amount: grandTotal,
                    },
                ],
                subtotal,
                taxTotal: taxAmount,
                grandTotal,
            });
        }

        await Subscription.insertMany(bulkSubs, { ordered: false });
        console.log('✅ Seed complete: 3 Products, 4 Plans, 2 Templates, and 3,000 Subscriptions created!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

runSeed();