// src/components/scroll-area/scroll-area-view.ts
import { isRTL } from "../../foundation/platform/env.js";
import { prefersReducedMotion } from "../../foundation/platform/platform.js";
import { ahead, registerUninherited } from "../../foundation/platform/style.js";
import { bindTabStop } from "../../foundation/focus/tabbable.js";
import { createScrollbarInput } from "./scroll-area-pointer.js";
import { on } from "../../foundation/kernel/events.js";
import {
  edgesOf,
  edgeTolerance,
  followsEnd,
  mainAxis,
  maxScroll,
  overflows,
  scrollbarShown,
  scrollsTowardStart,
  thumbGeometry
} from "./scroll-area-model.js";
var liveKeys = [
  "atXStart",
  "atXEnd",
  "atYStart",
  "atYEnd",
  "scrollingX",
  "scrollingY",
  "hovering",
  "visibleX",
  "visibleY",
  "dragging",
  "sticking"
];
var scrollEndDelay = 150;
var axes = ["x", "y"];
var names = {
  x: {
    overflow: "overflowX",
    atStart: "atXStart",
    atEnd: "atXEnd",
    scrolling: "scrollingX",
    visible: "visibleX",
    thumbSize: "--scroll-area-thumb-width",
    before: "--scroll-area-overflow-x-start",
    after: "--scroll-area-overflow-x-end",
    progress: "--scroll-area-progress-x"
  },
  y: {
    overflow: "overflowY",
    atStart: "atYStart",
    atEnd: "atYEnd",
    scrolling: "scrollingY",
    visible: "visibleY",
    thumbSize: "--scroll-area-thumb-height",
    before: "--scroll-area-overflow-y-start",
    after: "--scroll-area-overflow-y-end",
    progress: "--scroll-area-progress-y"
  }
};
var frameVariables = axes.flatMap((axis) => [
  names[axis].before,
  names[axis].after,
  names[axis].progress
]);
function createScrollView(store) {
  let root;
  let viewport;
  const host = () => viewport?.ownerDocument.defaultView ?? window;
  const scrollbars = /* @__PURE__ */ new Set();
  const track = { x: 0, y: 0 };
  const thickness = { x: 0, y: 0 };
  let rtl = false;
  const metrics = {
    x: { position: 0, client: 0, scroll: 0 },
    y: { position: 0, client: 0, scroll: 0 }
  };
  const previous = { x: Number.NaN, y: Number.NaN };
  const written = /* @__PURE__ */ new WeakMap();
  let frame = 0;
  let stuckTo = Number.NaN;
  let touchY = null;
  let pressed = false;
  let easing = 0;
  const scrollEnds = { x: 0, y: 0 };
  const lastScroll = { x: 0, y: 0 };
  const hideTimers = { x: 0, y: 0 };
  function measure() {
    const el = viewport;
    metrics.y.position = el.scrollTop;
    metrics.y.client = el.clientHeight;
    metrics.y.scroll = el.scrollHeight;
    const left = el.scrollLeft;
    if (left !== 0 && left < 0 !== rtl) {
      rtl = isRTL(el);
    }
    metrics.x.position = rtl ? -left : left;
    metrics.x.client = el.clientWidth;
    metrics.x.scroll = el.scrollWidth;
  }
  function write(el, property, value, unit = "px") {
    let values = written.get(el);
    if (!values) {
      written.set(el, values = {});
    }
    const rounded = Math.round(value * 100) / 100;
    if (values[property] === rounded) {
      return;
    }
    values[property] = rounded;
    el.style.setProperty(property, `${rounded}${unit}`);
  }
  function setFlag(key, value) {
    if (store.get()[key] !== value) {
      store.set({ [key]: value });
    }
  }
  function update({ resized = false } = {}) {
    frame = 0;
    if (!viewport) {
      return;
    }
    measure();
    if (resized) {
      follow();
    }
    const state = store.get();
    let patch;
    const set = (key, value) => {
      if (state[key] !== value) {
        ;
        (patch ??= {})[key] = value;
      }
    };
    for (const axis of axes) {
      const axisMetrics = metrics[axis];
      const name = names[axis];
      const delta = Number.isNaN(previous[axis]) ? 0 : axisMetrics.position - previous[axis];
      previous[axis] = axisMetrics.position;
      const edges = edgesOf(axisMetrics);
      set(name.overflow, overflows(axisMetrics));
      set(name.atStart, edges.atStart);
      set(name.atEnd, edges.atEnd);
      if (root) {
        registerUninherited(frameVariables);
        write(root, name.before, edges.before);
        write(root, name.after, edges.after);
        write(root, name.progress, edges.progress, "");
      }
      writeThumb(axis);
      if (delta === 0) {
        continue;
      }
      const ownScroll = axis === "y" && Math.abs(axisMetrics.position - stuckTo) < edgeTolerance;
      if (!ownScroll) {
        lastScroll[axis] = performance.now();
        set(name.scrolling, true);
        scrollEnds[axis] ||= host().setTimeout(
          () => endScroll(axis),
          scrollEndDelay
        );
      }
      if (axis === "y" && state.stickToEnd) {
        set(
          "sticking",
          followsEnd(state.sticking, { delta, after: edges.after })
        );
      }
    }
    writeCorner(
      patch?.overflowX ?? state.overflowX,
      patch?.overflowY ?? state.overflowY
    );
    if (patch) {
      store.set(patch);
    }
    if (patch || resized) {
      refreshVisibility();
    }
  }
  function writeThumb(axis) {
    const geometry = thumbGeometry(metrics[axis], track[axis]);
    for (const scrollbar of scrollbars) {
      if (scrollbar.axis !== axis) {
        continue;
      }
      write(scrollbar.el, names[axis].thumbSize, geometry.size);
      write(
        scrollbar.el,
        "--scroll-area-thumb-offset",
        axis === "x" && rtl ? -geometry.offset : geometry.offset
      );
    }
  }
  function writeCorner(overflowX, overflowY) {
    if (!root) {
      return;
    }
    const state = store.get();
    const both = overflowX && overflowY && state.scrollbarsX > 0 && state.scrollbarsY > 0;
    write(root, "--scroll-area-corner-width", both ? thickness.y : 0);
    write(root, "--scroll-area-corner-height", both ? thickness.x : 0);
  }
  function schedule() {
    if (frame || !viewport) {
      return;
    }
    frame = host().requestAnimationFrame(() => update());
  }
  function endScroll(axis) {
    const elapsed = performance.now() - lastScroll[axis];
    if (elapsed < scrollEndDelay) {
      scrollEnds[axis] = host().setTimeout(
        () => endScroll(axis),
        scrollEndDelay - elapsed
      );
      return;
    }
    scrollEnds[axis] = 0;
    setFlag(names[axis].scrolling, false);
    refreshVisibility();
  }
  function refreshVisibility() {
    const state = store.get();
    for (const axis of axes) {
      const name = names[axis];
      const shown = scrollbarShown(state.type, {
        overflow: state[name.overflow],
        hovering: state.hovering,
        scrolling: state[name.scrolling],
        dragging: state.dragging === axis
      });
      if (shown) {
        host().clearTimeout(hideTimers[axis]);
        hideTimers[axis] = 0;
        setFlag(name.visible, true);
        continue;
      }
      if (!state[name.visible] || hideTimers[axis]) {
        continue;
      }
      const delay = state.type === "scroll" || state.type === "hover" ? state.scrollHideDelay : 0;
      if (delay <= 0) {
        setFlag(name.visible, false);
      } else {
        hideTimers[axis] = host().setTimeout(() => {
          hideTimers[axis] = 0;
          setFlag(name.visible, false);
          refreshVisibility();
        }, delay);
      }
    }
  }
  function follow() {
    const state = store.get();
    if (!state.stickToEnd || !state.sticking || state.dragging || pressed || touchY !== null || easing) {
      return;
    }
    const max = maxScroll(metrics.y);
    if (max - metrics.y.position < edgeTolerance) {
      return;
    }
    stuckTo = max;
    viewport.scrollTo({ top: max, behavior: "instant" });
    metrics.y.position = viewport.scrollTop;
  }
  function scrollTo(axis, position, behavior = "instant") {
    if (!viewport) {
      return;
    }
    if (axis === "y") {
      viewport.scrollTo({ top: position, behavior });
    } else {
      viewport.scrollTo({ left: rtl ? -position : position, behavior });
    }
  }
  function release() {
    stopEasing();
    if (store.get().sticking && metrics.y.position > 0) {
      store.set({ sticking: false });
    }
  }
  function stopEasing() {
    if (!easing) {
      return;
    }
    host().cancelAnimationFrame(easing);
    easing = 0;
  }
  function easeToEnd() {
    const step = () => {
      easing = 0;
      if (!viewport) {
        return;
      }
      measure();
      const gap = maxScroll(metrics.y) - metrics.y.position;
      if (gap < edgeTolerance) {
        return update();
      }
      scrollTo("y", metrics.y.position + Math.max(1, gap * 0.2));
      easing = host().requestAnimationFrame(step);
    };
    easing = host().requestAnimationFrame(step);
  }
  function scrollToEdge(edge, { behavior = "smooth" } = {}) {
    if (!viewport) {
      return;
    }
    const axis = mainAxis(store.get());
    if (axis === "x") {
      rtl = isRTL(viewport);
    }
    measure();
    const smooth = behavior === "smooth" && !prefersReducedMotion();
    stopEasing();
    if (edge === "end" && axis === "y" && store.get().stickToEnd) {
      setFlag("sticking", true);
    }
    if (edge === "end" && axis === "y" && smooth) {
      return easeToEnd();
    }
    scrollTo(
      axis,
      edge === "start" ? 0 : maxScroll(metrics[axis]),
      smooth ? "smooth" : "instant"
    );
  }
  function bindViewport(el) {
    viewport = el;
    const view = el.ownerDocument.defaultView ?? window;
    let counted = false;
    const resize = new ResizeObserver(() => {
      rtl = isRTL(el);
      if (!counted && viewport === el) {
        counted = true;
        update({ resized: true });
        store.set({ counted: true });
      }
      measure();
      follow();
      schedule();
    });
    const observeChildren = () => {
      resize.observe(el);
      for (const child of Array.from(el.children)) {
        resize.observe(child);
      }
    };
    observeChildren();
    const children = new MutationObserver(() => {
      observeChildren();
      update({ resized: true });
    });
    children.observe(el, { childList: true });
    const scrollable = () => store.get().overflowX || store.get().overflowY;
    const tabStop = bindTabStop(el, scrollable);
    let wasScrollable = scrollable();
    const unsubscribe = store.subscribe(() => {
      if (scrollable() === wasScrollable) {
        return;
      }
      wasScrollable = scrollable();
      tabStop.check();
    });
    const lift = () => {
      pressed = false;
      view.removeEventListener("pointerup", lift, true);
      view.removeEventListener("pointercancel", lift, true);
      update({ resized: true });
    };
    const endTouch = () => {
      touchY = null;
      update({ resized: true });
    };
    const cleanups = [
      () => resize.disconnect(),
      () => children.disconnect(),
      tabStop.stop,
      unsubscribe,
      on(el, "scroll", schedule, { passive: true }),
      on(
        el,
        "wheel",
        (event) => {
          if (event.deltaY >= 0) {
            stopEasing();
          } else if (!scrollsInside(event.target, el)) {
            release();
          }
        },
        { passive: true }
      ),
      on(el, "keydown", (event) => {
        if (event.defaultPrevented || !scrollsTowardStart(
          event.key,
          event.shiftKey,
          isEditing(event.target)
        )) {
          return;
        }
        if (!scrollsInside(event.target, el)) {
          release();
        }
      }),
      on(
        el,
        "touchstart",
        (event) => touchY = event.touches[0]?.clientY ?? null,
        { passive: true }
      ),
      on(
        el,
        "touchmove",
        (event) => {
          const y = event.touches[0]?.clientY;
          if (y === void 0) {
            return;
          }
          if (touchY !== null && y > touchY && !scrollsInside(event.target, el)) {
            release();
          }
          touchY = y;
        },
        { passive: true }
      ),
      on(el, "touchend", endTouch, { passive: true }),
      on(el, "touchcancel", endTouch, { passive: true }),
      on(el, "pointerdown", (event) => {
        if (event.pointerType === "touch" || event.button !== 0) {
          return;
        }
        pressed = true;
        stopEasing();
        view.addEventListener("pointerup", lift, true);
        view.addEventListener("pointercancel", lift, true);
      })
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      view.removeEventListener("pointerup", lift, true);
      view.removeEventListener("pointercancel", lift, true);
      if (frame) {
        view.cancelAnimationFrame(frame);
      }
      frame = 0;
      stopEasing();
      for (const axis of axes) {
        view.clearTimeout(scrollEnds[axis]);
        view.clearTimeout(hideTimers[axis]);
        scrollEnds[axis] = hideTimers[axis] = 0;
      }
      if (viewport === el) {
        viewport = void 0;
      }
    };
  }
  function bindRoot(el) {
    ahead(() => registerUninherited(frameVariables));
    root = el;
    queueMicrotask(() => {
      if (root === el && el.isConnected && el.matches(":hover")) {
        setFlag("hovering", true);
      }
    });
    const hover = (hovering) => (event) => {
      if (event.pointerType === "touch") {
        return;
      }
      setFlag("hovering", hovering);
      refreshVisibility();
    };
    const cleanups = [
      on(el, "pointerenter", hover(true)),
      on(el, "pointerleave", hover(false))
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (root === el) {
        root = void 0;
      }
    };
  }
  const input = createScrollbarInput({
    viewport: () => viewport,
    metrics,
    track,
    rtl: () => rtl,
    measure,
    // At the start, scrollLeft has no sign to show a turned direction.
    readDirection: () => {
      rtl = isRTL(viewport);
    },
    scrollTo,
    release,
    stopEasing,
    setDragging
  });
  function bindScrollbar(el, axis) {
    const part = { el, axis };
    scrollbars.add(part);
    queueMicrotask(countScrollbars);
    const resize = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const length = axis === "y" ? entry.contentRect.height : entry.contentRect.width;
      const appeared = track[axis] === 0 && length > 0;
      track[axis] = length;
      thickness[axis] = (axis === "y" ? box?.inlineSize : box?.blockSize) ?? 0;
      if (appeared && viewport) {
        measure();
        writeThumb(axis);
      }
      schedule();
    });
    resize.observe(el);
    schedule();
    const cleanups = [
      () => resize.disconnect(),
      on(el, "wheel", input.forwardWheel, { passive: false }),
      // Pressing a scrollbar never moves focus, like a native one.
      on(el, "mousedown", (event) => event.preventDefault()),
      on(el, "pointerdown", (event) => input.pressTrack(event, el, axis))
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      input.endPress(el);
      scrollbars.delete(part);
      countScrollbars();
      for (const property in written.get(el)) {
        el.style.removeProperty(property);
      }
      written.delete(el);
    };
  }
  function countScrollbars() {
    let x = 0;
    let y = 0;
    for (const part of scrollbars) {
      if (part.axis === "x") {
        x++;
      } else {
        y++;
      }
    }
    store.set({ scrollbarsX: x, scrollbarsY: y });
  }
  function setDragging(dragging) {
    store.set({ dragging });
    refreshVisibility();
  }
  return {
    bindRoot,
    bindViewport,
    bindScrollbar,
    bindThumb: input.bindThumb,
    scrollToEdge,
    // Whether the view is at an edge now. The store catches up a frame after
    // a scroll, so a scroll handler reading it would get where the view was.
    // Undefined without a viewport, like on the server.
    isAt(edge) {
      if (!viewport?.isConnected) {
        return void 0;
      }
      measure();
      const axis = mainAxis({
        overflowX: overflows(metrics.x),
        overflowY: overflows(metrics.y)
      });
      const edges = edgesOf(metrics[axis]);
      return edge === "start" ? edges.atStart : edges.atEnd;
    },
    // Moves focus to the viewport, programmatically focusable for as long as
    // it holds focus when it isn't a tab stop.
    focusViewport() {
      const el = viewport;
      if (!el) {
        return;
      }
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
        const restore = () => el.getAttribute("tabindex") === "-1" && el.removeAttribute("tabindex");
        el.addEventListener("blur", restore, { once: true });
      }
      el.focus({ preventScroll: true });
    },
    // Applies changed options, like stickToEnd or type.
    refresh() {
      if (viewport?.isConnected) {
        update({ resized: true });
      }
      refreshVisibility();
    }
  };
}
function isEditing(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}
function scrollsInside(target, viewport) {
  for (let el = target instanceof Element ? target : null; el && el !== viewport; el = el.parentElement) {
    if (el.scrollTop <= 0 || el.scrollHeight <= el.clientHeight) {
      continue;
    }
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") {
      return true;
    }
  }
  return false;
}
export {
  createScrollView,
  liveKeys
};
