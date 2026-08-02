import api from './axios';

export const getNeobankAccount = async () => {
  const response = await api.get('/neobank/account');
  return response.data;
};

export const onboardNeobank = async (kycData) => {
  const response = await api.post('/neobank/onboard', kycData);
  return response.data;
};

export const getCashLocations = async (lat, lng) => {
  const response = await api.get('/neobank/cash-locations', { params: { lat, lng } });
  return response.data;
};

export const createCashIn = async (amount) => {
  const response = await api.post('/neobank/cash-in', { amount });
  return response.data;
};

export const createVirtualAccount = async () => {
  const response = await api.post('/neobank/virtual-account');
  return response.data;
};

export const sendP2PMoney = async (recipient, amount, note) => {
  const response = await api.post('/neobank/send', { recipient, amount, note });
  return response.data;
};

export const withdrawToBank = async (amount, accountNumber, routingNumber) => {
  const response = await api.post('/neobank/withdraw', { amount, accountNumber, routingNumber });
  return response.data;
};

export const getNeobankTransactions = async () => {
  const response = await api.get('/neobank/transactions');
  return response.data;
};
