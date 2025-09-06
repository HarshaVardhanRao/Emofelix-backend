# Frontend-Backend Parameter Mapping

This document shows how the frontend now sends all the required parameters that match the backend expectations.

## Backend Expected Parameters

From `views.py` in the `GeminiChatStreamView.post()` method, the backend expects:

```python
message = request.data.get('message', '').strip()
relation_type = request.data.get('relation_type', 'Friend')
mood = request.data.get('mood') or 'Neutral'
topic = request.data.get('topic') or 'General conversation'
additional_details = request.data.get('additional_details') or ''
nickname = Character.objects.filter(user=request.user, character_type=relation_type).first()
if nickname:
    nickname = nickname.nickname or request.user.first_name or request.user.username
else:
    nickname = request.user.first_name or request.user.username
history = request.data.get('history') or []
relation_id = request.data.get('relation_id')
```

## Frontend Implementation

The frontend now uses the `sendChatMessage()` function that sends all these parameters:

### Function Call Example

```javascript
const aiResponse = await sendChatMessage({
    message: messageToSend,                                    // ✅ message
    relationType: character?.character_type || 'Friend',       // ✅ relation_type
    mood: callPreferences?.moodLabel || 'Neutral',            // ✅ mood
    topic: callPreferences?.topic || 'General conversation',   // ✅ topic
    additionalDetails: callPreferences?.additionalDetails || '', // ✅ additional_details
    nickname: user?.first_name || user?.username || '',        // ✅ nickname
    history: historyPayload                                     // ✅ history
});
```

### System Prompt Construction

The frontend builds the exact same system prompt as the backend:

```javascript
const systemPrompt = `You are role-playing as the user's ${relationType}. Call him as ${nickname}. Speak lovingly and supportively, matching the emotional tone requested. User mood: ${mood}. Topic: ${topic}. Nickname of user: ${nickname}. Additional context: ${additionalDetails}. Do NOT break character; refer to the user by their nickname naturally. Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. Keep it short and simple. Don't be extra energized or excited, just be normal and calm. Don't be poetic. Don't beat about the bush.`;
```

## API Request Structure

The frontend sends this to your external AI API:

```json
{
  "model": "mistral:instruct",
  "messages": [
    {
      "role": "system",
      "content": "You are role-playing as the user's Friend. Call him as Alex. Speak lovingly and supportively, matching the emotional tone requested. User mood: Happy. Topic: General conversation. Nickname of user: Alex. Additional context: User seems excited. Do NOT break character; refer to the user by their nickname naturally. Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. Keep it short and simple. Don't be extra energized or excited, just be normal and calm. Don't be poetic. Don't beat about the bush."
    },
    {
      "role": "user", 
      "content": "Previous conversation..."
    },
    {
      "role": "assistant",
      "content": "Previous AI response..."
    },
    {
      "role": "user",
      "content": "Current user message"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

## Parameter Sources in Frontend

| Backend Parameter | Frontend Source | Notes |
|------------------|----------------|-------|
| `message` | User input from chat form | Current user message |
| `relation_type` | `character?.character_type` | Friend, Mother, Best Friend, etc. |
| `mood` | `callPreferences?.moodLabel` | Happy, Sad, Excited, Calm, etc. |
| `topic` | `callPreferences?.topic` | Conversation topic from call setup |
| `additional_details` | `callPreferences?.additionalDetails` | Extra context from call preferences |
| `nickname` | `user?.first_name \|\| user?.username` | User's display name |
| `history` | Last 20 messages from conversation | Chat history array |

## Key Features

1. **Exact System Prompt Match**: Frontend generates the same system prompt as backend
2. **Complete Parameter Coverage**: All backend-expected parameters are sent
3. **Conversation History**: Maintains last 20 messages for context
4. **User Preferences**: Integrates mood, topic, and additional details from call setup
5. **Character Context**: Uses character type for relation-specific responses
6. **Fallback Values**: Provides defaults for all optional parameters

## Testing

Use the test function to verify parameter sending:

```javascript
// In browser console
window.testExternalAI();
```

This will test various scenarios including:
- Full context chat with all parameters
- Conversation history handling
- Different relation types
- Initial greeting generation

The frontend now perfectly matches the backend's parameter expectations while using your external AI API endpoint.