import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    MessageCircle,
    Heart,
    User,
    Users,
    Crown,
    Baby,
    Sparkles,
    Lock
} from 'lucide-react';
import { API_BASE_URL } from '../apiBase';

// Character templates with personal touches
const characterTemplates = {
    'Mother': {
        icon: '👩‍❤️‍👨',
        emoji: '💝',
        title: 'My Mom',
        description: 'Always there with love, advice, and warm hugs',
        gradient: 'from-pink-400 to-rose-500',
        emotion: 'Nurturing & Wise',
        voice: 'Warm Mother'
    },
    'Father': {
        icon: '👨‍👧‍👦',
        emoji: '💪',
        title: 'My Dad',
        description: 'Strong, protective, and full of dad jokes',
        gradient: 'from-blue-400 to-indigo-500',
        emotion: 'Protective & Supportive',
        voice: 'Strong Father'
    },
    'Sister': {
        icon: '👭',
        emoji: '✨',
        title: 'My Sister',
        description: 'Your partner in crime and best confidante',
        gradient: 'from-purple-400 to-pink-500',
        emotion: 'Playful & Understanding',
        voice: 'Sisterly & Fun'
    },
    'Brother': {
        icon: '👬',
        emoji: '🤝',
        title: 'My Brother',
        description: 'Always has your back, teases but cares deeply',
        gradient: 'from-green-400 to-blue-500',
        emotion: 'Brotherly & Loyal',
        voice: 'Brotherly & Cool'
    },
    'Partner': {
        icon: '💑',
        emoji: '💕',
        title: 'My Love',
        description: 'Your soulmate, best friend, and life companion',
        gradient: 'from-red-400 to-pink-500',
        emotion: 'Romantic & Caring',
        voice: 'Loving Partner'
    },
    'Friend': {
        icon: '👫',
        emoji: '🌟',
        title: 'My Best Friend',
        description: 'Understands you completely, always fun to be around',
        gradient: 'from-yellow-400 to-orange-500',
        emotion: 'Fun & Loyal',
        voice: 'Friendly & Cheerful'
    }
};

const MyLovedOnes = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/characters/`);
            setCharacters(response.data);
        } catch (error) {
            console.error('Failed to fetch characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCharacterTemplate = (characterType) => {
        return characterTemplates[characterType] || {
            emoji: '💝',
            gradient: 'from-warm-400 to-love-500',
            title: characterType,
            description: 'A special person in your life'
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-16 w-16 text-love-400 animate-warm-pulse mx-auto mb-4" />
                    <p className="text-white text-xl">Loading your characters...</p>
                </div>
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-6 py-3 glass rounded-full text-white text-base font-medium mb-6">
                        <Heart className="w-5 h-5 mr-3 text-love-400 animate-warm-pulse" />
                        💕 Your Circle of Love
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-white mb-4">
                        Your <span className="loving-text">Characters</span>
                    </h1>
                    <p className="text-xl text-pink-200 max-w-2xl mx-auto leading-relaxed">
                        Connect with AI companions that understand you deeply.
                        Unlock new characters as you journey together. 💝
                    </p>
                </div>

                {/* My Characters Section */}
                {characters.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            💬 Your Characters
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {characters.map((character) => {
                                const template = getCharacterTemplate(character.character_type);
                                return (
                                    <div key={character.id} className={`group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 ${character.is_unlocked ? 'border-love-400/20' : 'border-gray-500/20'}`}>
                                        {/* Avatar and Basic Info */}
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${template.gradient} rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative`}>
                                                {template.emoji}
                                                {!character.is_unlocked && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                        <Lock className="h-6 w-6 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold ${character.is_unlocked ? 'text-white group-hover:loving-text' : 'text-gray-400'} transition-all`}>
                                                    {character.name}
                                                </h3>
                                                <p className={`${character.is_unlocked ? 'text-pink-200' : 'text-gray-500'}`}>
                                                    {character.character_type}
                                                </p>
                                                {!character.is_unlocked && (
                                                    <div className="flex items-center mt-1">
                                                        <Lock className="h-3 w-3 text-gray-500 mr-1" />
                                                        <span className="text-xs text-gray-500">Locked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Info */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center space-x-2">
                                                <Sparkles className={`h-4 w-4 ${character.is_unlocked ? 'text-warm-400' : 'text-gray-500'}`} />
                                                <span className={`text-sm ${character.is_unlocked ? 'text-pink-200' : 'text-gray-500'}`}>
                                                    {template.emotion}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {character.is_unlocked ? (
                                            <Link
                                                to={`/call-setup/${character.id}`}
                                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-love group-hover:shadow-warm"
                                            >
                                                <MessageCircle className="h-5 w-5 mr-2" />
                                                💬 Start Chatting
                                            </Link>
                                        ) : (
                                            <div className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl cursor-not-allowed opacity-75">
                                                <Lock className="h-5 w-5 mr-2" />
                                                � Coming Soon
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                {characters.length === 0 && !loading && (
                    <div className="text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                            <Heart className="h-16 w-16 text-love-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Welcome to Your Circle of Love!
                            </h3>
                            <p className="text-pink-200 max-w-md mx-auto">
                                Your characters will appear here automatically when you create an account.
                                You'll start with 1 character unlocked, and more will be unlocked based on special criteria!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLovedOnes;
