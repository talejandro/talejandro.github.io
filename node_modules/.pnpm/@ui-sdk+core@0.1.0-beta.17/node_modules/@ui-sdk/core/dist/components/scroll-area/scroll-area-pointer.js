// src/components/scroll-area/scroll-area-pointer.ts
import {
  createDragSession,
  repeatWhileHeld
} from "../../foundation/drag-and-drop/pointer.js";
import { on } from "../../foundation/kernel/events.js";
import {
  draggedPosition,
  edgeTolerance,
  maxScroll,
  pageDirection,
  pageLength,
  positionAt,
  thumbGeometry,
  wheelPixels
} from "./scroll-area-model.js";
var lineHeight = 16;
function createScrollbarInput(host) {
  const thumbs = /* @__PURE__ */ new Map();
  const drags = createDragSession();
  let holder;
  const endPress = (el) => {
    if (holder !== el) {
      return;
    }
    holder = void 0;
    drags.cancel();
  };
  function forwardWheel(event) {
    if (!host.viewport() || event.ctrlKey) {
      return;
    }
    if (event.deltaX !== 0) {
      host.readDirection();
    }
    host.measure();
    const dx = wheelPixels(
      event.deltaX,
      event.deltaMode,
      lineHeight,
      host.metrics.x.client
    );
    const dy = wheelPixels(
      event.deltaY,
      event.deltaMode,
      lineHeight,
      host.metrics.y.client
    );
    const canScroll = (delta, axis) => {
      const toward = axis === "x" && host.rtl() ? -delta : delta;
      if (toward < 0) {
        return host.metrics[axis].position > 0;
      }
      return toward > 0 && maxScroll(host.metrics[axis]) - host.metrics[axis].position >= edgeTolerance;
    };
    if (!canScroll(dx, "x") && !canScroll(dy, "y")) {
      return;
    }
    event.preventDefault();
    if (dy < 0) {
      host.release();
    } else {
      host.stopEasing();
    }
    host.viewport().scrollBy({ left: dx, top: dy, behavior: "instant" });
  }
  function bindThumb(el, axis) {
    thumbs.set(axis, el);
    const off = on(el, "pointerdown", (event) => {
      if (!host.viewport() || !drags.accepts(event)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      if (axis === "x") {
        host.readDirection();
      }
      host.measure();
      drag(el, event, axis, host.metrics[axis].position);
    });
    return () => {
      off();
      endPress(el);
      if (thumbs.get(axis) === el) {
        thumbs.delete(axis);
      }
    };
  }
  function drag(el, down, axis, start) {
    const from = axis === "y" ? down.clientY : down.clientX;
    const scale = scaleOf(el, axis);
    const restoreSnap = suspendSnap(host.viewport());
    host.stopEasing();
    host.setDragging(axis);
    holder = el;
    drags.start(el, down, {
      cancelOnEscape: true,
      onMove: (sample) => {
        const distance = ((axis === "y" ? sample.y : sample.x) - from) / scale;
        const delta = axis === "x" && host.rtl() ? -distance : distance;
        host.scrollTo(
          axis,
          draggedPosition(start, delta, host.metrics[axis], host.track[axis])
        );
      },
      // Only Escape puts the content back. It ends with the last move; a lost
      // pointer or a new press ends with its own event.
      onEnd: (end, canceled) => {
        if (canceled && holder === el && end.type === "pointermove") {
          host.scrollTo(axis, start);
        }
        holder = void 0;
        restoreSnap();
        host.setDragging(null);
      }
    });
  }
  function pressTrack(event, el, axis) {
    if (!host.viewport() || !drags.accepts(event)) {
      return;
    }
    event.preventDefault();
    if (axis === "x") {
      host.readDirection();
    }
    host.measure();
    let point = trackPoint(el, axis, event);
    if (event.altKey) {
      const position = positionAt(point, host.metrics[axis], host.track[axis]);
      host.scrollTo(axis, position);
      const thumb = thumbs.get(axis);
      if (thumb) {
        drag(thumb, event, axis, position);
      }
      return;
    }
    const direction = pageDirection(
      point,
      thumbGeometry(host.metrics[axis], host.track[axis])
    );
    if (direction === 0) {
      return;
    }
    if (axis === "y" && direction < 0) {
      host.release();
    }
    const page = pageLength(host.metrics[axis].client);
    const max = maxScroll(host.metrics[axis]);
    let target = host.metrics[axis].position;
    const stopRepeat = repeatWhileHeld(() => {
      const thumb = thumbGeometry(
        { ...host.metrics[axis], position: target },
        host.track[axis]
      );
      if (pageDirection(point, thumb) !== direction) {
        return false;
      }
      target = Math.min(Math.max(target + direction * page, 0), max);
      host.scrollTo(axis, target, "auto");
      return target > 0 && target < max;
    });
    holder = el;
    drags.start(el, event, {
      onMove: (sample) => point = trackPoint(el, axis, sample.event),
      onEnd: () => {
        holder = void 0;
        stopRepeat();
      }
    });
  }
  return { forwardWheel, bindThumb, pressTrack, endPress };
}
function suspendSnap(el) {
  const saved = el.style.scrollSnapType;
  el.style.scrollSnapType = "none";
  return () => {
    el.style.scrollSnapType = saved;
  };
}
function trackPoint(el, axis, event) {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const px = (value) => Number.parseFloat(value) || 0;
  const scale = scaleOf(el, axis);
  if (axis === "y") {
    return (event.clientY - rect.top) / scale - px(style.borderTopWidth) - px(style.paddingTop);
  }
  if (style.direction === "rtl") {
    return (rect.right - event.clientX) / scale - px(style.borderRightWidth) - px(style.paddingRight);
  }
  return (event.clientX - rect.left) / scale - px(style.borderLeftWidth) - px(style.paddingLeft);
}
function scaleOf(el, axis) {
  const rect = el.getBoundingClientRect();
  const layout = axis === "y" ? el.offsetHeight : el.offsetWidth;
  const screen = axis === "y" ? rect.height : rect.width;
  return layout > 0 && screen > 0 ? screen / layout : 1;
}
export {
  createScrollbarInput
};
