const Subscription = require('../../models/Subscription');
const Invoice = require('../../models/Invoice');
const { calculateNextBillingDate } = require('../subscriptions/subscription.service');

const PLAN_FIELDS = 'name billingCycle price canPause canRenew canCloseEarly autoClose';
const OPEN_INVOICE_STATUSES = ['DRAFT', 'CONFIRMED'];
const LIFECYCLE_ACTIONS = ['PAUSE', 'RESUME', 'RENEW', 'CLOSE'];

const MESSAGES = {
    PAUSE: 'Subscription paused.',
    RESUME: 'Subscription resumed.',
    RENEW: 'Subscription renewed.',
    CLOSE: 'Subscription closed.',
};

// GET /api/portal/overview
exports.getOverview = async (req, res) => {
    try {
        const [subscriptions, invoices] = await Promise.all([
            Subscription.find({ customerId: req.user._id })
                .populate('planId', PLAN_FIELDS)
                .sort({ createdAt: -1 })
                .lean(),
            Invoice.find({ customerId: req.user._id })
                .sort({ issueDate: -1 })
                .limit(50)
                .lean(),
        ]);

        const openInvoices = invoices.filter(
            (invoice) =>
                OPEN_INVOICE_STATUSES.includes(invoice.status) && invoice.balanceDue > 0
        );

        const summary = {
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter(
                (subscription) => subscription.status === 'ACTIVE' && !subscription.isPaused
            ).length,
            pausedSubscriptions: subscriptions.filter(
                (subscription) => subscription.status === 'ACTIVE' && subscription.isPaused
            ).length,
            openInvoices: openInvoices.length,
            totalDue: Number(
                openInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0).toFixed(2)
            ),
        };

        return res.json({ success: true, data: { summary, subscriptions, invoices } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/portal/subscriptions/:id/lifecycle
// Customers may only act on subscriptions that belong to their own account.
exports.handleLifecycleAction = async (req, res) => {
    try {
        const action = String(req.body.action || '').toUpperCase();
        if (!LIFECYCLE_ACTIONS.includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use PAUSE, RESUME, RENEW, or CLOSE.',
            });
        }

        const subscription = await Subscription.findOne({
            _id: req.params.id,
            customerId: req.user._id,
        }).populate('planId');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        const plan = subscription.planId;
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'The plan for this subscription is no longer available.',
            });
        }

        if (action === 'PAUSE') {
            if (!plan.canPause) {
                return res.status(403).json({
                    success: false,
                    message: 'This plan does not allow pausing.',
                });
            }
            if (subscription.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    message: 'Only active subscriptions can be paused.',
                });
            }
            if (subscription.isPaused) {
                return res.status(400).json({
                    success: false,
                    message: 'This subscription is already paused.',
                });
            }
            subscription.isPaused = true;
        }

        if (action === 'RESUME') {
            if (subscription.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    message: 'Only active subscriptions can be resumed.',
                });
            }
            if (!subscription.isPaused) {
                return res.status(400).json({
                    success: false,
                    message: 'This subscription is not paused.',
                });
            }
            subscription.isPaused = false;
            if (
                !subscription.nextBillingDate ||
                new Date(subscription.nextBillingDate) < new Date()
            ) {
                subscription.nextBillingDate = calculateNextBillingDate(
                    new Date(),
                    plan.billingCycle
                );
            }
        }

        if (action === 'RENEW') {
            if (!plan.canRenew) {
                return res.status(403).json({
                    success: false,
                    message: 'This plan is not renewable.',
                });
            }
            const now = new Date();
            subscription.status = 'ACTIVE';
            subscription.isPaused = false;
            subscription.startDate = now;
            subscription.nextBillingDate = calculateNextBillingDate(now, plan.billingCycle);
            if (subscription.expiryDate) {
                subscription.expiryDate = calculateNextBillingDate(now, plan.billingCycle);
            }
        }

        if (action === 'CLOSE') {
            if (subscription.status === 'CLOSED') {
                return res.status(400).json({
                    success: false,
                    message: 'This subscription is already closed.',
                });
            }
            if (subscription.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    message: 'Only active subscriptions can be closed.',
                });
            }

            const now = new Date();
            const isBeforeExpiry =
                !subscription.expiryDate || now < new Date(subscription.expiryDate);
            if (subscription.status === 'ACTIVE' && isBeforeExpiry && !plan.canCloseEarly) {
                return res.status(403).json({
                    success: false,
                    message: `Plan "${plan.name}" does not allow closing before the expiry date.`,
                });
            }

            subscription.status = 'CLOSED';
            subscription.isPaused = false;
            subscription.nextBillingDate = null;
        }

        await subscription.save();

        const updated = await Subscription.findById(subscription._id)
            .populate('planId', PLAN_FIELDS)
            .lean();

        return res.json({
            success: true,
            message: MESSAGES[action],
            data: updated,
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
