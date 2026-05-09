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
    userName: 'collabDebug.userName',
    userId: 'collabDebug.userId',
    userColor: 'collabDebug.userColor'
};

const USER_COLORS = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#f7b731',
    '#a55eea'
];

export async function activate(
    context: vscode.ExtensionContext
) {
    console.log('[CollabDebug] Extension activated');

    context.subscriptions.push(statusBarItem);

    /*
    =====================================
    START SESSION COMMAND
    =====================================
    */

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'collabDebug.startSession',
            async () => {

                const session =
                    await promptForSession(context);

                if (!session) {
                    return;
                }

                await context.globalState.update(
                    SESSION_KEYS.serverUrl,
                    session.serverUrl
                );

                await context.globalState.update(
                    SESSION_KEYS.sessionId,
                    session.sessionId
                );

                await context.globalState.update(
                    SESSION_KEYS.userName,
                    session.userName
                );

                await context.globalState.update(
                    SESSION_KEYS.userId,
                    session.userId
                );

                await context.globalState.update(
                    SESSION_KEYS.userColor,
                    session.userColor
                );

                startCollabSession(session);

                vscode.window.showInformationMessage(
                    `CollabDebug session started as ${session.userName}`
                );
            }
        )
    );

    /*
    =====================================
    JOIN SESSION COMMAND
    =====================================
    */

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'collabDebug.joinSession',
            async () => {

                const serverUrl =
                    await vscode.window.showInputBox({
                        title: 'CollabDebug: Join Session',
                        prompt: 'Server URL',
                        value: context.globalState.get<string>(
                            SESSION_KEYS.serverUrl,
                            'ws://localhost:3000'
                        ),
                        ignoreFocusOut: true
                    });

                if (!serverUrl) {
                    return;
                }

                const sessionId =
                    await vscode.window.showInputBox({
                        title: 'CollabDebug: Join Session',
                        prompt: 'Paste Session ID',
                        ignoreFocusOut: true
                    });

                if (!sessionId) {
                    return;
                }

                const userName =
                    await vscode.window.showInputBox({
                        title: 'CollabDebug: Join Session',
                        prompt: 'Your name',
                        value: context.globalState.get<string>(
                            SESSION_KEYS.userName,
                            ''
                        ),
                        ignoreFocusOut: true
                    });

                if (!userName) {
                    return;
                }

                const session = {
                    serverUrl,
                    sessionId,
                    userName,
                    userId: context.globalState.get<string>(
                        SESSION_KEYS.userId,
                        createUserId()
                    ),
                    userColor: context.globalState.get<string>(
                        SESSION_KEYS.userColor,
                        pickUserColor()
                    )
                };

                await context.globalState.update(
                    SESSION_KEYS.serverUrl,
                    serverUrl
                );

                await context.globalState.update(
                    SESSION_KEYS.sessionId,
                    sessionId
                );

                await context.globalState.update(
                    SESSION_KEYS.userName,
                    userName
                );

                startCollabSession(session);

                vscode.window.showInformationMessage(
                    `Joined session as ${userName}`
                );
            }
        )
    );

    /*
    =====================================
    STOP SESSION COMMAND
    =====================================
    */

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'collabDebug.stopSession',
            () => {

                stopCollabSession();

                vscode.window.showInformationMessage(
                    'CollabDebug session stopped'
                );
            }
        )
    );

    /*
    =====================================
    DEBUG SESSION EVENTS
    =====================================
    */

    context.subscriptions.push(
        vscode.debug.onDidChangeActiveDebugSession(
            session => {

                if (session) {
                    console.log(
                        '[CollabDebug] Debug session started:',
                        session.name
                    );
                } else {
                    console.log(
                        '[CollabDebug] Debug session stopped'
                    );
                }
            }
        )
    );

    /*
    =====================================
    BREAKPOINT EVENTS
    =====================================
    */

    context.subscriptions.push(
        vscode.debug.onDidChangeBreakpoints(
            (event) => {

                const session =
                    getCurrentSession();

                if (!session) {
                    return;
                }

                event.added.forEach((bp) => {

                    if (
                        !(bp instanceof vscode.SourceBreakpoint)
                    ) {
                        return;
                    }

                    const file =
                        bp.location.uri.fsPath;

                    const line =
                        bp.location.range.start.line + 1;

                    sendToServer({
                        type: 'breakpoint',
                        payload: {
                            file,
                            line,
                            action: 'add'
                        },
                        userId: session.userId,
                        userName: session.userName,
                        userColor: session.userColor
                    });
                });

                event.removed.forEach((bp) => {

                    if (
                        !(bp instanceof vscode.SourceBreakpoint)
                    ) {
                        return;
                    }

                    const file =
                        bp.location.uri.fsPath;

                    const line =
                        bp.location.range.start.line + 1;

                    sendToServer({
                        type: 'breakpoint',
                        payload: {
                            file,
                            line,
                            action: 'remove'
                        },
                        userId: session.userId,
                        userName: session.userName,
                        userColor: session.userColor
                    });
                });
            }
        )
    );

    /*
    =====================================
    VARIABLE TRACKING
    =====================================
    */

    context.subscriptions.push(
        vscode.debug.registerDebugAdapterTrackerFactory(
            '*',
            {
                createDebugAdapterTracker(debugSession) {

                    return {

                        onDidSendMessage:
                            async (message) => {

                                if (
                                    message.event !== 'stopped'
                                ) {
                                    return;
                                }

                                await captureAndSendVariables(
                                    debugSession,
                                    message.body?.threadId
                                );
                            }
                    };
                }
            }
        )
    );
}

