import axios from 'axios';
import { getActiveAIConfig, getAIModel } from './aiConfig';
import { API_BASE_URL } from '../apiBase';

/**
 * Sends a message to the external AI model and returns the response
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} model - Model name (optional, will use config default)
 * @returns {Promise<string>} - AI response content
 */
export const sendMessageToExternalAI = async (messages, model = null) => {
    try {
        const config = getActiveAIConfig();
        const modelName = model || getAIModel();

        const response = await axios.post(config.url, {
            model: modelName,
            messages: messages,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.token}`
            }
        });

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error(`Unexpected response format: ${response.status}`);
        }
    } catch (error) {
        console.error('External AI API Error:', error);
        if (error.response) {
            throw new Error(`AI API Error ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Failed to connect to AI service. Please check your connection.');
        } else {
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }
};

/**
 * Fetches the nickname that a character uses for the user
 * @param {string} characterId - Character ID
 * @returns {Promise<string>} - Character's nickname for the user
 */
export const fetchCharacterNickname = async (characterId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
            return '';
        }

        const response = await axios.get(`${API_BASE_URL}/api/characters/${characterId}/nickname/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data?.nickname !== undefined) {
            return response.data.nickname || '';
        } else {
            console.warn('Unexpected response format when fetching nickname:', response);
            return '';
        }
    } catch (error) {
        console.error('Error fetching character nickname:', error);
        if (error.response?.status === 404) {
            console.warn('Character not found when fetching nickname');
        } else if (error.response?.status === 401) {
            console.warn('Authentication failed when fetching nickname');
        }
        return '';
    }
};

/**
 * Builds conversation context for the AI model
 * @param {string} relationType - Type of relation (Friend, Mother, etc.)
 * @param {string} topic - Conversation topic
 * @param {string} additionalDetails - Additional context
 * @param {string} nickname - User's nickname
 * @param {Array} history - Previous conversation messages
 * @param {string} currentMessage - Current user message
 * @returns {Array} - Formatted messages array for AI API
 */
export const buildConversationContext = (
    relationType,
    topic,
    additionalDetails,
    nickname,
    history = [],
    currentMessage = ''
) => {
    // Build system prompt exactly like the backend
    const systemPrompt = `You are role-playing as the user's ${relationType}. Call him as ${nickname} when addressing and not required often. Speak lovingly and supportively, matching the emotional tone requested. Topic: ${topic}. Do NOT break character; refer to the user by their nickname naturally. Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. Keep it short and simple. Don't be extra energized or excited, just be normal and calm. Don't be poetic. Don't beat about the bush.`;

    // Start with system message
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    // Add conversation history
    history.forEach(msg => {
        if (msg.role && msg.content) {
            messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        }
    });

    // Add current message if provided
    if (currentMessage.trim()) {
        messages.push({ role: "user", content: currentMessage });
    }

    return messages;
};

/**
 * Generates an initial greeting message
 * @param {string} relationType - Type of relation
 * @param {string} mood - User's mood
 * @param {string} topic - Conversation topic  
 * @param {string} additionalDetails - Additional context
 * @param {string} nickname - User's nickname (optional, will be fetched if not provided)
 * @param {string} characterId - Character ID (used to fetch nickname if nickname not provided)
 * @returns {Promise<string>} - Greeting message
 */
export const generateInitialGreeting = async (relationType, mood, topic, additionalDetails, nickname = '', characterId = null) => {
    // Fetch nickname from backend if not provided and characterId is available
    let finalNickname = nickname;
    if (!finalNickname && characterId) {
        try {
            finalNickname = await fetchCharacterNickname(characterId);
            console.log(`Fetched nickname for initial greeting (character ${characterId}):`, finalNickname);
        } catch (error) {
            console.warn('Failed to fetch nickname for initial greeting, using empty string:', error);
            finalNickname = '';
        }
    }

    const messages = buildConversationContext(
        relationType,
        topic,
        additionalDetails,
        finalNickname,
        [],
        'Start the conversation with a warm, supportive greeting tailored to the provided context and ask a gentle opening question.'
    );

    return await sendMessageToExternalAI(messages);
};

/**
 * Sends a chat message with all required backend parameters
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User message
 * @param {string} params.relationType - Type of relation (Friend, Mother, etc.)
 * @param {string} params.mood - User's current mood
 * @param {string} params.topic - Conversation topic
 * @param {string} params.additionalDetails - Additional context
 * @param {string} params.nickname - User's nickname (optional, will be fetched if not provided)
 * @param {string} params.characterId - Character ID (used to fetch nickname if nickname not provided)
 * @param {Array} params.history - Previous conversation messages
 * @returns {Promise<string>} - AI response
 */
export const sendChatMessage = async ({
    message,
    relationType = 'Friend',
    topic = 'General conversation',
    additionalDetails = '',
    nickname = '',
    characterId = null,
    history = []
}) => {
    if (!message?.trim()) {
        throw new Error('Message is required');
    }

    // Fetch nickname from backend if not provided and characterId is available
    let finalNickname = nickname;
    if (!finalNickname && characterId) {
        try {
            finalNickname = await fetchCharacterNickname(characterId);
            console.log(`Fetched nickname for character ${characterId}:`, finalNickname);
        } catch (error) {
            console.warn('Failed to fetch nickname, using empty string:', error);
            finalNickname = '';
        }
    }

    // Build the conversation context with all required parameters
    const messages = buildConversationContext(
        relationType,
        topic,
        additionalDetails,
        finalNickname,
        history,
        message
    );

    return await sendMessageToExternalAI(messages);
};