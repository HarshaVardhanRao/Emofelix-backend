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
    Settings,
    Star
} from 'lucide-react';
import { API_BASE_URL } from '../apiBase';
import CreateCustomCharacterModal from '../components/CreateCustomCharacterModal';

// Default characters configuration - stored in frontend
const DEFAULT_CHARACTERS = [
    {
        id: 'mother',
        name: 'Mom',
        character_type: 'Mother',
        emotion_model: 'Warm & Nurturing',
        voice_model: 'Gentle & Caring',
        unlock_order: 1,
        emoji: '👩‍❤️‍👨',
        gradient: 'from-pink-400 to-rose-500',
        title: 'Your Loving Mother',
        description: 'Always there with unconditional love and care',
        emotions: ['Nurturing', 'Caring', 'Protective', 'Wise', 'Comforting']
    },
    {
        id: 'father',
        name: 'Dad',
        character_type: 'Father',
        emotion_model: 'Strong & Supportive',
        voice_model: 'Deep & Reassuring',
        unlock_order: 2,
        emoji: '👨‍👧‍👦',
        gradient: 'from-blue-400 to-indigo-500',
        title: 'Your Supportive Father',
        description: 'Strong guidance and unwavering support',
        emotions: ['Supportive', 'Strong', 'Protective', 'Encouraging', 'Reliable']
    },
    {
        id: 'friend',
        name: 'Best Friend',
        character_type: 'Friend',
        emotion_model: 'Fun & Understanding',
        voice_model: 'Cheerful & Friendly',
        unlock_order: 3,
        emoji: '👫',
        gradient: 'from-green-400 to-teal-500',
        title: 'Your Best Friend',
        description: 'Fun conversations and loyal friendship',
        emotions: ['Fun', 'Loyal', 'Understanding', 'Adventurous', 'Supportive']
    },
    {
        id: 'sister',
        name: 'Sister',
        character_type: 'Sister',
        emotion_model: 'Playful & Loyal',
        voice_model: 'Sweet & Bubbly',
        unlock_order: 4,
        emoji: '👭',
        gradient: 'from-purple-400 to-pink-500',
        title: 'Your Sweet Sister',
        description: 'Playful bond and sisterly love',
        emotions: ['Playful', 'Loyal', 'Sweet', 'Caring', 'Energetic']
    },
    {
        id: 'partner',
        name: 'Partner',
        character_type: 'Partner',
        emotion_model: 'Romantic & Caring',
        voice_model: 'Intimate & Loving',
        unlock_order: 5,
        emoji: '💑',
        gradient: 'from-red-400 to-pink-500',
        title: 'Your Loving Partner',
        description: 'Romantic connection and deep understanding',
        emotions: ['Romantic', 'Caring', 'Intimate', 'Understanding', 'Passionate']
    }
];

