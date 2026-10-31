import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically attach JWT token if logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Clear an expired/invalid session and let AuthContext react.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestToken = error.config?.headers?.Authorization;
        const storedToken = localStorage.getItem('token');

        // Only clear the session if the failed request used the current token.
        if (
            error.response?.status === 401 &&
            storedToken &&
            requestToken === `Bearer ${storedToken}`
        ) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// Authentication
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Admin: staff accounts
export const userApi = {
    getStaff: () => api.get('/users/staff'),
    getCustomers: (params) => api.get('/users/customers', { params }),
    createStaff: (data) => api.post('/users/staff', data),
    updateStaffStatus: (id, isActive) =>
        api.patch(`/users/staff/${id}/status`, { isActive }),
};

// Customer self-service
export const portalApi = {
    getOverview: () => api.get('/portal/overview'),
    lifecycleAction: (id, action) =>
        api.patch(`/portal/subscriptions/${id}/lifecycle`, { action }),
};

// Catalog & Subscriptions (Role 1)
export const catalogApi = {
    getProducts: (params) => api.get('/catalog/products', { params }),
    createProduct: (data) => api.post('/catalog/products', data),
    updateProduct: (id, data) => api.patch(`/catalog/products/${id}`, data),
    getPlans: (params) => api.get('/catalog/plans', { params }),
    createPlan: (data) => api.post('/catalog/plans', data),
    updatePlan: (id, data) => api.patch(`/catalog/plans/${id}`, data),
    getTemplates: () => api.get('/catalog/templates'),
    createTemplate: (data) => api.post('/catalog/templates', data),
};

export const subscriptionApi = {
    getAll: (params) => api.get('/subscriptions', { params }),
    getById: (id) => api.get(`/subscriptions/${id}`),
    create: (data) => api.post('/subscriptions', data),
    updateLines: (id, data) => api.patch(`/subscriptions/${id}`, data),
    transitionStatus: (id, targetStatus) =>
        api.patch(`/subscriptions/${id}/status`, { targetStatus }),
    lifecycleAction: (id, action) =>
        api.patch(`/subscriptions/${id}/lifecycle`, { action }),
};

// Billing, Invoices, Payments & Dashboard (Role 3)
export const billingApi = {
    getDashboard: () => api.get('/billing/dashboard'),
    runBillingDay: (payload = { autoConfirm: true }) => api.post('/billing/run', payload),
    getInvoices: (params) => api.get('/billing/invoices', { params }),
    getInvoiceById: (id) => api.get(`/billing/invoices/${id}`),
    updateInvoiceStatus: (id, status) => api.patch(`/billing/invoices/${id}/status`, { status }),
    recordPayment: (data) => api.post('/billing/payments', data),
    getPayments: () => api.get('/billing/payments'),
    getTaxes: () => api.get('/billing/taxes'),
    createTax: (data) => api.post('/billing/taxes', data),
    getDiscounts: () => api.get('/billing/discounts'),
    createDiscount: (data) => api.post('/billing/discounts', data),
};

export default api;