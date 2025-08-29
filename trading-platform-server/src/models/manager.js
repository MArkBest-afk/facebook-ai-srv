const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
}, { timestamps: false }); // Do not include default timestamps

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;