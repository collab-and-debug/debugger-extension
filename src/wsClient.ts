import * as vscode from 'vscode';
import { addRemoteBreakpoint, removeRemoteBreakpoint } from './decorationManager';

import WebSocket = require('ws');

export interface CollabSessionInfo {
    serverUrl: string;
    sessionId: string;
    userId:    string;
    userName:  string;
    userColor: string;
}

let wsClient:       WebSocket | undefined;
let reconnectTimer: NodeJS.Timeout | undefined;
let currentSession: CollabSessionInfo | undefined;

export const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
);
statusBarItem.text = '$(circle-slash) CollabDebug: Not connected';
statusBarItem.show();

export function getWsClient() {
    return wsClient;
}

export function getCurrentSession() {
    return currentSession;
}

export function sendToServer(payload: object): boolean {
    if (wsClient?.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify(payload));
        return true;
    }
    return false;
}

export function startCollabSession(session: CollabSessionInfo) {
    currentSession = session;
    reconnectNow();
}

export function stopCollabSession() {
    currentSession = undefined;

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
    }

    wsClient?.close();
    wsClient = undefined;

    statusBarItem.text            = '$(circle-slash) CollabDebug: Not connected';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.show();
}

function reconnectNow() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
    }

    wsClient?.removeAllListeners();
    wsClient?.close();
    connect();
}

function connect() {
    if (!currentSession) { return; }

    const url = buildSessionUrl(currentSession);
    console.log('[CollabDebug] Connecting to:', url);

    statusBarItem.text            = '$(sync~spin) CollabDebug: Connecting...';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.show();

    wsClient = new WebSocket(url);

    wsClient.on('open', () => {
        if (!currentSession) { return; }

        console.log('[CollabDebug] Connected');
        statusBarItem.text            = '$(check) CollabDebug: Connected';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.show();

        // Initial keepalive ping
        sendToServer({
            type:     'ping',
            userId:   currentSession.userId,
            userName: currentSession.userName
        });
    });

    wsClient.on('message', (data: WebSocket.RawData) => {
        try {
            const message = JSON.parse(data.toString());

            // Ignore messages we sent ourselves
            if (isOwnMessage(message)) { return; }

            // Handle remote breakpoint events — render decorations in editor
            if (message.type === 'BREAKPOINT_HIT') {
                addRemoteBreakpoint(
                    message.userId,
                    message.payload?.file,
                    message.payload?.line,
                    message.userColor
                );
            }

            if (message.type === 'BREAKPOINT_REMOVED') {
                removeRemoteBreakpoint(
                    message.userId,
                    message.payload?.file,
                    message.payload?.line
                );
            }

            // Legacy event name support (in case server sends older format)
            if (message.type === 'breakpoint' && message.action === 'add') {
                addRemoteBreakpoint(message.userId, message.file, message.line, message.userColor);
            }

            if (message.type === 'breakpoint' && message.action === 'remove') {
                removeRemoteBreakpoint(message.userId, message.file, message.line);
            }

        } catch (err) {
            console.error('[CollabDebug] Error parsing message:', err);
        }
    });

    wsClient.on('error', (err: Error) => {
        console.error('[CollabDebug] WebSocket error:', err.message);
        statusBarItem.text = '$(warning) CollabDebug: Error';
        statusBarItem.show();
    });

    wsClient.on('close', () => {
        if (!currentSession) { return; }

        console.log('[CollabDebug] Disconnected. Retrying in 3s...');
        statusBarItem.text = '$(warning) CollabDebug: Disconnected';
        statusBarItem.show();

        // Auto-reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
    });
}

// Builds the WebSocket URL with session params as query string.
// Uses string concatenation instead of new URL() to avoid issues
// with wss:// protocol parsing on some Node versions.
function buildSessionUrl(session: CollabSessionInfo): string {
    const base = session.serverUrl.replace(/\/$/, '');

    const params = new URLSearchParams({
        sessionId: session.sessionId,
        userId:    session.userId,
        userName:  session.userName,
        userColor: session.userColor
    });

    return `${base}/?${params.toString()}`;
}

function isOwnMessage(message: any): boolean {
    return Boolean(
        currentSession?.userId &&
        message?.userId === currentSession.userId
    );
}