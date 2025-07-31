import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Heart,
    Menu,
    X,
    User,
    LogOut,
    MessageCircle,
    Settings,
    Home
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
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Heart className="h-8 w-8 text-primary-600" />
                            <span className="text-2xl font-bold text-gray-900">Emofelix</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/relations"
                                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Relations</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-primary-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Home className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/relations"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        <span>Relations</span>
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors text-left"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-primary-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
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
