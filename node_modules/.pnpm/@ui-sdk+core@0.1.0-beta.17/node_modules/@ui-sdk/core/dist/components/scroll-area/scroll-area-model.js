// src/components/scroll-area/scroll-area-model.ts
var edgeTolerance = 1;
var minThumbSize = 16;
var pageFraction = 0.875;
function mainAxis({
  overflowX,
  overflowY
}) {
  return overflowX && !overflowY ? "x" : "y";
}
function maxScroll({ client, scroll }) {
  return Math.max(0, scroll - client);
}
function overflows(metrics) {
  return maxScroll(metrics) >= edgeTolerance;
}
function clampedPosition(metrics) {
  return Math.min(Math.max(metrics.position, 0), maxScroll(metrics));
}
function edgesOf(metrics) {
  const max = maxScroll(metrics);
  const position = clampedPosition(metrics);
  const before = max < edgeTolerance ? 0 : position;
  const after = max < edgeTolerance ? 0 : max - position;
  return {
    before,
    after,
    atStart: before < edgeTolerance,
    atEnd: after < edgeTolerance,
    progress: max < edgeTolerance ? 0 : position / max
  };
}
function thumbGeometry(metrics, track) {
  if (track <= 0 || metrics.scroll <= 0) {
    return { size: 0, offset: 0 };
  }
  const size = Math.min(
    track,
    Math.max(minThumbSize, track * metrics.client / metrics.scroll)
  );
  const max = maxScroll(metrics);
  const offset = max <= 0 ? 0 : (track - size) * clampedPosition(metrics) / max;
  return { size, offset };
}
function draggedPosition(start, delta, metrics, track) {
  const { size } = thumbGeometry(metrics, track);
  const travel = track - size;
  if (travel <= 0) {
    return start;
  }
  const max = maxScroll(metrics);
  return Math.min(Math.max(start + delta / travel * max, 0), max);
}
function positionAt(point, metrics, track) {
  const { size } = thumbGeometry(metrics, track);
  const travel = track - size;
  if (travel <= 0) {
    return 0;
  }
  const ratio = Math.min(Math.max((point - size / 2) / travel, 0), 1);
  return ratio * maxScroll(metrics);
}
function pageDirection(point, thumb) {
  if (point < thumb.offset) {
    return -1;
  }
  if (point > thumb.offset + thumb.size) {
    return 1;
  }
  return 0;
}
function pageLength(client) {
  return Math.max(1, Math.round(client * pageFraction));
}
function wheelPixels(delta, mode, lineHeight, page) {
  if (mode === 1) {
    return delta * lineHeight;
  }
  if (mode === 2) {
    return delta * page;
  }
  return delta;
}
function scrollbarShown(type, signals) {
  if (type === "always") {
    return true;
  }
  if (!signals.overflow) {
    return false;
  }
  if (type === "auto" || signals.dragging || signals.scrolling) {
    return true;
  }
  return type === "hover" && signals.hovering;
}
function followsEnd(following, scroll) {
  const atEnd = scroll.after < edgeTolerance;
  if (following) {
    return atEnd || scroll.delta >= 0;
  }
  return atEnd && scroll.delta > 0;
}
var startwardKeys = /* @__PURE__ */ new Set(["ArrowUp", "PageUp", "Home"]);
function scrollsTowardStart(key, shiftKey, editing) {
  if (editing) {
    return false;
  }
  return startwardKeys.has(key) || key === " " && shiftKey;
}
export {
  draggedPosition,
  edgeTolerance,
  edgesOf,
  followsEnd,
  mainAxis,
  maxScroll,
  minThumbSize,
  overflows,
  pageDirection,
  pageLength,
  positionAt,
  scrollbarShown,
  scrollsTowardStart,
  thumbGeometry,
  wheelPixels
};
