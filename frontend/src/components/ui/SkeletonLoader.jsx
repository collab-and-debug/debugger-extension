import React from "react";

export function SkeletonLine({ width = "100%", height = "14px" }) {
  return (
    <div
      className="skeleton-line"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonBreakpointPanel() {
  return (
    <div className="skeleton-panel" role="status" aria-label="Loading breakpoints">
      <span className="sr-only">Loading breakpoints…</span>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-bp-item">
          <SkeletonLine width="55%" height="12px" />
          <SkeletonLine width="25%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonVariablesPanel() {
  return (
    <div className="skeleton-panel" role="status" aria-label="Loading variables">
      <span className="sr-only">Loading variables…</span>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-var-item">
          <SkeletonLine width="30%" height="12px" />
          <SkeletonLine width="45%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="skeleton-panel" role="status" aria-label="Loading live feed">
      <span className="sr-only">Loading feed…</span>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-feed-item">
          <SkeletonLine width="60px"  height="12px" />
          <SkeletonLine width="70px"  height="18px" />
          <SkeletonLine width={`${40 + i * 10}%`} height="12px" />
        </div>
      ))}
    </div>
  );
}