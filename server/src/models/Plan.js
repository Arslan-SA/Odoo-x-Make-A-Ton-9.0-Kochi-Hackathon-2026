const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        price: { type: Number, required: true, min: 0 },
        billingCycle: {
            type: String,
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
            required: true,
        },
        minQty: { type: Number, default: 1, min: 1 },
        availableFrom: { type: Date, default: Date.now },
        availableTo: { type: Date, default: null },
        // Admin lifecycle rules (Plan-by-plan configuration)
        autoClose: { type: Boolean, default: false },
        canCloseEarly: { type: Boolean, default: true },
        canPause: { type: Boolean, default: true },
        canRenew: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);