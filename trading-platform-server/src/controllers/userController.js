const User = require('../models/user');
const { generateChatResponse } = require('../services/aiService');
const { sendMessageToUser } = require('../websocket/websocketManager'); // Import WebSocket utility

const initUser = async (req, res) => {
  try {
    const { userId, lead_sig } = req.body;

    if (userId) {
      const user = await User.findById(userId);

      if (user) {
        return res.send(user);
      }
    }

    // If no userId provided or user not found, create a new user
    const newUser = new User({
      // Mongoose automatically generates an _id for a new document
      lead_sig: lead_sig || null, // Set lead_sig if provided
      balance: 100, // Default balance
      trades: [],
      selectedRobotId: null,
      totalPnl: 0,
      sessionStartTime: Date.now(), // Or use a more appropriate default if needed
      timeLimit: 14400, // Default time limit in seconds (4 hours)
      isRunning: false,
      isBlocked: false,
      isSubscribed: false, // Default subscription status
      lastActive: Date.now(),
      createdAt: Date.now(),
      ipAddress: req.ip || null, // Capture IP address if available
      location: 'N/A', // Default location
      comment: '',
    });

    await newUser.save();

    res.status(201).send(newUser); // Use 201 status for resource creation

  } catch (error) {
    console.error('Error in initUser:', error);
    res.status(500).send({ error: 'An error occurred while initializing the user.' });
  }
};

const selectRobot = async (req, res) => {
  try {
    const { userId } = req.params;
    const { robotId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    user.selectedRobotId = robotId;
    await user.save();

    res.send({ success: true });

  } catch (error) {
    console.error('Error in selectRobot:', error);
    res.status(500).send({ error: 'An error occurred while selecting the robot.' });
  }
};

const toggleTrading = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isRunning } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    user.isRunning = isRunning;
    await user.save();

    res.send({ success: true });

  } catch (error) {
    console.error('Error in toggleTrading:', error);
    res.status(500).send({ error: 'An error occurred while toggling trading status.' });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    res.send(user);

  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).send({ error: 'An error occurred while fetching user data.' });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    res.send(user);

  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).send({ error: 'An error occurred while fetching user data.' });
  }
};

const handleChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    // Ensure chatHistory exists and is an array
    if (!user.chatHistory) {
      user.chatHistory = [];
    }

    // Add the user's message to the chat history
    user.chatHistory.push({ role: 'user', text: text, timestamp: new Date() });

    // Get AI response (pass only the messages array for the chat session)
    const aiResponseText = await generateChatResponse(user.chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })), text);

    // Add the AI's response to the chat history
    user.chatHistory.push({ role: 'model', text: aiResponseText, timestamp: new Date() });

    // Send the AI's response to the client via WebSocket
    sendMessageToUser(userId, {
      type: 'chat:new_message',
      payload: { sender: 'ai', text: aiResponseText, timestamp: new Date() }
    });

    await user.save();

    res.send({ success: true });

  } catch (error) {
    console.error('Error in handleChat:', error);
    res.status(500).send({ error: 'An error occurred while processing the chat message.' });
  }
};

module.exports = {
  initUser,
  selectRobot,
  toggleTrading,
  getUser,
  handleChat,
};
/*