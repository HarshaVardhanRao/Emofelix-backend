import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Plus,
    MessageCircle,
    Heart,
    Clock,
    TrendingUp,
    Users,
    Star,
    Calendar,
    ArrowRight
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [relations, setRelations] = useState([]);
    const [stats, setStats] = useState({
        totalRelations: 0,
        totalChats: 0,
        avgMoodRating: 0,
        streakDays: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentChats, setRecentChats] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch relations
            const relationsResponse = await axios.get(`${API_BASE_URL}/api/relations/`);
                setRelations(relationsResponse.data);

                // Fetch call history for recent chats
            const historyResponse = await axios.get(`${API_BASE_URL}/api/call-history/`);
                setRecentChats(historyResponse.data.slice(0, 5)); // Get last 5 chats

                // Calculate stats
                setStats({
                    totalRelations: relationsResponse.data.length,
                    totalChats: historyResponse.data.length,
                    avgMoodRating: 4.2, // Mock data
                    streakDays: 7 // Mock data
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.first_name || 'Friend'}! 👋
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Ready to connect with your AI companions today?
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                to="/relations"
                                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Relation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: 'Total Relations',
                            value: stats.totalRelations,
                            icon: Users,
                            color: 'bg-blue-500',
                            bgColor: 'bg-blue-50',
                            textColor: 'text-blue-700'
                        },
                        {
                            title: 'Total Conversations',
                            value: stats.totalChats,
                            icon: MessageCircle,
                            color: 'bg-green-500',
                            bgColor: 'bg-green-50',
                            textColor: 'text-green-700'
                        },
                        {
                            title: 'Average Mood',
                            value: `${stats.avgMoodRating}/5`,
                            icon: Star,
                            color: 'bg-yellow-500',
                            bgColor: 'bg-yellow-50',
                            textColor: 'text-yellow-700'
                        },
                        {
                            title: 'Daily Streak',
                            value: `${stats.streakDays} days`,
                            icon: TrendingUp,
                            color: 'bg-purple-500',
                            bgColor: 'bg-purple-50',
                            textColor: 'text-purple-700'
                        }
                    ].map((stat, index) => (
                        <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${stat.textColor}`}>{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* My Relations */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">My Relations</h2>
                                <Link
                                    to="/relations"
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                                >
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>

                            {relations.length === 0 ? (
                                <div className="text-center py-12">
                                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No relations yet</h3>
                                    <p className="text-gray-600 mb-6">Create your first AI companion to get started</p>
                                    <Link
                                        to="/relations"
                                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create First Relation
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relations.slice(0, 4).map((relation) => (
                                        <div key={relation.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold text-lg">
                                                        {relation.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{relation.name}</h3>
                                                    <p className="text-sm text-gray-600">{relation.relation_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-500">
                                                    Voice: {relation.voice_model}
                                                </div>
                                                <Link
                                                    to={`/chat/${relation.id}`}
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                                                >
                                                    Chat
                                                    <MessageCircle className="h-4 w-4 ml-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-6">
                        {/* Recent Chats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Chats</h2>

                            {recentChats.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No recent chats</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentChats.map((chat, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <MessageCircle className="h-4 w-4 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {chat.relation_name || 'Unknown Relation'}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {new Date(chat.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {Math.floor(chat.duration_seconds / 60)}m
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/relations"
                                    className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    <Plus className="h-5 w-5 text-primary-600" />
                                    <span className="text-primary-700 font-medium">Create New Relation</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Users className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-700 font-medium">Edit Profile</span>
                                </Link>
                                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-yellow-600" />
                                    <span className="text-yellow-700 font-medium">Daily Check-in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
