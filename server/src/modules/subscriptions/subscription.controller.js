const Subscription = require('../../models/Subscription');
const Plan = require('../../models/Plan');
const QuotationTemplate = require('../../models/QuotationTemplate');
const {
    calculateNextBillingDate,
    buildSubscriptionLines,
    generateSubNumber,
    VALID_TRANSITIONS,
} = require('./subscription.service');

// 1. Create Subscription (Supports Quotation Template auto-fill)
exports.createSubscription = async (req, res) => {
    try {
        let { customerId, planId, templateId, lines, paymentTerms, expiryDate, discountId, defaultTaxRate } = req.body;

        // If sales rep selected a Quotation Template, auto-load plan, validity & lines
        if (templateId) {
            const template = await QuotationTemplate.findById(templateId).lean();
            if (!template) return res.status(404).json({ success: false, message: 'Quotation template not found' });

            planId = planId || template.planId;
            paymentTerms = paymentTerms || template.paymentTerms;
            if (!lines || lines.length === 0) {
                lines = template.lines;
            }
            if (!expiryDate && template.validityDays) {
                const exp = new Date();
                exp.setDate(exp.getDate() + template.validityDays);
                expiryDate = exp;
            }
        }

        const plan = await Plan.findById(planId).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        // Validate minimum quantity from Plan
        const totalQty = (lines || []).reduce((sum, l) => sum + Number(l.quantity || 1), 0);
        if (totalQty < plan.minQty) {
            return res.status(400).json({
                success: false,
                message: `Plan "${plan.name}" requires a minimum total quantity of ${plan.minQty}`,
            });
        }

        const calculated = await buildSubscriptionLines(lines, defaultTaxRate);
        const subNumber = await generateSubNumber();

        const subscription = await Subscription.create({
            subNumber,
            customerId,
            planId,
            templateId: templateId || null,
            discountId: discountId || null,
            status: 'DRAFT',
            paymentTerms: paymentTerms || 'Immediate Payment',
            expiryDate: expiryDate || null,
            lines: calculated.lines,
            subtotal: calculated.subtotal,
            taxTotal: calculated.taxTotal,
            grandTotal: calculated.grandTotal,
        });

        res.status(201).json({ success: true, data: subscription });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 2. Get Paginated Subscriptions (<2s SLA optimized with .lean() and indexes)
exports.getSubscriptions = async (req, res) => {
    try {
        const { status, customerId, planId, search, page = 1, limit = 25 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (customerId) filter.customerId = customerId;
        if (planId) filter.planId = planId;
        if (search) filter.subNumber = { $regex: search, $options: 'i' };

        const skip = (Number(page) - 1) * Number(limit);

        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .populate('customerId', 'name email')
                .populate(
                    'planId',
                    'name billingCycle price minQty autoClose canCloseEarly canPause canRenew isActive'
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Subscription.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: subscriptions,
            meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Get Single Subscription Details
exports.getSubscriptionById = async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id)
            .populate('customerId', 'name email')
            .populate('planId')
            .populate('templateId')
            .lean();

        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. Transition State: DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED
exports.transitionStatus = async (req, res) => {
    try {
        const { targetStatus } = req.body;
        const sub = await Subscription.findById(req.params.id).populate('planId');
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

        const allowedNext = VALID_TRANSITIONS[sub.status] || [];
        if (!allowedNext.includes(targetStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid state transition from ${sub.status} to ${targetStatus}`,
            });
        }

        // Check if closing early is permitted by Plan rules
        if (targetStatus === 'CLOSED' && sub.status === 'ACTIVE') {
            const now = new Date();
            const isBeforeExpiry = !sub.expiryDate || now < new Date(sub.expiryDate);
            if (isBeforeExpiry && sub.planId && !sub.planId.canCloseEarly) {
                return res.status(403).json({
                    success: false,
                    message: `Plan "${sub.planId.name}" does not allow closing early before expiry date.`,
                });
            }
            sub.nextBillingDate = null;
        }

        // When moving to ACTIVE, set startDate and initial nextBillingDate
        if (targetStatus === 'ACTIVE') {
            const now = new Date();
            sub.startDate = sub.startDate || now;
            sub.nextBillingDate = now; // Due immediately on activation or next billing run
            sub.isPaused = false;
        }

        sub.status = targetStatus;
        await sub.save();

        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 5. Lifecycle Actions: PAUSE, RESUME, RENEW (Enforces Plan Booleans)
exports.handleLifecycleAction = async (req, res) => {
    try {
        const { action } = req.body; // 'PAUSE' | 'RESUME' | 'RENEW'
        const sub = await Subscription.findById(req.params.id).populate('planId');
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

        const plan = sub.planId;

        if (action === 'PAUSE') {
            if (!plan.canPause) {
                return res.status(403).json({ success: false, message: 'This plan cannot be paused.' });
            }
            if (sub.status !== 'ACTIVE') {
                return res.status(400).json({ success: false, message: 'Only ACTIVE subscriptions can be paused.' });
            }
            sub.isPaused = true;
        } else if (action === 'RESUME') {
            sub.isPaused = false;
            if (!sub.nextBillingDate || sub.nextBillingDate < new Date()) {
                sub.nextBillingDate = calculateNextBillingDate(new Date(), plan.billingCycle);
            }
        } else if (action === 'RENEW') {
            if (!plan.canRenew) {
                return res.status(403).json({ success: false, message: 'This plan is not renewable.' });
            }
            const now = new Date();
            sub.status = 'ACTIVE';
            sub.isPaused = false;
            sub.startDate = now;
            sub.nextBillingDate = calculateNextBillingDate(now, plan.billingCycle);
            if (sub.expiryDate) {
                sub.expiryDate = calculateNextBillingDate(now, plan.billingCycle);
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use PAUSE, RESUME, or RENEW.' });
        }

        await sub.save();
        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 6. Update Subscription Lines / Plan while in DRAFT or QUOTATION
exports.updateSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id);
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

        if (!['DRAFT', 'QUOTATION'].includes(sub.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot edit subscription lines once in ${sub.status} status.`,
            });
        }

        const { lines, paymentTerms, expiryDate, discountId, defaultTaxRate } = req.body;

        if (lines && lines.length > 0) {
            const plan = await Plan.findById(sub.planId).lean();
            const totalQty = lines.reduce((sum, l) => sum + Number(l.quantity || 1), 0);
            if (plan && totalQty < plan.minQty) {
                return res.status(400).json({
                    success: false,
                    message: `Plan "${plan.name}" requires at least ${plan.minQty} quantity.`,
                });
            }

            const calculated = await buildSubscriptionLines(lines, defaultTaxRate);
            sub.lines = calculated.lines;
            sub.subtotal = calculated.subtotal;
            sub.taxTotal = calculated.taxTotal;
            sub.grandTotal = calculated.grandTotal;
        }

        if (paymentTerms) sub.paymentTerms = paymentTerms;
        if (expiryDate) sub.expiryDate = expiryDate;
        if (discountId !== undefined) sub.discountId = discountId;

        await sub.save();
        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};