import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    AlertCircle,
    Heart,
} from "lucide-react";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";
import { API_BASE_URL } from "../apiBase";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsLoading, setTermsLoading] = useState(false);

    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate("/dashboard");
            } else if (result.error?.includes("Terms and Conditions")) {
                setShowTermsModal(true);
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTermsForLogin = async () => {
        setTermsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/accept-terms/`, {
                terms_accepted: true,
            });
            setShowTermsModal(false);
            navigate("/dashboard");
        } catch (err) {
            console.error("Terms acceptance error:", err);
            setError("Failed to accept terms. Please try again.");
        } finally {
            setTermsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                            Welcome Back to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
                                EmoFelix
                            </span>
                        </h2>
                        <p className="text-gray-300 text-sm">
                            Connect with your virtual loved ones
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center backdrop-blur-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <span className="text-red-200 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Email/Password Login */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                                    className="glass-input pl-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

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
                                    className="glass-input pl-10 pr-10 w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold rounded-xl hover:shadow-neon-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-400">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Login */}
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
                        <Link
                            to="/forgot-password"
                            className="text-neon-blue hover:text-neon-pink text-sm"
                        >
                            Forgot your password?
                        </Link>
                        <div>
                            <span className="text-gray-400 text-sm">
                                Don't have an account?{" "}
                            </span>
                            <Link
                                to="/register"
                                className="text-neon-pink hover:text-neon-blue text-sm font-semibold"
                            >
                                Sign up
                            </Link>
                        </div>
                        <p className="text-xs text-gray-500">
                            By signing in, you agree to our{" "}
                            <button
                                type="button"
                                onClick={() => setShowTermsModal(true)}
                                className="text-neon-blue hover:text-neon-pink underline transition-colors"
                            >
                                Terms of Service
                            </button>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-neon-blue">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={handleAcceptTermsForLogin}
                isLoading={termsLoading}
            />
        </div>
    );
};

export default Login;
