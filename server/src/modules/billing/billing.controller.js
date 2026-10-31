const Invoice = require('../../models/Invoice');
const Payment = require('../../models/Payment');
const Subscription = require('../../models/Subscription');
const TaxRule = require('../../models/TaxRule');
const DiscountRule = require('../../models/DiscountRule');
const { evaluateAndApplyDiscount, calculateDueDate } = require('./billing.service');
const { calculateNextBillingDate } = require('../subscriptions/subscription.service');

// ================= 1. TAX & DISCOUNT RULES (ADMIN) =================
exports.createTaxRule = async (req, res) => {
    try {
        const tax = await TaxRule.create(req.body);
        res.status(201).json({ success: true, data: tax });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getTaxRules = async (_req, res) => {
    try {
        const taxes = await TaxRule.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: taxes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDiscountRule = async (req, res) => {
    try {
        const discount = await DiscountRule.create(req.body);
        res.status(201).json({ success: true, data: discount });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getDiscountRules = async (req, res) => {
    try {
        const discounts = await DiscountRule.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: discounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= 2. BILLING DAY ENGINE (IDEMPOTENT) =================
exports.runBillingEngine = async (req, res) => {
    try {
        const billingDate = req.body.billingDate ? new Date(req.body.billingDate) : new Date();
        const defaultTax = await TaxRule.findOne({ isActive: true, isDefault: true }).lean();
        const fallbackTaxRate = defaultTax ? defaultTax.ratePercent : 18;

        // Fetch all ACTIVE, unpaused subscriptions due on or before billingDate
        const dueSubscriptions = await Subscription.find({
            status: 'ACTIVE',
            isPaused: false,
            nextBillingDate: { $lte: billingDate },
        }).populate('planId');

        let createdCount = 0;
        let skippedCount = 0;
        let autoClosedCount = 0;

        for (const sub of dueSubscriptions) {
            // Check if subscription has passed expiryDate and plan has autoClose = true
            if (sub.expiryDate && billingDate >= new Date(sub.expiryDate) && sub.planId?.autoClose) {
                sub.status = 'CLOSED';
                sub.nextBillingDate = null;
                await sub.save();
                autoClosedCount++;
                continue;
            }

            const cycleDateStr = new Date(sub.nextBillingDate).toISOString().split('T')[0];
            const billingCycleKey = `${sub._id}_${cycleDateStr}`;

            // Idempotency check: Never bill twice for the same cycle
            const existingInvoice = await Invoice.findOne({ billingCycleKey }).lean();
            if (existingInvoice) {
                skippedCount++;
                continue;
            }

            // Calculate subtotal, discounts, and taxes
            const subtotal = sub.subtotal || 0;
            const { discountTotal } = await evaluateAndApplyDiscount(
                sub.discountId,
                sub.lines,
                subtotal,
                billingDate
            );

            const taxableBase = Math.max(0, subtotal - discountTotal);
            const effectiveTaxRate = sub.lines[0]?.taxRate ?? fallbackTaxRate;
            const taxTotal = Number(((taxableBase * effectiveTaxRate) / 100).toFixed(2));
            const grandTotal = Number((taxableBase + taxTotal).toFixed(2));

            const invCount = await Invoice.countDocuments();
            const invNumber = `INV-${String(invCount + 1).padStart(5, '0')}-${Math.floor(100 + Math.random() * 900)}`;

            await Invoice.create({
                invNumber,
                subscriptionId: sub._id,
                customerId: sub.customerId,
                billingCycleKey,
                status: req.body.autoConfirm ? 'CONFIRMED' : 'DRAFT',
                issueDate: billingDate,
                dueDate: calculateDueDate(billingDate, sub.paymentTerms),
                lines: sub.lines,
                subtotal,
                discountTotal,
                taxTotal,
                grandTotal,
                paidAmount: 0,
                balanceDue: grandTotal,
            });

            // Advance subscription to next billing cycle
            sub.nextBillingDate = calculateNextBillingDate(
                sub.nextBillingDate,
                sub.planId?.billingCycle || 'MONTHLY'
            );
            await sub.save();
            createdCount++;
        }

        res.json({
            success: true,
            summary: {
                processed: dueSubscriptions.length,
                invoicesCreated: createdCount,
                skippedDuplicates: skippedCount,
                autoClosedSubscriptions: autoClosedCount,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= 3. INVOICES MANAGEMENT =================
exports.getInvoices = async (req, res) => {
    try {
        const { status, customerId, overdueOnly, page = 1, limit = 25 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (customerId) filter.customerId = customerId;
        if (overdueOnly === 'true') {
            filter.status = 'CONFIRMED';
            filter.dueDate = { $lt: new Date() };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [invoices, total] = await Promise.all([
            Invoice.find(filter)
                .populate('customerId', 'name email')
                .populate('subscriptionId', 'subNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Invoice.countDocuments(filter),
        ]);

        // Attach dynamic isOverdue flag for UI badges
        const now = new Date();
        const enriched = invoices.map((inv) => ({
            ...inv,
            isOverdue: inv.status === 'CONFIRMED' && new Date(inv.dueDate) < now,
        }));

        res.json({
            success: true,
            data: enriched,
            meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('customerId', 'name email')
            .populate('subscriptionId')
            .lean();
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 }).lean();
        res.json({ success: true, data: { ...invoice, payments } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Move Invoice: DRAFT -> CONFIRMED -> PAID (or CANCELLED)
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        invoice.status = status;
        if (status === 'PAID') {
            invoice.paidAmount = invoice.grandTotal;
            invoice.balanceDue = 0;
        }
        await invoice.save();
        res.json({ success: true, data: invoice });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ================= 4. PAYMENTS & RECONCILIATION =================
exports.recordPayment = async (req, res) => {
    try {
        const { invoiceId, amount, method, paymentDate, note } = req.body;
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        if (invoice.status === 'PAID') {
            return res.status(400).json({ success: false, message: 'Invoice is already fully paid' });
        }

        const payment = await Payment.create({
            invoiceId: invoice._id,
            customerId: invoice.customerId,
            amount: Number(amount),
            method: method || 'BANK_TRANSFER',
            paymentDate: paymentDate || new Date(),
            note: note || '',
        });

        invoice.paidAmount = Number((invoice.paidAmount + Number(amount)).toFixed(2));
        invoice.balanceDue = Math.max(0, Number((invoice.grandTotal - invoice.paidAmount).toFixed(2)));

        // Auto-transition to PAID when balance reaches 0
        if (invoice.balanceDue === 0) {
            invoice.status = 'PAID';
        } else if (invoice.status === 'DRAFT') {
            invoice.status = 'CONFIRMED';
        }

        await invoice.save();
        res.status(201).json({ success: true, data: { payment, invoice } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('invoiceId', 'invNumber grandTotal status')
            .populate('customerId', 'name email')
            .sort({ paymentDate: -1 })
            .limit(100)
            .lean();
        res.json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= 5. FINANCE LEAD DASHBOARD (<2s SLA) =================
exports.getFinanceDashboard = async (req, res) => {
    try {
        const now = new Date();

        const [subStats, invoiceStats, overdueInvoices] = await Promise.all([
            // 1. Subscription counts by status
            Subscription.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, mrr: { $sum: '$grandTotal' } } },
            ]),

            // 2. Revenue collected vs owed & overdue counts in 1 fast query
            Invoice.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCollectedRevenue: { $sum: '$paidAmount' },
                        totalOutstandingOwed: {
                            $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, '$balanceDue', 0] },
                        },
                        overdueCount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ['$status', 'CONFIRMED'] }, { $lt: ['$dueDate', now] }] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        overdueAmount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ['$status', 'CONFIRMED'] }, { $lt: ['$dueDate', now] }] },
                                    '$balanceDue',
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),

            // 3. Top 15 Overdue Invoices to chase immediately
            Invoice.find({ status: 'CONFIRMED', dueDate: { $lt: now } })
                .populate('customerId', 'name email')
                .populate('subscriptionId', 'subNumber')
                .sort({ dueDate: 1 })
                .limit(15)
                .lean(),
        ]);

        const activeSubObj = subStats.find((s) => s._id === 'ACTIVE') || { count: 0, mrr: 0 };
        const fin = invoiceStats[0] || {
            totalCollectedRevenue: 0,
            totalOutstandingOwed: 0,
            overdueCount: 0,
            overdueAmount: 0,
        };

        res.json({
            success: true,
            data: {
                kpis: {
                    activeSubscriptions: activeSubObj.count,
                    activeRecurringValue: Number(activeSubObj.mrr.toFixed(2)),
                    collectedRevenue: Number(fin.totalCollectedRevenue.toFixed(2)),
                    outstandingOwed: Number(fin.totalOutstandingOwed.toFixed(2)),
                    overdueInvoicesCount: fin.overdueCount,
                    overdueAmount: Number(fin.overdueAmount.toFixed(2)),
                },
                subscriptionsByStatus: subStats,
                overdueWatchlist: overdueInvoices,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};