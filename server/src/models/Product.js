const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
    {
        attribute: { type: String, required: true, trim: true }, // e.g., "Brand"
        value: { type: String, required: true, trim: true },     // e.g., "Odoo"
        priceModifier: { type: Number, default: 0 },             // e.g., 560
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        type: {
            type: String,
            enum: ['SERVICE', 'CONSUMABLE', 'DIGITAL', 'ADDON'],
            default: 'SERVICE',
        },
        salesPrice: { type: Number, required: true, min: 0 },
        costPrice: { type: Number, required: true, min: 0, default: 0 },
        notes: { type: String, default: '' },
        variants: [variantSchema],
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);