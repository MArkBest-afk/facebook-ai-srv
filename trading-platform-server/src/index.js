console.log(`--- SERVER STARTING: Version ${new Date().toISOString()} ---`);

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { runTradingSimulation } = require('./services/tradingService');
const { generateManagerRecommendations } = require('./services/managerRecommendationService');
const { initializeWebSocket } = require('./websocket/websocketManager');

// --- Route Imports ---
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// --- WebSocket Server with Origin Validation ---
const wss = new WebSocket.Server({
  server,
  verifyClient: (info, done) => {
    const origin = info.origin || info.req.headers.origin;
    console.log('Verifying WebSocket origin:', origin);
    const allowedOrigins = [
      'https://studio--demotrade-ai.us-central1.hosted.app',
      'http://localhost:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      done(true);
    } else {
      console.log(`WebSocket connection from origin ${origin} rejected.`);
      done(false, 403, 'Forbidden');
    }
  }
});

initializeWebSocket(wss); // Initialize WebSocket handling

// --- Middleware ---
app.use(express.json());
app.use(helmet());

// --- CORS Configuration for HTTP Requests ---
const corsOptions = {
  origin: [
    'https://studio--demotrade-ai.us-central1.hosted.app',
    'http://localhost:3000'
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- API Routes ---
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- Environment Variable Checks ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: Required environment variables are not defined.');
  process.exit(1);
}

// --- Database Connection ---
// Removed deprecated options for modern Mongoose versions
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB...');
    // Start background services
    setInterval(runTradingSimulation, 1000);
    setInterval(generateManagerRecommendations, 300000); // 5 minutes
  })
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1); // Exit if DB connection fails
  });

// --- Server Listening ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
