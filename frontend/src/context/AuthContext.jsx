import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/auth/profile/');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // Only clear auth if we truly have no valid tokens
            // The axios interceptor should have already tried to refresh
            if (error.response?.status === 401) {
                // Token is truly invalid/expired and refresh failed
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setIsAuthenticated(false);
                setUser(null);
            }
            // For other errors (network, etc), don't logout - might be temporary
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            await fetchProfile();
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
            setLoading(false);
            throw error;
        }
    };

    const register = async (userData) => {
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
        setLoading(false);
        // We removed the hardcoded navigate('/login') here
        // The ProtectedRoute/StaffRoute will handle the redirect based on context
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, isAuthenticated, setIsAuthenticated, loading }}>
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
