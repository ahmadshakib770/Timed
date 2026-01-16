import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  requestVerification: (email) => api.post('/auth/request-verification', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  completeSignup: (email, code, password, nickname) => 
    api.post('/auth/complete-signup', { email, code, password, nickname }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me')
};

// Plans API
export const plansAPI = {
  createPlan: (planData) => api.post('/plans', planData),
  getPlans: () => api.get('/plans'),
  getPlanByDate: (date) => api.get(`/plans/${date}`),
  addTask: (planId, taskData) => api.post(`/plans/${planId}/tasks`, taskData),
  updateTask: (planId, taskId, taskData) => api.put(`/plans/${planId}/tasks/${taskId}`, taskData),
  completeTask: (planId, taskId, actualEndTime) => 
    api.put(`/plans/${planId}/tasks/${taskId}/complete`, { actualEndTime }),
  deleteTask: (planId, taskId) => api.delete(`/plans/${planId}/tasks/${taskId}`),
  deletePlan: (planId) => api.delete(`/plans/${planId}`)
};

export default api;
