import app from './app.js';
import "dotenv/config.js";
import connectDB from './db/index.js';
import { createServer } from 'http';
import { initializeSocket } from './socket/index.js';
import { setupChatSocket } from './socket/chatSocket.js';

const PORT = process.env.PORT || 8000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Setup chat socket handlers
setupChatSocket(io);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
      console.log(`Socket.io is ready for connections`);
    })
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  });
