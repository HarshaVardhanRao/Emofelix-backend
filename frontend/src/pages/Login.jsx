import { useState, useEffect, useRef, useCallback } from 'react';
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

    const { login, googleLogin } = useAuth();
    const googleBtnRenderedRef = useRef(false);
    const [googleReady, setGoogleReady] = useState(false);

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
                        setError(result.error);
                    }
                } else {
                    setError(result.error);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTermsForLogin = async () => {
        if (!pendingUserId) return;
        
        setTermsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/accept-terms-login/`, {
                user_id: pendingUserId,
                terms_accepted: true
            });
            
            if (response.data.token) {
                // Store the token and login
                localStorage.setItem('token', response.data.token);
                setShowTermsModal(false);
                window.location.reload(); // Refresh to complete login
            }
        } catch (error) {
            console.error('Error accepting terms during login:', error);
            setError('Error accepting terms. Please try again.');
        } finally {
            setTermsLoading(false);
        }
    };

    const handleTermsModalClose = () => {
        setShowTermsModal(false);
        setPendingUserId(null);
        setError('You must accept the Terms and Conditions to continue');
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
                    const result = await googleLogin(response.credential);
                    if (result.success) navigate('/dashboard'); else setError(result.error);
                },
                ux_mode: 'popup'
            });
            // Optionally render styled Google button inside our existing custom button container if we want default styling
            const container = document.getElementById('google_button_container');
            if (container && !googleBtnRenderedRef.current) {
                window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with' });
                googleBtnRenderedRef.current = true;
            }
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
                            <div className="relative">
                                <Heart className="h-16 w-16 text-neon-pink animate-pulse-glow" />
                                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-neon-blue animate-ping" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black holo-text mb-4">
                            Welcome Back! 🎉
                        </h2>
                        <p className="text-gray-200 text-lg">
                            Sign in to continue your <span className="text-neon-blue font-semibold">emotional journey</span> ✨
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="glass-card rounded-xl p-4 flex items-center space-x-3 border border-red-500/30 shake-error">
                                <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                                <span className="text-red-300 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Email Field */}
                            <div className="animate-slide-up">
                                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                                    📧 Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-blue group-focus-within:text-neon-pink transition-colors" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-glass w-full pl-12 pr-4 py-4 text-white placeholder-gray-300 focus:scale-105 transition-all duration-300"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                                    🔒 Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-blue group-focus-within:text-neon-pink transition-colors" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-glass w-full pl-12 pr-12 py-4 text-white placeholder-gray-300 focus:scale-105 transition-all duration-300"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-neon-blue transition-colors wiggle-hover"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-neon-blue hover:text-neon-pink transition-colors font-medium wiggle-hover"
                            >
                                🤔 Forgot your password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary-glass py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 wiggle-hover animate-slide-up"
                            style={{ animationDelay: '0.3s' }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="loading-glass mr-3"></div>
                                    ⚡ Signing In...
                                </div>
                            ) : (
                                <span className="flex items-center justify-center">
                                    🚀 Sign In
                                </span>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 glass text-gray-300 rounded-full font-medium">✨ Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
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
                                    // Show One Tap / popup
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
                            className="w-full glass-card py-4 px-6 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 flex items-center justify-center group wiggle-hover animate-slide-up"
                            style={{ animationDelay: '0.5s' }}
                        >
                            <img
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google"
                                className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
                            />
                            {googleReady ? '🌟 Sign in with Google' : '⏳ Loading Google...'}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
                            <span className="text-gray-300">Don't have an account? </span>
                            <Link
                                to="/register"
                                className="text-neon-blue hover:text-neon-pink font-bold transition-colors wiggle-hover"
                            >
                                🎯 Sign up here
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Additional Info */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                    <div className="glass rounded-2xl p-4">
                        <p className="text-sm text-gray-300">
                            By signing in, you agree to our{' '}
                            <Link to="/terms" className="text-neon-blue hover:text-neon-pink transition-colors">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
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
