import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Heart,
    Menu,
    X,
    User,
    LogOut,
    MessageCircle,
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
                        <Link to={isAuthenticated ? "/loved-ones" : "/"} className="flex items-center space-x-3 group">
                            <div className="relative">
                                <Heart className="h-10 w-10 text-love-400 hover:text-love-300 transition-colors duration-300 animate-warm-pulse" />
                                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-warm-300 animate-peaceful-float" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-love-400 to-warm-400 bg-clip-text text-transparent">
                                Emofelix
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-6">
                                {/* Main Navigation - Chat focused */}
                                <Link
                                    to="/loved-ones"
                                    className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-love-500/30 to-warm-500/30 text-white border-2 border-love-400/30 hover:from-love-500/50 hover:to-warm-500/50 hover:border-love-400/60 transition-all duration-300 shadow-love backdrop-blur-sm"
                                >
                                    <MessageCircle className="h-5 w-5 text-love-300" />
                                    <span className="font-semibold">💕 My Loved Ones</span>
                                </Link>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/profile"
                                        className="p-3 rounded-full bg-gradient-to-r from-comfort-500/20 to-peace-500/20 text-white border border-white/20 hover:from-comfort-500/40 hover:to-peace-500/40 transition-all duration-300 group"
                                        title="My Profile"
                                    >
                                        <User className="h-5 w-5 text-comfort-300 group-hover:text-white transition-colors" />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-white/20 hover:from-orange-500/40 hover:to-red-500/40 transition-all duration-300 group"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5 text-orange-300 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-6 py-2 rounded-full bg-gradient-to-r from-comfort-500/20 to-peace-500/20 text-white border border-white/20 hover:from-comfort-500/30 hover:to-peace-500/30 transition-all duration-300 font-medium"
                                >
                                    💝 Welcome Back
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-3 rounded-full bg-gradient-to-r from-love-500 to-warm-500 text-white font-semibold hover:from-love-600 hover:to-warm-600 transition-all duration-300 shadow-love"
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
                                <X className="h-6 w-6 text-love-300" />
                            ) : (
                                <Menu className="h-6 w-6 text-warm-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 glass-card rounded-2xl mt-4 animate-slide-down border-2 border-love-400/20">
                        <div className="flex flex-col space-y-4 px-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/loved-ones"
                                        className="flex items-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-love-500/30 to-warm-500/30 text-white border-2 border-love-400/30 hover:from-love-500/50 hover:to-warm-500/50 transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <MessageCircle className="h-6 w-6 text-love-300" />
                                        <span className="font-semibold text-lg">💕 My Loved Ones</span>
                                    </Link>
                                    <div className="flex space-x-3">
                                        <Link
                                            to="/profile"
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-comfort-500/20 to-peace-500/20 text-white border border-white/20 hover:from-comfort-500/40 hover:to-peace-500/40 transition-all duration-300"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="h-5 w-5 text-comfort-300" />
                                            <span className="font-medium">Profile</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-white/20 hover:from-orange-500/40 hover:to-red-500/40 transition-all duration-300"
                                        >
                                            <LogOut className="h-5 w-5 text-orange-300" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-comfort-500/20 to-peace-500/20 text-white border border-white/20 hover:from-comfort-500/30 hover:to-peace-500/30 transition-all duration-300 text-center font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        💝 Welcome Back
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-love-500 to-warm-500 text-white font-semibold hover:from-love-600 hover:to-warm-600 transition-all duration-300 text-center shadow-love"
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
