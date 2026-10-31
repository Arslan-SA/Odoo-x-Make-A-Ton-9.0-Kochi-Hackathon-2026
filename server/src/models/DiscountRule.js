const mongoose = require('mongoose');

const discountRuleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        type: { type: String, enum: ['FIXED', 'PERCENT'], required: true },
        value: { type: Number, required: true, min: 0 }, // e.g., 500 or 20 (%)
        minPurchaseAmount: { type: Number, default: 0 },
        minQuantity: { type: Number, default: 1 },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: null },
        maxUses: { type: Number, default: null }, // null = unlimited
        usedCount: { type: Number, default: 0 },
        scope: {
            type: String,
            enum: ['SUBSCRIPTION', 'PRODUCT'],
            default: 'SUBSCRIPTION',
        },
        targetProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('DiscountRule', discountRuleSchema);