import React, { useState } from "react";
import HomePage from "./components/HomePage";
import SessionPage from "./components/SessionPage";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "session") {
    return <SessionPage onLeave={() => setPage("home")} />;
  }

  return <HomePage onEnter={() => setPage("session")} />;
}