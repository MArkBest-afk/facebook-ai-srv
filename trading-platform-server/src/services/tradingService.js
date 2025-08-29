const User = require('../models/user');
const Trade = require('../models/trade');
const mongoose = require('mongoose');
const { sendMessageToUser } = require('../websocket/websocketManager');

async function runTradingSimulation() {
  try {
    const activeUsers = await User.find({ isRunning: true });

    for (const user of activeUsers) {
      console.log(`Making trading decision for user: ${user.name || user._id}`);

      // Placeholder trading logic: 50% chance to make a trade
      const shouldTrade = Math.random() < 0.5;

      if (shouldTrade) {
        console.log(`User ${user.name || user._id} will make a trade.`);

        // Placeholder trade simulation
        const simulatedPnl = (Math.random() - 0.5) * 10; // Random P/L between -5 and +5
        const simulatedTrade = {
          // TODO: Implement actual trade details (symbol, type, quantity, prices, etc.)
          symbol: 'SIM',
          type: simulatedPnl > 0 ? 'BUY' : 'SELL',
          quantity: 0.1,
          entryPrice: 100,
          exitPrice: 100 + simulatedPnl * 10, // Simple calculation for exit price
          pnl: simulatedPnl,
          timestamp: Date.now(),
          id: new mongoose.Types.ObjectId().toString(), // Generate a unique ID for the trade
        };

        // Update user's balance and total P/L
        user.balance += simulatedPnl;
        user.totalPnl += simulatedPnl;

        // Add trade to user's trades array (if storing in user document)
        // Or create a new Trade document (if using a separate trades collection)
        // For now, let's assume a separate Trade model and collection
        const newTrade = new Trade({
          userId: user._id,
          ...simulatedTrade,
        });
        await newTrade.save();
        
        // Add to user's trades array if preferred:
        // if (!user.trades) {
        //     user.trades = [];
        // }
        user.trades.push(simulatedTrade);


        // Save the updated user
        await user.save();

        console.log(`Trade simulated for user ${user.name || user._id}. P/L: ${simulatedPnl.toFixed(2)}. New Balance: ${user.balance.toFixed(2)}.`);

        // TODO: Use sendMessageToUser to send real-time updates
        // Send user update (balance, totalPnl)
        sendMessageToUser(user._id.toString(), {
          type: 'user:update',
          payload: {
            balance: user.balance,
            totalPnl: user.totalPnl,
          },
        });

        // Send new trade update
        sendMessageToUser(user._id.toString(), {
          type: 'trade:new',
          payload: simulatedTrade,
        });

      } else {
        console.log(`User ${user.name || user._id}: No trade this cycle.`);
      }

      // Optional: Add a small delay between processing users to avoid overwhelming the DB
      // await new Promise(resolve => setTimeout(resolve, 50));
    }

  } catch (error) {
    console.error('Error during trading simulation:', error);
  }
}

module.exports = {
  runTradingSimulation,
};