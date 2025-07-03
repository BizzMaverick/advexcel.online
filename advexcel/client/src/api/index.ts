import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData: any) => api.put('/auth/profile', userData),
  changePassword: (passwordData: any) => api.put('/auth/change-password', passwordData)
};

// Excel API
export const excelAPI = {
  getAllSpreadsheets: () => api.get('/excel'),
  getSpreadsheet: (id: string) => api.get(`/excel/${id}`),
  createSpreadsheet: (spreadsheetData: any) => api.post('/excel', spreadsheetData),
  updateSpreadsheet: (id: string, spreadsheetData: any) => api.put(`/excel/${id}`, spreadsheetData),
  deleteSpreadsheet: (id: string) => api.delete(`/excel/${id}`),
  shareSpreadsheet: (id: string, isPublic: boolean) => api.put(`/excel/${id}/share`, { isPublic }),
  getPublicSpreadsheet: (id: string) => api.get(`/excel/public/${id}`)
};

// Referral API
export const referralAPI = {
  generateReferralCode: () => api.post('/referral/generate'),
  getMyReferrals: () => api.get('/referral/my-referrals'),
  validateReferralCode: (referralCode: string) => api.post('/referral/validate', { referralCode }),
  applyReferralCode: (referralCode: string) => api.post('/referral/apply', { referralCode })
};

export default api;