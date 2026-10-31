const mongoose = require('mongoose');

const taxRuleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true }, // e.g., "GST 18%"
        ratePercent: { type: Number, required: true, min: 0, max: 100 },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TaxRule', taxRuleSchema);