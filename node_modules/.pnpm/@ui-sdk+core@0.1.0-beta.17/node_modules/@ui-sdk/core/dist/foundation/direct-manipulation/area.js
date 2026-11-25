// src/foundation/direct-manipulation/area.ts
import { isRTL } from "../platform/env.js";
import { createDragSession } from "../drag-and-drop/pointer.js";
import { snapToStep } from "../number/steps.js";
import { isDestroying } from "../kernel/keep.js";
var axisOf = (axis) => ({
  min: axis?.min ?? 0,
  max: axis?.max ?? 1,
  step: axis?.step ?? 0.01,
  label: axis?.label
});
function createArea(context, options) {
  const { store } = context;
  const x = () => axisOf(options.x?.());
  const y = () => axisOf(options.y?.());
  const value = () => options.value(store.get());
  const drags = createDragSession(context.onDestroy);
  const fraction = (n, axis) => axis.max === axis.min ? 0 : (n - axis.min) / (axis.max - axis.min);
  function set(next, details) {
    const snapped = { x: snapToStep(next.x, x()), y: snapToStep(next.y, y()) };
    const current = value();
    if (snapped.x === current.x && snapped.y === current.y) {
      return false;
    }
    return options.set(snapped, details);
  }
  function at(el, clientX, clientY) {
    const rect = el.getBoundingClientRect();
    let fx = rect.width ? (clientX - rect.left) / rect.width : 0;
    if (isRTL(el)) {
      fx = 1 - fx;
    }
    const fy = rect.height ? 1 - (clientY - rect.top) / rect.height : 0;
    const ax = x();
    const ay = y();
    return {
      x: ax.min + Math.min(1, Math.max(0, fx)) * (ax.max - ax.min),
      y: ay.min + Math.min(1, Math.max(0, fy)) * (ay.max - ay.min)
    };
  }
  const api = {
    /** Sets the value, snapped to each axis's step. Returns whether it changed. */
    set: (next) => set(next, { reason: "imperative" }),
    /** Jumps the thumb under the pointer and follows it until it lifts. Call from the surface's `pointerdown`. */
    pointerdown(event, el) {
      if (!drags.accepts(event) || options.disabled?.()) {
        return;
      }
      event.preventDefault();
      set(at(el, event.clientX, event.clientY), {
        reason: "track-press",
        event
      });
      const thumb = el.querySelector("[data-area-thumb]");
      thumb?.focus({ preventScroll: true });
      let reason = "track-press";
      const unsubscribe = store.subscribe(
        () => options.disabled?.() && drags.cancel()
      );
      drags.start(el, event, {
        onMove: (sample) => {
          if (set(at(el, sample.x, sample.y), {
            reason: "drag",
            event: sample.event
          })) {
            reason = "drag";
          }
        },
        // A teardown cut the drag short, so nobody ended it to commit.
        onEnd: (end) => {
          unsubscribe();
          if (!isDestroying()) {
            options.onCommit?.(value(), { reason, event: end });
          }
        }
      });
    },
    /**
     * Handles a key on the thumb and returns whether it did. Arrows step an
     * axis, Shift ten steps; Page Up and Page Down step y by a tenth of its
     * range; Home and End go to x's ends.
     */
    keydown(event) {
      if (event.defaultPrevented || options.disabled?.() || event.altKey || event.ctrlKey || event.metaKey) {
        return false;
      }
      const ax = x();
      const ay = y();
      const current = value();
      const times = event.shiftKey ? 10 : 1;
      const rtl = event.target instanceof Element && isRTL(event.target);
      let next;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const sign = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
        next = { ...current, x: current.x + sign * ax.step * times };
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        next = {
          ...current,
          y: current.y + (event.key === "ArrowUp" ? 1 : -1) * ay.step * times
        };
      } else if (event.key === "PageUp" || event.key === "PageDown") {
        next = {
          ...current,
          y: current.y + (event.key === "PageUp" ? 1 : -1) * (ay.max - ay.min) / 10
        };
      } else if (event.key === "Home") {
        next = { ...current, x: ax.min };
      } else if (event.key === "End") {
        next = { ...current, x: ax.max };
      }
      if (!next) {
        return false;
      }
      event.preventDefault();
      if (set(next, { reason: "step-key", event })) {
        options.onCommit?.(value(), { reason: "step-key", event });
      }
      return true;
    },
    /** Where the value sits, from 0 to 1 on each axis, with y from the bottom. */
    fractions(state) {
      const current = options.value(state);
      return { x: fraction(current.x, x()), y: fraction(current.y, y()) };
    },
    /** The thumb's position, as a `style` attribute. */
    thumbStyle(state) {
      const { x: fx, y: fy } = api.fractions(state);
      const percent = (n) => Math.round(n * 1e4) / 100;
      return `position:absolute;inset-inline-start:${percent(fx)}%;top:${percent(1 - fy)}%;--area-x:${fx};--area-y:${fy}`;
    },
    /** The thumb's role and value for screen readers, and `data-area-thumb` for the surface to find it. */
    thumbAttrs(state) {
      const current = options.value(state);
      const ax = x();
      const ay = y();
      const percent = (n, axis) => `${Math.round(fraction(n, axis) * 100)}%`;
      const text = options.valueText?.(current) ?? `${ax.label ?? "X"} ${percent(current.x, ax)}, ${ay.label ?? "Y"} ${percent(current.y, ay)}`;
      return {
        role: "slider",
        tabindex: options.disabled?.() ? "-1" : "0",
        "aria-roledescription": "2D slider",
        "aria-valuemin": String(ax.min),
        "aria-valuemax": String(ax.max),
        "aria-valuenow": String(current.x),
        "aria-valuetext": text,
        "aria-disabled": options.disabled?.() ? "true" : void 0,
        "data-area-thumb": ""
      };
    }
  };
  return api;
}
export {
  createArea
};
