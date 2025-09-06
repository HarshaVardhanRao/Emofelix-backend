import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiBase';
import { sendChatMessage, generateInitialGreeting } from '../utils/aiService';
import {
    ArrowLeft,
    Phone,
    Video,
    Crown,
    MessageCircle,
    Lock,
    Send
} from 'lucide-react';

const CallSetup = () => {
    const { relationId } = useParams(); // We'll keep this param name for compatibility
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Call setup state
    const [mood, setMood] = useState(2); // Default to okay (middle option)
    const [language, setLanguage] = useState('English');
    const [topic, setTopic] = useState('General Chat');
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Mood emojis for the mood selector - Reduced to 5
    const moodEmojis = ['😢', '😐', '🙂', '😊', '🥰'];
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
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadCharacter = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/characters/${relationId}/`);
                setCharacter(response.data);
            } catch (error) {
                console.error('Failed to fetch character:', error);
                navigate('/loved-ones');
            } finally {
                setLoading(false);
            }
        };

        loadCharacter();
    }, [relationId, navigate]);

    const handleStartCall = async (callType) => {
        const callData = {
            mood,
            moodLabel: moodLabels[mood],
            language,
            topic,
            additionalDetails,
            callType,
            sendAsFirstMessage: additionalDetails.trim().length > 0 // Flag to send message if present
        };
        sessionStorage.setItem('callPreferences', JSON.stringify(callData));

        if (callType === 'voice' || callType === 'video') {
            return; // Locked on web
        }

        try {
            // Generate initial greeting using AI service directly
            console.log('[CallSetup] Generating initial greeting via AI API...');
            const initialGreeting = await generateInitialGreeting(
                character?.character_type || 'Friend',
                moodLabels[mood],
                topic,
                additionalDetails,
                '', // nickname will be fetched automatically
                relationId // characterId for nickname fetching
            );

            // Store the initial greeting in session storage
            sessionStorage.setItem('initialAIGreeting', initialGreeting);
            console.log('[CallSetup] Initial greeting generated and stored');
        } catch (error) {
            console.error('[CallSetup] Failed to generate initial greeting:', error);
            // Store a fallback greeting
            sessionStorage.setItem('initialAIGreeting', 
                `Hello! I'm so glad you're here. How are you feeling today? 💕`
            );
        }

        // Optional: Still call backend for logging/tracking purposes
        axios.post(`${API_BASE_URL}/api/characters/${relationId}/start-call/`, {
            call_type: callType,
            mood: moodLabels[mood],
            topic,
            additional_details: additionalDetails,
            language,
        }).catch(() => {/* ignore backend errors */ });

        // Navigate to chat
        const directMessageParam = additionalDetails.trim().length > 0 ? '&directMessage=true' : '';
        navigate(`/chat/${relationId}?callType=${callType}${directMessageParam}`);
    };

    const handleSendMessage = async () => {
        if (!additionalDetails.trim()) return;

        // Store the message as the first user message and start chat immediately
        const callData = {
            mood,
            moodLabel: moodLabels[mood],
            language,
            topic,
            additionalDetails,
            callType: 'chat',
            sendAsFirstMessage: true // Flag to indicate this should be sent as first message
        };
        sessionStorage.setItem('callPreferences', JSON.stringify(callData));

        try {
            // Send the message directly to AI API
            console.log('[CallSetup] Sending message directly to AI API...');
            const aiResponse = await sendChatMessage({
                message: additionalDetails,
                relationType: character?.character_type || 'Friend',
                mood: moodLabels[mood],
                topic: topic,
                additionalDetails: '',
                characterId: relationId, // For automatic nickname fetching
                history: []
            });

            // Store the AI response for immediate display in chat
            sessionStorage.setItem('directMessageResponse', aiResponse);
            console.log('[CallSetup] AI response received and stored');
        } catch (error) {
            console.error('[CallSetup] Failed to get AI response:', error);
            // Store a fallback response
            sessionStorage.setItem('directMessageResponse', 
                "I'm here to listen and support you. Please tell me more about what's on your mind. 💝"
            );
        }

        // Optional: Still call backend for logging/tracking purposes
        axios.post(`${API_BASE_URL}/api/characters/${relationId}/start-call/`, {
            call_type: 'chat',
            mood: moodLabels[mood],
            topic,
            additional_details: additionalDetails,
            language,
        }).catch(() => {/* ignore backend errors */ });

        // Navigate to chat immediately
        navigate(`/chat/${relationId}?callType=chat&directMessage=true`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-white text-xl">Character not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-peaceful bg-300% animate-loving-shift opacity-30"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-warm-400 rounded-full opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `floatSlow ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/loved-ones')}
                        className="flex items-center space-x-3 text-pink-200 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-base font-medium">Back to Loved Ones</span>
                    </button>

                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-rose-200">Connection Setup</h1>

                    <div className="w-48" />
                </div>

                {/* Two blocks: Preferences & Contact (left) and Connection (right) */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                    {/* Left: Preferences & Contact */}
                    <div>
                        <div className="glass-card rounded-2xl p-6 border-2 border-love-400/20 relative overflow-hidden">
                            <h3 className="text-xl font-bold text-white mb-4">Preferences & Contact</h3>
                            {/* Character (Contact) */}
                            <div className="relative w-full flex items-center gap-4 mb-6">
                                <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-love-400 to-warm-500 shadow-love" />
                                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20" />
                                    <div className="absolute inset-0 flex items-center justify-center text-3xl">👤</div>
                                    <div className="absolute inset-0 spin-slower">
                                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow" />
                                        <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow" />
                                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow" />
                                        <div className="absolute top-1/2 -left-0.5 -translate-y-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{character.name}</h2>
                                    <p className="text-pink-200 text-sm">{character.character_type}</p>
                                </div>
                            </div>

                            {/* Mood */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-white mb-3">How are you feeling?</h4>
                                <div className="flex items-center gap-3 mb-2">
                                    {moodEmojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setMood(index)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${mood === index
                                                ? 'bg-gradient-to-br from-warm-400 to-love-500 scale-110 shadow-warm emoji-wiggle'
                                                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                                                }`}
                                            aria-label={`Mood ${moodLabels[index]}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-white font-semibold">{moodLabels[mood]}</div>
                            </div>

                            {/* Preferences */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="transition-transform duration-300 hover:-translate-y-0.5">
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

                                <div className="transition-transform duration-300 hover:-translate-y-0.5">
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

                                <div className="md:col-span-2 transition-transform duration-300 hover:-translate-y-0.5">
                                    <label className="block text-base font-medium text-pink-200 mb-2">What's on your mind?</label>
                                    <div className="relative">
                                        <textarea
                                            value={additionalDetails}
                                            onChange={(e) => setAdditionalDetails(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Share anything specific... (Ctrl+Enter to send)"
                                            className="w-full p-3 pr-12 border-2 border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-pink-300 resize-none focus:ring-2 focus:ring-love-400 focus:border-love-400 transition-all"
                                            rows={4}
                                        />
                                        {additionalDetails.trim() && (
                                            <button
                                                onClick={handleSendMessage}
                                                className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg group"
                                                title="Send message and start chat (Ctrl+Enter)"
                                            >
                                                <Send className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                    {additionalDetails.trim() && (
                                        <div className="mt-2 text-xs text-pink-300 flex items-center gap-1">
                                            <Send className="h-3 w-3" />
                                            <span>Press the send button or Ctrl+Enter to start chatting immediately</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Connection */}
                    <div>
                        <div className="glass-card rounded-2xl p-6 border-2 border-comfort-400/20 h-full flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">Connection</h3>
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                                {/* Voice Call (locked) */}
                                <div className="relative opacity-70">
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 text-white font-bold rounded-xl cursor-not-allowed"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-6 w-6" />
                                            <div className="text-left">
                                                <div className="text-lg flex items-center">Voice Call <Lock className="h-4 w-4 ml-2" /></div>
                                                <div className="text-xs opacity-90">Mobile only</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Video Call (locked) */}
                                <div className="relative opacity-70">
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-600/50 to-rose-600/50 text-white font-bold rounded-xl cursor-not-allowed"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Video className="h-6 w-6" />
                                            <div className="text-left">
                                                <div className="text-lg flex items-center">Video Call <Crown className="h-4 w-4 ml-1" /><Lock className="h-4 w-4 ml-2" /></div>
                                                <div className="text-xs opacity-90">Mobile only</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Text Chat (enabled) */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity animate-gradientMove bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur" />
                                    <button
                                        type="button"
                                        onClick={() => handleStartCall('chat')}
                                        className="relative w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <MessageCircle className="h-6 w-6" />
                                            <div className="text-left">
                                                <div className="text-lg">Text Chat</div>
                                                <div className="text-xs opacity-90">Written words</div>
                                            </div>
                                        </div>
                                        <ArrowLeft className="h-5 w-5 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Component-scoped animations */}
            <style>{`
                @keyframes floatSlow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
                @keyframes spinSlow { to { transform: rotate(360deg) } }
                @keyframes gradientMoveKey { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
                @keyframes wiggle { 0%,100% { transform: rotate(0deg) } 25% { transform: rotate(5deg) } 75% { transform: rotate(-5deg) } }
                .spin-slower { animation: spinSlow 12s linear infinite; }
                .animate-gradientMove { background-size: 200% 200%; animation: gradientMoveKey 6s ease infinite; }
                .emoji-wiggle { animation: wiggle 0.6s ease; }
            `}</style>
        </div>
    );
};

export default CallSetup;
