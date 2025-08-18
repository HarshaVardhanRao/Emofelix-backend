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

            const { token: authToken } = response.data;
            setToken(authToken);
            localStorage.setItem('token', authToken);

            // Fetch user profile
            const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/`);
            setUser(profileResponse.data);

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            
            // Handle terms acceptance requirement
            if (error.response?.status === 403 && error.response?.data?.requires_terms_acceptance) {
                return {
                    success: false,
                    error: error.response.data.error,
                    user_id: error.response.data.user_id,
                    requires_terms_acceptance: true
                };
            }
            
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, userData);

            // Check if the registration was successful
            if (response.status === 201 || response.status === 200) {
                // Auto-login after registration
                const loginResult = await login(userData.email, userData.password);
                return loginResult;
            } else {
                return {
                    success: false,
                    error: response.data?.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            let errorMessage = 'Registration failed';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.email) {
                    errorMessage = error.response.data.email[0];
                } else {
                    errorMessage = Object.values(error.response.data)[0];
                }
            }

            return {
                success: false,
                error: errorMessage
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

    const googleLogin = async (idToken, termsAccepted = false) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/google-login/`, { 
                id_token: idToken,
                terms_accepted: termsAccepted
            });
            const { token: authToken } = response.data;
            setToken(authToken);
            localStorage.setItem('token', authToken);
            const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/`);
            setUser(profileResponse.data);
            return { success: true };
        } catch (error) {
            console.error('Google login failed:', error);
            
            // Handle terms acceptance requirement for Google login
            if (error.response?.status === 403 && error.response?.data?.requires_terms_acceptance) {
                return {
                    success: false,
                    error: error.response.data.error,
                    user_id: error.response.data.user_id,
                    requires_terms_acceptance: true
                };
            }
            
            return { success: false, error: error.response?.data?.error || 'Google login failed' };
        }
    };

    const updateUser = (updates) => {
        setUser(prevUser => ({
            ...prevUser,
            ...updates
        }));
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/profile/`);
                setUser(response.data);
                return response.data;
            } catch (error) {
                console.error('Failed to refresh user data:', error);
                return null;
            }
        }
        return null;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        googleLogin,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
