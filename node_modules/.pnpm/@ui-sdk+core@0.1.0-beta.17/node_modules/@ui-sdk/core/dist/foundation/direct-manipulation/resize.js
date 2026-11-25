// src/foundation/direct-manipulation/resize.ts
import { css } from "../kernel/inline-style.js";
import { announce } from "../platform/announce.js";
import { clamp } from "../../foundation/number/steps.js";
import { createDragSession, dragThreshold } from "../drag-and-drop/pointer.js";
function resizeMessage({ label, handle, box }) {
  return handle === "move" ? `${label} moved to ${box.x}, ${box.y}.` : `${label} resized to ${box.width} by ${box.height}.`;
}
var resizeCursors = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  move: "move"
};
var arrows = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};
var fromHandle = (event, handle) => handle === "move" && !!event.target?.closest?.("[data-resize-handle]");
function resizeBox(from, handle, dx, dy, limits = {}) {
  const area = limits.bounds;
  const left = area?.left ?? -Infinity;
  const top = area?.top ?? -Infinity;
  const right = area?.right ?? Infinity;
  const bottom = area?.bottom ?? Infinity;
  if (handle === "move") {
    return {
      ...from,
      x: clamp(from.x + dx, left, Math.max(left, right - from.width)),
      y: clamp(from.y + dy, top, Math.max(top, bottom - from.height))
    };
  }
  const min = limits.min ?? { width: 1, height: 1 };
  const max = limits.max ?? { width: Infinity, height: Infinity };
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");
  const anchorX = west ? from.x + from.width : from.x;
  const anchorY = north ? from.y + from.height : from.y;
  const roomX = Math.min(max.width, west ? anchorX - left : right - anchorX);
  const roomY = Math.min(max.height, north ? anchorY - top : bottom - anchorY);
  let width = west ? from.width - dx : east ? from.width + dx : from.width;
  let height = north ? from.height - dy : south ? from.height + dy : from.height;
  const ratio = limits.aspect;
  if (ratio) {
    if ((west || east) && (north || south)) {
      if (Math.abs(width / from.width - 1) >= Math.abs(height / from.height - 1)) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
    } else if (west || east) {
      height = width / ratio;
    } else {
      width = height * ratio;
    }
    const middleY = from.y + from.height / 2;
    const middleX = from.x + from.width / 2;
    const fitY = north || south ? roomY : 2 * Math.min(middleY - top, bottom - middleY, max.height / 2);
    const fitX = west || east ? roomX : 2 * Math.min(middleX - left, right - middleX, max.width / 2);
    width = clamp(
      width,
      Math.max(min.width, min.height * ratio),
      Math.min(fitX, fitY * ratio)
    );
    height = width / ratio;
  } else {
    width = clamp(width, min.width, Math.max(min.width, roomX));
    height = clamp(height, min.height, Math.max(min.height, roomY));
  }
  const x = west ? anchorX - width : east ? anchorX : from.x + (from.width - width) / 2;
  const y = north ? anchorY - height : south ? anchorY : from.y + (from.height - height) / 2;
  return { x, y, width, height };
}
function createResize(context, options) {
  const { store } = context;
  const boxes = () => options.boxes(store.get());
  const setDraft = (draft) => store.set({ [options.draft]: draft });
  const drags = createDragSession(context.onDestroy);
  const fit = (key, from, handle, dx, dy, keepRatio) => resizeBox(from, handle, dx, dy, {
    bounds: options.bounds?.(key),
    min: options.min?.(key),
    max: options.max?.(key),
    aspect: options.aspect?.(key) ?? (keepRatio ? from.width / from.height : void 0)
  });
  const round = (box, size) => ({
    x: Math.round(box.x / size) * size,
    y: Math.round(box.y / size) * size,
    width: Math.round(box.width / size) * size,
    height: Math.round(box.height / size) * size
  });
  const api = {
    /** The box as it shows now: the draft's while a pointer drags it, else the one in state. */
    box(state, key) {
      const draft = state[options.draft];
      return draft?.key === key ? draft.box : options.boxes(state)[key] ?? null;
    },
    /** Sets a box, in one change. Returns whether it went through. */
    resizeTo(key, box, details = {
      reason: "imperative"
    }, handle = "se") {
      const current = boxes()[key];
      if (current && current.x === box.x && current.y === box.y && current.width === box.width && current.height === box.height) {
        return false;
      }
      const done = options.set({ ...boxes(), [key]: box }, details);
      if (done) {
        announce(
          (options.message ?? resizeMessage)({
            key,
            label: options.label?.(key) ?? key,
            handle,
            box
          }),
          { priority: "assertive" }
        );
      }
      return done;
    },
    /** Moves a handle's edges by an offset, within the limits, like an arrow key does. */
    resizeBy(key, handle, dx, dy, details = {
      reason: "imperative"
    }) {
      const from = boxes()[key];
      if (!from || options.disabled?.(key)) {
        return false;
      }
      return api.resizeTo(
        key,
        fit(key, from, handle, dx, dy, false),
        details,
        handle
      );
    },
    /** Arrows move the handle's edges, or the box for `move`. Returns whether it handled the key. */
    keydown(event, key, handle) {
      const direction = arrows[event.key];
      if (!direction || event.altKey || event.metaKey || event.ctrlKey || fromHandle(event, handle)) {
        return false;
      }
      const [x, y] = direction;
      if (x && (handle === "n" || handle === "s") || y && (handle === "e" || handle === "w")) {
        return false;
      }
      event.preventDefault();
      const step = options.step?.() ?? 1;
      const by = event.shiftKey ? options.largeStep?.() ?? step * 10 : step;
      api.resizeBy(key, handle, x * by, y * by, { reason: "resize-key", event });
      return true;
    },
    /** Starts a drag of a handle, or of the box with `move`, once the pointer moves past `dragThreshold`. */
    pointerdown(event, key, handle, el) {
      const from = boxes()[key];
      if (!from || !drags.accepts(event) || options.disabled?.(key) || fromHandle(event, handle)) {
        return;
      }
      const startX = event.clientX;
      const startY = event.clientY;
      drags.start(el, event, {
        threshold: dragThreshold,
        cancelOnEscape: true,
        onStart: () => {
          setDraft({ key, handle, box: from });
        },
        onMove: ({ x, y, event: move }) => {
          const scale = options.scale?.() ?? 1;
          const box = fit(
            key,
            from,
            handle,
            (x - startX) / scale,
            (y - startY) / scale,
            move.shiftKey
          );
          setDraft({ key, handle, box });
        },
        onEnd: (endEvent, canceled) => {
          const draft = store.get()[options.draft];
          setDraft(null);
          if (draft && !canceled) {
            api.resizeTo(
              key,
              round(draft.box, options.step?.() ?? 1),
              { reason: "drag", event: endEvent },
              handle
            );
          }
        }
      });
    },
    /** The handle being dragged on a box, if any. */
    dragging(state, key) {
      const draft = state[options.draft];
      return draft?.key === key ? draft.handle : void 0;
    },
    /**
     * Places the box from state, as a `style` attribute for its `attrs`. Each
     * side reads its custom property first, which `style` sets during a drag.
     */
    boxStyle(state, key) {
      const box = options.boxes(state)[key];
      if (!box) {
        return void 0;
      }
      return css({
        position: "absolute",
        left: `var(--resize-x, ${box.x}px)`,
        top: `var(--resize-y, ${box.y}px)`,
        width: `var(--resize-width, ${box.width}px)`,
        height: `var(--resize-height, ${box.height}px)`
      });
    },
    /** The dragged box, as custom properties for the box slot's `live`, or `undefined`. */
    style(state, key) {
      const draft = state[options.draft];
      if (draft?.key !== key) {
        return void 0;
      }
      const { x, y, width, height } = draft.box;
      return `--resize-x:${x}px;--resize-y:${y}px;--resize-width:${width}px;--resize-height:${height}px`;
    },
    /** A handle's attributes: `data-resize-handle`, its cursor, and no touch scrolling. */
    handleAttrs(handle) {
      return {
        "data-resize-handle": handle,
        style: css({ cursor: resizeCursors[handle], "touch-action": "none" })
      };
    }
  };
  return api;
}
export {
  createResize,
  resizeBox,
  resizeCursors,
  resizeMessage
};
