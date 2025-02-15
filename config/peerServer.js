const { ExpressPeerServer } = require('peer');

module.exports = (server) => {
    const peerServer = ExpressPeerServer(server, {
        debug: true,
        path: '/'
    });

    return peerServer;
};
