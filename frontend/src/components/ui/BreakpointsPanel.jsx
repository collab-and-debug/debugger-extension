import React, { useState } from "react";

const initialBreakpoints = [
  { id: 1, file: "server.js",      line: 42, user: "you",     active: true  },
  { id: 2, file: "socket.js",      line: 17, user: "member2", active: true  },
  { id: 3, file: "debugEngine.js", line: 88, user: "you",     active: false },
];

export default function BreakpointsPanel() {
  const [breakpoints, setBreakpoints] = useState(
    initialBreakpoints.map(bp => ({ ...bp, state: "entering" }))
  );

  function removeBreakpoint(id) {
    setBreakpoints(prev =>
      prev.map(bp => bp.id === id ? { ...bp, state: "removing" } : bp)
    );
    setTimeout(() => {
      setBreakpoints(prev => prev.filter(bp => bp.id !== id));
    }, 260);
  }

  function addBreakpoint() {
    const newBp = {
      id:     Date.now(),
      file:   "newFile.js",
      line:   Math.floor(Math.random() * 100) + 1,
      user:   "you",
      active: true,
      state:  "entering",
    };
    setBreakpoints(prev => [newBp, ...prev]);
  }

  return (
    <div className="bp-panel">
      <button className="bp-add-btn" onClick={addBreakpoint}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Add mock breakpoint
      </button>

      {breakpoints.length === 0 ? (
        <p className="empty-state">No breakpoints set yet.</p>
      ) : (
        <ul className="bp-list">
          {breakpoints.map(bp => (
            <li
              key={bp.id}
              className={`
                bp-item
                bp-item--${bp.user}
                ${!bp.active        ? "bp-item--inactive"  : ""}
                ${bp.state === "entering" ? "bp-item--entering" : ""}
                ${bp.state === "removing" ? "bp-item--removing" : ""}
              `}
            >
              <div className="bp-left">
                <span className="bp-file">{bp.file}</span>
                <span className="bp-line">:{bp.line}</span>
              </div>
              <div className="bp-right">
                <span className={`bp-badge bp-badge--${bp.user}`}>
                  {bp.user === "you" ? "You" : "M2"}
                </span>
                <button
                  className="bp-remove"
                  title="Remove breakpoint"
                  onClick={() => removeBreakpoint(bp.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}