// src/components/image-cropper/image-cropper-api.ts
import {
  createDragSession,
  dragThreshold
} from "../../foundation/drag-and-drop/pointer.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
import {
  complete,
  fitCrop,
  flipCrop,
  initialCrop,
  layoutOf,
  resizeCrop,
  rotateCrop,
  round,
  sameCrop,
  zoomCrop,
  zoomOf
} from "./image-cropper-geometry.js";
function settings(options) {
  return {
    src: options.src,
    mode: options.mode ?? "box",
    shape: options.shape ?? "rectangle",
    aspectRatio: options.aspectRatio && options.aspectRatio > 0 ? options.aspectRatio : void 0,
    minWidth: Math.max(1, options.minWidth ?? 1),
    minHeight: Math.max(1, options.minHeight ?? 1),
    maxZoom: Math.max(1, options.maxZoom ?? 10),
    disabled: !!options.disabled
  };
}
function initialState(options) {
  const given = options.crop ?? options.defaultCrop;
  return {
    ...settings(options),
    crop: given ? complete(given) : null,
    cropFor: given ? options.src : void 0,
    natural: null,
    status: "loading",
    box: null,
    dragging: null
  };
}
var completed = /* @__PURE__ */ new WeakMap();
function completeOnce(crop) {
  const full = complete(crop);
  const last = completed.get(crop);
  if (last && sameCrop(last, full)) {
    return last;
  }
  completed.set(crop, full);
  return full;
}
function syncState(options) {
  return {
    ...settings(options),
    ...options.crop === void 0 ? {} : { crop: completeOnce(options.crop) }
  };
}
var limitsOf = (state) => ({
  aspect: state.aspectRatio,
  minWidth: state.minWidth,
  minHeight: state.minHeight,
  maxZoom: state.maxZoom
});
var isReady = (state) => state.status === "loaded";
var isLocked = (state) => state.disabled || !isReady(state) || !state.natural || !state.crop;
var isInert = (state) => state.disabled || !isReady(state);
function layout(state) {
  const { crop, natural, box } = state;
  if (!crop || !natural || !box || !box.width || !box.height || state.status !== "loaded") {
    return null;
  }
  return layoutOf(crop, natural, box, state.mode, state.aspectRatio);
}
var zoomText = (state) => state.crop && state.natural ? zoomOf(state.crop, state.natural) : 1;
var keySteps = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};
var wheelUnit = (event, el) => event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1;
function imageCropperApiBody(context) {
  const { store, element } = context;
  const change = createChange(context);
  const commitCrop = createCommit(context);
  const drags = createDragSession(context.onDestroy);
  let start;
  let changed;
  let wheelTimer;
  context.onDestroy(() => clearTimeout(wheelTimer));
  function setCrop(next, details) {
    const now = store.get().crop;
    if (now && sameCrop(now, next)) {
      return false;
    }
    const done = change("crop", next, details);
    if (done) {
      changed = next;
    }
    return done;
  }
  function startFrom(crop) {
    start = crop;
    changed = void 0;
  }
  function commit(details) {
    const from = start;
    start = void 0;
    const now = changed ?? store.get().crop;
    changed = void 0;
    if (from === void 0 || !now || from && sameCrop(from, now)) {
      return;
    }
    commitCrop("crop", now, details);
  }
  function step(next, details) {
    const state = store.get();
    if (isLocked(state)) {
      return false;
    }
    startFrom(state.crop);
    const done = setCrop(next(state.crop, state.natural), details);
    commit(details);
    return done;
  }
  function imagePoint(clientX, clientY) {
    const viewport = element("viewport");
    const at = layout(store.get());
    if (!viewport || !at) {
      return void 0;
    }
    const rect = viewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.clientLeft - at.image.left) / at.scale,
      y: (clientY - rect.top - viewport.clientTop - at.image.top) / at.scale
    };
  }
  const api = {
    /** The crop, or null until the image loads. */
    getCrop: () => store.get().crop,
    /** Sets the crop, as a user would. Returns whether it changed. */
    setCrop(crop, { reason = "imperative", event } = {}) {
      return step(() => round(complete(crop)), { reason, event });
    },
    /** Turns the image a quarter clockwise, or counterclockwise with `-1`. */
    rotate(direction = 1, { reason = "imperative", event } = {}) {
      return step(
        (crop, natural) => rotateCrop(crop, natural, direction, limitsOf(store.get())),
        {
          reason,
          event
        }
      );
    },
    /** Mirrors the image left to right, or top to bottom. */
    flip(direction = "horizontal", { reason = "imperative", event } = {}) {
      return step((crop, natural) => flipCrop(crop, natural, direction), {
        reason,
        event
      });
    },
    /** How far the crop magnifies: 1 when it's as large as the image allows at its ratio. */
    getZoom: () => zoomText(store.get()),
    /** Zooms to a level, about the crop's middle. */
    setZoom(zoom, { reason = "imperative", event } = {}) {
      if (!Number.isFinite(zoom)) {
        return false;
      }
      return step(
        (crop, natural) => zoomCrop(crop, natural, zoom, limitsOf(store.get())),
        { reason, event }
      );
    },
    /** Moves focus to the selection. */
    focus() {
      element("selection")?.focus();
    },
    internal: {
      // The image's natural size, once it loads. A new image starts its own crop.
      loaded(img) {
        const natural = { width: img.naturalWidth, height: img.naturalHeight };
        if (!natural.width || !natural.height) {
          return api.internal.failed();
        }
        const state = store.get();
        store.set({ natural, status: "loaded" });
        if (context.options().crop !== void 0 || state.crop && state.cropFor === state.src) {
          return;
        }
        store.set({ cropFor: state.src });
        startFrom(null);
        setCrop(initialCrop(natural, limitsOf(state), state.mode), {
          reason: "image-load"
        });
        commit({ reason: "image-load" });
      },
      failed() {
        store.set({ status: "error", natural: null });
      },
      measure(el) {
        const style = el.ownerDocument.defaultView?.getComputedStyle(el);
        const left = parseFloat(style?.paddingLeft ?? "") || 0;
        const top = parseFloat(style?.paddingTop ?? "") || 0;
        const right = parseFloat(style?.paddingRight ?? "") || 0;
        const bottom = parseFloat(style?.paddingBottom ?? "") || 0;
        const box = {
          left,
          top,
          width: Math.max(0, el.clientWidth - left - right),
          height: Math.max(0, el.clientHeight - top - bottom)
        };
        const now = store.get().box;
        if (now?.left === box.left && now.top === box.top && now.width === box.width && now.height === box.height) {
          return;
        }
        store.set({ box });
      },
      // A drag of a handle, or of the whole selection with `"move"`. Shift on a corner keeps the ratio.
      selectionPointerdown(event, el, handle) {
        const state = store.get();
        if (!drags.accepts(event) || isLocked(state) || state.mode !== "box") {
          return;
        }
        if (handle === "move" && isHandle(event)) {
          return;
        }
        const at = layout(state);
        if (!at) {
          return;
        }
        const from = state.crop;
        const natural = state.natural;
        const startX = event.clientX;
        const startY = event.clientY;
        drags.start(el, event, {
          threshold: dragThreshold,
          cancelOnEscape: true,
          onStart: () => {
            startFrom(from);
            store.set({ dragging: handle });
          },
          onMove: ({ x, y, event: move }) => {
            const dx = (x - startX) / at.scale;
            const dy = (y - startY) / at.scale;
            const next = resizeCrop(
              from,
              natural,
              handle,
              dx,
              dy,
              limitsOf(store.get()),
              move.shiftKey
            );
            setCrop(next, { reason: "drag", event: move });
          },
          onEnd: (end, canceled) => {
            store.set({ dragging: null });
            if (canceled && !isLocked(store.get())) {
              setCrop(from, { reason: "drag", event: end });
            }
            commit({ reason: "drag", event: end });
          }
        });
      },
      // Pans the image under a frame with one pointer, and zooms it with two.
      viewportPointerdown(event, el) {
        const state = store.get();
        if (isLocked(state) || state.mode !== "frame") {
          return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }
        event.preventDefault();
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
        }
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        begin();
        if (pointers.size > 1) {
          return;
        }
        startFrom(state.crop);
        store.set({ dragging: "pan" });
        let reason = "drag";
        let last = event;
        const move = (moved) => {
          if (!pointers.has(moved.pointerId) || !gesture) {
            return;
          }
          last = moved;
          pointers.set(moved.pointerId, { x: moved.clientX, y: moved.clientY });
          const now = store.get();
          if (!now.natural) {
            return;
          }
          const { crop, center, distance, scale, selection } = gesture;
          const points = [...pointers.values()];
          const middle = centerOf(points);
          if (points.length > 1 && distance) {
            reason = "pinch";
            const anchor = {
              x: crop.x + (center.x - selection.left) / scale,
              y: crop.y + (center.y - selection.top) / scale
            };
            const zoomed = zoomCrop(
              crop,
              now.natural,
              zoomOf(crop, now.natural) * (spread(points) / distance),
              limitsOf(now),
              anchor
            );
            const k = selection.width / zoomed.width;
            const panned = {
              x: anchor.x - (middle.x - selection.left) / k - zoomed.x,
              y: anchor.y - (middle.y - selection.top) / k - zoomed.y
            };
            setCrop(
              resizeCrop(
                zoomed,
                now.natural,
                "move",
                panned.x,
                panned.y,
                limitsOf(now)
              ),
              {
                reason: "pinch",
                event: moved
              }
            );
          } else {
            const dx = (center.x - middle.x) / scale;
            const dy = (center.y - middle.y) / scale;
            setCrop(
              resizeCrop(crop, now.natural, "move", dx, dy, limitsOf(now)),
              {
                reason: "drag",
                event: moved
              }
            );
          }
        };
        const release = (event2) => {
          stop?.();
          store.set({ dragging: null });
          commit({ reason, event: event2 });
        };
        const up = (lifted) => {
          pointers.delete(lifted.pointerId);
          if (pointers.size) {
            return begin();
          }
          release(lifted);
        };
        const cancel = (canceled) => {
          if (canceled instanceof KeyboardEvent && canceled.key !== "Escape") {
            return;
          }
          stop?.();
          store.set({ dragging: null });
          const event2 = canceled instanceof KeyboardEvent ? last : canceled;
          if (state.crop) {
            setCrop(state.crop, { reason, event: event2 });
          }
          commit({ reason, event: event2 });
        };
        const doc = el.ownerDocument;
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", cancel);
        doc.addEventListener("keydown", cancel);
        stop = () => {
          pointers.clear();
          gesture = null;
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", cancel);
          doc.removeEventListener("keydown", cancel);
          stop = void 0;
          endPan = void 0;
        };
        endPan = release;
      },
      // The wheel zooms a frame at the pointer. A wheel has no release, so a pause commits.
      wheel(event, el) {
        const state = store.get();
        if (isLocked(state) || state.mode !== "frame") {
          return;
        }
        event.preventDefault();
        const delta = Math.max(
          -50,
          Math.min(50, event.deltaY * wheelUnit(event, el))
        );
        const at = imagePoint(event.clientX, event.clientY);
        if (start === void 0) {
          startFrom(state.crop);
        }
        setCrop(
          zoomCrop(
            state.crop,
            state.natural,
            zoomOf(state.crop, state.natural) * Math.exp(-delta * 0.01),
            limitsOf(state),
            at
          ),
          { reason: "wheel", event }
        );
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => commit({ reason: "wheel", event }), 300);
      },
      // Arrows move the crop, or a handle's edges; Shift moves ten times as far.
      // Plus and minus zoom, and R turns the image, Shift with R the other way.
      keydown(event, handle) {
        const state = store.get();
        if (event.altKey || event.ctrlKey || event.metaKey || isLocked(state)) {
          return;
        }
        if (handle === "move" && isHandle(event)) {
          return;
        }
        const direction = keySteps[event.key];
        if (direction) {
          const [x, y] = direction;
          if (x && (handle === "n" || handle === "s") || y && (handle === "e" || handle === "w")) {
            return;
          }
          event.preventDefault();
          const unit = Math.max(1, Math.round(1 / (layout(state)?.scale ?? 1)));
          const by = unit * (event.shiftKey ? 10 : 1);
          step(
            (crop, natural) => resizeCrop(
              crop,
              natural,
              handle,
              x * by,
              y * by,
              limitsOf(state)
            ),
            {
              reason: "step-key",
              event
            }
          );
          return;
        }
        if (event.key === "+" || event.key === "=" || event.key === "-" || event.key === "_") {
          event.preventDefault();
          const factor = event.key === "+" || event.key === "=" ? 1.25 : 0.8;
          step(
            (crop, natural) => zoomCrop(
              crop,
              natural,
              zoomOf(crop, natural) * factor,
              limitsOf(state)
            ),
            {
              reason: "zoom-key",
              event
            }
          );
          return;
        }
        if (event.key === "r" || event.key === "R") {
          event.preventDefault();
          api.rotate(event.shiftKey ? -1 : 1, { reason: "rotate-key", event });
        }
      },
      zoomInput(event, el) {
        const state = store.get();
        if (isLocked(state)) {
          return;
        }
        if (start === void 0) {
          startFrom(state.crop);
        }
        if (Number.isFinite(el.valueAsNumber)) {
          setCrop(
            zoomCrop(
              state.crop,
              state.natural,
              el.valueAsNumber,
              limitsOf(state)
            ),
            {
              reason: "zoom-input",
              event
            }
          );
        }
        el.value = String(zoomText(store.get()));
      },
      zoomCommit(event) {
        commit({ reason: "zoom-input", event });
      }
    }
  };
  const pointers = /* @__PURE__ */ new Map();
  let gesture = null;
  let stop;
  let endPan;
  context.onDestroy(() => stop?.());
  store.subscribe(() => {
    if (!isLocked(store.get())) {
      return;
    }
    drags.cancel();
    endPan?.();
  });
  function begin() {
    const state = store.get();
    const at = layout(state);
    const viewport = element("viewport");
    if (!at || !state.crop || !viewport) {
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const offset = {
      x: rect.left + viewport.clientLeft,
      y: rect.top + viewport.clientTop
    };
    const points = [...pointers.values()];
    gesture = {
      crop: state.crop,
      center: centerOf(points),
      distance: points.length > 1 ? spread(points) : 0,
      scale: at.scale,
      selection: {
        ...at.selection,
        left: at.selection.left + offset.x,
        top: at.selection.top + offset.y
      }
    };
  }
  deriveFromOptions(
    context,
    ["status", "natural"],
    (synced, state) => synced.src === state.src ? void 0 : { status: "loading", natural: null }
  );
  const ratioOf = (options) => options.aspectRatio && options.aspectRatio > 0 ? options.aspectRatio : void 0;
  let ratio = ratioOf(context.options());
  context.onOptions((options) => {
    const next = ratioOf(options);
    if (next === ratio) {
      return;
    }
    ratio = next;
    if (!next) {
      return;
    }
    queueMicrotask(
      () => step((crop, natural) => fitCrop(crop, natural, limitsOf(store.get())), {
        reason: "aspect-ratio-change"
      })
    );
  });
  return api;
}
var imageCropperApi = imageCropperApiBody;
var isHandle = (event) => !!event.target?.closest?.(
  '[data-slot="image-cropper-handle"]'
);
var centerOf = (points) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length
});
var spread = (points) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
export {
  imageCropperApi,
  initialState,
  isInert,
  isReady,
  layout,
  syncState,
  zoomText
};
