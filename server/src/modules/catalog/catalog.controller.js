const Product = require('../../models/Product');
const Plan = require('../../models/Plan');
const QuotationTemplate = require('../../models/QuotationTemplate');

// ================= PRODUCTS & VARIANTS =================
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const filter = req.query.activeOnly === 'true' ? { isActive: true } : {};
        const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ================= RECURRING PLANS =================
exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
        const plans = await Plan.find(filter).sort({ price: 1 }).lean();
        res.json({ success: true, data: plans });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ================= QUOTATION TEMPLATES =================
exports.createTemplate = async (req, res) => {
    try {
        const template = await QuotationTemplate.create(req.body);
        res.status(201).json({ success: true, data: template });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getTemplates = async (req, res) => {
    try {
        const templates = await QuotationTemplate.find({ isActive: true })
            .populate('planId')
            .populate('lines.productId')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};