import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const predict = async (data) => {
  const response = await api.post('/predict', data);
  return response.data;
};

export const simulate = async (data) => {
  const response = await api.post('/simulate', data);
  return response.data;
};

export const getLocations = async () => {
  const response = await api.get('/locations');
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/history');
  return response.data;
};

export const getHistoricalRisk = async () => {
  const response = await api.get('/risk/historical');
  return response.data;
};

export default {
  getHistoricalRisk,
  getHealth,
  predict,
  simulate,
  getLocations,
  getHistory,
  clearHistory
};
