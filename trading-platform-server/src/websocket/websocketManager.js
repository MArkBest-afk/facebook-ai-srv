const WebSocket = require('ws');

const activeConnections = new Map();

let wss;

function init(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws) {
    console.log('Client connected via WebSocket');

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'join' && parsedMessage.payload && parsedMessage.payload.userId) {
          const userId = parsedMessage.payload.userId;
          activeConnections.set(userId, ws);
          console.log(`User ${userId} joined via WebSocket`);
          // Optional: Send confirmation back to the user
          // sendMessageToUser(userId, { type: 'join:success', payload: { userId: userId } });
        }
        // TODO: Handle other incoming WebSocket messages (e.g., chat messages from client)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        // Optional: Send an error message back to the client
        // ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format.' } }));
      }
    });

    ws.on('close', function close() {
      // Find and remove the disconnected user from activeConnections
      for (const [userId, connection] of activeConnections.entries()) {
        if (connection === ws) {
          activeConnections.delete(userId);
          console.log(`User ${userId} disconnected via WebSocket`);
          break;
        }
      }
      console.log('Client disconnected');
    });

    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
      // Handle specific errors if needed
    });

    // Initial message on connection
    ws.send(JSON.stringify({ type: 'connected', payload: { message: 'Successfully connected to WebSocket.' } }));
  });
}

function sendMessageToUser(userId, message) {
  const ws = activeConnections.get(userId);

  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
      // console.log(`Sent message to user ${userId}:`, message); // Optional logging
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error);
    }
  } else {
    // console.warn(`User ${userId} not connected or WebSocket is not open.`); // Optional logging
  }
}

// Optional: Function to broadcast messages to all connected users
// function broadcastMessage(message) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(message));
//     }
//   });
// }


module.exports = {
  init,
  sendMessageToUser,
  // broadcastMessage, // Export if needed
  // activeConnections // Export if needed for advanced scenarios, but try to use provided functions
};