// AI Service Configuration
// This file allows switching between different AI providers

export const AI_PROVIDERS = {
    EXTERNAL_API: 'external_api',
    GEMINI_STREAM: 'gemini_stream',
    // Add more providers as needed
};

export const AI_CONFIG = {
    // Current active provider
    activeProvider: import.meta.env.VITE_AI_PROVIDER || AI_PROVIDERS.EXTERNAL_API,

    // Provider-specific configurations
    [AI_PROVIDERS.EXTERNAL_API]: {
        url: import.meta.env.VITE_EXTERNAL_AI_URL || 'https://df6d54334a9e.ngrok-free.app/v1/chat/completions',
        token: import.meta.env.VITE_EXTERNAL_AI_TOKEN || 'dev_secret_123',
        model: 'mistral:instruct',
        maxTokens: 1000,
        temperature: 0.7,
    },

    [AI_PROVIDERS.GEMINI_STREAM]: {
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/chat/gemini/stream/`,
        model: 'gemini-1.5-flash',
        streaming: true,
    }
};

export const getActiveAIConfig = () => {
    return AI_CONFIG[AI_CONFIG.activeProvider];
};

export const isStreamingProvider = () => {
    const config = getActiveAIConfig();
    return config.streaming === true;
};

export const getAIModel = () => {
    const config = getActiveAIConfig();
    return config.model;
};