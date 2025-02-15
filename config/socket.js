module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔗 کاربر متصل شد:', socket.id);

        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit('user-connected', userId);

            socket.on('disconnect', () => {
                socket.to(roomId).emit('user-disconnected', userId);
            });
        });
    });
};
