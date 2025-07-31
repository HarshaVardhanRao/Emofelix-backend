import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    ArrowLeft,
    Mic,
    MicOff,
    MoreVertical,
    Heart,
    Bot,
    User
} from 'lucide-react';

const Chat = () => {
    const { relationId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [relation, setRelation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        fetchRelation();
        // Add some welcome messages
        setMessages([
            {
                id: 1,
                content: "Hello! I'm so happy to see you today. How are you feeling?",
                sender: 'ai',
                timestamp: new Date().toISOString()
            }
        ]);
        setLoading(false);
    }, [relationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchRelation = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/relations/${relationId}/`);
            setRelation(response.data);
        } catch (error) {
            console.error('Failed to fetch relation:', error);
            navigate('/relations');
        }
    };

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
            // Add typing indicator
            const typingMessage = {
                id: Date.now() + 1,
                content: '',
                sender: 'ai',
                timestamp: new Date().toISOString(),
                typing: true
            };
            setMessages(prev => [...prev, typingMessage]);

            // Send message to FastAPI streaming endpoint
            const response = await fetch('http://127.0.0.1:8001/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify({
                    user_id: user.id,
                    message: messageToSend,
                    relation_type: relation?.relation_type || 'friend'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            // Remove typing indicator
            setMessages(prev => prev.filter(msg => !msg.typing));

            // Add AI message that will be updated with streaming content
            const aiMessageId = Date.now() + 2;
            setMessages(prev => [...prev, {
                id: aiMessageId,
                content: '',
                sender: 'ai',
                timestamp: new Date().toISOString()
            }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const word = line.slice(6);
                        if (word.trim()) {
                            aiResponse += word + ' ';
                            // Update the AI message with the accumulated response
                            setMessages(prev => prev.map(msg =>
                                msg.id === aiMessageId
                                    ? { ...msg, content: aiResponse.trim() }
                                    : msg
                            ));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove typing indicator and add error message
            setMessages(prev => prev.filter(msg => !msg.typing));
            setMessages(prev => [...prev, {
                id: Date.now() + 3,
                content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!relation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Relation not found</h2>
                    <button
                        onClick={() => navigate('/relations')}
                        className="text-primary-600 hover:text-primary-700"
                    >
                        Go back to relations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/relations')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {relation.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{relation.name}</h1>
                                <p className="text-sm text-gray-600">{relation.relation_type} • Online</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Heart className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                    ? 'bg-primary-600 ml-2'
                                    : 'bg-gray-300 mr-2'
                                }`}>
                                {message.sender === 'user' ? (
                                    <User className="h-4 w-4 text-white" />
                                ) : (
                                    <Bot className="h-4 w-4 text-gray-600" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`px-4 py-2 rounded-2xl ${message.sender === 'user'
                                    ? 'bg-primary-600 text-white'
                                    : message.error
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-white text-gray-900 border border-gray-200'
                                }`}>
                                {message.typing ? (
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                ) : (
                                    <p className="text-sm">{message.content}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${relation.name}...`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                            disabled={sending}
                        />
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${isRecording
                                    ? 'text-red-600 bg-red-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
