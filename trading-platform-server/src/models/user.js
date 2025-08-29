const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: String,
  type: String, // e.g., 'BUY' or 'SELL'
  quantity: Number,
  entryPrice: Number,
  exitPrice: Number,
  pnl: Number,
  timestamp: { type: Date, default: Date.now },
  id: String, // Assuming this is a unique trade ID
}, { _id: false }); // We might not need a separate _id for each trade subdocument

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  trades: [tradeSchema], // Array of trade subdocuments
  selectedRobotId: {
    type: String,
    default: null,
  },
  totalPnl: {
    type: Number,
    default: 0,
  },
  sessionStartTime: {
    type: Number, // Storing as a number (likely timestamp)
    default: null,
  },
  timeLimit: {
    type: Number, // Storing as a number (likely in seconds)
    default: 14400, // Default to 4 hours (14400 seconds)
  },
  isRunning: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  chatHistory: {
    type: [
      {
        role: {
          type: String, // 'user' or 'model'
          required: true,
        },
        parts: [{ text: { type: String, required: true } }],
      },
    ],
    default: [],
  },
  managerRecommendations: {
 type: [
      {
 timestamp: { type: Date, default: Date.now },
 text: { type: String, required: true },
      },
    ],
 default: [],
  },

}, { timestamps: false }); // Set timestamps to false as we have manual timestamp fields

const User = mongoose.model('User', userSchema);

module.exports = User;