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
    Lock,
    Settings
} from 'lucide-react';
import { API_BASE_URL } from '../apiBase';

const MyLovedOnes = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentEmotionIndex, setCurrentEmotionIndex] = useState({});

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', emotion_model: '', voice_model: '' });

    useEffect(() => {
        fetchCharacters();
    }, []);

    useEffect(() => {
        // Set up emotion rotation timer
        const emotionTimer = setInterval(() => {
            setCurrentEmotionIndex(prev => {
                const newIndex = { ...prev };
                characters.forEach(character => {
                    const template = getCharacterTemplate(character.character_type);
                    const currentIndex = newIndex[character.id] || 0;
                    const nextIndex = (currentIndex + 1) % template.emotions.length;
                    newIndex[character.id] = nextIndex;

                    // Optional: Log emotion changes for debugging
                    if (character.is_unlocked) {
                        console.log(`${character.name} emotion changed to: ${template.emotions[nextIndex]}`);
                    }
                });
                return newIndex;
            });
        }, 5000); // Change every 5 seconds

        return () => clearInterval(emotionTimer);
    }, [characters]);

    const fetchCharacters = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/characters/`);
            console.log('Fetched characters:', response);
            setCharacters(response.data);

            // Initialize emotion indices
            const initialIndices = {};
            response.data.forEach(character => {
                initialIndices[character.id] = 0;
            });
            setCurrentEmotionIndex(initialIndices);
        } catch (error) {
            console.error('Failed to fetch characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCharacterTemplate = (characterType) => {
        return characters[characterType] || {
            emoji: '💝',
            gradient: 'from-warm-400 to-love-500',
            title: characterType,
            description: 'A special person in your life',
            emotions: ['Special & Unique']
        };
    };

    const getCurrentEmotion = (character) => {
        const template = getCharacterTemplate(character.character_type);
        const index = currentEmotionIndex[character.id] || 0;
        return template.emotions[index] || template.emotions[0];
    };

    const openEditModal = (character) => {
        setEditingCharacter(character);
        setEditForm({
            name: character.name || '',
            emotion_model: character.emotion_model || '',
            voice_model: character.voice_model || ''
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCharacter = async (e) => {
        e.preventDefault();
        if (!editingCharacter) return;
        try {
            await axios.patch(`${API_BASE_URL}/api/characters/${editingCharacter.id}/`, editForm);
            setShowEditModal(false);
            setEditingCharacter(null);
            await fetchCharacters();
        } catch (error) {
            console.error('Failed to update character:', error);
            alert(error.response?.data?.detail || 'Update failed');
        }
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
                                    <div key={character.id} className={`group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 ${character.is_unlocked ? 'border-love-400/20' : 'border-gray-500/20'} relative`}>
                                        {/* Settings button */}
                                        <button
                                            onClick={() => character.is_unlocked ? openEditModal(character) : alert('Unlock this character to edit details')}
                                            className={`absolute top-3 right-3 p-2 rounded-full glass transition-transform ${character.is_unlocked ? 'hover:scale-110 text-white/80 hover:text-white' : 'opacity-60 cursor-pointer text-white/50'}`}
                                            title={character.is_unlocked ? 'Edit details' : 'Unlock to edit'}
                                        >
                                            <Settings className="h-5 w-5" />
                                        </button>

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

                                        {/* Quick Info with animated emotion changes */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center space-x-2 group/emotion">
                                                <Sparkles className={`h-4 w-4 ${character.is_unlocked ? 'text-warm-400' : 'text-gray-500'} transition-all duration-700 group-hover/emotion:scale-110 ${character.is_unlocked ? 'animate-pulse' : ''}`} />
                                                <span
                                                    className={`text-sm ${character.is_unlocked ? 'text-pink-200' : 'text-gray-500'} transition-all duration-700 font-medium group-hover/emotion:text-warm-300`}
                                                    style={{
                                                        textShadow: character.is_unlocked ? '0 0 10px rgba(255, 182, 193, 0.3)' : 'none'
                                                    }}
                                                >
                                                    {getCurrentEmotion(character)}
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

                {/* Edit Character Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Details</h2>
                            <form onSubmit={handleUpdateCharacter} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emotion Model</label>
                                    <input
                                        name="emotion_model"
                                        type="text"
                                        value={editForm.emotion_model}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="e.g., Empathetic"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Voice Model</label>
                                    <input
                                        name="voice_model"
                                        type="text"
                                        value={editForm.voice_model}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="e.g., Warm Female"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowEditModal(false); setEditingCharacter(null); }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
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
