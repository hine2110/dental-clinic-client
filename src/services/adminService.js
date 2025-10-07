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

    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    // Return full error details for better debugging
    const errorDetails = {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
      errors: error.response?.data?.errors,
      details: error.response?.data?.details,
      response: error.response,
    };

    console.error("📋 Error details:", errorDetails);
    return Promise.reject(errorDetails);
  }
);

// Admin Services
export const adminService = {
  // User Management
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams();

    // Add parameters if provided
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.role) queryParams.append("role", params.role);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/admin/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
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

  // Reports
  generateUserReport: (filters) =>
    adminAPI.post("/admin/reports/users", filters),

  exportUsers: (format = "csv") =>
    adminAPI.get(`/admin/export/users?format=${format}`, {
      responseType: "blob",
    }),

  // System Management
  getSystemSettings: () => adminAPI.get("/admin/settings"),

  updateSystemSettings: (settings) => adminAPI.put("/admin/settings", settings),

  getAuditLogs: (page = 1, limit = 50) =>
    adminAPI.get(`/admin/audit-logs?page=${page}&limit=${limit}`),

  // Notifications
  getNotifications: () => adminAPI.get("/admin/notifications"),

  markNotificationRead: (notificationId) =>
    adminAPI.patch(`/admin/notifications/${notificationId}/read`),

  markAllNotificationsRead: () =>
    adminAPI.patch("/admin/notifications/read-all"),

  // Services Management (Admin)
  getServices: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.category) queryParams.append("category", params.category);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive);
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/admin/services${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return adminAPI.get(url);
  },

  getServiceCategories: () => adminAPI.get(`/admin/services/categories`),
  getServiceById: (id) => adminAPI.get(`/admin/services/${id}`),

  // Create service with image upload
  createService: (formData) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return adminAPI.post(`/admin/services`, formData, config);
  },

  // Update service with image upload
  updateService: (id, formData) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return adminAPI.put(`/admin/services/${id}`, formData, config);
  },

  toggleServiceStatus: (id) => adminAPI.patch(`/admin/services/${id}/toggle`),
  deleteService: (id) => adminAPI.delete(`/admin/services/${id}`),
  hardDeleteService: (id) => adminAPI.delete(`/admin/services/${id}/hard`),

  // Upload Management
  uploadImage: (formData) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return adminAPI.post(`/admin/upload/image`, formData, config);
  },

  deleteImage: (filename) => adminAPI.delete(`/admin/upload/image/${filename}`),
};
