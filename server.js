const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// List of waiting users
let waitingUsers = [];

// PeerJS configuration
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

// Serve static files
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // When a user clicks the "Start" button
    socket.on('start', (peerId) => {
        // Add user to the waiting list
        waitingUsers.push({ socketId: socket.id, peerId });
        console.log('👥 Waiting users:', waitingUsers);

        // If at least two users are waiting, connect them
        if (waitingUsers.length >= 2) {
            const user1 = waitingUsers.shift();
            const user2 = waitingUsers.shift();

            // Connect both users
            io.to(user1.socketId).emit('call', user2.peerId);
            io.to(user2.socketId).emit('call', user1.peerId);

            console.log(`🔗 Connecting ${user1.peerId} with ${user2.peerId}`);
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        waitingUsers = waitingUsers.filter(user => user.socketId !== socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
