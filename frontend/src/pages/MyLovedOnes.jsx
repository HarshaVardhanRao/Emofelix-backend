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
    Sparkles
} from 'lucide-react';

// Default relation templates with personal touches
const defaultRelations = [
    {
        type: 'Mother',
        icon: '👩‍❤️‍👨',
        emoji: '💝',
        title: 'My Mom',
        description: 'Always there with love, advice, and warm hugs',
        gradient: 'from-pink-400 to-rose-500',
        emotion: 'Nurturing & Wise',
        voice: 'Warm Mother'
    },
    {
        type: 'Father',
        icon: '👨‍👧‍👦',
        emoji: '💪',
        title: 'My Dad',
        description: 'Strong, protective, and full of dad jokes',
        gradient: 'from-blue-400 to-indigo-500',
        emotion: 'Protective & Supportive',
        voice: 'Strong Father'
    },
    {
        type: 'Sister',
        icon: '👭',
        emoji: '✨',
        title: 'My Sister',
        description: 'Your partner in crime and best confidante',
        gradient: 'from-purple-400 to-pink-500',
        emotion: 'Playful & Understanding',
        voice: 'Sisterly & Fun'
    },
    {
        type: 'Brother',
        icon: '👬',
        emoji: '🤝',
        title: 'My Brother',
        description: 'Always has your back, teases but cares deeply',
        gradient: 'from-green-400 to-blue-500',
        emotion: 'Brotherly & Loyal',
        voice: 'Brotherly & Cool'
    },
    {
        type: 'Partner',
        icon: '💑',
        emoji: '💕',
        title: 'My Love',
        description: 'Your soulmate, best friend, and life companion',
        gradient: 'from-red-400 to-pink-500',
        emotion: 'Romantic & Caring',
        voice: 'Loving Partner'
    },
    {
        type: 'Friend',
        icon: '👫',
        emoji: '🌟',
        title: 'My Best Friend',
        description: 'Understands you completely, always fun to be around',
        gradient: 'from-yellow-400 to-orange-500',
        emotion: 'Fun & Loyal',
        voice: 'Friendly & Cheerful'
    }
];

