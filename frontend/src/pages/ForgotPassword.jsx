import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Lock, Sparkles, Heart } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiBase';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    // Start countdown timer
    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Step 1: Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/api/forgot-password/`, {
                email: formData.email
            });
            setSuccess('If an account with this email exists, an OTP has been sent.');
            setStep(2);
            startCountdown();
        } catch (error) {
            console.error('Forgot password error:', error);
            setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            setError('Please enter the OTP');
            return;
        }

        if (!formData.new_password) {
            setError('Please enter a new password');
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        if (formData.new_password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/api/reset-password/`, {
                email: formData.email,
                otp: formData.otp,
                new_password: formData.new_password
            });
            setSuccess('Password has been reset successfully!');
            setStep(3);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/api/forgot-password/`, {
                email: formData.email
            });
            setSuccess('OTP has been resent to your email.');
            startCountdown();
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError(error.response?.data?.error || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                            {step === 1 && 'Forgot Password? 🤔'}
                            {step === 2 && 'Enter OTP 📱'}
                            {step === 3 && 'Success! 🎉'}
                        </h2>
                        <p className="text-gray-200 text-lg">
                            {step === 1 && "Don't worry, we'll help you get back in! ✨"}
                            {step === 2 && 'Check your email and enter the OTP below 📧'}
                            {step === 3 && 'Your password has been reset successfully! 🎊'}
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="glass-card rounded-xl p-4 flex items-center space-x-3 border border-red-500/30 shake-error mb-6">
                            <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                            <span className="text-red-300 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="glass-card rounded-xl p-4 flex items-center space-x-3 border border-green-500/30 mb-6">
                            <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
                            <span className="text-green-300 text-sm font-medium">{success}</span>
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
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
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary-glass py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 wiggle-hover animate-slide-up"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="loading-glass mr-3"></div>
                                        📤 Sending OTP...
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        📤 Send OTP
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP and New Password */}
                    {step === 2 && (
                        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                            <div className="space-y-6">
                                {/* OTP Input */}
                                <div className="animate-slide-up">
                                    <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2">
                                        🔢 Enter OTP
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="input-glass w-full py-4 text-center text-2xl font-bold text-white placeholder-gray-300 focus:scale-105 transition-all duration-300"
                                        placeholder="000000"
                                    />
                                </div>

                                {/* New Password */}
                                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <label htmlFor="new_password" className="block text-sm font-semibold text-white mb-2">
                                        🔒 New Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-blue group-focus-within:text-neon-pink transition-colors" />
                                        <input
                                            id="new_password"
                                            name="new_password"
                                            type="password"
                                            required
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            className="input-glass w-full pl-12 pr-4 py-4 text-white placeholder-gray-300 focus:scale-105 transition-all duration-300"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <label htmlFor="confirm_password" className="block text-sm font-semibold text-white mb-2">
                                        🔒 Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-blue group-focus-within:text-neon-pink transition-colors" />
                                        <input
                                            id="confirm_password"
                                            name="confirm_password"
                                            type="password"
                                            required
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className="input-glass w-full pl-12 pr-4 py-4 text-white placeholder-gray-300 focus:scale-105 transition-all duration-300"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Resend OTP */}
                            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0 || loading}
                                    className="text-sm text-neon-blue hover:text-neon-pink transition-colors font-medium wiggle-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {countdown > 0 ? (
                                        <span className="flex items-center justify-center">
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Resend in {countdown}s
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            🔄 Resend OTP
                                        </span>
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary-glass py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 wiggle-hover animate-slide-up"
                                style={{ animationDelay: '0.4s' }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="loading-glass mr-3"></div>
                                        🔄 Resetting Password...
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        🔑 Reset Password
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success Message */}
                    {step === 3 && (
                        <div className="text-center py-8 animate-bounce-in">
                            <div className="mb-6">
                                <CheckCircle className="h-24 w-24 text-green-400 mx-auto animate-pulse-glow" />
                            </div>
                            <p className="text-gray-300 text-lg mb-6">
                                You'll be redirected to login in a few seconds...
                            </p>
                            <Link
                                to="/login"
                                className="btn-primary-glass py-3 px-6 rounded-2xl font-bold hover:scale-105 transition-all duration-300 wiggle-hover inline-flex items-center"
                            >
                                🚀 Go to Login
                            </Link>
                        </div>
                    )}

                    {/* Back to Login */}
                    {step < 3 && (
                        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                            <Link
                                to="/login"
                                className="text-neon-blue hover:text-neon-pink font-bold transition-colors wiggle-hover inline-flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                🏠 Back to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                    <div className="glass rounded-2xl p-4">
                        <p className="text-sm text-gray-300">
                            Having trouble? Contact our support team at{' '}
                            <a href="mailto:support@emofelix.com" className="text-neon-blue hover:text-neon-pink transition-colors">
                                support@emofelix.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;