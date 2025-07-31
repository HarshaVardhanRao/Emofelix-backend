import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Heart,
    Menu,
    X,
    User,
    LogOut,
    MessageCircle,
    Home,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <Heart className="h-10 w-10 text-rose-400 hover:text-rose-300 transition-colors duration-300" />
                                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300 animate-ping" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                                Emofelix
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                                >
                                    <Home className="h-4 w-4 text-purple-300" />
                                    <span className="font-medium">🏠 My Space</span>
                                </Link>
                                <Link
                                    to="/relations"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-white/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300"
                                >
                                    <MessageCircle className="h-4 w-4 text-emerald-300" />
                                    <span className="font-medium">💕 My Loved Ones</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-white/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300"
                                >
                                    <User className="h-4 w-4 text-blue-300" />
                                    <span className="font-medium">✨ My Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-white/20 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
                                >
                                    <LogOut className="h-4 w-4 text-orange-300" />
                                    <span className="font-medium">� See You Later</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/20 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 font-medium"
                                >
                                    � Welcome Back
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-500/25"
                                >
                                    ✨ Join Our Family
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-full bg-white/10 backdrop-blur-lg text-white hover:bg-white/20 transition-all duration-300"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-rose-300" />
                            ) : (
                                <Menu className="h-6 w-6 text-purple-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 glass-card rounded-2xl mt-4 animate-slide-down">
                        <div className="flex flex-col space-y-3 px-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Home className="h-5 w-5 text-purple-300" />
                                        <span className="font-medium">🏠 My Space</span>
                                    </Link>
                                    <Link
                                        to="/relations"
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-white/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <MessageCircle className="h-5 w-5 text-emerald-300" />
                                        <span className="font-medium">💕 My Loved Ones</span>
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-white/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5 text-blue-300" />
                                        <span className="font-medium">✨ My Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-white/20 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 text-left"
                                    >
                                        <LogOut className="h-5 w-5 text-orange-300" />
                                        <span className="font-medium">� See You Later</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/20 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 text-center font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        � Welcome Back
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-center shadow-lg shadow-pink-500/25"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        ✨ Join Our Family
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
