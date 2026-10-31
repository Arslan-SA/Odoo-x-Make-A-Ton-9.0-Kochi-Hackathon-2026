const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true,
            index: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        amount: { type: Number, required: true, min: 0.01 },
        method: {
            type: String,
            enum: ['BANK_TRANSFER', 'UPI', 'CARD', 'CASH', 'CHEQUE'],
            default: 'BANK_TRANSFER',
        },
        paymentDate: { type: Date, default: Date.now, index: true },
        note: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);