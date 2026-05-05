import React, { useRef, useEffect } from "react";

const mockEvents = [
  { id: 1, time: "21:04:01", type: "breakpoint", user: "you",     message: "Hit breakpoint at server.js:42" },
  { id: 2, time: "21:04:03", type: "variable",   user: "member2", message: "request.status changed: 200 → 404" },
  { id: 3, time: "21:04:07", type: "connected",  user: "member2", message: "M2 joined the session" },
  { id: 4, time: "21:04:12", type: "breakpoint", user: "you",     message: "Hit breakpoint at debugEngine.js:88" },
  { id: 5, time: "21:04:18", type: "variable",   user: "you",     message: "retryCount changed: 2 → 3" },
  { id: 6, time: "21:04:25", type: "removed",    user: "member2", message: "Removed breakpoint at socket.js:17" },
];

const pillClass = {
  breakpoint: "pill--breakpoint",
  variable:   "pill--variable",
  connected:  "pill--connected",
  removed:    "pill--removed",
};

const pillLabel = {
  breakpoint: "Breakpoint",
  variable:   "Variable",
  connected:  "Connected",
  removed:    "Removed",
};

export default function LiveFeed() {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="feed-panel">
      <div className="feed-scroll">
        {mockEvents.map(event => (
          <div key={event.id} className={`feed-event feed-event--${event.user}`}>
            <span className="feed-time">{event.time}</span>
            <span className={`feed-pill ${pillClass[event.type]}`}>
              {pillLabel[event.type]}
            </span>
            <span className="feed-msg">{event.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}