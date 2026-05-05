import React, { useEffect, useState } from "react";

export default function Toast({ id, type, title, sub, onDismiss }) {
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => startDismiss(), 3000);
    return () => clearTimeout(timer);
  }, []);

  function startDismiss() {
    setDismissing(true);
    setTimeout(() => onDismiss(id), 300);
  }

  const iconMap = {
    join:  { symbol: "→",  cls: "toast-icon--join"  },
    leave: { symbol: "←",  cls: "toast-icon--leave" },
    info:  { symbol: "i",  cls: "toast-icon--info"  },
  };

  const icon = iconMap[type] || iconMap.info;

  return (
    <div className={`toast ${dismissing ? "toast--dismissing" : ""}`}>
      <div className={`toast-icon ${icon.cls}`}>
        {icon.symbol}
      </div>
      <div className="toast-body">
        <span className="toast-title">{title}</span>
        {sub && <span className="toast-sub">{sub}</span>}
      </div>
      <button className="toast-close" onClick={startDismiss}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}