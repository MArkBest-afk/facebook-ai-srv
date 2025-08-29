const User = require('../models/user');
const { generateChatResponse } = require('./aiService');

/**
 * Generates recommendations for managers based on user data using AI.
 */
async function generateManagerRecommendations() {
  try {
    console.log('Generating manager recommendations...');
    // Define criteria for 'hot' leads
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const users = await User.find({
      isRunning: true, // User is currently running the simulation
      lastActive: { $gte: oneHourAgo }, // Active within the last hour
      // Add more criteria here as needed
    });

    for (const user of users) {
      // Further filter based on additional criteria (e.g., trades and PnL)
      if (user.trades.length > 5 && user.totalPnl > 10) { // Example criteria
        console.log(`User ${user._id} identified as a hot lead.`);
        // Construct a detailed prompt for Gemini based on user data
        const prompt = `Analyze the following user data and provide a brief, actionable recommendation for a manager regarding user ${user.name}.
User ID: ${user._id}
Current Balance: ${user.balance}
Total PnL: ${user.totalPnl}
Number of Trades: ${user.trades.length}
Is Currently Running Simulation: ${user.isRunning}
Last Active: ${user.lastActive}
Selected Robot ID: ${user.selectedRobotId || 'None'}

What specific action or message should a manager consider for this user to engage or assist them?`;
        // Call the AI service to get a recommendation
        // TODO: Implement logic to store or send the recommendation
        // Example: Save to user document, send via WebSocket to admin panel, etc.
        try {
          const aiRecommendation = await generateChatResponse([], prompt); // Passing empty chat history, just using the prompt
          console.log(`Recommendation for user ${user._id}: ${aiRecommendation}`); // Keep for debugging, can remove later

          // Store the recommendation in the user document
          user.managerRecommendations.push({ timestamp: new Date(), text: aiRecommendation });
      } catch (aiError) {
        console.error(`Error generating AI recommendation for user ${user._id}:`, aiError);
      }
    }
      try {
        const aiRecommendation = await generateChatResponse([], prompt); // Passing empty chat history, just using the prompt
        console.log(`Recommendation for user ${user._id}: ${aiRecommendation}`);
      } catch (aiError) {
        console.error(`Error generating AI recommendation for user ${user._id}:`, aiError);
      }
    }

    console.log('Manager recommendation generation complete.');

  } catch (error) {
    console.error('Error in generating manager recommendations:', error);
  }
}

module.exports = {
  generateManagerRecommendations,
};