const socket = io();
let peer;
let localStream;
const remoteAudio = document.getElementById('remoteAudio');

// Request user permission for microphone access
navigator.mediaDevices.getUserMedia({
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,    // تنظیم نرخ نمونه‌برداری به ۴۸ کیلوهرتز
        channelCount: 1       // استفاده از صدای مونو (برای تماس بهتر)
    }
}).then(stream => {
    localStream = stream;
}).catch(err => {
    alert('Please allow microphone access.');
    console.error(err);
});



// Create PeerJS instance
peer = new Peer({
    host: '/',
    port: 3000,
    path: '/peerjs'
});

// When PeerJS is ready
peer.on('open', (peerId) => {
    console.log('📞 Peer ID:', peerId);

    // When user clicks the "Start" button
    document.getElementById('startCall').addEventListener('click', () => {
        socket.emit('start', peerId);
    });
});

// Receiving a call
peer.on('call', (call) => {
    call.answer(localStream); // Answer the call with our microphone stream
    call.on('stream', (remoteStream) => {
        remoteAudio.srcObject = remoteStream;
    });
});
function optimizeAudioQuality(connection) {
    const sender = connection.peerConnection.getSenders().find(s => s.track.kind === 'audio');
    if (sender) {
        let parameters = sender.getParameters();
        if (!parameters.encodings) parameters.encodings = [{}];
        parameters.encodings[0].maxBitrate = 128 * 1000;  // تنظیم بیت‌ریت به ۱۲۸ کیلوبیت
        sender.setParameters(parameters);
    }
}

// When receiving a "call" event from the server
socket.on('call', (remotePeerId) => {
    console.log('🔗 Connecting to:', remotePeerId);

    const call = peer.call(remotePeerId, localStream);
    call.on('stream', (remoteStream) => {
        remoteAudio.srcObject = remoteStream;
    });
    optimizeAudioQuality(call);
});