const MyLovedOnes = () => {
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [newRelation, setNewRelation] = useState({
        name: '',
        relation_type: '',
        emotion_model: 'Warm & Loving',
        voice_model: 'Gentle & Caring'
    });

    useEffect(() => {
        const createDefaultRelations = async () => {
            try {
                const promises = defaultRelations.map(template =>
                    axios.post('http://127.0.0.1:8000/api/relations/', {
                        name: template.title,
                        relation_type: template.type,
                        emotion_model: template.emotion,
                        voice_model: template.voice
                    })
                );

                await Promise.all(promises);
                console.log('Default relations created successfully');
            } catch (error) {
                console.error('Failed to create default relations:', error);
            }
        };

        const fetchRelationsAndCreateDefaults = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/relations/');
                const existingRelations = response.data;

                // If user has no relations, create default ones
                if (existingRelations.length === 0) {
                    await createDefaultRelations();
                    // Fetch again after creating defaults
                    const updatedResponse = await axios.get('http://127.0.0.1:8000/api/relations/');
                    setRelations(updatedResponse.data);
                } else {
                    setRelations(existingRelations);
                }
            } catch (error) {
                console.error('Failed to fetch relations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelationsAndCreateDefaults();
    }, []);

    const fetchRelations = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/relations/');
            setRelations(response.data);
        } catch (error) {
            console.error('Failed to fetch relations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRelation = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/relations/', newRelation);
            setShowCreateModal(false);
            setSelectedTemplate(null);
            setNewRelation({ name: '', relation_type: '', emotion_model: 'Warm & Loving', voice_model: 'Gentle & Caring' });
            fetchRelations();
        } catch (error) {
            console.error('Failed to create relation:', error);
        }
    };

    const getRelationIcon = (relationType) => {
        const template = defaultRelations.find(t => t.type === relationType);
        return template ? template.emoji : '💝';
    };

    const getRelationGradient = (relationType) => {
        const template = defaultRelations.find(t => t.type === relationType);
        return template ? template.gradient : 'from-warm-400 to-love-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-16 w-16 text-love-400 animate-warm-pulse mx-auto mb-4" />
                    <p className="text-white text-xl">Loading your loved ones...</p>
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
                        Your <span className="loving-text">Loved Ones</span>
                    </h1>
                    <p className="text-xl text-pink-200 max-w-2xl mx-auto leading-relaxed">
                        Create AI companions of the people who matter most to you.
                        They're always here when you need them. 💝
                    </p>
                </div>

                {/* My Relations Section */}
                {relations.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            💬 Ready to Chat
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relations.map((relation) => (
                                <div key={relation.id} className="group glass-card rounded-3xl p-6 card-hover gentle-bounce border-2 border-love-400/20">
                                    {/* Avatar and Basic Info */}
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${getRelationGradient(relation.relation_type)} rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                                            {getRelationIcon(relation.relation_type)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:loving-text transition-all">{relation.name}</h3>
                                            <p className="text-pink-200">{relation.relation_type}</p>
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-warm-400" />
                                            <span className="text-sm text-pink-200">{relation.emotion_model}</span>
                                        </div>
                                    </div>

                                    {/* Chat Button */}
                                    <Link
                                        to={`/chat/${relation.id}`}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-love group-hover:shadow-warm"
                                    >
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        💬 Start Chatting
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Relation Button - Only show after default relations are created */}
                {relations.length > 0 && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => {
                                setSelectedTemplate(null);
                                setNewRelation({ name: '', relation_type: '', emotion_model: 'Warm & Loving', voice_model: 'Gentle & Caring' });
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-peace-500 to-comfort-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-peace"
                        >
                            <User className="h-6 w-6 mr-3" />
                            🌟 Create Custom Relationship
                        </button>
                    </div>
                )}
            </div>

            {/* Create Relation Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card rounded-3xl p-8 w-full max-w-md border-2 border-love-400/30 shadow-love">
                        <div className="text-center mb-6">
                            {selectedTemplate && (
                                <div className={`w-16 h-16 bg-gradient-to-br ${selectedTemplate.gradient} rounded-full flex items-center justify-center text-3xl mx-auto mb-4`}>
                                    {selectedTemplate.emoji}
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-white">
                                {selectedTemplate ? `Create Your ${selectedTemplate.title}` : 'Create Custom Relationship'}
                            </h2>
                            <p className="text-pink-200 mt-2">
                                {selectedTemplate ? selectedTemplate.description : 'Design your own unique relationship'}
                            </p>
                        </div>

                        <form onSubmit={handleCreateRelation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-pink-200 mb-2">
                                    💝 What should we call them?
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newRelation.name}
                                    onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-love-400 backdrop-blur-sm"
                                    placeholder={selectedTemplate ? `e.g., "Mom", "Mama", "Mother"` : "Enter their name"}
                                />
                            </div>

                            {!selectedTemplate && (
                                <div>
                                    <label className="block text-sm font-medium text-pink-200 mb-2">
                                        👥 Relationship Type
                                    </label>
                                    <select
                                        required
                                        value={newRelation.relation_type}
                                        onChange={(e) => setNewRelation({ ...newRelation, relation_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-love-400 backdrop-blur-sm"
                                    >
                                        <option value="" className="bg-gray-800">Select relationship type</option>
                                        {defaultRelations.map(template => (
                                            <option key={template.type} value={template.type} className="bg-gray-800">{template.type}</option>
                                        ))}
                                        <option value="Grandparent" className="bg-gray-800">Grandparent</option>
                                        <option value="Cousin" className="bg-gray-800">Cousin</option>
                                        <option value="Mentor" className="bg-gray-800">Mentor</option>
                                        <option value="Other" className="bg-gray-800">Other</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedTemplate(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-love-500 to-warm-500 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-love"
                                >
                                    💝 Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLovedOnes;
