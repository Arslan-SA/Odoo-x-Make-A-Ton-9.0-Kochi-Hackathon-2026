const mongoose = require('mongoose');

const templateLineSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        variantAttribute: { type: String, default: null },
        variantValue: { type: String, default: null },
        quantity: { type: Number, required: true, min: 1, default: 1 },
    },
    { _id: false }
);

const quotationTemplateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        validityDays: { type: Number, required: true, default: 15, min: 1 },
        paymentTerms: { type: String, default: 'Immediate Payment' },
        lines: [templateLineSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('QuotationTemplate', quotationTemplateSchema);