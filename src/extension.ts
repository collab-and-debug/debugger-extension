import * as vscode from 'vscode';
import {
    getCurrentSession,
    sendToServer,
    startCollabSession,
    statusBarItem,
    stopCollabSession
} from './wsClient';

const SESSION_KEYS = {
    serverUrl: 'collabDebug.serverUrl',
    sessionId: 'collabDebug.sessionId',
    userName:  'collabDebug.userName',
    userId:    'collabDebug.userId',
    userColor: 'collabDebug.userColor'
};

const DEFAULT_SERVER = 'wss://debugger-server.onrender.com';

const USER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#f7b731', '#a55eea'];

export async function activate(context: vscode.ExtensionContext) {
    console.log('[CollabDebug] Extension activated');
    context.subscriptions.push(statusBarItem);

    // ─────────────────────────────────────────────
    // START SESSION
    // ─────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand('collabDebug.startSession', async () => {

            const serverUrl = await vscode.window.showInputBox({
                title: 'CollabDebug: Start Session',
                prompt: 'Server URL',
                value: context.globalState.get(SESSION_KEYS.serverUrl, DEFAULT_SERVER),
                ignoreFocusOut: true
            });
            if (!serverUrl) return;

            const userName = await vscode.window.showInputBox({
                title: 'CollabDebug: Start Session',
                prompt: 'Your name',
                value: context.globalState.get(SESSION_KEYS.userName, ''),
                ignoreFocusOut: true
            });
            if (!userName) return;

            const userId = context.globalState.get(SESSION_KEYS.userId, createUserId());
            const httpUrl = toHttpUrl(serverUrl);

            vscode.window.showInformationMessage('Creating session...');

            let sessionId: string;

            try {
                const res = await fetch(`${httpUrl}/session/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                if (!res.ok) throw new Error(`Server error: ${res.status}`);

                const data = await res.json() as { sessionId: string };
                sessionId = data.sessionId;

            } catch (err) {
                vscode.window.showErrorMessage('Failed to create session');
                return;
            }

            const userColor = pickUserColor();

            const session = { serverUrl, sessionId, userName, userId, userColor };

            await context.globalState.update(SESSION_KEYS.serverUrl, serverUrl);
            await context.globalState.update(SESSION_KEYS.sessionId, sessionId);
            await context.globalState.update(SESSION_KEYS.userName, userName);
            await context.globalState.update(SESSION_KEYS.userId, userId);
            await context.globalState.update(SESSION_KEYS.userColor, userColor);

            startCollabSession(session);

            // 🔥 AUTO OPEN DASHBOARD
            const dashboardUrl = `https://collab-debug.vercel.app/#/session/${sessionId}`;
            vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));

            // Copy ID UI
            vscode.window.showInformationMessage(
                `Session started! ID: ${sessionId}`,
                'Copy ID'
            ).then(action => {
                if (action === 'Copy ID') {
                    vscode.env.clipboard.writeText(sessionId);
                    vscode.window.showInformationMessage('Session ID copied!');
                }
            });
        })
    );

    // ─────────────────────────────────────────────
    // JOIN SESSION
    // ─────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand('collabDebug.joinSession', async () => {

            const serverUrl = await vscode.window.showInputBox({
                title: 'Join Session',
                prompt: 'Server URL',
                value: context.globalState.get(SESSION_KEYS.serverUrl, DEFAULT_SERVER),
                ignoreFocusOut: true
            });
            if (!serverUrl) return;

            const sessionId = await vscode.window.showInputBox({
                title: 'Join Session',
                prompt: 'Session ID',
                ignoreFocusOut: true
            });
            if (!sessionId) return;

            const userName = await vscode.window.showInputBox({
                title: 'Join Session',
                prompt: 'Your name',
                value: context.globalState.get(SESSION_KEYS.userName, ''),
                ignoreFocusOut: true
            });
            if (!userName) return;

            const httpUrl = toHttpUrl(serverUrl);

            try {
                const res = await fetch(`${httpUrl}/session/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, userId: 'check' })
                });

                if (res.status === 404) {
                    vscode.window.showErrorMessage('Session not found');
                    return;
                }

            } catch {
                vscode.window.showErrorMessage('Server unreachable');
                return;
            }

            const userId = createUserId();
            const userColor = pickUserColor();

            const session = { serverUrl, sessionId, userName, userId, userColor };

            await context.globalState.update(SESSION_KEYS.serverUrl, serverUrl);
            await context.globalState.update(SESSION_KEYS.sessionId, sessionId);
            await context.globalState.update(SESSION_KEYS.userName, userName);
            await context.globalState.update(SESSION_KEYS.userId, userId);
            await context.globalState.update(SESSION_KEYS.userColor, userColor);

            startCollabSession(session);

            // 🔥 AUTO OPEN DASHBOARD ON JOIN
            const dashboardUrl = `https://collab-debug.vercel.app/#/session/${sessionId}`;
            vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));

            vscode.window.showInformationMessage(`Joined as ${userName}`);
        })
    );

    // ─────────────────────────────────────────────
    // STOP SESSION
    // ─────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand('collabDebug.stopSession', () => {
            stopCollabSession();
            vscode.window.showInformationMessage('Session stopped');
        })
    );

    // ─────────────────────────────────────────────
    // BREAKPOINT + VARIABLE LOGIC (UNCHANGED)
    // ─────────────────────────────────────────────
    context.subscriptions.push(
        vscode.debug.onDidChangeBreakpoints((event) => {

            const session = getCurrentSession();
            if (!session) return;

            event.added.forEach(bp => {
                if (!(bp instanceof vscode.SourceBreakpoint)) return;

                sendToServer({
                    type: 'breakpoint',
                    payload: {
                        file: bp.location.uri.fsPath,
                        line: bp.location.range.start.line + 1,
                        action: 'add'
                    },
                    ...session
                });
            });

            event.removed.forEach(bp => {
                if (!(bp instanceof vscode.SourceBreakpoint)) return;

                sendToServer({
                    type: 'breakpoint',
                    payload: {
                        file: bp.location.uri.fsPath,
                        line: bp.location.range.start.line + 1,
                        action: 'remove'
                    },
                    ...session
                });
            });
        })
    );
}

export function deactivate() {
    stopCollabSession();
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function toHttpUrl(serverUrl: string) {
    return serverUrl.replace(/\/$/, '')
        .replace('wss://', 'https://')
        .replace('ws://', 'http://');
}

function createUserId() {
    return `user-${Math.random().toString(36).slice(2, 8)}`;
}

function pickUserColor() {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}