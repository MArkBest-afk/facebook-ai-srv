const express = require('express');
const router = express.Router();
const { loginAdmin, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/adminController');
const { validate, updateUserSchema } = require('../middleware/validation');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Public route for admin login
router.post('/login', loginLimiter, loginAdmin);

// TODO: Add protected admin routes below this line

// Protected routes for user management
router.get('/users', auth, getUsers);
router.get('/users/:userId', auth, getUserById);
router.patch('/users/:userId', auth, validate(updateUserSchema), updateUser);
router.delete('/users/:userId', auth, deleteUser);

module.exports = router;