export function deactivate() {
    stopCollabSession();

    console.log(
        '[CollabDebug] Extension deactivated'
    );
}

/*
=====================================
AUTO CREATE SESSION
=====================================
*/

async function promptForSession(
    context: vscode.ExtensionContext
) {

    const serverUrl =
        await vscode.window.showInputBox({
            title: 'CollabDebug: Start Session',
            prompt: 'Server URL',
            value: context.globalState.get<string>(
                SESSION_KEYS.serverUrl,
                'ws://localhost:3000'
            ),
            ignoreFocusOut: true
        });

    if (!serverUrl) {
        return undefined;
    }

    const userName =
        await vscode.window.showInputBox({
            title: 'CollabDebug: Start Session',
            prompt: 'Your name',
            value: context.globalState.get<string>(
                SESSION_KEYS.userName,
                ''
            ),
            ignoreFocusOut: true
        });

    if (!userName) {
        return undefined;
    }

    const userId =
        context.globalState.get<string>(
            SESSION_KEYS.userId,
            createUserId()
        );

    const httpUrl = serverUrl
        .replace('wss://', 'https://')
        .replace('ws://', 'http://');

    try {

        const response = await fetch(
            `${httpUrl}/session/create`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId
                })
            }
        );

        const data =
            await response.json() as {
                sessionId: string
            };

        const sessionId =
            data.sessionId;

        vscode.window.showInformationMessage(
            `Session ID: ${sessionId}`,
            'Copy to Clipboard'
        ).then(action => {

            if (
                action === 'Copy to Clipboard'
            ) {
                vscode.env.clipboard.writeText(
                    sessionId
                );
            }
        });

        return {
            serverUrl,
            sessionId,
            userName,
            userId,
            userColor:
                context.globalState.get<string>(
                    SESSION_KEYS.userColor,
                    pickUserColor()
                )
        };

    } catch (err) {

        vscode.window.showErrorMessage(
            'Failed to create session'
        );

        return undefined;
    }
}

async function captureAndSendVariables(
    debugSession: vscode.DebugSession,
    threadId: number | undefined
) {

    const collabSession =
        getCurrentSession();

    if (
        !collabSession ||
        threadId === undefined
    ) {
        return;
    }

    try {

        const stack =
            await debugSession.customRequest(
                'stackTrace',
                {
                    threadId,
                    startFrame: 0,
                    levels: 1
                }
            );

        const topFrame =
            stack.stackFrames?.[0];

        if (!topFrame) {
            return;
        }

        const scopesResponse =
            await debugSession.customRequest(
                'scopes',
                {
                    frameId: topFrame.id
                }
            );

        const scopes =
            scopesResponse.scopes || [];

        const localScope =
            scopes.find(
                (scope: any) =>
                    scope.name === 'Local' ||
                    scope.name === 'Locals'
            ) || scopes[0];

        if (
            !localScope?.variablesReference
        ) {
            return;
        }

        const variablesResponse =
            await debugSession.customRequest(
                'variables',
                {
                    variablesReference:
                        localScope.variablesReference
                }
            );

        const variables =
            variablesResponse.variables || [];

        const scopesObject:
            Record<string, any> = {};

        variables.forEach((v: any) => {
            scopesObject[v.name] = v.value;
        });

        sendToServer({
            type: 'variable-state',
            payload: {
                scopes: {
                    local: scopesObject
                }
            },
            userId: collabSession.userId,
            userName: collabSession.userName,
            userColor: collabSession.userColor,
            sessionId: collabSession.sessionId
        });

    } catch (err) {

        console.error(
            '[CollabDebug] Failed to capture variables:',
            err
        );
    }
}

function createUserId() {
    return `user-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function pickUserColor() {
    return USER_COLORS[
        Math.floor(
            Math.random() *
            USER_COLORS.length
        )
    ];
}
