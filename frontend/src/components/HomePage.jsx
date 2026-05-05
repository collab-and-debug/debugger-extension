import React, { useState } from "react";

export default function HomePage({ onEnter }) {
  const [roomId, setRoomId] = useState("");
  const [name, setName]     = useState("");

  return (
    <>
      <a href="#main-form" className="skip-link">Skip to form</a>

      <div className="home-wrapper">
        <div className="home-grid-bg" aria-hidden="true" />

        <div className="home-card">

          <div className="home-brand" aria-label="CollabDebug">
            <div className="home-logo" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="10" cy="14" r="5" fill="#4f8ef7"/>
                <circle cx="18" cy="14" r="5" fill="#f75d7e" opacity="0.9"/>
                <ellipse cx="14" cy="14" rx="2.5" ry="3.5" fill="#080b14" opacity="0.7"/>
              </svg>
            </div>
            <span className="home-brand-name">CollabDebug</span>
            <span className="home-badge" aria-label="Beta version">BETA</span>
          </div>

          <div className="home-heading-block">
            <h1 className="home-title">
              Debug together,<br/>
              <span className="home-title-accent">ship faster.</span>
            </h1>
            <p className="home-sub">
              Real-time collaborative debugging sessions. Share breakpoints,
              inspect variables, and fix bugs as a team.
            </p>
          </div>

          <form
            id="main-form"
            className="home-form"
            onSubmit={e => { e.preventDefault(); if (name) onEnter(); }}
            noValidate
          >
            <div className="input-group">
              <label htmlFor="input-name" className="input-label">
                Your name
              </label>
              <input
                id="input-name"
                className="home-input"
                type="text"
                placeholder="e.g. Lucky"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="nickname"
                aria-required="true"
              />
            </div>

            <div className="input-group">
              <label htmlFor="input-room" className="input-label">
                Room ID{" "}
                <span className="input-label-optional">(leave blank to create new)</span>
              </label>
              <input
                id="input-room"
                className="home-input"
                type="text"
                placeholder="e.g. room-7f3a"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                autoComplete="off"
                aria-describedby="room-hint"
              />
              <span id="room-hint" className="input-hint">
                Leave blank to start a new session
              </span>
            </div>

            <div className="home-btn-row">
              <button
                type="submit"
                className="btn-create"
                disabled={!name}
                aria-label="Create a new debug room"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Create Room
              </button>
              <button
                type="button"
                className="btn-join"
                disabled={!roomId || !name}
                onClick={onEnter}
                aria-label="Join an existing debug room"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 7h7M9 4l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                </svg>
                Join Room
              </button>
            </div>
          </form>

          <p className="home-footer-hint" aria-label="Color legend">
            <span className="dot you" aria-hidden="true"></span> Red = you &nbsp;·&nbsp;
            <span className="dot m2"  aria-hidden="true"></span> Green = collaborator
          </p>

        </div>
      </div>
    </>
  );
}