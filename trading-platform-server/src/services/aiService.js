const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure the API key is loaded
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a chat response using the Gemini API.
 * Can handle either a full chat history or a single prompt.
 *
 * @param {Array} chatHistory - An array of chat messages (optional).
 * @param {string} newMessage - The new message or prompt from the user.
 * @returns {Promise<string>} The generated text response.
 */
async function generateChatResponse(chatHistory, newMessage) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // If there is no history, treat the newMessage as the initial prompt.
        if (!chatHistory || chatHistory.length === 0) {
            const result = await model.generateContent(newMessage);
            const response = await result.response;
            return response.text();
        }

        // If there is history, start a chat session.
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500, // Adjust as needed
            },
        });

        const result = await chat.sendMessage(newMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Error generating chat response:', error);
        // Instead of re-throwing, return a user-friendly error message.
        // This prevents the entire server from crashing on an API error.
        return 'I am currently unable to respond. Please try again later.';
    }
}

module.exports = {
    generateChatResponse
};