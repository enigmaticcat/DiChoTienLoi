import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
// Change to your computer's IP for testing on real device
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/user/refresh-token`, { refreshToken });
                    const { token, refreshToken: newRefresh } = res.data.data;
                    await AsyncStorage.setItem('token', token);
                    await AsyncStorage.setItem('refreshToken', newRefresh);
                    error.config.headers.Authorization = `Bearer ${token}`;
                    return api(error.config);
                } catch {
                    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post('/user/', data),
    login: (data: { email: string; password: string }) =>
        api.post('/user/login', data),
    logout: () => api.post('/user/logout'),
    sendVerificationCode: (email: string) =>
        api.post('/user/send-verification-code', { email }),
    verifyEmail: (code: string) =>
        api.post('/user/verify-email', { code }),
    refreshToken: (refreshToken: string) =>
        api.post('/user/refresh-token', { refreshToken }),
    forgotPassword: (email: string) =>
        api.post('/user/forgot-password', { email }),
    resetPassword: (data: { email: string; code: string; newPassword: string }) =>
        api.post('/user/reset-password', data),
};

// User APIs
export const userApi = {
    getProfile: () => api.get('/user/'),
    updateProfile: (data: FormData) => api.put('/user/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteAccount: () => api.delete('/user/'),
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        api.post('/user/change-password', data),
};

// Group APIs
export const groupApi = {
    create: (name?: string) => api.post('/user/group/', name ? { name } : {}),
    getMembers: () => api.get('/user/group/'),
    addMember: (username: string) => api.post('/user/group/add', { username }),
    removeMember: (username: string) => api.delete('/user/group/', { data: { username } }),
    leaveGroup: () => api.post('/user/group/leave'),
    deleteGroup: () => api.delete('/user/group/delete'),
};

// Food APIs
export const foodApi = {
    getAll: () => api.get('/food/'),
    create: (data: FormData) => api.post('/food/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (data: { name: string; newName?: string; newCategory?: string; newUnit?: string }) =>
        api.put('/food/', data),
    delete: (name: string) => api.delete('/food/', { data: { name } }),
    getCategories: () => api.get('/food/categories'),
    getUnits: () => api.get('/food/units'),
};

// Fridge APIs
export const fridgeApi = {
    getAll: () => api.get('/fridge/'),
    getOne: (id: string) => api.get(`/fridge/${id}`),
    create: (data: { foodName: string; quantity?: number; useWithin?: number; note?: string; image?: string; location?: string }) =>
        api.post('/fridge/', data),
    update: (data: { itemId: string; newQuantity?: number; newNote?: string; newUseWithin?: number; newLocation?: string }) =>
        api.put('/fridge/', data),
    delete: (itemId: string) => api.delete('/fridge/', { data: { itemId } }),
};

// Shopping APIs
export const shoppingApi = {
    getLists: () => api.get('/shopping/list'),
    createList: (date?: string) => api.post('/shopping/list', date ? { date } : {}),
    deleteList: (listId: string) => api.delete('/shopping/list', { data: { listId } }),

    getTasks: (listId: string) => api.get(`/shopping/task/${listId}`),
    createTask: (data: { listId: string; foodName: string; quantity?: number; assignedTo?: string; price?: number }) =>
        api.post('/shopping/task', data),
    updateTask: (data: { taskId: string; newFoodName?: string; newQuantity?: number; isCompleted?: boolean; newPrice?: number }) =>
        api.put('/shopping/task', data),
    deleteTask: (taskId: string) => api.delete('/shopping/task', { data: { taskId } }),
};

// MealPlan APIs
export const mealPlanApi = {
    getAll: (date?: string) => api.get('/meal-plan/', { params: date ? { date } : {} }),
    create: (data: { foodName: string; timestamp: string; name: 'sáng' | 'trưa' | 'tối' }) =>
        api.post('/meal-plan/', data),
    update: (data: { planId: string; newFoodName?: string; newTimestamp?: string; newName?: string }) =>
        api.put('/meal-plan/', data),
    delete: (planId: string) => api.delete('/meal-plan/', { data: { planId } }),
};

// Recipe APIs
export const recipeApi = {
    getAll: (foodId?: string) => api.get('/recipe/', { params: foodId ? { foodId } : {} }),
    create: (data: { foodName: string; name: string; description?: string; htmlContent?: string }) =>
        api.post('/recipe/', data),
    update: (data: { recipeId: string; newFoodName?: string; newName?: string; newDescription?: string; newHtmlContent?: string }) =>
        api.put('/recipe/', data),
    delete: (recipeId: string) => api.delete('/recipe/', { data: { recipeId } }),
};

// Admin APIs
export const adminApi = {
    getCategories: () => api.get('/admin/category'),
    createCategory: (name: string) => api.post('/admin/category', { name }),
    editCategory: (oldName: string, newName: string) => api.put('/admin/category', { oldName, newName }),
    deleteCategory: (name: string) => api.delete('/admin/category', { data: { name } }),

    getUnits: () => api.get('/admin/unit'),
    createUnit: (unitName: string) => api.post('/admin/unit', { unitName }),
    deleteUnit: (unitName: string) => api.delete('/admin/unit', { data: { unitName } }),

    getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
        api.get('/admin/users', { params }),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
    getStats: () => api.get('/admin/stats'),
};

export default api;
