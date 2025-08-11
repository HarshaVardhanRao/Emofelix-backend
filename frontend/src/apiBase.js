// Utility to get API base URL from Vite env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// Gemini chat stream (served by Django now)
export const GEMINI_CHAT_STREAM_URL = `${API_BASE_URL}/api/chat/gemini/stream/`;
