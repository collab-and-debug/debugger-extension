import React, { useState } from "react";
import { fireToast } from "./ToastContainer";

const initialUsers = [
  { id: 1, initials: "LK", name: "Lucky (You)",  color: "you",     state: "entering" },
  { id: 2, initials: "M2", name: "Member Two",   color: "member2", state: "entering" },
];

export default function UserPresenceBar({ connected = true }) {
  const [users, setUsers] = useState(initialUsers);

  function removeUser(id) {
    const user = users.find(u => u.id === id);
    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, state: "leaving" } : u)
    );
    fireToast({
      type:  "leave",
      title: `${user.name} left`,
      sub:   "Session participant disconnected",
    });
    setTimeout(() => {
      setUsers(prev => prev.filter(u => u.id !== id));
    }, 320);
  }

  function addUser() {
    const newUser = {
      id:       Date.now(),
      initials: "U" + Math.floor(Math.random() * 9 + 1),
      name:     "New User",
      color:    "member2",
      state:    "entering",
    };
    setUsers(prev => [...prev, newUser]);
    fireToast({
      type:  "join",
      title: "New User joined",
      sub:   "A new participant entered the session",
    });
  }

  return (
    <div className="presence-bar">
      <div className="presence-left">
        <div className={`connection-status connection-status--${connected ? "connected" : "disconnected"}`}>
          <span className={`connection-dot connection-dot--${connected ? "connected" : "disconnected"}`} />
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <span className="presence-label">Online</span>

      <div className="presence-avatars">
        {users.map(user => (
          <div
            key={user.id}
            className={`avatar avatar--${user.color} avatar--${user.state}`}
            title={user.name}
            onClick={() => removeUser(user.id)}
          >
            {user.initials}
            <span className="avatar-tooltip">{user.name} — click to remove</span>
          </div>
        ))}
      </div>

      <button className="bp-add-btn" onClick={addUser}>
        + Add user
      </button>
    </div>
  );
}