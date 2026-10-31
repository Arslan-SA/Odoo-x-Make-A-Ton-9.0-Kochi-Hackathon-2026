const Product = require('../../models/Product');
const Plan = require('../../models/Plan');
const QuotationTemplate = require('../../models/QuotationTemplate');
const Subscription = require('../../models/Subscription');

// Helper: Calculate next billing date from plan frequency
const calculateNextBillingDate = (fromDate, billingCycle) => {
    const next = new Date(fromDate);
    switch (billingCycle) {
        case 'DAILY':
            next.setDate(next.getDate() + 1);
            break;
        case 'WEEKLY':
            next.setDate(next.getDate() + 7);
            break;
        case 'MONTHLY':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'YEARLY':
            next.setFullYear(next.getFullYear() + 1);
            break;
        default:
            next.setMonth(next.getMonth() + 1);
    }
    return next;
};

// Helper: Resolve product lines, variant price modifiers (+560), and taxes
const buildSubscriptionLines = async (rawLines = [], defaultTaxRate = 0) => {
    let subtotal = 0;
    let taxTotal = 0;
    const resolvedLines = [];

    for (const item of rawLines) {
        const product = await Product.findById(item.productId).lean();
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        let unitPrice = product.salesPrice;

        // Apply Variant Price Modifier (e.g., Brand: Odoo -> +560)
        if (item.variantValue && Array.isArray(product.variants)) {
            const matchedVariant = product.variants.find(
                (v) =>
                    v.value.toLowerCase() === item.variantValue.toLowerCase() &&
                    (!item.variantAttribute || v.attribute.toLowerCase() === item.variantAttribute.toLowerCase())
            );
            if (matchedVariant) {
                unitPrice += matchedVariant.priceModifier;
            }
        }

        const quantity = Number(item.quantity || 1);
        const taxRate = Number(item.taxRate ?? defaultTaxRate ?? 0);
        const lineBase = quantity * unitPrice;
        const taxAmount = Number(((lineBase * taxRate) / 100).toFixed(2));
        const amount = Number((lineBase + taxAmount).toFixed(2));

        subtotal += lineBase;
        taxTotal += taxAmount;

        resolvedLines.push({
            productId: product._id,
            productName: product.name,
            variantAttribute: item.variantAttribute || null,
            variantValue: item.variantValue || null,
            quantity,
            unitPrice,
            taxRate,
            taxAmount,
            amount,
        });
    }

    return {
        lines: resolvedLines,
        subtotal: Number(subtotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        grandTotal: Number((subtotal + taxTotal).toFixed(2)),
    };
};

// Generate unique sequential subscription number (e.g., SUB-00001)
const generateSubNumber = async () => {
    const count = await Subscription.countDocuments();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `SUB-${String(count + 1).padStart(5, '0')}-${randomSuffix}`;
};

/**
 * Strict Subscription State Machine Transitions:
 * DRAFT → QUOTATION → CONFIRMED → ACTIVE → CLOSED
 * No skipping allowed (e.g., cannot jump from DRAFT to CONFIRMED).
 */
const VALID_TRANSITIONS = {
    DRAFT: ['QUOTATION'],
    QUOTATION: ['CONFIRMED'],
    CONFIRMED: ['ACTIVE'],
    ACTIVE: ['CLOSED'],
    CLOSED: [], // Terminal unless renewed via lifecycle endpoint
};

module.exports = {
    calculateNextBillingDate,
    buildSubscriptionLines,
    generateSubNumber,
    VALID_TRANSITIONS,
};