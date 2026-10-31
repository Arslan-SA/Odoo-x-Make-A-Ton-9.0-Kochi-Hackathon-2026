const mongoose = require('mongoose');

const invoiceLineSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        variantValue: { type: String, default: null },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        amount: { type: Number, required: true },
    },
    { _id: false }
);

const invoiceSchema = new mongoose.Schema(
    {
        invNumber: { type: String, required: true, unique: true, index: true },
        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
            required: true,
            index: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Idempotency lock: prevents double-billing on the same cycle!
        billingCycleKey: { type: String, required: true, unique: true, index: true },
        status: {
            type: String,
            enum: ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'],
            default: 'DRAFT',
            index: true,
        },
        issueDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true, index: true },
        lines: [invoiceLineSchema],
        subtotal: { type: Number, required: true, default: 0 },
        discountTotal: { type: Number, default: 0 },
        taxTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true, default: 0 },
        paidAmount: { type: Number, default: 0 },
        balanceDue: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

// Compound indexes for <2s Finance Dashboard & Overdue queries
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);