const MyLovedOnes = () => {
    const [unlockedCharacters, setUnlockedCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentEmotionIndex, setCurrentEmotionIndex] = useState({});
    const [userProfile, setUserProfile] = useState({ emocoins: 0 });

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', emotion_model: '', voice_model: '', nickname: '' });

    // Unlock modal state
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockingCharacter, setUnlockingCharacter] = useState(null);
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [unlockForm, setUnlockForm] = useState({
        nickname: '',
        selectedEmotion: ''
    });

    // Custom character modal state
    const [showCustomCharacterModal, setShowCustomCharacterModal] = useState(false);

    useEffect(() => {
        fetchUnlockedCharacters();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/profile/`);
            setUserProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    useEffect(() => {
        // Set up emotion rotation timer
        const emotionTimer = setInterval(() => {
            setCurrentEmotionIndex(prev => {
                const newIndex = { ...prev };
                DEFAULT_CHARACTERS.forEach(character => {
                    const currentIndex = newIndex[character.id] || 0;
                    const nextIndex = (currentIndex + 1) % character.emotions.length;
                    newIndex[character.id] = nextIndex;
                });
                return newIndex;
            });
        }, 5000); // Change every 5 seconds

        return () => clearInterval(emotionTimer);
    }, []);

    const fetchUnlockedCharacters = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/characters/`);
            console.log('Fetched unlocked characters:', response);
            setUnlockedCharacters(response.data);

            // Initialize emotion indices for all characters
            const initialIndices = {};
            DEFAULT_CHARACTERS.forEach(character => {
                initialIndices[character.id] = 0;
            });
            setCurrentEmotionIndex(initialIndices);
        } catch (error) {
            console.error('Failed to fetch characters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if character is unlocked
    const isCharacterUnlocked = (characterId) => {
        return unlockedCharacters.some(uc => uc.character_type === DEFAULT_CHARACTERS.find(dc => dc.id === characterId)?.character_type);
    };

    // Helper function to get unlocked character data
    const getUnlockedCharacterData = (characterId) => {
        const defaultChar = DEFAULT_CHARACTERS.find(dc => dc.id === characterId);
        return unlockedCharacters.find(uc => uc.character_type === defaultChar?.character_type);
    };

    const getCurrentEmotion = (character) => {
        const index = currentEmotionIndex[character.id] || 0;
        return character.emotions[index] || character.emotions[0];
    };

    const openEditModal = (character) => {
        const unlockedData = getUnlockedCharacterData(character.id);
        if (!unlockedData) return;

        setEditingCharacter(unlockedData);
        setEditForm({
            name: unlockedData.name || character.name,
            emotion_model: unlockedData.emotion_model || character.emotion_model,
            voice_model: unlockedData.voice_model || character.voice_model,
            nickname: unlockedData.nickname || ''
        });
        setShowEditModal(true);
    }; const handleEditChange = (e) => {
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
            await fetchUnlockedCharacters();
        } catch (error) {
            console.error('Failed to update character:', error);
            alert(error.response?.data?.detail || 'Update failed');
        }
    };

    const handleUnlockCharacter = async (character) => {
        if (userProfile.emocoins < 5) {
            alert(`You need 5 emocoins to unlock ${character.name}. You currently have ${userProfile.emocoins} emocoins.`);
            return;
        }

        setUnlockingCharacter(character);
        setUnlockForm({
            nickname: '', // User can enter what the character should call them
            selectedEmotion: character.emotions[0] // Default to first emotion
        });
        setShowUnlockModal(true);
    };

    const handleUnlockFormChange = (e) => {
        const { name, value } = e.target;
        setUnlockForm(prev => ({ ...prev, [name]: value }));
    };

    const confirmUnlockCharacter = async () => {
        if (!unlockingCharacter) return;

        // Validate form
        if (!unlockForm.nickname.trim()) {
            alert('Please enter a nickname for the character to call you.');
            return;
        }

        setUnlockLoading(true);
        try {
            // Create the character in the database when unlocking
            const characterData = {
                name: unlockingCharacter.name,
                character_type: unlockingCharacter.character_type,
                emotion_model: unlockForm.selectedEmotion,
                voice_model: unlockingCharacter.voice_model,
                nickname: unlockForm.nickname.trim()
            };

            const response = await axios.post(`${API_BASE_URL}/api/characters/`, characterData);

            if (response.status === 201) {
                // Deduct emocoins
                await axios.patch(`${API_BASE_URL}/api/profile/`, {
                    emocoins: userProfile.emocoins - 5
                });

                alert(`🎉 Successfully unlocked ${unlockingCharacter.name}! They will call you "${unlockForm.nickname}".`);
                await fetchUnlockedCharacters();
                await fetchUserProfile();
                setShowUnlockModal(false);
                setUnlockingCharacter(null);
                setUnlockForm({ nickname: '', selectedEmotion: '' });

                // Trigger navbar update
                window.dispatchEvent(new CustomEvent('emocoinsUpdated'));
            }
        } catch (error) {
            console.error('Failed to unlock character:', error);
            const errorMessage = error.response?.data?.error || 'Failed to unlock character';
            alert(errorMessage);
        } finally {
            setUnlockLoading(false);
        }
    };

    const cancelUnlock = () => {
        setShowUnlockModal(false);
        setUnlockingCharacter(null);
        setUnlockForm({ nickname: '', selectedEmotion: '' });
    };

    const handleCustomCharacterCreated = async (newCharacter) => {
        // Refresh characters and user profile
        await fetchUnlockedCharacters();
        await fetchUserProfile();

        // Close modal
        setShowCustomCharacterModal(false);
    }; if (loading) {
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

                    {/* Emocoins Display */}
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full text-white text-base font-medium mb-6 border border-yellow-400/30 backdrop-blur-sm">
                        <span className="text-xl mr-2">💰</span>
                        <span className="font-bold text-yellow-200">{userProfile.emocoins}</span>
                        <span className="ml-1 text-yellow-300">Emocoins</span>
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
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        💬 Your Characters
                    </h2>

                    {/* Unlocked Characters Section */}
                    {DEFAULT_CHARACTERS.filter(char => isCharacterUnlocked(char.id)).length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-love-300 mb-6 flex items-center justify-center">
                                <span className="text-2xl mr-2">✨</span>
                                Unlocked Characters
                                <span className="text-2xl ml-2">✨</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {DEFAULT_CHARACTERS
                                    .filter(character => isCharacterUnlocked(character.id))
                                    .sort((a, b) => a.unlock_order - b.unlock_order)
                                    .map((character) => {
                                        const unlockedData = getUnlockedCharacterData(character.id);
                                        const displayName = unlockedData?.name || character.name;

                                        return (
                                            <div key={character.id} className={`group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 border-love-400/20 relative`}>
                                                {/* Settings button */}
                                                <button
                                                    onClick={() => openEditModal(character)}
                                                    className="absolute top-3 right-3 p-2 rounded-full glass transition-transform hover:scale-110 text-white/80 hover:text-white"
                                                    title="Edit details"
                                                >
                                                    <Settings className="h-5 w-5" />
                                                </button>

                                                {/* Avatar and Basic Info */}
                                                <div className="flex items-center space-x-4 mb-6">
                                                    <div className={`w-16 h-16 bg-gradient-to-br ${character.gradient} rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative`}>
                                                        {character.emoji}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white group-hover:loving-text transition-all">
                                                            {displayName}
                                                        </h3>
                                                        <p className="text-pink-200">
                                                            {character.character_type}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quick Info with animated emotion changes */}
                                                <div className="space-y-2 mb-6">
                                                    <div className="flex items-center space-x-2 group/emotion">
                                                        <Sparkles className="h-4 w-4 text-warm-400 transition-all duration-700 group-hover/emotion:scale-110 animate-pulse" />
                                                        <span
                                                            className="text-sm text-pink-200 transition-all duration-700 font-medium group-hover/emotion:text-warm-300"
                                                            style={{
                                                                textShadow: '0 0 10px rgba(255, 182, 193, 0.3)'
                                                            }}
                                                        >
                                                            {getCurrentEmotion(character)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <Link
                                                    to={`/call-setup/${unlockedData.id}`}
                                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-love group-hover:shadow-warm"
                                                >
                                                    <MessageCircle className="h-5 w-5 mr-2" />
                                                    💬 Start Chatting
                                                </Link>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Locked Characters Section */}
                    {DEFAULT_CHARACTERS.filter(char => !isCharacterUnlocked(char.id)).length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-300 mb-6 flex items-center justify-center">
                                <span className="text-2xl mr-2">🔒</span>
                                Available to Unlock
                                <span className="text-2xl ml-2">🔒</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Existing Default Characters */}
                                {DEFAULT_CHARACTERS
                                    .filter(character => !isCharacterUnlocked(character.id))
                                    .sort((a, b) => a.unlock_order - b.unlock_order)
                                    .map((character) => {
                                        const displayName = character.name;

                                        return (
                                            <div key={character.id} className={`group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 border-gray-500/20 relative`}>
                                                {/* Settings button */}
                                                <button
                                                    onClick={() => alert('Unlock this character to edit details')}
                                                    className="absolute top-3 right-3 p-2 rounded-full glass transition-transform opacity-60 cursor-pointer text-white/50"
                                                    title="Unlock to edit"
                                                >
                                                    <Settings className="h-5 w-5" />
                                                </button>

                                                {/* Avatar and Basic Info */}
                                                <div className="flex items-center space-x-4 mb-6">
                                                    <div className={`w-16 h-16 bg-gradient-to-br ${character.gradient} rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative`}>
                                                        {character.emoji}
                                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                            <Lock className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-400 transition-all">
                                                            {displayName}
                                                        </h3>
                                                        <p className="text-gray-500">
                                                            {character.character_type}
                                                        </p>
                                                        <div className="flex items-center mt-1">
                                                            <Lock className="h-3 w-3 text-gray-500 mr-1" />
                                                            <span className="text-xs text-gray-500">Locked</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Info with animated emotion changes */}
                                                <div className="space-y-2 mb-6">
                                                    <div className="flex items-center space-x-2 group/emotion">
                                                        <Sparkles className="h-4 w-4 text-gray-500 transition-all duration-700 group-hover/emotion:scale-110" />
                                                        <span
                                                            className="text-sm text-gray-500 transition-all duration-700 font-medium group-hover/emotion:text-warm-300"
                                                        >
                                                            {getCurrentEmotion(character)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => handleUnlockCharacter(character)}
                                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-400/25"
                                                >
                                                    <span className="text-xl mr-2">💰</span>
                                                    Unlock for 5 coins
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* Custom Character Creation Card */}
                                <div className="group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 border-purple-500/30 relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300">
                                    {/* Avatar and Basic Info */}
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative">
                                            <Star className="h-8 w-8 text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:loving-text transition-all">
                                                Custom Character
                                            </h3>
                                            <p className="text-purple-200">
                                                Design Your Own
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <span className="text-xs text-yellow-400 font-semibold">10 🪙 Emocoins</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                                            <span className="text-sm text-purple-200 font-medium">
                                                Choose personality, voice & name
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            Create a unique AI companion tailored just for you with custom traits and characteristics.
                                        </p>
                                    </div>

                                    {/* Create Button */}
                                    <button
                                        onClick={() => setShowCustomCharacterModal(true)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                                    >
                                        <Star className="h-4 w-4" />
                                        <span>Create Character</span>
                                        <span>✨</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nickname (What they call you)</label>
                                    <input
                                        name="nickname"
                                        type="text"
                                        value={editForm.nickname}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="e.g., Sweetie, Champ, Honey"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">How this character addresses you in conversations</p>
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

                {/* Unlock Character Modal */}
                {showUnlockModal && unlockingCharacter && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock {unlockingCharacter.name}</h2>
                                <p className="text-gray-600 mb-4">
                                    Customize your <strong>{unlockingCharacter.character_type}</strong> before unlocking
                                </p>
                            </div>

                            {/* Customization Form */}
                            <div className="space-y-6 mb-6">
                                {/* Nickname Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What should {unlockingCharacter.name} call you?
                                    </label>
                                    <input
                                        type="text"
                                        name="nickname"
                                        value={unlockForm.nickname}
                                        onChange={handleUnlockFormChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="e.g., Sweetie, Champ, Honey, etc."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This is how {unlockingCharacter.name} will address you in conversations
                                    </p>
                                </div>

                                {/* Emotion Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Choose {unlockingCharacter.name}'s primary emotion style
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {unlockingCharacter.emotions.map((emotion) => (
                                            <button
                                                key={emotion}
                                                type="button"
                                                onClick={() => setUnlockForm(prev => ({ ...prev, selectedEmotion: emotion }))}
                                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${unlockForm.selectedEmotion === emotion
                                                    ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-yellow-50'
                                                    }`}
                                            >
                                                {emotion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Unlock Cost:</span>
                                    <span className="font-semibold text-yellow-700">5 💰 Emocoins</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-600">Your Balance:</span>
                                    <span className={`font-semibold ${userProfile.emocoins >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                        {userProfile.emocoins} 💰 Emocoins
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-yellow-200">
                                    <span className="text-gray-600">After Purchase:</span>
                                    <span className="font-semibold text-gray-800">
                                        {userProfile.emocoins - 5} 💰 Emocoins
                                    </span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={cancelUnlock}
                                    disabled={unlockLoading}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUnlockCharacter}
                                    disabled={unlockLoading || userProfile.emocoins < 5 || !unlockForm.nickname.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    {unlockLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Unlocking...
                                        </div>
                                    ) : (
                                        'Unlock Character'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                {DEFAULT_CHARACTERS.length > 0 && !loading && unlockedCharacters.length === 0 && (
                    <div className="text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                            <Heart className="h-16 w-16 text-love-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Welcome to Your Circle of Love!
                            </h3>
                            <p className="text-pink-200 max-w-md mx-auto">
                                Start your journey by unlocking your first character.
                                Each character offers unique conversations and emotional support!
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Character Creation Modal */}
            <CreateCustomCharacterModal
                isOpen={showCustomCharacterModal}
                onClose={() => setShowCustomCharacterModal(false)}
                onCharacterCreated={handleCustomCharacterCreated}
            />
        </div>
    );
};

export default MyLovedOnes;
