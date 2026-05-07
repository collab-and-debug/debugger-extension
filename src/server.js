const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

console.log('CollabDebug WebSocket server running on ws://localhost:3000');

wss.on('connection', (ws, request) => {
    console.log('Client connected:', request.url);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'ping') {
                console.log('PING from', data.userName, `(${data.userId})`);
                return;
            }

            if (data.type === 'variable-state') {
                console.log('\nVARIABLE STATE RECEIVED');
                console.log('Session ID:', data.sessionId);
                console.log('User:', data.userName || data.userId);
                console.log('Variables:', data.variables);
                broadcast(ws, data);
                return;
            }

            if (data.type === 'breakpoint') {
                console.log(`\nBREAKPOINT ${data.action.toUpperCase()} by ${data.userName || data.userId} at ${data.file}:${data.line}`);
                broadcast(ws, data);
                return;
            }

            if (data.type === 'breakpoint-added' || data.type === 'breakpoint-removed') {
                console.log(`\n${data.type.toUpperCase()} by ${data.userId} at line ${data.line}`);
                broadcast(ws, data);
            }
        } catch (err) {
            console.error('Invalid message:', message.toString());
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(sender, data) {
    wss.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
