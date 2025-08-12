import axios from 'axios';

// Handle API URL - add https:// if it's just a hostname from Render
const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4476';
const API_BASE_URL = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}.onrender.com`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors (but don't auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass through errors without auto-logout
    // Users will only be logged out when they manually click logout
    return Promise.reject(error);
  }
);

// Authentication API calls
export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post('/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  const { access_token } = response.data;
  localStorage.setItem('access_token', access_token);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/products/');
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post('/products/', product);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders/');
  return response.data;
};

export const createOrder = async (order) => {
  const response = await api.post('/orders/', order);
  return response.data;
}

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}`, { status });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics/');
  return response.data;
};

export const getLiveEvents = async () => {
  const response = await api.get('/live_events/');
  return response.data;
};

export const createLiveEvent = async (event) => {
  const response = await api.post('/live_events/', event);
  return response.data;
};

export const deleteLiveEvent = async (eventId) => {
  const response = await api.delete(`/live_events/${eventId}`);
  return response.data;
};

export default api;
