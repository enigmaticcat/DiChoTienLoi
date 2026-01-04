import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi } from '../services/api';

interface User {
    id: string;
    email: string;
    name: string;
    username?: string;
    avatar?: string;
    role: 'user' | 'admin';
    group?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    verifyEmail: (code: string) => Promise<{ success: boolean; message: string }>;
    sendVerificationCode: (email: string) => Promise<{ success: boolean; message: string }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Load auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login({ email, password });
            const data = response.data;

            if (data.code === '00047') {
                const { id, email: userEmail, name, username, avatar, role, group, token: newToken, refreshToken } = data.data;

                const userData: User = { id, email: userEmail, name, username, avatar, role, group };

                await AsyncStorage.setItem('token', newToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));

                setToken(newToken);
                setUser(userData);

                return { success: true, message: data.message };
            }

            return { success: false, message: data.message };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại';
            return { success: false, message };
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            console.log('Registering with:', { email, password, name });
            const response = await authApi.register({ email, password, name });
            console.log('Register response:', response.data);
            const data = response.data;

            if (data.code === '00035') {
                return { success: true, message: data.message };
            }

            return { success: false, message: data.message };
        } catch (error: any) {
            console.error('Register error:', error.response?.data || error.message);
            const message = error.response?.data?.message || 'Đăng ký thất bại';
            return { success: false, message };
        }
    };

    const verifyEmail = async (code: string) => {
        try {
            const response = await authApi.verifyEmail(code);
            const data = response.data;

            if (data.code === '00058') {
                return { success: true, message: data.message };
            }

            return { success: false, message: data.message };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Xác thực thất bại';
            return { success: false, message };
        }
    };

    const sendVerificationCode = async (email: string) => {
        try {
            const response = await authApi.sendVerificationCode(email);
            const data = response.data;

            return { success: data.code === '00048', message: data.message };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gửi mã thất bại';
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
            setToken(null);
            setUser(null);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await userApi.getProfile();
            const userData = response.data.data;
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                logout,
                verifyEmail,
                sendVerificationCode,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
