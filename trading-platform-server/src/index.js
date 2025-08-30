
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const helmet = require('helmet');
const cors = require('cors');

// Use relative paths for robustness
const { runTradingSimulation } = require('./services/tradingService.js');
const { generateManagerRecommendations } = require('./services/managerRecommendationService.js');
const { initializeWebSocket } = require('./websocket/websocketManager.js');
const errorMiddleware = require('./middleware/error.js');
const userRoutes = require('./routes/users.js');
const adminRoutes = require('./routes/admin.js');

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
      'http://localhost:3000' // Also allow localhost for local frontend dev
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
    'http://localhost:3000' // Also allow localhost for local frontend dev
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// --- Environment Variable Checks ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: Required environment variables are not defined.');
  process.exit(1);
}

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB...');
    // Start background services
    setInterval(runTradingSimulation, 1000);
    setInterval(generateManagerRecommendations, 300000); // 5 minutes
  })
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
  });

// --- API Routes ---
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- Centralized Error Handler ---
app.use(errorMiddleware);

// --- Server Startup ---
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
