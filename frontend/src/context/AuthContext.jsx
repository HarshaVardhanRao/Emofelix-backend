import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiBase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/profile/`);
                    setUser(response.data);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login/`, {
                email,
                password,
            });

            const { token: authToken, user_id } = response.data;
            setToken(authToken);
            localStorage.setItem('token', authToken);

            // Fetch user profile
            const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/`);
            setUser(profileResponse.data);

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, userData);

            // Auto-login after registration
            const loginResult = await login(userData.email, userData.password);
            return loginResult;
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post(`${API_BASE_URL}/api/logout/`);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/google-login/`, { id_token: idToken });
            const { token: authToken } = response.data;
            setToken(authToken);
            localStorage.setItem('token', authToken);
            const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/`);
            setUser(profileResponse.data);
            return { success: true };
        } catch (error) {
            console.error('Google login failed:', error);
            return { success: false, error: error.response?.data?.error || 'Google login failed' };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        googleLogin,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
