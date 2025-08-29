const {
    GoogleGenerativeAI
} = require('@google/generative-ai');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a chat response from the Gemini AI.
 * @param {Array<Object>} chatHistory - Array of previous messages in the chat.
 * @param {string} newMessage - The new message from the user.
 * @returns {Promise<string>} The text response from the AI.
 * @throws {Error} If there's an error interacting with the AI.
 */
async function generateChatResponse(chatHistory, newMessage) {
    try {
        // For text-only input, use the gemini-pro model
        // For text and image input, use the gemini-pro-vision model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro'
        });

        // Start a chat session with the provided history
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500, // Adjust as needed
            },
        });

        // Send the new message to the chat
        const result = await chat.sendMessage(newMessage);
        const response = await result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error('Error generating chat response:', error);
        throw new Error('Failed to generate chat response.');
    }
}

module.exports = {
    generateChatResponse
};