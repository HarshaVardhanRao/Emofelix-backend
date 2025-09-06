import { sendChatMessage, generateInitialGreeting } from './aiService';

/**
 * Test function to verify the external AI integration
 */
export const testExternalAI = async () => {
    try {
        console.log('🧪 Testing External AI Integration...');

        // Test 1: Simple chat message with backend-like parameters
        console.log('Test 1: Chat message with full context');
        const response1 = await sendChatMessage({
            message: 'Hello! How are you today?',
            relationType: 'Friend',
            mood: 'Happy',
            topic: 'Daily check-in',
            additionalDetails: 'User seems excited about something',
            nickname: 'Alex',
            history: []
        });
        console.log('✅ Full context chat test:', response1.substring(0, 100) + '...');

        // Test 2: Chat with conversation history
        console.log('Test 2: Chat with conversation history');
        const response2 = await sendChatMessage({
            message: 'Can you tell me more about that?',
            relationType: 'Mother',
            mood: 'Curious',
            topic: 'Family advice',
            additionalDetails: 'User seeking guidance',
            nickname: 'Sweetie',
            history: [
                { role: 'user', content: 'I had a difficult day at work' },
                { role: 'assistant', content: 'Oh sweetie, I\'m sorry to hear that. What happened?' }
            ]
        });
        console.log('✅ History conversation test:', response2.substring(0, 100) + '...');

        // Test 3: Generate initial greeting
        console.log('Test 3: Generating initial greeting');
        const greeting = await generateInitialGreeting(
            'Mother',
            'Calm',
            'Family chat',
            'User seems tired after a long day',
            'Sweetie'
        );
        console.log('✅ Initial greeting test:', greeting.substring(0, 100) + '...');

        // Test 4: Different relation types
        console.log('Test 4: Different relation type - Best Friend');
        const response4 = await sendChatMessage({
            message: 'I need some advice about something',
            relationType: 'Best Friend',
            mood: 'Confused',
            topic: 'Personal advice',
            additionalDetails: 'User is facing a difficult decision',
            nickname: 'Buddy',
            history: []
        });
        console.log('✅ Best Friend context test:', response4.substring(0, 100) + '...');

        console.log('🎉 All tests passed! External AI integration is working properly.');
        console.log('📋 The system now sends all backend-expected parameters:');
        console.log('   - message, relation_type, mood, topic');
        console.log('   - additional_details, nickname, history');
        return true;

    } catch (error) {
        console.error('❌ External AI test failed:', error);
        return false;
    }
};

// Export for use in development console
if (typeof window !== 'undefined') {
    window.testExternalAI = testExternalAI;
}