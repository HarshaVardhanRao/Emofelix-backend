import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles, Heart } from 'lucide-react';
import TermsAndConditionsModal from '../components/TermsAndConditionsModal';
import { API_BASE_URL } from '../apiBase';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsLoading, setTermsLoading] = useState(false);
    const [pendingUserId, setPendingUserId] = useState(null);
    const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
    const [googleReady, setGoogleReady] = useState(false);

    const { login, googleLogin } = useAuth();

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                // Check if error is due to terms acceptance requirement
                if (result.error && result.error.includes('Terms and Conditions')) {
                    // If login failed due to terms, get the user ID and show terms modal
                    if (result.user_id) {
                        setPendingUserId(result.user_id);
                        setShowTermsModal(true);
                    } else {
                        setError('Login failed. Please try again.');
                    }
                } else {
                    setError(result.error);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTermsForLogin = async () => {
        setTermsLoading(true);
        try {
            // Handle regular login with pending user ID
            if (pendingUserId) {
                const response = await axios.post(`${API_BASE_URL}/api/auth/accept-terms-login/`, {
                    user_id: pendingUserId,
                    terms_accepted: true
                });

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    setShowTermsModal(false);
                    window.location.reload();
                }
            }
            // Handle Google login with pending credential
            else if (pendingGoogleCredential) {
                const result = await googleLogin(pendingGoogleCredential, true);
                if (result.success) {
                    setShowTermsModal(false);
                    navigate('/dashboard');
                } else {
                    setError(result.error);
                }
            }
        } catch (error) {
            console.error('Terms acceptance error:', error);
            setError('Failed to accept terms. Please try again.');
        } finally {
            setTermsLoading(false);
        }
    };

    const handleTermsModalClose = () => {
        setShowTermsModal(false);
        setPendingUserId(null);
        setPendingGoogleCredential(null);
    };

    const loadGoogleScript = () => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                return resolve();
            }
            const existing = document.getElementById('google-identity-script');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = 'google-identity-script';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const initGoogle = useCallback(async () => {
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
            console.warn('VITE_GOOGLE_CLIENT_ID not set');
            return;
        }
        if (!(window.google && window.google.accounts && window.google.accounts.id)) return;
        try {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    if (!response.credential) {
                        setError('No credential received');
                        return;
                    }
                    try {
                        // For login, try Google login directly (no terms check needed for existing users)
                        const result = await googleLogin(response.credential, false);
                        if (result.success) {
                            navigate('/dashboard');
                        } else {
                            // Only show terms modal if backend specifically requires it
                            if (result.requires_terms_acceptance) {
                                setPendingGoogleCredential(response.credential);
                                setShowTermsModal(true);
                            } else {
                                setError(result.error || 'Google login failed');
                            }
                        }
                    } catch (error) {
                        console.error('Google login error:', error);
                        setError('Google login failed');
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: false
            });

            setGoogleReady(true);
        } catch (e) {
            console.error('Google init error', e);
            setError('Google init failed');
        }
    }, [googleLogin, navigate]);

    useEffect(() => {
        loadGoogleScript().then(initGoogle).catch(err => {
            console.error('Google script load failed', err);
            setError('Failed to load Google services');
        });
    }, [initGoogle]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-neon-blue rounded-full animate-float-bounce opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${4 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="glass-card rounded-3xl p-8 shadow-neon-lg animate-bounce-in">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-neon-blue rounded-full flex items-center justify-center animate-pulse-glow">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Welcome Back to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
                                EmoFelix
                            </span>
                        </h2>
                        <p className="text-gray-300 text-sm">
                            Connect with your virtual loved ones
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center backdrop-blur-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <span className="text-red-200 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="glass-input pl-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="glass-input pl-10 pr-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold rounded-xl hover:shadow-neon-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-gray-400">or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={async () => {
                                setError('');

                                if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                                    setError('Google Client ID missing');
                                    return;
                                }
                                if (!googleReady) {
                                    await loadGoogleScript();
                                    await initGoogle();
                                }
                                if (window.google?.accounts?.id) {
                                    window.google.accounts.id.prompt((notification) => {
                                        if (notification.isNotDisplayed()) {
                                            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                                        }
                                        if (notification.isSkippedMoment()) {
                                            console.log('One Tap skipped:', notification.getSkippedReason());
                                        }
                                    });
                                } else {
                                    setError('Google auth not ready');
                                }
                            }}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 transition-colors flex items-center justify-center"
                        >
                            <img
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google"
                                className="w-5 h-5 mr-2"
                            />
                            {googleReady ? 'Sign in with Google' : 'Loading Google...'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 space-y-4">
                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="text-neon-blue hover:text-neon-pink transition-colors text-sm"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <div className="text-center">
                            <span className="text-gray-400 text-sm">Don't have an account? </span>
                            <Link
                                to="/register"
                                className="text-neon-pink hover:text-neon-blue transition-colors text-sm font-semibold"
                            >
                                Sign up
                            </Link>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By signing in, you agree to our{' '}
                            <Link to="/terms" className="text-neon-blue hover:text-neon-pink transition-colors">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-neon-blue hover:text-neon-pink transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal for Login */}
            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onClose={handleTermsModalClose}
                onAccept={handleAcceptTermsForLogin}
                isLoading={termsLoading}
            />
        </div>
    );
};

export default Login;
