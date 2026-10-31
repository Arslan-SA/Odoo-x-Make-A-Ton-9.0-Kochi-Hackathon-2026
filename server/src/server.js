const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const portalRoutes = require('./modules/portal/portal.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const billingRoutes = require('./modules/billing/billing.routes');

const app = express();

connectDB();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));