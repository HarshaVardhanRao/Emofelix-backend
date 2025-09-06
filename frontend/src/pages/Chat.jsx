import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    ArrowLeft,
    Mic,
    MicOff,
    Heart,
    Phone,
    Video,
    PhoneOff
} from 'lucide-react';

import { API_BASE_URL } from '../apiBase';
import { sendChatMessage, generateInitialGreeting } from '../utils/aiService';

const Chat = () => {
    const { relationId } = useParams(); // Keep param name for compatibility
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useAuth();
    const [character, setCharacter] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [callPreferences, setCallPreferences] = useState(null);
    const messagesEndRef = useRef(null);

    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const isDirectMessage = urlParams.get('directMessage') === 'true';

    const fetchCharacter = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/characters/${relationId}/`);
            setCharacter(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch character:', error);
            navigate('/loved-ones');
        }
    }, [relationId, navigate]);

    // Helper to get the initial greeting from External AI (non-streaming)
    const streamInitialGreeting = useCallback(async ({ relationType, mood, topic, additionalDetails, nickname }) => {
        console.info('[ExternalAI] Starting initial greeting...');

        // Start with a typing indicator
        const typingId = Date.now();
        setMessages([
            {
                id: typingId,
                content: '',
                sender: 'ai',
                timestamp: new Date().toISOString(),
                typing: true
            }
        ]);

        try {
            const greeting = await generateInitialGreeting(
                relationType || 'Friend',
                mood || 'Neutral',
                topic || 'General conversation',
                additionalDetails || '',
                nickname || ''
            );

            // Replace typing with actual greeting
            setMessages([
                {
                    id: Date.now(),
                    content: greeting,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                }
            ]);

            console.info('[ExternalAI] Initial greeting completed');
        } catch (error) {
            console.error('[ExternalAI] Initial greeting failed:', error);
            // Replace typing with error message
            setMessages([
                {
                    id: Date.now(),
                    content: "Hello my dear! I'm so happy to see you today. How are you feeling? 💝",
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                }
            ]);
        }
    }, []);

    useEffect(() => {
        // Wait for auth token before starting initial greeting
        if (!token) return;

        // Dev-only guard to avoid double stream in React StrictMode
        if (import.meta.env.DEV) {
            window.CHAT_INIT_ONCE = window.CHAT_INIT_ONCE || {};
            if (window.CHAT_INIT_ONCE[relationId]) {
                return;
            }
            window.CHAT_INIT_ONCE[relationId] = true;
        }

        const initializeChat = () => {
            fetchCharacter().then((characterData) => {
                // Get call preferences from sessionStorage
                const savedPreferences = sessionStorage.getItem('callPreferences');
                let cleanup;
                if (savedPreferences) {
                    const preferences = JSON.parse(savedPreferences);
                    setCallPreferences(preferences);

                    // Handle direct message scenario
                    if (isDirectMessage && preferences.sendAsFirstMessage && preferences.additionalDetails) {
                        // Add the user message immediately
                        const userMessage = {
                            id: Date.now(),
                            content: preferences.additionalDetails,
                            sender: 'user',
                            timestamp: new Date().toISOString()
                        };
                        setMessages([userMessage]);

                        // Start AI response streaming using the same logic as handleSendMessage
                        const typingMessage = {
                            id: Date.now() + 1,
                            content: '',
                            sender: 'ai',
                            timestamp: new Date().toISOString(),
                            typing: true
                        };
                        setMessages(prev => [...prev, typingMessage]);

                        // Stream AI response
                        (async () => {
                            try {
                                const historyPayload = [];

                                const aiResponse = await sendChatMessage({
                                    message: preferences.additionalDetails,
                                    relationType: characterData?.character_type || 'Friend',
                                    mood: preferences?.moodLabel || preferences?.mood || 'Neutral',
                                    topic: preferences?.topic || 'General conversation',
                                    additionalDetails: '',
                                    nickname: user?.first_name || user?.username || '',
                                    history: historyPayload
                                });

                                // Remove typing indicator and add AI response
                                setMessages(prev => prev.filter(msg => !msg.typing));
                                setMessages(prev => [...prev, {
                                    id: Date.now() + 1,
                                    content: aiResponse,
                                    sender: 'ai',
                                    timestamp: new Date().toISOString()
                                }]);

                            } catch (error) {
                                console.error('Streaming error:', error);
                                setMessages(prev => prev.filter(msg => !msg.typing));
                                setMessages(prev => [...prev, {
                                    id: Date.now() + 1,
                                    content: "I'm sorry my dear, I'm having trouble connecting right now. Please try again. 💕",
                                    sender: 'ai',
                                    timestamp: new Date().toISOString(),
                                    error: true
                                }]);
                            }
                        })();
                    } else {
                        // Normal greeting flow
                        const additional = [preferences?.additionalDetails, preferences?.language ? `Preferred language: ${preferences.language}` : '']
                            .filter(Boolean)
                            .join('\n');

                        cleanup = streamInitialGreeting({
                            relationType: characterData?.character_type,
                            mood: preferences?.moodLabel || preferences?.mood,
                            topic: preferences?.topic,
                            additionalDetails: additional,
                            nickname: (user?.first_name || user?.username),
                        });
                    }

                    sessionStorage.removeItem('callPreferences');
                } else {
                    cleanup = streamInitialGreeting({
                        relationType: characterData?.character_type,
                        mood: 'Neutral',
                        topic: 'General conversation',
                        additionalDetails: '',
                        nickname: (user?.first_name || user?.username),
                    });
                }

                setLoading(false);

                if (typeof cleanup === 'function') {
                    return cleanup;
                }
            });
        };

        const cleanup = initializeChat();
        return () => {
            if (typeof cleanup === 'function') cleanup();
        };
    }, [relationId, fetchCharacter, user, streamInitialGreeting, token, isDirectMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const userMessage = {
            id: Date.now(),
            content: newMessage,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setSending(true);

        const messageToSend = newMessage;
        setNewMessage('');

        try {
            const typingMessage = {
                id: Date.now() + 1,
                content: '',
                sender: 'ai',
                timestamp: new Date().toISOString(),
                typing: true
            };
            setMessages(prev => [...prev, typingMessage]);

            const historyPayload = messages.slice(-20).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content
            }));

            const aiResponse = await sendChatMessage({
                message: messageToSend,
                relationType: character?.character_type || 'Friend',
                mood: callPreferences?.moodLabel || callPreferences?.mood || 'Neutral',
                topic: callPreferences?.topic || 'General conversation',
                additionalDetails: callPreferences?.additionalDetails || '',
                nickname: user?.first_name || user?.username || '',
                history: historyPayload
            });

            // Remove typing indicator and add AI response
            setMessages(prev => prev.filter(msg => !msg.typing));
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                content: aiResponse,
                sender: 'ai',
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(msg => !msg.typing));
            setMessages(prev => [...prev, {
                id: Date.now() + 3,
                content: "I'm sorry my dear, I'm having trouble connecting right now. Please try again. 💕",
                sender: 'ai',
                timestamp: new Date().toISOString(),
                error: true
            }]);
        } finally {
            setSending(false);
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Voice recording logic would go here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-16 w-16 text-love-400 animate-warm-pulse mx-auto mb-4" />
                    <p className="text-white text-xl">Connecting with your loved one...</p>
                </div>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-center glass-card rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">💔 Couldn't find them</h2>
                    <p className="text-pink-200 mb-6">This character seems to have stepped away.</p>
                    <button
                        onClick={() => navigate('/loved-ones')}
                        className="px-6 py-3 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300"
                    >
                        💕 Back to My Characters
                    </button>
                </div>
            </div>
        );
    }

    const getRelationEmoji = (characterType) => {
        const emojiMap = {
            'Mother': '👩‍❤️‍👨',
            'Father': '👨‍👧‍👦',
            'Sister': '👭',
            'Brother': '👬',
            'Partner': '💑',
            'Friend': '👫'
        };
        return emojiMap[characterType] || '💝';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-peaceful bg-300% animate-loving-shift opacity-30"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-warm-400 rounded-full animate-peaceful-float opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Chat Header */}
            <div className="relative z-50 glass-card border-b-2 border-love-400/30 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/loved-ones')}
                            className="p-3 text-pink-200 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-love-400 to-warm-500 rounded-full flex items-center justify-center text-2xl gentle-bounce shadow-love">
                                {getRelationEmoji(character.character_type)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{character.name}</h1>
                                <p className="text-pink-200 flex items-center">
                                    <span className="w-2 h-2 bg-peace-400 rounded-full animate-ping mr-2"></span>
                                    {character.character_type} • Always here for you 💕
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="p-3 text-pink-200 hover:text-love-300 hover:bg-white/20 rounded-full transition-all duration-300 group">
                            <Heart className="h-5 w-5 group-hover:scale-110 transition-transform animate-warm-pulse" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Chat Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.sender === 'user'
                                ? 'bg-gradient-to-br from-warm-400 to-love-500 ml-3 shadow-warm'
                                : 'bg-gradient-to-br from-comfort-400 to-peace-500 mr-3 shadow-comfort'
                                }`}>
                                {message.sender === 'user' ? (
                                    <span className="text-lg">😊</span>
                                ) : (
                                    <span className="text-lg">{getRelationEmoji(character.character_type)}</span>
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`px-6 py-4 rounded-3xl backdrop-blur-sm ${message.sender === 'user'
                                ? 'bg-gradient-to-br from-warm-500 to-love-500 text-white shadow-warm'
                                : message.error
                                    ? 'bg-gradient-to-br from-red-400/80 to-pink-400/80 text-white border border-red-300/30'
                                    : 'bg-white/90 text-gray-800 border-2 border-love-300/30 shadow-love'
                                } gentle-bounce`}>
                                {message.typing ? (
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-warm-400 rounded-full animate-warm-pulse"></div>
                                        <div className="w-3 h-3 bg-love-400 rounded-full animate-warm-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-3 h-3 bg-comfort-400 rounded-full animate-warm-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                ) : (
                                    <p className="text-base leading-relaxed">{message.content}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="relative z-10 glass-card border-t-2 border-love-400/30 p-6">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`💬 Share your heart with ${character.name}...`}
                            className="w-full px-6 py-4 bg-white/90 border-2 border-love-300/30 rounded-full focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-love-400 pr-14 text-gray-800 placeholder-gray-500 backdrop-blur-sm shadow-love"
                            disabled={sending}
                        />
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${isRecording
                                ? 'text-red-500 bg-red-100/80'
                                : 'text-pink-400 hover:text-love-500 hover:bg-love-100/80'
                                }`}
                        >
                            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-4 bg-gradient-to-r from-love-500 to-warm-500 text-white rounded-full hover:from-love-600 hover:to-warm-600 focus:outline-none focus:ring-2 focus:ring-love-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-love hover:scale-110 group"
                    >
                        {sending ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Send className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        )}
                    </button>
                </form>

                {/* Emotional Support Message */}
                <div className="mt-4 text-center">
                    <p className="text-pink-200 text-sm">
                        💕 {character.name} is here to listen and support you with love
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
