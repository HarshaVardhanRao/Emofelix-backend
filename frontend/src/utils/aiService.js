import axios from 'axios';
import { getActiveAIConfig, getAIModel } from './aiConfig';

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
 * Builds conversation context for the AI model
 * @param {string} relationType - Type of relation (Friend, Mother, etc.)
 * @param {string} mood - User's current mood
 * @param {string} topic - Conversation topic
 * @param {string} additionalDetails - Additional context
 * @param {string} nickname - User's nickname
 * @param {Array} history - Previous conversation messages
 * @param {string} currentMessage - Current user message
 * @returns {Array} - Formatted messages array for AI API
 */
export const buildConversationContext = (
    relationType,
    mood,
    topic,
    additionalDetails,
    nickname,
    history = [],
    currentMessage = ''
) => {
    // Build system prompt
    const systemPrompt = `You are role-playing as the user's ${relationType}. Call them ${nickname}. 
Speak lovingly and supportively, matching the emotional tone requested. 
User mood: ${mood}. Topic: ${topic}. Nickname of user: ${nickname}. 
Additional context: ${additionalDetails}. 
Do NOT break character; refer to the user by their nickname naturally. 
Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. 
Keep it short and simple. Don't be extra energized or excited, just be normal and calm. 
Don't be poetic. Don't beat about the bush.`;

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
 * @param {string} nickname - User's nickname
 * @returns {Promise<string>} - Greeting message
 */
export const generateInitialGreeting = async (relationType, mood, topic, additionalDetails, nickname) => {
    const messages = buildConversationContext(
        relationType,
        mood,
        topic,
        additionalDetails,
        nickname,
        [],
        'Start the conversation with a warm, supportive greeting tailored to the provided context and ask a gentle opening question.'
    );

    return await sendMessageToExternalAI(messages);
};