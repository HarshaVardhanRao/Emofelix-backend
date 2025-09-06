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
            console.log(`Fetched nickname for character ${characterId}:`, response.data.nickname);
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
 * Fetches the most recent chat summary for a character
 * @param {string} characterId - Character ID
 * @returns {Promise<string|null>} - Previous chat summary or null if none exists
 */
export const fetchPreviousChatSummary = async (characterId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
            return null;
        }

        const response = await axios.get(`${API_BASE_URL}/api/characters/${characterId}/chat-summary/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            console.log(`Fetched previous chat summary for character ${characterId}:`, response.data.summary);
            return response.data.summary || null;
        } else {
            console.warn('Unexpected response format when fetching chat summary:', response);
            return null;
        }
    } catch (error) {
        console.error('Error fetching previous chat summary:', error);
        return null;
    }
};

/**
 * Saves a chat summary for a character
 * @param {string} characterId - Character ID
 * @param {string} summary - Summary of the chat conversation
 * @returns {Promise<boolean>} - True if saved successfully, false otherwise
 */
export const saveChatSummary = async (characterId, summary) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
            return false;
        }

        const response = await axios.post(`${API_BASE_URL}/api/chat/save-summary/`, {
            character_id: characterId,
            summary: summary
        }, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 201) {
            console.log(`Saved chat summary for character ${characterId}:`, response.data);
            return true;
        } else {
            console.warn('Unexpected response when saving chat summary:', response);
            return false;
        }
    } catch (error) {
        console.error('Error saving chat summary:', error);
        return false;
    }
};

/**
 * Generates a summary of the current conversation
 * @param {Array} messages - Array of conversation messages
 * @param {string} relationType - Type of relation
 * @param {string} nickname - User's nickname
 * @returns {Promise<string>} - Generated summary
 */
export const generateChatSummary = async (messages, relationType, nickname) => {
    try {
        // Build conversation text from messages
        const conversationText = messages
            .filter(msg => !msg.typing && msg.content.trim())
            .map(msg => `${msg.sender === 'user' ? nickname || 'User' : relationType}: ${msg.content}`)
            .join('\n');

        if (!conversationText.trim()) {
            return '';
        }

        // Create summary prompt
        const summaryMessages = [
            {
                role: "system",
                content: "You are an expert at summarizing conversations. Create a concise 2-3 sentence summary of the conversation that captures the main topics discussed and the emotional tone. Focus on what was talked about and how the conversation went."
            },
            {
                role: "user",
                content: `Please summarize this conversation:\n\n${conversationText}`
            }
        ];

        const summary = await sendMessageToExternalAI(summaryMessages);
        console.log('Generated chat summary:', summary);
        return summary;
    } catch (error) {
        console.error('Error generating chat summary:', error);
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
 * @param {string} previousSummary - Summary of previous conversations (optional)
 * @returns {Array} - Formatted messages array for AI API
 */
export const buildConversationContext = (
    relationType,
    topic,
    additionalDetails,
    nickname,
    history = [],
    currentMessage = '',
    previousSummary = ''
) => {
    // Build system prompt exactly like the backend, with optional previous summary
    let systemPrompt = `You are role-playing as the user's ${relationType}. Call him as ${nickname} when addressing and not required often. Speak lovingly and supportively, matching the emotional tone requested. Topic: ${topic}. Do NOT break character; refer to the user by their nickname naturally. Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. Keep it short and simple. Don't be extra energized or excited, just be normal and calm. Don't be poetic. Don't beat about the bush.`;

    // Add previous conversation summary if available
    if (previousSummary && previousSummary.trim()) {
        systemPrompt += `\n\nPrevious conversation summary: ${previousSummary}. Use this context to maintain continuity but don't explicitly mention the summary.`;
    }

    console.log(systemPrompt)

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
 * @param {string} previousSummary - Summary of previous conversations (optional)
 * @returns {Promise<string>} - Greeting message
 */
export const generateInitialGreeting = async (relationType, mood, topic, additionalDetails, nickname = '', characterId = null, previousSummary = '') => {
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
        'Start the conversation with a warm, supportive greeting tailored to the provided context and ask a gentle opening question.',
        previousSummary
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
 * @param {string} params.previousSummary - Summary of previous conversations (optional)
 * @returns {Promise<string>} - AI response
 */
export const sendChatMessage = async ({
    message,
    relationType = 'Friend',
    topic = 'General conversation',
    additionalDetails = '',
    nickname = '',
    characterId = null,
    history = [],
    previousSummary = ''
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
        message,
        previousSummary
    );

    return await sendMessageToExternalAI(messages);
};