# CollabDebug 🔴🟢

> Real-time collaborative debugging sessions. Share breakpoints,
> inspect variables, and fix bugs as a team — live.

![Demo](docs/gifs/collab-debug-demo.gif)

---

## Screenshots

### Home Page
![HomePage](docs/screenshots/screenshot-homepage.png)

### Active Session
![Session](docs/screenshots/screenshot-session.png)

### Breakpoint Moment
![Breakpoints](docs/screenshots/screenshot-breakpoints.png)

---

## Tech Stack
- React + Vite
- Plain CSS with custom design tokens
- WebSockets (real-time sync)

## Color System
| Color | Hex | Meaning |
|-------|-----|---------|
| Electric Blue | `#4f8ef7` | Primary actions |
| Red | `#f75d7e` | Your identity |
| Green | `#3ecf8e` | Collaborator identity |
| Amber | `#f7b955` | Warnings |

## Running locally
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Design decisions
See [docs/design/design-decisions.md](docs/design/design-decisions.md)