require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const QuotationTemplate = require('../models/QuotationTemplate');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

const runSeed = async () => {
    try {
        await connectDB();
        console.log('Clearing old Catalog & Subscription data...');
        await Promise.all([
            Product.deleteMany({}),
            Plan.deleteMany({}),
            QuotationTemplate.deleteMany({}),
            Subscription.deleteMany({}),
            Invoice.deleteMany({}),
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

        // 5. Give the demo customer a small, realistic portal to explore.
        const demoCustomer = await User.findOne({ email: 'customer@brightloop.dev' }).lean();
        if (demoCustomer) {
            const demoLine = {
                productId: products[0]._id,
                productName: products[0].name,
                variantAttribute: 'Brand',
                variantValue: 'Odoo',
                quantity: 2,
                unitPrice: 2560,
                taxRate: 18,
                taxAmount: 921.6,
                amount: 6041.6,
            };

            const demoSubs = await Subscription.insertMany([
                {
                    subNumber: 'SUB-DEMO-001',
                    customerId: demoCustomer._id,
                    planId: plans[0]._id,
                    status: 'ACTIVE',
                    isPaused: false,
                    startDate: now,
                    nextBillingDate: now,
                    paymentTerms: 'Net 15',
                    lines: [demoLine],
                    subtotal: 5120,
                    taxTotal: 921.6,
                    grandTotal: 6041.6,
                },
                {
                    subNumber: 'SUB-DEMO-002',
                    customerId: demoCustomer._id,
                    planId: plans[0]._id,
                    status: 'ACTIVE',
                    isPaused: true,
                    startDate: now,
                    nextBillingDate: now,
                    paymentTerms: 'Net 15',
                    lines: [demoLine],
                    subtotal: 5120,
                    taxTotal: 921.6,
                    grandTotal: 6041.6,
                },
                {
                    subNumber: 'SUB-DEMO-003',
                    customerId: demoCustomer._id,
                    planId: plans[1]._id,
                    status: 'CLOSED',
                    isPaused: false,
                    startDate: now,
                    expiryDate: now,
                    nextBillingDate: null,
                    paymentTerms: 'Immediate Payment',
                    lines: [demoLine],
                    subtotal: 5120,
                    taxTotal: 921.6,
                    grandTotal: 6041.6,
                },
            ]);

            const activeDemoSub = demoSubs[0];
            await Invoice.insertMany([
                {
                    invNumber: 'INV-DEMO-001',
                    subscriptionId: activeDemoSub._id,
                    customerId: demoCustomer._id,
                    billingCycleKey: `demo-${activeDemoSub._id}-current`,
                    status: 'CONFIRMED',
                    issueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
                    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                    lines: [demoLine],
                    subtotal: 5120,
                    taxTotal: 921.6,
                    grandTotal: 6041.6,
                    paidAmount: 0,
                    balanceDue: 6041.6,
                },
                {
                    invNumber: 'INV-DEMO-002',
                    subscriptionId: activeDemoSub._id,
                    customerId: demoCustomer._id,
                    billingCycleKey: `demo-${activeDemoSub._id}-previous`,
                    status: 'PAID',
                    issueDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
                    dueDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
                    lines: [demoLine],
                    subtotal: 5120,
                    taxTotal: 921.6,
                    grandTotal: 6041.6,
                    paidAmount: 6041.6,
                    balanceDue: 0,
                },
            ]);
            console.log('✅ Demo portal data: 3 subscriptions and 2 invoices for customer@brightloop.dev');
        } else {
            console.log('⚠️ Run npm run seed:auth first to create the demo customer portal data.');
        }

        console.log('✅ Seed complete: 3 Products, 4 Plans, 2 Templates, and 3,000 Subscriptions created!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

runSeed();