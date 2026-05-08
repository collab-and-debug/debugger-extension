import * as vscode from 'vscode';
import { addRemoteBreakpoint, removeRemoteBreakpoint } from './decorationManager';

import WebSocket = require('ws');

export interface CollabSessionInfo {
    serverUrl: string;
    sessionId: string;
    userId: string;
    userName: string;
    userColor: string;
}

let wsClient: WebSocket | undefined;
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

export function sendToServer(payload: object) {
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
    statusBarItem.text = '$(circle-slash) CollabDebug: Not connected';
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
    if (!currentSession) {
        return;
    }

    const url = buildSessionUrl(currentSession);
    console.log('[CollabDebug] Connecting to WebSocket server:', url);

    statusBarItem.text = '$(sync~spin) CollabDebug: Connecting...';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.show();

    wsClient = new WebSocket(url);

    wsClient.on('open', () => {
        if (!currentSession) {
            return;
        }

        console.log('[CollabDebug] Connected to WebSocket server');
        statusBarItem.text = '$(check) CollabDebug: Connected';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.show();

        sendToServer({
            type: 'ping',
            userId: currentSession.userId,
            userName: currentSession.userName
        });
    });

    wsClient.on('message', (data: WebSocket.RawData) => {
        try {
            const message = JSON.parse(data.toString());

            if (isOwnMessage(message)) {
                return;
            }

            if (message.type === 'breakpoint' && message.action === 'add') {
                addRemoteBreakpoint(message.userId, message.file, message.line, message.userColor);
            }

            if (message.type === 'breakpoint' && message.action === 'remove') {
                removeRemoteBreakpoint(message.userId, message.file, message.line);
            }

            if (message.type === 'breakpoint-added') {
                addRemoteBreakpoint(message.userId, message.filePath, message.line, message.userColor);
            }

            if (message.type === 'breakpoint-removed') {
                removeRemoteBreakpoint(message.userId, message.filePath, message.line);
            }
        } catch (err) {
            console.error('[CollabDebug] Error parsing message:', err);
        }
    });

    wsClient.on('error', (err: Error) => {
        console.error('[CollabDebug] WebSocket error:', err.message);
    });

    wsClient.on('close', () => {
        if (!currentSession) {
            return;
        }

        console.log('[CollabDebug] Disconnected from server. Retrying in 3 seconds...');
        statusBarItem.text = '$(warning) CollabDebug: Disconnected';
        statusBarItem.show();

        reconnectTimer = setTimeout(connect, 3000);
    });
}

function buildSessionUrl(session: CollabSessionInfo) {
    const base = session.serverUrl.replace(/\/$/, '');
    const url = new URL(base);
    url.searchParams.set('sessionId', session.sessionId);
    url.searchParams.set('userId', session.userId);
    url.searchParams.set('userName', session.userName);
    url.searchParams.set('userColor', session.userColor);
    return url.toString();
}

function isOwnMessage(message: any) {
    return Boolean(currentSession?.userId && message?.userId === currentSession.userId);
}
