import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    Phone,
    Video,
    Crown,
    MessageCircle
} from 'lucide-react';

const CallSetup = () => {
    const { relationId } = useParams();
    const navigate = useNavigate();
    const [relation, setRelation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAppDownload, setShowAppDownload] = useState(false);
    const [selectedCallType, setSelectedCallType] = useState(null);

    // Call setup state
    const [mood, setMood] = useState(2); // Default to okay (middle option)
    const [language, setLanguage] = useState('English');
    const [topic, setTopic] = useState('General Chat');
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Mood emojis for the mood selector - Reduced to 5
    const moodEmojis = ['😢', '', '🙂', '😊', '🥰'];
    const moodLabels = ['Sad', 'Neutral', 'Okay', 'Happy', 'Joyful'];

    const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'];
    const topics = [
        'General Chat',
        'Life Advice',
        'Emotional Support',
        'Daily Check-in',
        'Relationship Talk',
        'Work & Career',
        'Health & Wellness',
        'Dreams & Goals',
        'Memories & Stories',
        'Fun & Entertainment'
    ];

    useEffect(() => {
        const loadRelation = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/relations/${relationId}/`);
                setRelation(response.data);
            } catch (error) {
                console.error('Failed to fetch relation:', error);
                navigate('/loved-ones');
            } finally {
                setLoading(false);
            }
        };

        loadRelation();
    }, [relationId, navigate]);

    const handleStartCall = (callType) => {
        // Save call preferences
        const callData = {
            mood,
            language,
            topic,
            additionalDetails,
            callType
        };

        // Store call preferences in sessionStorage for the chat component
        sessionStorage.setItem('callPreferences', JSON.stringify(callData));

        if (callType === 'voice' || callType === 'video') {
            // Show app download modal for voice/video calls
            setSelectedCallType(callType);
            setShowAppDownload(true);
        } else {
            // Direct navigation for text chat
            navigate(`/chat/${relationId}?callType=${callType}`);
        }
    };

    const handleCloseAppDownload = () => {
        setShowAppDownload(false);
        setSelectedCallType(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!relation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-white text-xl">Relation not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-peaceful bg-300% animate-loving-shift opacity-30"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-warm-400 rounded-full animate-peaceful-float opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/loved-ones')}
                        className="flex items-center space-x-3 text-pink-200 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-base font-medium">Back to Loved Ones</span>
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-1">Connection Setup</h1>
                        <p className="text-pink-200 text-sm">Prepare for your conversation with {relation.name}</p>
                    </div>

                    <div className="w-48"></div> {/* Spacer for balance */}
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Relation Info */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 border-2 border-love-400/20 text-center h-full">
                            <div className="w-24 h-24 bg-gradient-to-br from-love-400 to-warm-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-love">
                                <span className="text-4xl">👤</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{relation.name}</h2>
                            <p className="text-pink-200 text-base">{relation.relation_type}</p>
                            <div className="mt-3 flex items-center justify-center space-x-2">
                                <span className="w-2 h-2 bg-peace-400 rounded-full animate-ping"></span>
                                <span className="text-pink-200 text-sm">Ready to connect</span>
                            </div>

                            {/* Mood Selector - Compact */}
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-white mb-3">How are you feeling?</h3>
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {moodEmojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setMood(index)}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-all duration-300 ${mood === index
                                                    ? 'bg-gradient-to-br from-warm-400 to-love-500 scale-110 shadow-warm'
                                                    : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <span className="text-base text-white font-semibold">{moodLabels[mood]}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Preferences */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 border-2 border-comfort-400/20 h-full">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">Preferences</h3>

                            <div className="space-y-4">
                                {/* Language */}
                                <div>
                                    <label className="block text-base font-medium text-pink-200 mb-2">Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full p-3 border-2 border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-love-400 focus:border-love-400 transition-all"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang} value={lang} className="bg-gray-800 text-white">{lang}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Topic */}
                                <div>
                                    <label className="block text-base font-medium text-pink-200 mb-2">Topic</label>
                                    <select
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full p-3 border-2 border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-love-400 focus:border-love-400 transition-all"
                                    >
                                        {topics.map((topicOption) => (
                                            <option key={topicOption} value={topicOption} className="bg-gray-800 text-white">{topicOption}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Additional Details */}
                                <div>
                                    <label className="block text-base font-medium text-pink-200 mb-2">What's on your mind?</label>
                                    <textarea
                                        value={additionalDetails}
                                        onChange={(e) => setAdditionalDetails(e.target.value)}
                                        placeholder="Share anything specific..."
                                        className="w-full p-3 border-2 border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-pink-300 resize-none focus:ring-2 focus:ring-love-400 focus:border-love-400 transition-all"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Connection Options */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 border-2 border-peace-400/20 h-full">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">Choose Connection</h3>

                            <div className="space-y-3">
                                {/* Voice Call */}
                                <button
                                    onClick={() => handleStartCall('voice')}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        <div className="text-left">
                                            <div className="text-lg">Voice Call</div>
                                            <div className="text-xs opacity-90">Talk naturally</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>

                                {/* Video Call */}
                                <button
                                    onClick={() => handleStartCall('video')}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Video className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <div className="text-lg flex items-center">
                                                Video Call
                                                <Crown className="h-4 w-4 ml-1" />
                                            </div>
                                            <div className="text-xs opacity-90">Face-to-face</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>

                                {/* Text Chat */}
                                <button
                                    onClick={() => handleStartCall('chat')}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <MessageCircle className="h-6 w-6 group-hover:bounce transition-transform" />
                                        <div className="text-left">
                                            <div className="text-lg">Text Chat</div>
                                            <div className="text-xs opacity-90">Written words</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Download Modal */}
                {showAppDownload && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="glass-card rounded-3xl p-8 border-2 border-love-400/30 text-center max-w-md w-full mx-4">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-love-400 to-warm-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-love">
                                    <span className="text-3xl">📱</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {selectedCallType === 'voice' ? 'Voice Calls' : 'Video Calls'} Available on Mobile
                                </h2>
                                <p className="text-pink-200">
                                    Download our mobile app to enjoy {selectedCallType === 'voice' ? 'voice' : 'video'} calls with your loved ones
                                </p>
                            </div>

                            {/* App Store Links */}
                            <div className="space-y-3 mb-6">
                                {/* iOS App Store */}
                                <a
                                    href="https://apps.apple.com/app/emofelix"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-3 w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <span className="text-2xl">🍎</span>
                                    <div className="text-left">
                                        <div className="text-sm opacity-90">Download on the</div>
                                        <div className="text-lg font-bold">App Store</div>
                                    </div>
                                </a>

                                {/* Google Play Store */}
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.emofelix"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-3 w-full p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <span className="text-2xl">📱</span>
                                    <div className="text-left">
                                        <div className="text-sm opacity-90">Get it on</div>
                                        <div className="text-lg font-bold">Google Play</div>
                                    </div>
                                </a>
                            </div>

                            {/* Alternative - Continue with Text Chat */}
                            <div className="border-t border-white/20 pt-4">
                                <p className="text-pink-200 text-sm mb-3">Or continue with text chat on web</p>
                                <button
                                    onClick={() => navigate(`/chat/${relationId}?callType=chat`)}
                                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    <span>Continue with Text Chat</span>
                                </button>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleCloseAppDownload}
                                className="absolute top-4 right-4 p-2 text-pink-200 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300"
                            >
                                <ArrowLeft className="h-5 w-5 rotate-45" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallSetup;
