const express = require('express');
const router = express.Router();

const { initUser, selectRobot, toggleTrading, getUser, handleChat } = require('../controllers/userController');
const { validate, selectRobotSchema, toggleTradingSchema, chatSchema } = require('../middleware/validation');

// User endpoints
router.post('/init', initUser);

// Add validation middleware for the request body
router.patch('/:userId/robot', validate(selectRobotSchema), selectRobot);

// Add validation middleware for the request body
router.post('/:userId/chat', validate(chatSchema), handleChat);

// Add validation middleware for the request body
router.patch('/:userId/trading', validate(toggleTradingSchema), toggleTrading);

router.get('/:userId', getUser);

module.exports = router;