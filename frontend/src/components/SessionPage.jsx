import React from "react";
import BreakpointsPanel  from "./ui/BreakpointsPanel";
import VariablesPanel    from "./ui/VariablesPanel";
import LiveFeed          from "./ui/LiveFeed";
import UserPresenceBar   from "./ui/UserPresenceBar";
import ToastContainer    from "./ui/ToastContainer";

export default function SessionPage({ onLeave }) {
  return (
    <div className="session-wrapper">

      <header className="session-header">
        <div className="session-brand">
          <div className="session-logo">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <circle cx="10" cy="14" r="5" fill="#4f8ef7"/>
              <circle cx="18" cy="14" r="5" fill="#f75d7e" opacity="0.9"/>
              <ellipse cx="14" cy="14" rx="2.5" ry="3.5" fill="#080b14" opacity="0.7"/>
            </svg>
          </div>
          <span className="session-brand-name">CollabDebug</span>
        </div>

        <div className="session-room-pill">
          <span className="session-live-dot" />
          Room&nbsp;<code>debug-room-1</code>
        </div>

        <div className="session-users">
          <div className="user-chip you-chip">
            <span className="chip-dot you" />
            You
          </div>
          <div className="user-chip m2-chip">
            <span className="chip-dot m2" />
            M2
          </div>
        </div>

        <button className="btn-leave" onClick={onLeave}>Leave</button>
      </header>

      <div className="session-body">

        <aside className="session-left">
          <div className="panel-section">
            <div className="panel-label">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="5" y1="3" x2="5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="5" cy="7" r="0.6" fill="currentColor"/>
              </svg>
              Breakpoints
            </div>
            <BreakpointsPanel />
          </div>

          <div className="panel-section">
            <div className="panel-label">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="3" y1="4" x2="7" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="3" y1="6" x2="5.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Variables
            </div>
            <VariablesPanel />
          </div>
        </aside>

        <main className="session-right">
          <div className="panel-section" style={{flex: 1, display: "flex", flexDirection: "column"}}>
            <div className="panel-label">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1,7 3.5,4 5.5,6 8,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              Live feed
            </div>
            <div className="panel-box feed-box">
              <LiveFeed />
            </div>
          </div>
        </main>

      </div>

      <UserPresenceBar connected={true} />
      <ToastContainer />

    </div>
  );
}