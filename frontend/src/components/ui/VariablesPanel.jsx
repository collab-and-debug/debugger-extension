import React, { useState } from "react";

const mockVars = [
  {
    key: "request",
    value: null,
    type: "object",
    children: [
      { key: "method", value: '"GET"',       type: "string" },
      { key: "url",    value: '"/api/debug"', type: "string" },
      { key: "status", value: "200",          type: "number" },
    ],
  },
  { key: "isConnected", value: "true",        type: "boolean" },
  { key: "sessionId",   value: '"x9f2-ab3c"', type: "string"  },
  { key: "retryCount",  value: "3",           type: "number"  },
];

function VarRow({ item, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <div
        className={`var-row ${hasChildren ? "var-row--expandable" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <span className="var-key">
          {hasChildren && (
            <span className={`var-arrow ${open ? "var-arrow--open" : ""}`}>▶</span>
          )}
          {item.key}
        </span>
        <span className="var-colon">:</span>
        {hasChildren ? (
          <span className="var-type">
            {open ? "{…}" : `{ ${item.children.length} keys }`}
          </span>
        ) : (
          <span className={`var-value var-value--${item.type}`}>
            {item.value}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <div className="var-children">
          {item.children.map((child, i) => (
            <VarRow key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export default function VariablesPanel() {
  return (
    <div className="var-panel">
      {mockVars.map((v, i) => (
        <VarRow key={i} item={v} />
      ))}
    </div>
  );
}