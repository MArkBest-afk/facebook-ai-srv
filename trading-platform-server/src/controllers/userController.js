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

    const newUser = new User({
      lead_sig: lead_sig || null,
      balance: 100,
      trades: [],
      selectedRobotId: null,
      totalPnl: 0,
      sessionStartTime: Date.now(),
      timeLimit: 14400,
      isRunning: false,
      isBlocked: false,
      isSubscribed: false,
      lastActive: Date.now(),
      createdAt: Date.now(),
      ipAddress: req.ip || null,
      location: 'N/A',
      comment: '',
    });

    await newUser.save();

    res.status(201).send(newUser);

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

const handleChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    if (!user.chatHistory) {
      user.chatHistory = [];
    }

    user.chatHistory.push({ role: 'user', text: text, timestamp: new Date() });

    const aiResponseText = await generateChatResponse(user.chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })), text);

    user.chatHistory.push({ role: 'model', text: aiResponseText, timestamp: new Date() });

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
