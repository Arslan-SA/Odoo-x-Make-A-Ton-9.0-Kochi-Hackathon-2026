const DiscountRule = require('../../models/DiscountRule');

// Evaluate and apply discount rule if still valid and within usage limits
const evaluateAndApplyDiscount = async (discountId, lines, subtotal, billingDate = new Date()) => {
    if (!discountId) return { discountTotal: 0, discountApplied: false };

    const discount = await DiscountRule.findById(discountId);
    if (!discount || !discount.isActive) return { discountTotal: 0, discountApplied: false };

    // 1. Check start and end dates
    if (discount.startDate && billingDate < new Date(discount.startDate)) {
        return { discountTotal: 0, discountApplied: false };
    }
    if (discount.endDate && billingDate > new Date(discount.endDate)) {
        return { discountTotal: 0, discountApplied: false };
    }

    // 2. Check max usage limit
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
        return { discountTotal: 0, discountApplied: false };
    }

    // 3. Check minimum purchase and minimum quantity
    const totalQty = lines.reduce((sum, l) => sum + Number(l.quantity || 0), 0);
    if (subtotal < discount.minPurchaseAmount || totalQty < discount.minQuantity) {
        return { discountTotal: 0, discountApplied: false };
    }

    // 4. Calculate discount amount based on scope (SUBSCRIPTION vs PRODUCT)
    let eligibleAmount = subtotal;
    if (discount.scope === 'PRODUCT' && discount.targetProductIds?.length > 0) {
        const targetIds = discount.targetProductIds.map((id) => String(id));
        eligibleAmount = lines
            .filter((l) => targetIds.includes(String(l.productId)))
            .reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    }

    if (eligibleAmount <= 0) return { discountTotal: 0, discountApplied: false };

    let discountTotal = 0;
    if (discount.type === 'PERCENT') {
        discountTotal = Number(((eligibleAmount * discount.value) / 100).toFixed(2));
    } else {
        discountTotal = Math.min(discount.value, eligibleAmount);
    }

    // Increment usage counter atomically
    await DiscountRule.findByIdAndUpdate(discount._id, { $inc: { usedCount: 1 } });

    return { discountTotal, discountApplied: true };
};

// Parse payment terms (e.g., "Net 15" -> +15 days)
const calculateDueDate = (issueDate, paymentTerms = 'Net 15') => {
    const due = new Date(issueDate);
    const match = String(paymentTerms).match(/(\d+)/);
    const daysToAdd = match ? Number(match[1]) : 15;
    due.setDate(due.getDate() + daysToAdd);
    return due;
};

module.exports = {
    evaluateAndApplyDiscount,
    calculateDueDate,
};