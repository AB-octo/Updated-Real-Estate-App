import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: any;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Ideally verify token here, for now just assume valid
            setIsAuthenticated(true);
            // Decode token to get username if needed, or fetch profile
            // For mini app, simple state is enough
            // But we don't have user info in token (unless decoded).
            // Let's assume user is logged in.
        }
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await api.post('/api/auth/login/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setIsAuthenticated(true);
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            await api.post('/api/auth/register/', userData);
            // Auto login or redirect to login
            navigate('/login');
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
