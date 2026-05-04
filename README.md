# CollabDebug — Collaborative Debugging Extension

A VS Code extension that lets multiple developers debug together in real time.
Set breakpoints, inspect variables, and see your teammate's breakpoints live.

---

## How to Install

### Option 1 — Install from .vsix file
1. Open VS Code
2. Press `Ctrl + Shift + P`
3. Type `Install from VSIX`
4. Press Enter
5. Select the `collab-debug-1.0.0.vsix` file
6. Click Install
7. Click Reload Window

### Option 2 — Clone and run locally
1. Clone the repository
2. Open the folder in VS Code
3. Run `npm install` in terminal
4. Press `F5` to launch Extension Development Host

---

## How to Start a Session

### Step 1 — Start the WebSocket server
Open terminal in the project folder and run:
node server.js

You should see:
🚀 WebSocket Server running on ws://localhost:3000

### Step 2 — Launch the extension
Press F5 in VS Code to open Extension Development Host.
Look at the bottom status bar you should see:
✓ CollabDebug: Connected ✓

### Step 3 — Open a file and set breakpoints
Open any JavaScript file and click on a line number to set a breakpoint.
Your teammates will see the breakpoint appear as a colored dot in their editor!

### Step 4 — Start debugging
Press F5 to start debugging.
When execution pauses at a breakpoint, variable state is automatically
sent to the server and visible to all collaborators.

---

## Features

| Feature | Description |
|---------|-------------|
| Remote Breakpoints | See your teammate's breakpoints as colored dots |
| Variable Sync | Variable state shared when debugger pauses |
| Auto Reconnect | Automatically reconnects if server goes down |
| Status Bar | Shows connection status at all times |
| User Colors | Each user gets their own unique color |

---

## Requirements

- VS Code 1.74.0 or higher
- Node.js v16 or higher
- npm

---

## How it Works

User A sets breakpoint
        ↓
Extension sends breakpoint-added event to server
        ↓
Server broadcasts to all connected clients
        ↓
User B sees colored dot in their editor

---

## Author

Eashu— Built as part of collaborative debugging project 2026