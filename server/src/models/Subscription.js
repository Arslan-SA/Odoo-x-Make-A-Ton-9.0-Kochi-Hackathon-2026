const mongoose = require('mongoose');

const subscriptionLineSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: { type: String, required: true },
        variantAttribute: { type: String, default: null },
        variantValue: { type: String, default: null },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 }, // base salesPrice + variant priceModifier
        taxRate: { type: Number, default: 0 },               // % from TaxRule
        taxAmount: { type: Number, default: 0 },
        amount: { type: Number, required: true, min: 0 },    // (quantity * unitPrice) + taxAmount
    },
    { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
    {
        subNumber: { type: String, required: true, unique: true, index: true }, // e.g., SUB-00001
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
            index: true,
        },
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuotationTemplate',
            default: null,
        },
        discountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiscountRule',
            default: null,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'],
            default: 'DRAFT',
            index: true,
        },
        isPaused: { type: Boolean, default: false },
        startDate: { type: Date, default: null },
        expiryDate: { type: Date, default: null },
        nextBillingDate: { type: Date, default: null, index: true },
        paymentTerms: { type: String, default: 'Net 15' },
        lines: [subscriptionLineSchema],
        subtotal: { type: Number, default: 0 },
        taxTotal: { type: Number, default: 0 },
        discountTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound indexes for <2s Dashboard & Billing Day Cron queries
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ planId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);