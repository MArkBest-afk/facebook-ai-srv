const Manager = require('../models/manager');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Import the User model

const jwtSecret = process.env.JWT_SECRET;

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const manager = await Manager.findOne({ username });
    if (!manager) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ _id: manager._id, role: manager.role }, jwtSecret, { expiresIn: '1h' });

    res.send({ token });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).send({ error: 'Server error during login' });
  }
};

// Admin User Management Controllers

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      // Basic search implementation (case-insensitive on name)
      query = { name: { $regex: search, $options: 'i' } };
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.send({ users, total });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).send({ error: 'Server error fetching users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).send({ error: 'Server error fetching user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Optional: Add validation for updates using Zod here

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).send({ error: 'Server error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).send({ error: 'Server error deleting user' });
  }
};

module.exports = {
  loginAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};