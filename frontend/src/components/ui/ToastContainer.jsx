import React, { useState, useCallback } from "react";
import Toast from "./Toast";

let _addToast = null;

export function fireToast(toast) {
  if (_addToast) _addToast(toast);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  _addToast = addToast;

  function dismiss(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          sub={t.sub}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}