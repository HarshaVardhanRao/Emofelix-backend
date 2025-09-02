# External AI Integration

This document explains the integration of the external AI service with the EmoFelix chat system.

## Overview

The chat system has been updated to use an external AI API instead of the previous Gemini streaming service. The new implementation supports:

- OpenAI-compatible API endpoints
- Configurable AI providers
- Proper error handling and fallbacks
- Environment-based configuration

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# External AI Configuration
VITE_EXTERNAL_AI_URL=https://your-ai-api-endpoint.com/v1/chat/completions
VITE_EXTERNAL_AI_TOKEN=your_secret_token
VITE_AI_PROVIDER=external_api
```

### API Format

The external AI service should follow the OpenAI chat completions format:

**Request:**
```json
{
  "model": "mistral:instruct",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Hello! How can I help you today?"
      }
    }
  ]
}
```

## Files Modified

1. **`frontend/.env`** - Added AI configuration variables
2. **`frontend/src/apiBase.js`** - Added external AI URL constants
3. **`frontend/src/utils/aiService.js`** - New AI service utilities
4. **`frontend/src/utils/aiConfig.js`** - AI provider configuration
5. **`frontend/src/pages/Chat.jsx`** - Updated to use external AI service

## Features

### Chat Integration

- **Initial Greeting**: AI generates contextual greetings based on relation type, mood, and preferences
- **Conversation Context**: Maintains conversation history for coherent responses
- **Error Handling**: Graceful fallbacks when AI service is unavailable
- **Typing Indicators**: Shows typing status while waiting for AI response

### Context Building

The system automatically builds conversation context including:
- User's relation type (Friend, Mother, etc.)
- Current mood and topic
- Chat history (last 20 messages)
- User preferences and additional details

### Testing

Use the test utility in the browser console:

```javascript
// Test the AI integration
window.testExternalAI();
```

## Switching Providers

To switch back to Gemini or add new providers:

1. Update `VITE_AI_PROVIDER` in `.env`
2. Add provider configuration in `aiConfig.js`
3. Implement provider-specific logic in `aiService.js`

## Error Handling

The system includes comprehensive error handling:

- Network connectivity issues
- API authentication errors
- Invalid response formats
- Service timeouts

All errors display user-friendly messages while logging technical details to the console.

## Security Considerations

- API tokens are stored in environment variables
- Tokens are never exposed in client-side code
- All API calls include proper authorization headers
- Error messages don't expose sensitive information

## Performance

- Non-streaming responses for better reliability
- Conversation history limited to last 20 messages
- Configurable response length and temperature
- Graceful degradation when service is slow