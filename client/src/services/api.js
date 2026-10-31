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

// Catalog & Subscriptions (Role 1)
export const catalogApi = {
    getProducts: () => api.get('/catalog/products'),
    createProduct: (data) => api.post('/catalog/products', data),
    getPlans: () => api.get('/catalog/plans'),
    createPlan: (data) => api.post('/catalog/plans', data),
    getTemplates: () => api.get('/catalog/templates'),
    createTemplate: (data) => api.post('/catalog/templates', data),
};

export const subscriptionApi = {
    getAll: (params) => api.get('/subscriptions', { params }),
    getById: (id) => api.get(`/subscriptions/${id}`),
    create: (data) => api.post('/subscriptions', data),
    updateLines: (id, data) => api.put(`/subscriptions/${id}`, data),
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