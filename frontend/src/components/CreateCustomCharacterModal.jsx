import { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Star, Coins, AlertCircle, CheckCircle, User, Mic, Brain } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiBase';

const CreateCustomCharacterModal = ({ isOpen, onClose, onCharacterCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        character_type: '',
        emotion_model: '',
        voice_model: '',
        nickname: ''
    });
    const [options, setOptions] = useState({
        character_types: [],
        emotion_models: [],
        voice_models: [],
        cost: 10,
        user_emocoins: 0,
        can_create: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch available options when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/custom-characters/options/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setOptions(response.data);
        } catch (error) {
            console.error('Error fetching character options:', error);
            setError('Failed to load character options. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear messages when user types
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Character name is required');
            return false;
        }

        if (formData.name.length < 2) {
            setError('Character name must be at least 2 characters long');
            return false;
        }

        if (!formData.character_type) {
            setError('Please select a character type');
            return false;
        }

        if (!formData.emotion_model) {
            setError('Please select an emotion model');
            return false;
        }

        if (!formData.voice_model) {
            setError('Please select a voice model');
            return false;
        }

        if (options.user_emocoins < options.cost) {
            setError(`You need ${options.cost} emocoins to create a custom character. You have ${options.user_emocoins} emocoins.`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/custom-characters/create-custom/`, formData, {
                headers: { Authorization: `Token ${token}` }
            });

            setSuccess('Custom character created successfully! ✨');

            // Update emocoins in options
            setOptions(prev => ({
                ...prev,
                user_emocoins: response.data.remaining_emocoins
            }));

            // Dispatch event to update navbar emocoins
            window.dispatchEvent(new CustomEvent('emocoinsUpdated', {
                detail: { emocoins: response.data.remaining_emocoins }
            }));

            // Call parent callback with new character
            if (onCharacterCreated) {
                onCharacterCreated(response.data.character);
            }

            // Close modal after delay
            setTimeout(() => {
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    character_type: '',
                    emotion_model: '',
                    voice_model: '',
                    nickname: ''
                });
                setSuccess('');
            }, 2000);

        } catch (error) {
            console.error('Error creating character:', error);
            if (error.response?.data?.errors) {
                // Handle validation errors
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(errorMessages);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to create character. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setError('');
            setSuccess('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border border-white/30">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Heart className="h-8 w-8 text-pink-500 animate-pulse-glow" />
                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Create Custom Character ✨</h2>
                            <p className="text-gray-600 text-sm">Design your perfect AI companion</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100/80 rounded-xl"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Cost Info */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-y border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            <span className="text-gray-800 font-semibold">Cost: {options.cost} emocoins</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Your balance:</span>
                            <span className="text-yellow-600 font-bold">{options.user_emocoins} emocoins</span>
                        </div>
                    </div>
                    {options.user_emocoins < options.cost && (
                        <div className="mt-2 text-red-600 text-sm flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Insufficient emocoins. You need {options.cost - options.user_emocoins} more emocoins.</span>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="p-6 bg-gradient-to-br from-gray-50/90 to-purple-50/50">
                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 mb-6">
                            <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                            <span className="text-red-700 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 mb-6">
                            <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                            <span className="text-green-700 text-sm font-medium">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Character Name */}
                        <div className="animate-slide-up">
                            <label htmlFor="name" className="flex items-center text-sm font-bold text-purple-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-2">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                Character Name *
                            </label>
                            <div className="relative group">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full py-4 px-5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-purple-400 focus:bg-white/90 focus:outline-none transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20"
                                    placeholder="Enter character name (e.g., Sarah, Mom, Best Friend)"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300 pointer-events-none"></div>
                            </div>
                            <p className="text-xs text-purple-600 mt-2 ml-2 opacity-80">✨ What should we call your character?</p>
                        </div>

                        {/* Character Type */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="character_type" className="flex items-center text-sm font-bold text-pink-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-lg flex items-center justify-center mr-2">
                                    <Heart className="h-4 w-4 text-white" />
                                </div>
                                Character Type *
                            </label>
                            <div className="relative group">
                                <select
                                    id="character_type"
                                    name="character_type"
                                    required
                                    value={formData.character_type}
                                    onChange={handleChange}
                                    className="w-full py-4 px-5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl text-gray-800 focus:border-pink-400 focus:bg-white/90 focus:outline-none transition-all duration-300 font-medium shadow-lg hover:shadow-pink-500/20 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-white text-gray-500">🎭 Select character type...</option>
                                    {options.character_types.map((type) => (
                                        <option key={type.value} value={type.value} className="bg-white text-gray-800 py-3">
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-md flex items-center justify-center">
                                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-pink-600 mt-2 ml-2 opacity-80">💕 What role should this character play?</p>
                        </div>

                        {/* Emotion Model */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="emotion_model" className="flex items-center text-sm font-bold text-blue-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mr-2">
                                    <Brain className="h-4 w-4 text-white" />
                                </div>
                                Emotion Model *
                            </label>
                            <div className="relative group">
                                <select
                                    id="emotion_model"
                                    name="emotion_model"
                                    required
                                    value={formData.emotion_model}
                                    onChange={handleChange}
                                    className="w-full py-4 px-5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-400 focus:bg-white/90 focus:outline-none transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/20 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-white text-gray-500">🧠 Select emotion style...</option>
                                    {options.emotion_models.map((emotion) => (
                                        <option key={emotion} value={emotion} className="bg-white text-gray-800 py-3">
                                            {emotion}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-md flex items-center justify-center">
                                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-blue-600 mt-2 ml-2 opacity-80">🎭 How should your character express emotions?</p>
                        </div>

                        {/* Voice Model */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <label htmlFor="voice_model" className="flex items-center text-sm font-bold text-green-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-2">
                                    <Mic className="h-4 w-4 text-white" />
                                </div>
                                Voice Model *
                            </label>
                            <div className="relative group">
                                <select
                                    id="voice_model"
                                    name="voice_model"
                                    required
                                    value={formData.voice_model}
                                    onChange={handleChange}
                                    className="w-full py-4 px-5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl text-gray-800 focus:border-green-400 focus:bg-white/90 focus:outline-none transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/20 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-white text-gray-500">🎤 Select voice style...</option>
                                    {options.voice_models.map((voice) => (
                                        <option key={voice} value={voice} className="bg-white text-gray-800 py-3">
                                            {voice}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-md flex items-center justify-center">
                                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-green-600 mt-2 ml-2 opacity-80">🎵 What should your character's voice sound like?</p>
                        </div>

                        {/* Nickname */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <label htmlFor="nickname" className="flex items-center text-sm font-bold text-yellow-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center mr-2">
                                    <Star className="h-4 w-4 text-white" />
                                </div>
                                Nickname (Optional)
                            </label>
                            <div className="relative group">
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    maxLength={100}
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    className="w-full py-4 px-5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-yellow-400 focus:bg-white/90 focus:outline-none transition-all duration-300 font-medium shadow-lg hover:shadow-yellow-500/20"
                                    placeholder="What should they call you? (e.g., sweetheart, buddy, kiddo)"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <Star className="h-5 w-5 text-yellow-500 opacity-50" />
                                </div>
                            </div>
                            <p className="text-xs text-yellow-600 mt-2 ml-2 opacity-80">⭐ How would you like this character to address you?</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-4 pt-8">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !options.can_create}
                                className="flex-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up shadow-2xl"
                                style={{ animationDelay: '0.5s' }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        <Sparkles className="h-4 w-4 mr-2 animate-bounce" />
                                        Creating Magic...
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <Star className="h-5 w-5 mr-2 animate-pulse" />
                                        Create Character ({options.cost} 🪙)
                                        <Sparkles className="h-4 w-4 ml-2 animate-bounce" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                        <h3 className="text-gray-800 font-semibold mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                            Tips for creating great characters:
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Choose a name that feels personal and meaningful to you</li>
                            <li>• Select an emotion model that matches how you want to feel</li>
                            <li>• Pick a voice that you'll find comforting and engaging</li>
                            <li>• Each character type can only be created once per account</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCustomCharacterModal;