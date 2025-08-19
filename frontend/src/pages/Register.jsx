import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, Heart, Shield } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../apiBase";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(""); // clear error when typing
        if (success) setSuccess(""); // clear success when typing
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setError("Please enter your email first");
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }

        setOtpSending(true);
        setError("");
        setSuccess("");

        try {
            await axios.post(`${API_BASE_URL}/api/send-otp/`, {
                email: formData.email,
            });

            setOtpSent(true);
            setSuccess("OTP sent successfully! Please check your email.");
        } catch (err) {
            console.error("OTP sending error:", err);
            setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
        } finally {
            setOtpSending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }

        if (!otpSent) {
            setError("Please send and verify OTP first");
            return;
        }

        if (!formData.otp) {
            setError("Please enter the OTP sent to your email");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, {
                first_name: formData.name.split(' ')[0] || formData.name,
                last_name: formData.name.split(' ').slice(1).join(' ') || '',
                email: formData.email,
                password: formData.password,
                otp: formData.otp,
                terms_accepted: termsAccepted,
            });

            if (response.data) {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            console.error("Register error:", err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 410) {
                setError("OTP has expired. Please request a new OTP.");
                setOtpSent(false);
            } else {
                setError("Registration failed. Please try again.");
            }
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
                            animationDuration: `${4 + Math.random() * 4}s`,
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
                            Create your{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
                                EmoFelix
                            </span>{" "}
                            account
                        </h2>
                        <p className="text-gray-300 text-sm">Join and connect instantly</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center backdrop-blur-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <span className="text-red-200 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Success Display */}
                    {success && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center backdrop-blur-sm">
                            <Shield className="w-5 h-5 text-green-400 mr-2" />
                            <span className="text-green-200 text-sm">{success}</span>
                        </div>
                    )}

                    {/* Register Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="glass-input pl-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={otpSent}
                                        className="glass-input pl-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 disabled:opacity-50"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={otpSending || !formData.email || otpSent}
                                    className="px-4 py-3 bg-gradient-to-r from-neon-blue to-neon-pink text-white font-medium rounded-xl hover:shadow-neon-sm transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                                >
                                    {otpSending ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                            Sending...
                                        </div>
                                    ) : otpSent ? (
                                        "OTP Sent ✓"
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* OTP Input - Only show after OTP is sent */}
                        {otpSent && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        maxLength="6"
                                        className="glass-input pl-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                        placeholder="Enter 6-digit OTP from email"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Check your email for the OTP. It's valid for 10 minutes.
                                </p>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="glass-input pl-10 pr-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="glass-input pl-10 pr-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <span className="text-gray-400 hover:text-white transition-colors text-sm">
                                            Hide
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 hover:text-white transition-colors text-sm">
                                            Show
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 text-neon-blue bg-white/10 border-white/20 rounded focus:ring-neon-blue focus:ring-2"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-300">
                                I agree to the{" "}
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(true)}
                                    className="text-neon-blue hover:text-neon-pink underline transition-colors"
                                >
                                    Terms and Conditions
                                </button>{" "}
                                and Privacy Policy
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading || !otpSent}
                            className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold rounded-xl hover:shadow-neon-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating account...
                                </div>
                            ) : !otpSent ? (
                                "Send OTP to Continue"
                            ) : (
                                "Verify OTP & Create Account"
                            )}
                        </button>
                    </form>

                    {/* OR Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    {/* Google Signup */}
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (!credentialResponse.credential) {
                                setError("No Google credential received");
                                return;
                            }
                            try {
                                setLoading(true);
                                const result = await googleLogin(
                                    credentialResponse.credential,
                                    false
                                );
                                if (result.success) {
                                    if (result.requires_terms_acceptance) {
                                        setShowTermsModal(true);
                                    } else {
                                        navigate("/dashboard");
                                    }
                                } else {
                                    setError(result.error || "Google login failed");
                                }
                            } catch (err) {
                                console.error("Google login error:", err);
                                setError("Google login failed. Please try again.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        onError={() => {
                            setError("Google login failed. Please try again.");
                        }}
                    />

                    {/* Footer */}
                    <div className="mt-6 space-y-4 text-center">
                        <span className="text-gray-400 text-sm">
                            Already have an account?{" "}
                        </span>
                        <Link
                            to="/login"
                            className="text-neon-pink hover:text-neon-blue transition-colors text-sm font-semibold"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                    // If user was trying to send OTP, send it now
                    if (!otpSent && formData.email) {
                        handleSendOTP();
                    }
                }}
                isLoading={false}
            />
        </div>
    );
};

export default Register;
