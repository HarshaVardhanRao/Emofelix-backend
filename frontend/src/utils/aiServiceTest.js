import { sendMessageToExternalAI, buildConversationContext, generateInitialGreeting } from './aiService';

/**
 * Test function to verify the external AI integration
 */
export const testExternalAI = async () => {
    try {
        console.log('🧪 Testing External AI Integration...');

        // Test 1: Simple message
        console.log('Test 1: Simple greeting message');
        const simpleMessages = [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello! How are you?" }
        ];

        const response1 = await sendMessageToExternalAI(simpleMessages);
        console.log('✅ Simple message test:', response1.substring(0, 100) + '...');

        // Test 2: Build conversation context
        console.log('Test 2: Building conversation context');
        const contextMessages = buildConversationContext(
            'Friend',
            'Happy',
            'General chat',
            'Just catching up',
            'Alex',
            [
                { role: 'user', content: 'Hi there!' },
                { role: 'assistant', content: 'Hello Alex! Great to see you!' }
            ],
            'How has your day been?'
        );

        const response2 = await sendMessageToExternalAI(contextMessages);
        console.log('✅ Context conversation test:', response2.substring(0, 100) + '...');

        // Test 3: Generate initial greeting
        console.log('Test 3: Generating initial greeting');
        const greeting = await generateInitialGreeting(
            'Mother',
            'Calm',
            'Family chat',
            'User seems tired',
            'Sweetie'
        );
        console.log('✅ Initial greeting test:', greeting.substring(0, 100) + '...');

        console.log('🎉 All tests passed! External AI integration is working properly.');
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