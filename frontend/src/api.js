import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY || 'your-secret-api-key-here';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

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
