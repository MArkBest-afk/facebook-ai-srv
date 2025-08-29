const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming userId is an ObjectId referencing the User model
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'], // Assuming only BUY and SELL types
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number,
    required: true
  },
  pnl: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number, // Storing timestamp as a number (Unix timestamp or similar)
    required: true
  },
  id: { // Keeping this based on your example, though _id will be the primary identifier
    type: String
  }
}, { timestamps: false }); // Disable Mongoose's default timestamps

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;