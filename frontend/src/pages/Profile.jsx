import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    User,
    Mail,
    Edit,
    Save,
    Camera,
    Shield,
    Bell,
    Heart,
    Settings,
    Crown,
    Calendar,
    Award,
    Lock,
    Eye,
    EyeOff,
    X
} from 'lucide-react';
import { API_BASE_URL } from '../apiBase';

const Profile = () => {
    const { user, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        emocoins: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        totalChats: 0,
        totalRelations: 0,
        memberSince: '',
        currentPlan: 'Free'
    });

    // Password modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const initializeProfile = async () => {
            await fetchProfile();
            await fetchStats();
        };
        initializeProfile();
    }, [fetchProfile, fetchStats]);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/profile/`);
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            // Fetch relations for count
            const relationsResponse = await axios.get(`${API_BASE_URL}/api/relations/`);

            // Fetch call history for count
            const historyResponse = await axios.get(`${API_BASE_URL}/api/call-history/`);

            setStats({
                totalRelations: relationsResponse.data.length,
                totalChats: historyResponse.data.length,
                memberSince: user?.date_joined ? new Date(user.date_joined).getFullYear() : new Date().getFullYear(),
                currentPlan: 'Free' // This would come from your membership model
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.put('http://127.0.0.1:8000/api/profile/', profile);
            setEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert('New password must be at least 6 characters long!');
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/change-password/`, {
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword
            });

            alert('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to change password. Please check your current password.';
            alert(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };

    const openAccountSettings = () => {
        setShowPasswordModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Manage your account information and preferences
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="inline-flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                            ) : (
                                                <Save className="h-4 w-4 mr-1" />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Avatar */}
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-3xl">
                                            {profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                                        <Camera className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {profile.first_name} {profile.last_name}
                                    </h3>
                                    <p className="text-gray-600">{profile.email}</p>
                                    <p className="text-sm text-gray-500 mt-1">Member since {stats.memberSince}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            disabled
                                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Bell className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-600">Receive updates about your conversations</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Privacy Mode</p>
                                            <p className="text-sm text-gray-600">Enhanced privacy for conversations</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-gray-600">Relations</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{stats.totalRelations}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-gray-600">Total Chats</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{stats.totalChats}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">💰</span>
                                        <span className="text-sm text-gray-600">Emocoins</span>
                                    </div>
                                    <span className="font-semibold text-primary-600">{profile.emocoins || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Award className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm text-gray-600">Member Since</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{stats.memberSince}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Card */}
                        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 p-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <Crown className="h-5 w-5 text-primary-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                            </div>
                            <p className="text-2xl font-bold text-primary-600 mb-2">{stats.currentPlan}</p>
                            <p className="text-sm text-gray-600 mb-4">
                                {stats.currentPlan === 'Free'
                                    ? 'Upgrade to unlock more features'
                                    : 'Enjoying premium features'
                                }
                            </p>
                            <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                                {stats.currentPlan === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={openAccountSettings}
                                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Settings className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-700">Account Settings</span>
                                </button>
                                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                                    <Shield className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-700">Privacy & Security</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                >
                                    <Settings className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Enter new password"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        disabled={passwordLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
