// src/services/patientService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/auth';
console.log("✅ ENV:", process.env.REACT_APP_API_BASE_URL);

// Patient authentication services
export const login = (data) => axios.post(`${API}/login`, data);

export const register = (data) => axios.post(`${API}/register`, data);

export const sendVerificationCode = (email) =>
  axios.post(`${API}/send-code`, { email });

export const verifyEmailCode = (email, code) =>
  axios.post(`${API}/verify-code`, { email, code });

export const resetPassword = (data) =>
  axios.post(`${API}/reset-password`, data);

export const getCurrentUser = (token) =>
  axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const changePassword = (data, token) =>
  axios.put(`${API}/change-password`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const logout = (token) =>
  axios.post(`${API}/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
