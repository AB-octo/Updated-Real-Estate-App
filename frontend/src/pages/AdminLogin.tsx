import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import api from '../api';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser, setIsAuthenticated } = useAuth();
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!captchaToken) {
            setError('Please complete the reCAPTCHA.');
            return;
        }

        setLoading(true);
        try {
            // 1. Get tokens
            const response = await api.post('/api/auth/login/', {
                username,
                password,
                captcha_token: captchaToken
            });

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // 2. Verify if user is staff
            const profileResp = await api.get('/api/auth/profile/');
            const userData = profileResp.data;

            if (!userData.is_staff) {
                // Not a staff user - clear tokens and error out
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setError('Access denied. This login is for administrators only.');
                setLoading(false);
                return;
            }

            // 3. Perfect! User is admin
            setUser(userData);
            setIsAuthenticated(true);
            navigate('/admin-dash');

        } catch (err: any) {
            console.error("Login error", err);
            setError('Invalid credentials or server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Estately Admin
                    </span>
                </div>
                <h2 className="text-center text-2xl font-extrabold text-white">Administrator Portal</h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Secure access for authorized personnel only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300">Admin Username</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Enter admin username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex justify-center">
                            <ReCAPTCHA
                                theme="dark"
                                sitekey="6Ldk5VwsAAAAAPEjBGerTquDThJ9qMu8zOKVN01U"
                                onChange={(token: string | null) => setCaptchaToken(token)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Authorize Access'}
                        </button>
                    </form>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                        ← Back to Main Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
