const User = require('../../models/User');
const { validatePassword } = require('../../utils/password');
const publicUser = require('../../utils/publicUser');

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

// GET /api/users/customers
exports.listCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        const filter = { role: 'customer', isActive: true };

        if (search) {
            const regex = { $regex: String(search), $options: 'i' };
            filter.$or = [{ name: regex }, { email: regex }, { company: regex }];
        }

        const customers = await User.find(filter)
            .sort({ name: 1 })
            .limit(100)
            .lean();

        res.json({ success: true, data: customers.map(publicUser) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/users/staff
exports.listStaff = async (_req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: staff.map(publicUser) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/users/staff
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, company } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required',
            });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, message: passwordError });
        }

        const normalizedEmail = normalizeEmail(email);
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        const staff = await User.create({
            name,
            email: normalizedEmail,
            password,
            company: company || '',
            role: 'staff',
        });

        return res.status(201).json({ success: true, data: publicUser(staff) });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors)[0]?.message || 'Invalid staff details';
            return res.status(400).json({ success: false, message });
        }
        return res.status(500).json({
            success: false,
            message: 'Could not create the staff account',
        });
    }
};

// PATCH /api/users/staff/:id/status
exports.updateStaffStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be true or false',
            });
        }

        const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff account not found' });
        }

        staff.isActive = isActive;
        await staff.save({ validateBeforeSave: false });

        return res.json({ success: true, data: publicUser(staff) });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
