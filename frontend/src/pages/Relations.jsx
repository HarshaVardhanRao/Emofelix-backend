import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Edit,
    Trash2,
    MessageCircle,
    Heart,
    User,
    Mic,
    Brain,
    Search
} from 'lucide-react';

const Relations = () => {
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRelation, setNewRelation] = useState({
        name: '',
        relation_type: '',
        emotion_model: '',
        voice_model: ''
    });

    useEffect(() => {
        fetchRelations();
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
            setNewRelation({ name: '', relation_type: '', emotion_model: '', voice_model: '' });
            fetchRelations();
        } catch (error) {
            console.error('Failed to create relation:', error);
        }
    };

    const handleDeleteRelation = async (id) => {
        if (window.confirm('Are you sure you want to delete this relation?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/relations/${id}/`);
                fetchRelations();
            } catch (error) {
                console.error('Failed to delete relation:', error);
            }
        }
    };

    const filteredRelations = relations.filter(relation =>
        relation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        relation.relation_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const relationTypes = [
        'Mother', 'Father', 'Friend', 'Mentor', 'Sibling', 'Grandparent',
        'Teacher', 'Coach', 'Partner', 'Therapist', 'Other'
    ];

    const emotionModels = [
        'Empathetic', 'Cheerful', 'Calm', 'Supportive', 'Wise', 'Playful', 'Serious'
    ];

    const voiceModels = [
        'Warm Female', 'Calm Male', 'Elderly Wise', 'Young Energetic',
        'Professional', 'Gentle', 'Strong'
    ];

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
                            <h1 className="text-3xl font-bold text-gray-900">My Relations</h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Manage your AI companions and their personalities
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add New Relation
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search relations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Relations Grid */}
                {filteredRelations.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            {searchTerm ? 'No relations found' : 'No relations yet'}
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {searchTerm
                                ? 'Try adjusting your search terms to find the relation you\'re looking for.'
                                : 'Create your first AI companion to start building meaningful relationships.'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Your First Relation
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRelations.map((relation) => (
                            <div key={relation.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                {/* Avatar and Basic Info */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">
                                            {relation.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{relation.name}</h3>
                                        <p className="text-gray-600">{relation.relation_type}</p>
                                    </div>
                                </div>

                                {/* Relation Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Brain className="h-4 w-4 text-primary-600" />
                                        <span className="text-sm text-gray-600">Emotion: {relation.emotion_model}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mic className="h-4 w-4 text-secondary-600" />
                                        <span className="text-sm text-gray-600">Voice: {relation.voice_model}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/chat/${relation.id}`}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Chat
                                    </Link>
                                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRelation(relation.id)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Relation Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Relation</h2>

                        <form onSubmit={handleCreateRelation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={newRelation.name}
                                        onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter relation name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relation Type
                                </label>
                                <select
                                    required
                                    value={newRelation.relation_type}
                                    onChange={(e) => setNewRelation({ ...newRelation, relation_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select relation type</option>
                                    {relationTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emotion Model
                                </label>
                                <select
                                    required
                                    value={newRelation.emotion_model}
                                    onChange={(e) => setNewRelation({ ...newRelation, emotion_model: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select emotion model</option>
                                    {emotionModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Voice Model
                                </label>
                                <select
                                    required
                                    value={newRelation.voice_model}
                                    onChange={(e) => setNewRelation({ ...newRelation, voice_model: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select voice model</option>
                                    {voiceModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Create Relation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Relations;
