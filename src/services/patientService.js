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

// Google OAuth
export const googleLogin = () => {
  window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google`;
};

export const getProfileStatus = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/patient/profile/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting profile status:', error);
    throw error;
  }
};

// Create or update patient profile
export const createOrUpdateProfile = async (profileData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/patient/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get patient profile
export const getPatientProfile = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/patient/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};
  
