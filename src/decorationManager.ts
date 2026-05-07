import * as vscode from 'vscode';

const userDecorations = new Map<string, vscode.TextEditorDecorationType>();
const userRanges = new Map<string, Map<string, vscode.Range[]>>();
const userColorMap = new Map<string, string>();

const USER_COLORS = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#f7b731',
    '#a55eea'
];

let colorIndex = 0;

export function addRemoteBreakpoint(userId: string, filePath: string, line: number, userColor?: string) {
    const decoration = getDecorationForUser(userId, userColor);

    for (const editor of vscode.window.visibleTextEditors) {
        if (!isSameFile(editor.document.uri.fsPath, filePath)) {
            continue;
        }

        const range = new vscode.Range(line - 1, 0, line - 1, 0);
        const existing = getRangesForFile(userId, filePath);

        if (!existing.some(item => item.start.line === range.start.line)) {
            existing.push(range);
        }

        editor.setDecorations(decoration, existing);
        console.log(`[CollabDebug] Remote breakpoint added for ${userId} at line ${line}`);
    }
}

export function removeRemoteBreakpoint(userId: string, filePath: string, line: number) {
    const decoration = getDecorationForUser(userId);

    for (const editor of vscode.window.visibleTextEditors) {
        if (!isSameFile(editor.document.uri.fsPath, filePath)) {
            continue;
        }

        const updated = getRangesForFile(userId, filePath).filter(range => range.start.line !== line - 1);
        userRanges.get(userId)?.set(filePath, updated);
        editor.setDecorations(decoration, updated);
        console.log(`[CollabDebug] Remote breakpoint removed for ${userId} at line ${line}`);
    }
}

function getDecorationForUser(userId: string, preferredColor?: string): vscode.TextEditorDecorationType {
    if (!userDecorations.has(userId)) {
        const color = getColorForUser(userId, preferredColor);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="${color}"/></svg>`;
        const decoration = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`),
            gutterIconSize: 'contain',
            overviewRulerColor: color,
            overviewRulerLane: vscode.OverviewRulerLane.Left
        });

        userDecorations.set(userId, decoration);
    }

    return userDecorations.get(userId)!;
}

function getColorForUser(userId: string, preferredColor?: string): string {
    if (!userColorMap.has(userId)) {
        const color = preferredColor || USER_COLORS[colorIndex % USER_COLORS.length];
        userColorMap.set(userId, color);
        colorIndex++;
    }

    return userColorMap.get(userId)!;
}

function getRangesForFile(userId: string, filePath: string) {
    if (!userRanges.has(userId)) {
        userRanges.set(userId, new Map());
    }

    const files = userRanges.get(userId)!;

    if (!files.has(filePath)) {
        files.set(filePath, []);
    }

    return files.get(filePath)!;
}

function isSameFile(editorPath: string, eventPath: string) {
    const normalize = (value: string) => value.replace(/\\/g, '/').toLowerCase();
    return normalize(editorPath) === normalize(eventPath) || normalize(editorPath).endsWith(`/${normalize(eventPath).split('/').pop()}`);
}
