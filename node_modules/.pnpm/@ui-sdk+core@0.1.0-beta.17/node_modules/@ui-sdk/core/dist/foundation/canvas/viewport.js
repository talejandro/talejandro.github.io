// src/foundation/canvas/viewport.ts
import { announce } from "../platform/announce.js";
var rest = 1e5;
var wheelUnit = (event, surface) => event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface.clientHeight : 1;
function createViewport(context, options) {
  const { store } = context;
  const minZoom = () => options.minZoom?.() ?? 0.1;
  const maxZoom = () => options.maxZoom?.() ?? 4;
  const clampZoom = (zoom) => Math.min(maxZoom(), Math.max(minZoom(), zoom));
  const set = (value, details) => options.set ? options.set(value, details) : (store.set({ [options.key]: value }), true);
  const origin = () => {
    const box = options.surface()?.getBoundingClientRect();
    return {
      left: box?.left ?? 0,
      top: box?.top ?? 0,
      width: box?.width ?? 0,
      height: box?.height ?? 0
    };
  };
  const pointers = /* @__PURE__ */ new Map();
  let gesture = null;
  let stop;
  context.onDestroy(() => stop?.());
  let findable;
  let rested = { x: 0, y: 0 };
  const restyle = () => store.set({ [options.key]: { ...api.get() } });
  const api = {
    /** The viewport now. */
    get() {
      return store.get()[options.key] ?? { x: 0, y: 0, zoom: 1 };
    },
    /** A point on screen, like a pointer's `clientX` and `clientY`, in canvas units. */
    toCanvas(clientX, clientY) {
      const { x, y, zoom } = api.get();
      const box = origin();
      return {
        x: (clientX - box.left - x) / zoom,
        y: (clientY - box.top - y) / zoom
      };
    },
    /** A canvas point on screen, in client pixels. */
    toScreen(point) {
      const { x, y, zoom } = api.get();
      const box = origin();
      return {
        x: point.x * zoom + x + box.left,
        y: point.y * zoom + y + box.top
      };
    },
    /** Where an element is on the canvas, like a port inside a node, from its box on screen. */
    rectOf(el) {
      const box = el.getBoundingClientRect();
      const a = api.toCanvas(box.left, box.top);
      const b = api.toCanvas(box.right, box.bottom);
      return { left: a.x, top: a.y, right: b.x, bottom: b.y };
    },
    /** The part of the canvas on screen now. */
    visible() {
      const { x, y, zoom } = api.get();
      const box = origin();
      return {
        left: -x / zoom,
        top: -y / zoom,
        right: (box.width - x) / zoom,
        bottom: (box.height - y) / zoom
      };
    },
    /** Moves to a viewport, keeping the zoom within bounds. */
    setViewport(value, details = {
      reason: "imperative"
    }) {
      const next = { x: value.x, y: value.y, zoom: clampZoom(value.zoom) };
      const now = api.get();
      if (next.x === now.x && next.y === now.y && next.zoom === now.zoom) {
        return false;
      }
      return set(next, details);
    },
    /** Pans by screen pixels. */
    panBy(dx, dy, details = {
      reason: "imperative"
    }) {
      const { x, y, zoom } = api.get();
      return api.setViewport({ x: x + dx, y: y + dy, zoom }, details);
    },
    /** Zooms to a scale, keeping the canvas point under a screen point still. Defaults to the surface's center. */
    zoomTo(zoom, at, details = {
      reason: "imperative"
    }) {
      const view = api.get();
      const box = origin();
      const px = (at?.x ?? box.left + box.width / 2) - box.left;
      const py = (at?.y ?? box.top + box.height / 2) - box.top;
      const next = clampZoom(zoom);
      const k = next / view.zoom;
      return api.setViewport(
        { x: px - (px - view.x) * k, y: py - (py - view.y) * k, zoom: next },
        details
      );
    },
    /** Zooms by a factor, like `1.2` in and `1 / 1.2` out. */
    zoomBy(factor, at, details = {
      reason: "imperative"
    }) {
      return api.zoomTo(api.get().zoom * factor, at, details);
    },
    /** Shows a canvas box whole and centered, zooming no further in than `maxZoom`. */
    fit(rect, fitOptions = {}, details = {
      reason: "imperative"
    }) {
      const box = origin();
      const padding = fitOptions.padding ?? 32;
      const width = Math.max(rect.right - rect.left, 1);
      const height = Math.max(rect.bottom - rect.top, 1);
      const zoom = clampZoom(
        Math.min(
          (box.width - padding * 2) / width,
          (box.height - padding * 2) / height,
          fitOptions.maxZoom ?? 1
        )
      );
      return api.setViewport(
        {
          x: box.width / 2 - (rect.left + width / 2) * zoom,
          y: box.height / 2 - (rect.top + height / 2) * zoom,
          zoom
        },
        details
      );
    },
    /** Pans the least distance that brings a canvas box into view, with `padding` screen pixels around it. */
    reveal(rect, revealOptions = {}, details = {
      reason: "focus-in"
    }) {
      const { zoom } = api.get();
      const seen = api.visible();
      const pad = (revealOptions.padding ?? 24) / zoom;
      const shift = (low, high, from, to) => high - low > to - from - pad * 2 ? (from + to) / 2 - (low + high) / 2 : low < from + pad ? from + pad - low : high > to - pad ? to - pad - high : 0;
      const dx = shift(rect.left, rect.right, seen.left, seen.right);
      const dy = shift(rect.top, rect.bottom, seen.top, seen.bottom);
      return dx || dy ? api.panBy(dx * zoom, dy * zoom, details) : false;
    },
    /** Pans with the wheel or a two finger scroll; zooms at the pointer with Ctrl or ⌘, and with a trackpad pinch, which browsers send as Ctrl. */
    wheel(event) {
      const surface = options.surface();
      if (!surface) {
        return;
      }
      event.preventDefault();
      const unit = wheelUnit(event, surface);
      if (event.ctrlKey || event.metaKey) {
        const delta = Math.max(-50, Math.min(50, event.deltaY * unit));
        api.zoomBy(
          Math.exp(-delta * 0.01),
          { x: event.clientX, y: event.clientY },
          { reason: "wheel", event }
        );
      } else {
        api.panBy(-event.deltaX * unit, -event.deltaY * unit, {
          reason: "wheel",
          event
        });
      }
    },
    /** Pans while one pointer drags the surface, and pinches with two. Call it for presses on empty space. */
    pointerdown(event) {
      const surface = options.surface();
      if (!surface || event.pointerType === "mouse" && event.button !== 0 && event.button !== 1) {
        return;
      }
      event.preventDefault();
      try {
        surface.setPointerCapture(event.pointerId);
      } catch {
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const begin = () => {
        const points = [...pointers.values()];
        const center = {
          x: points.reduce((s, p) => s + p.x, 0) / points.length,
          y: points.reduce((s, p) => s + p.y, 0) / points.length
        };
        const distance = points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
        gesture = { center, distance, view: api.get() };
      };
      begin();
      if (pointers.size > 1) {
        return;
      }
      const move = (e) => {
        if (!pointers.has(e.pointerId) || !gesture) {
          return;
        }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const points = [...pointers.values()];
        const center = {
          x: points.reduce((s, p) => s + p.x, 0) / points.length,
          y: points.reduce((s, p) => s + p.y, 0) / points.length
        };
        const { view } = gesture;
        if (points.length > 1 && gesture.distance) {
          const distance = Math.hypot(
            points[0].x - points[1].x,
            points[0].y - points[1].y
          );
          const zoom = clampZoom(view.zoom * (distance / gesture.distance));
          const box = origin();
          const cx = (gesture.center.x - box.left - view.x) / view.zoom;
          const cy = (gesture.center.y - box.top - view.y) / view.zoom;
          api.setViewport(
            {
              x: center.x - box.left - cx * zoom,
              y: center.y - box.top - cy * zoom,
              zoom
            },
            { reason: "pinch", event: e }
          );
        } else {
          api.setViewport(
            {
              x: view.x + center.x - gesture.center.x,
              y: view.y + center.y - gesture.center.y,
              zoom: view.zoom
            },
            { reason: "drag", event: e }
          );
        }
      };
      const up = (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size) {
          begin();
        } else {
          end();
        }
      };
      const end = () => {
        pointers.clear();
        gesture = null;
        surface.removeEventListener("pointermove", move);
        surface.removeEventListener("pointerup", up);
        surface.removeEventListener("pointercancel", up);
        stop = void 0;
      };
      surface.addEventListener("pointermove", move);
      surface.addEventListener("pointerup", up);
      surface.addEventListener("pointercancel", up);
      stop = end;
    },
    /** `+` and `-` zoom at the center, `0` goes back to 100%. Returns whether it handled the key. */
    keydown(event, at) {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
      }
      const factor = event.key === "+" || event.key === "=" ? 1.25 : event.key === "-" || event.key === "_" ? 0.8 : event.key === "0" ? 0 : void 0;
      if (factor === void 0) {
        return false;
      }
      event.preventDefault();
      const done = factor ? api.zoomBy(factor, at, { reason: "zoom-key", event }) : api.zoomTo(1, at, { reason: "zoom-key", event });
      if (done) {
        announce(
          options.message?.(api.get().zoom) ?? `Zoom ${Math.round(api.get().zoom * 100)}%`
        );
      }
      return true;
    },
    /** The world element's `style`: one transform for every item, so panning lays nothing out. */
    style(state) {
      const { x, y, zoom } = state[options.key] ?? {
        x: 0,
        y: 0,
        zoom: 1
      };
      const at = findable ? rested : { x: 0, y: 0 };
      return `transform:translate(${x + at.x}px,${y + at.y}px) scale(${zoom});transform-origin:0 0;--canvas-zoom:${zoom}`;
    },
    /**
     * Turns the browser's scrolls inside `el` into pans, until the returned
     * function runs, so find in page, focus and links to an id bring what
     * they found into view. `el` is a pane that fills the surface and holds
     * only the world, with `overflow: scroll`, since find in page skips what a
     * user can't scroll: it rests scrolled far from its origin, with the world
     * offset to match.
     */
    bindFindable(el) {
      const spacer = el.ownerDocument.createElement("div");
      spacer.setAttribute("aria-hidden", "true");
      Object.assign(spacer.style, {
        position: "absolute",
        insetInlineStart: `${rest * 2}px`,
        insetBlockStart: `${rest * 2}px`,
        width: "1px",
        height: "1px",
        visibility: "hidden",
        pointerEvents: "none"
      });
      let bound = true;
      let frame = 0;
      const settle = () => {
        if (!bound) {
          return;
        }
        if (!spacer.isConnected) {
          el.append(spacer);
        }
        const rtl = el.ownerDocument.defaultView?.getComputedStyle(el).direction === "rtl";
        el.scrollLeft = rtl ? -rest : rest;
        el.scrollTop = rest;
        const at = { x: el.scrollLeft, y: el.scrollTop };
        if (at.x === rested.x && at.y === rested.y) {
          return;
        }
        rested = at;
        restyle();
      };
      let focusing = false;
      const onFocusIn = () => {
        focusing = true;
        requestAnimationFrame(() => focusing = false);
      };
      const onScroll = (event) => {
        if (!spacer.isConnected || !el.scrollLeft && !el.scrollTop) {
          return settle();
        }
        const dx = el.scrollLeft - rested.x;
        const dy = el.scrollTop - rested.y;
        if (!dx && !dy) {
          return;
        }
        settle();
        api.panBy(-dx, -dy, {
          reason: focusing ? "focus-in" : "find-in-page",
          event
        });
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(settle);
      };
      findable = el;
      rested = { x: 0, y: 0 };
      settle();
      el.addEventListener("scroll", onScroll);
      el.addEventListener("focusin", onFocusIn);
      const view = el.ownerDocument.defaultView;
      const sized = view?.ResizeObserver ? new view.ResizeObserver(settle) : void 0;
      sized?.observe(el);
      return () => {
        bound = false;
        cancelAnimationFrame(frame);
        sized?.disconnect();
        el.removeEventListener("scroll", onScroll);
        el.removeEventListener("focusin", onFocusIn);
        spacer.remove();
        if (findable !== el) {
          return;
        }
        findable = void 0;
        rested = { x: 0, y: 0 };
        el.scrollLeft = 0;
        el.scrollTop = 0;
        restyle();
      };
    }
  };
  return api;
}
export {
  createViewport
};
