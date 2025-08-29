// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Use http for WebSocket integration
const WebSocket = require('ws'); // Use ws for simplicity, can be replaced with socket.io
const helmet = require('helmet'); // Import helmet middleware

const { runTradingSimulation } = require('/home/user/facebook-ai-srv/trading-platform-server/src/services/tradingService.js');
const { generateManagerRecommendations } = require('/home/user/facebook-ai-srv/trading-platform-server/src/services/managerRecommendationService.js');
const errorMiddleware = require('/home/user/facebook-ai-srv/trading-platform-server/src/middleware/error.js'); // Import error handling middleware
const app = express();
const server = http.createServer(app); // Create HTTP server based on Express app
const wss = new WebSocket.Server({ server }); // Create WebSocket server on top of the HTTP server

// Middleware to parse JSON request bodies
app.use(express.json());

// Security middleware: set various secure HTTP headers
app.use(helmet());

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not defined.');
    process.exit(1);
}


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB...');
    // Start the trading simulation timer
    // TODO: Make interval durations configurable via environment variables
    const tradingInterval = setInterval(runTradingSimulation, 1000); // Run every 1 second
  })
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    // If connection fails, clear the interval if it was set (though unlikely here)
    // clearInterval(tradingInterval); // This line is technically not needed as setInterval won't be called
  });

// Set up the manager recommendation timer after a short delay to allow DB connection
setTimeout(() => {
  if (mongoose.connection.readyState === 1) { // Check if connected
    // TODO: Make interval duration configurable
    setInterval(generateManagerRecommendations, 300000); // Run every 5 minutes
  }
}, 5000); // Wait 5 seconds before starting the recommendation timer

// Import and use user routes
// Basic WebSocket connection handling
wss.on('connection', function connection(ws) {
  console.log('Client connected via WebSocket');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // TODO: Handle incoming WebSocket messages (e.g., 'join')
  });

  ws.send('Welcome!'); // Send a welcome message to the client
});

const userRoutes = require('/home/user/facebook-ai-srv/trading-platform-server/src/routes/users.js');
app.use('/api/v1/users', userRoutes);

// Import and use admin routes
const adminRoutes = require('/home/user/facebook-ai-srv/trading-platform-server/src/routes/admin.js');
app.use('/api/v1/admin', adminRoutes);

// Centralized error handler middleware
app.use(errorMiddleware);


const port = process.env.PORT || 3000;
server.listen(port, () => { // Start the HTTP server, which also listens for WebSocket connections
  console.log(`Server is running on port ${port}`);
});