// server.js

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { CONNECTION, ON_USER_JOINED, DISCONNECT, ON_USER_REMOVED, ON_EDITOR_CHANGE } from './const.js';

// Create an Express application
const app = express();

const liveUsersList = {};
let currentContent = '';

// Use CORS middleware
app.use(cors());

// Create an HTTP server and pass it the Express application
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Handle Socket.IO connections
io.on(CONNECTION, (socket) => {
 
  liveUsersList[socket.id] = `user-${socket.id}`
  io.emit(ON_USER_JOINED, { liveUsersList, currentContent });
 
  socket.on(ON_EDITOR_CHANGE, (newContent) => {
    currentContent = newContent;
    io.emit(ON_EDITOR_CHANGE, newContent); // Broadcast message to all clients
  });

  // Handle user disconnecting
  socket.on(DISCONNECT, () => {
    delete liveUsersList[socket.id];
    io.emit(ON_USER_REMOVED, liveUsersList);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
