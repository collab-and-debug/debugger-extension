# CollabDebug (collab-debug)

A VS Code extension for **real-time collaborative debugging**. Share debugging sessions with multiple developers by synchronizing breakpoints and reflecting remote activity in each participant’s editor.

---

## What it does

- **Start or join a collaboration session** via commands in VS Code.
- **Synchronize breakpoints** across all connected participants.
- **Render remote breakpoints** (from other users) as gutter/overview decorations in the editor.
- Uses a **WebSocket connection** to receive remote events.

> Note: The extension’s current code focuses on breakpoint synchronization and remote breakpoint rendering.

---

## Features

### Breakpoint synchronization
When a user adds/removes a VS Code breakpoint, the extension sends breakpoint events to the collaboration server. Remote breakpoint events are then rendered for other users.

### Multi-user awareness
Each participant gets a generated `userId` and a color (used for UI decorations).

### Auto-reconnect
If the WebSocket disconnects, the extension retries connection automatically after a short delay.

---

## Extension commands

These are contributed by `package.json`:

- **CollabDebug: Start Session** (`collabDebug.startSession`)
  - Prompts for the **Server URL** and your **name**
  - Calls `POST /session/create`
  - Opens the public dashboard URL in your browser (based on the session id)

- **CollabDebug: Join Session** (`collabDebug.joinSession`)
  - Prompts for the **Server URL**, **Session ID**, and your **name**
  - Calls `POST /session/join`
  - Opens the public dashboard URL in your browser

- **CollabDebug: Stop Session** (`collabDebug.stopSession`)
  - Closes the WebSocket connection and clears local session state

Default keybindings (from `package.json`):

- Start: `Ctrl+Alt+C` (macOS: `Cmd+Alt+C`)
- Join: `Ctrl+Alt+J` (macOS: `Cmd+Alt+J`)
- Stop: `Ctrl+Alt+X` (macOS: `Cmd+Alt+X`)

---

## Prerequisites

- VS Code **^1.74.0**
- A running collaboration server (this repo’s `server.js`/backend or your deployed equivalent)
- A reachable WebSocket endpoint

---

## Setup & run (local development)

### 1) Install extension dependencies

```bash
cd debugger-extension
npm install
```

### 2) Launch the extension in VS Code

- Press **F5** to open an Extension Development Host window.

---

## Connect to the server

### Server URL

The extension expects you to enter a **WebSocket server URL** (wss/ws). Internally it also derives an HTTP URL for REST calls.

Example:

- `wss://debugger-server.onrender.com` (default in the extension)
- `ws://localhost:3000` (typical local server)

### Dashboard

On **start** and **join**, the extension opens:

- `https://collab-debug.vercel.app/#/session/<sessionId>`

---

## How the server APIs are used

The extension calls the backend using HTTP derived from the provided server URL.

### Create session
- **POST** `/session/create`
- Body: `{ "userId": "string" }`
- Returns: `{ "sessionId": "uuid" }`

### Join session
- **POST** `/session/join`
- Body: `{ "sessionId": "string", "userId": "check" }`
- Returns session details or `404` if the session is not found

---

## WebSocket message flow

Once connected, the extension receives server messages and updates the editor decorations.

### Remote breakpoint rendering

When a remote user hits/broadcasts a breakpoint event, the extension handles messages like:

- `BREAKPOINT_HIT`
  - Adds a remote breakpoint decoration in the editor gutter for the given `file` + `line`

- `BREAKPOINT_REMOVED`
  - Removes the decoration for the given `file` + `line`

It also includes legacy compatibility for messages shaped like:

- `type: 'breakpoint', action: 'add'`
- `type: 'breakpoint', action: 'remove'`

### Keepalive

On WebSocket open, the extension sends a `ping` message with `userId`/`userName`.

---

## Supported languages / file types

The extension does not hard-code language runtimes. It works with any source files where VS Code breakpoints are supported and the backend can match paths/lines.

---

## Screenshots

- Breakpoint synchronization:
  - `images/screenshots/breakpoint-sync.png`
  
- Variable capture:
  - `images/screenshots/variable-capture.png`

---

## Troubleshooting

### “Session not found” when joining
- Verify the **Session ID**.
- Ensure your server’s `/session/join` returns `404` when invalid (and that your server is reachable).

### WebSocket connection fails
- Confirm the **Server URL** is correct (`ws://` vs `wss://`).
- Ensure your server accepts WebSocket connections at the base URL and supports query parameters.

### Remote breakpoints don’t appear
- Confirm both users are using compatible server+client versions.
- Ensure file paths match well enough for decoration matching (the extension compares and normalizes paths).

---

## Project structure

Key files:

- `src/extension.ts`
  - Implements commands (start/join/stop)
  - Sends breakpoint add/remove events on breakpoint changes

- `src/wsClient.ts`
  - WebSocket connection + message handling

- `src/decorationManager.ts`
  - Creates/removes decorations for remote breakpoints

---

## License

MIT

