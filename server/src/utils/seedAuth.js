require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const DEMO_USERS = [
    {
        name: 'Brightloop Admin',
        email: 'admin@brightloop.dev',
        password: 'Admin@12345',
        role: 'admin',
        company: 'Brightloop',
    },
    {
        name: 'Demo Customer',
        email: 'customer@brightloop.dev',
        password: 'Customer@12345',
        role: 'customer',
        company: 'Acme Retail',
    },
    {
        name: 'Demo Staff',
        email: 'staff@brightloop.dev',
        password: 'Staff@12345',
        role: 'staff',
        company: 'Brightloop',
    },
];

const seedAuth = async () => {
    await connectDB();

    for (const demo of DEMO_USERS) {
        let user = await User.findOne({ email: demo.email }).select('+password');

        if (!user) {
            user = new User(demo);
        } else {
            user.name = demo.name;
            user.password = demo.password;
            user.role = demo.role;
            user.company = demo.company;
            user.isActive = true;
        }

        await user.save();
        console.log(`Seeded ${demo.role}: ${demo.email} / ${demo.password}`);
    }

    await mongoose.disconnect();
    console.log('Auth seed complete.');
};

seedAuth()
    .then(() => process.exit(0))
    .catch(async (err) => {
        console.error('Auth seed failed:', err.message);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    });
