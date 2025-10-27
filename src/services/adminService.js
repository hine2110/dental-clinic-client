import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with default config
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
adminAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("🚨 AdminAPI Error:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    const errorDetails = {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };

    console.error("📋 Error details:", errorDetails);
    return Promise.reject(errorDetails);
  }
);

// Admin Services
export const adminService = {
  // User Management
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const url = `/admin/users?${queryParams.toString()}`;
    return adminAPI.get(url);
  },
  getUserById: (userId) => adminAPI.get(`/admin/users/${userId}`),
  createStaffAccount: (userData) =>
    adminAPI.post("/admin/create-account", userData),
  updateUser: (userId, userData) =>
    adminAPI.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => adminAPI.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId) =>
    adminAPI.patch(`/admin/users/${userId}/toggle-status`),

  // Analytics
  getDashboardStats: () => adminAPI.get("/admin/dashboard/stats"),
  getUserAnalytics: (period = "30d") =>
    adminAPI.get(`/admin/analytics/users?period=${period}`),
  getSystemAnalytics: () => adminAPI.get("/admin/analytics/system"),

  // Services Management (Admin)
  getServices: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const timestamp = new Date().getTime(); 
    queryParams.append('_', timestamp);
    const url = `/admin/services?${queryParams.toString()}`;
    return adminAPI.get(url);
  },
  getServiceCategories: () => adminAPI.get(`/admin/services/categories`),
  getServiceById: (id) => adminAPI.get(`/admin/services/${id}`),
  createService: (formData) => {
    return adminAPI.post(`/admin/services`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateService: (id, formData) => {
    return adminAPI.put(`/admin/services/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  toggleServiceStatus: (id) => adminAPI.patch(`/admin/services/${id}/toggle`),
  deleteService: (id) => adminAPI.delete(`/admin/services/${id}`),
  
  // Service Doctor Management
  getServiceDoctors: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const timestamp = new Date().getTime(); 
    queryParams.append('_', timestamp);
    const url = `/admin/service-doctors?${queryParams.toString()}`;
    return adminAPI.get(url);
  },
  createServiceDoctor: (payload) => {
    return adminAPI.post("/admin/service-doctors", payload);
  },
  updateServiceDoctor: (id, payload) => {
    return adminAPI.put(`/admin/service-doctors/${id}`, payload);
  },
  toggleServiceDoctorStatus: (id) => {
    return adminAPI.patch(`/admin/service-doctors/${id}/toggle-status`);
  },
  deleteServiceDoctor: (id) => {
    return adminAPI.delete(`/admin/service-doctors/${id}`);
  },
  hardDeleteServiceDoctor: (id) => {
    return adminAPI.delete(`/admin/service-doctors/${id}/hard-delete`);
  },

  // Discount Management
  getAllDiscounts: () => adminAPI.get("/admin/discounts"),
  createDiscount: (discountData) =>
    adminAPI.post("/admin/discounts", discountData),
  updateDiscount: (id, discountData) =>
    adminAPI.put(`/admin/discounts/${id}`, discountData),
  deleteDiscount: (id) => adminAPI.delete(`/admin/discounts/${id}`),
  checkDiscountCode: (code) => adminAPI.get(`/admin/discounts/check-code/${code}`),

  getAllLocations: () => {
    return adminAPI.get('/locations');
  },

  getSchedules: (params) => { 
    return adminAPI.get("/admin/schedules", { params });
  },

  getPatientHistory: (patientId) => {
    return adminAPI.get(`/admin/history/${patientId}`);
},

};