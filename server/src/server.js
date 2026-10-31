const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const portalRoutes = require('./modules/portal/portal.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const billingRoutes = require('./modules/billing/billing.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Brightloop Subscription API' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Admin: staff accounts and workspace settings
app.use('/api/users', userRoutes);

// Customer self-service
app.use('/api/portal', portalRoutes);

// Role 1 Routes: Catalog & Subscriptions
app.use('/api/catalog', catalogRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Fresh database detected. Auto-seeding demo users...');
      const DEMO_USERS = [
        { name: 'Brightloop Admin', email: 'admin@brightloop.dev', password: 'Admin@12345', role: 'admin', company: 'Brightloop' },
        { name: 'Demo Customer', email: 'customer@brightloop.dev', password: 'Customer@12345', role: 'customer', company: 'Acme Retail' },
        { name: 'Demo Staff', email: 'staff@brightloop.dev', password: 'Staff@12345', role: 'staff', company: 'Brightloop' },
      ];
      for (const demo of DEMO_USERS) {
        await User.create(demo);
      }
      console.log('Demo users seeded successfully.');
    }
  } catch (seedErr) {
    console.warn('Auto-seed check note:', seedErr.message);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
