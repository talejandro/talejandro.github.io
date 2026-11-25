// src/foundation/direct-manipulation/spans.ts
import { deriveState } from "../kernel/derive.js";
import { settleDraft } from "../kernel/draft.js";
import { announce } from "../platform/announce.js";
import {
  createAutoScroll
} from "../drag-and-drop/auto-scroll.js";
import { isRTL } from "../platform/env.js";
import { keepFocus } from "../focus/keep-focus.js";
import { documentOrder } from "../kernel/order.js";
import { createDragSession, dragThreshold } from "../drag-and-drop/pointer.js";
import { onGrid } from "../number/steps.js";
function spansMessage({ type, label }) {
  if (type === "draw") {
    return `Added ${label}.`;
  }
  if (type === "delete") {
    return `Deleted ${label}.`;
  }
  if (type === "cancel") {
    return `Put back ${label}.`;
  }
  return `${label}.`;
}
function stackSpans(spans) {
  const result = /* @__PURE__ */ new Map();
  const byTrack = /* @__PURE__ */ new Map();
  for (const span of spans) {
    byTrack.set(span.track, [...byTrack.get(span.track) ?? [], span]);
  }
  for (const track of byTrack.values()) {
    track.sort((a, b) => a.start - b.start || b.end - a.end);
    let group = [];
    let lanes = [];
    let groupEnd = -Infinity;
    const close = () => {
      for (const span of group) {
        result.get(span.id).lanes = lanes.length;
      }
      group = [];
      lanes = [];
    };
    for (const span of track) {
      if (span.start >= groupEnd) {
        close();
      }
      let lane = lanes.findIndex((end) => end <= span.start);
      if (lane === -1) {
        lane = lanes.push(span.end) - 1;
      } else {
        lanes[lane] = span.end;
      }
      result.set(span.id, { lane, lanes: 0 });
      group.push(span);
      groupEnd = Math.max(
        groupEnd === -Infinity ? span.end : groupEnd,
        span.end
      );
    }
    close();
  }
  return result;
}
function isSpanFree(spans, span) {
  return spans.every(
    (other) => other.id === span.id || other.track !== span.track || other.end <= span.start || other.start >= span.end
  );
}
function createSpans(context, options) {
  const { store } = context;
  const tracks = /* @__PURE__ */ new Map();
  const elements = /* @__PURE__ */ new Map();
  const value = () => store.get()[options.key];
  const draft = () => store.get()[options.draft];
  const setDraft = (next) => store.set({ [options.draft]: next });
  const min = () => options.min?.() ?? 0;
  const max = () => options.max?.() ?? 100;
  const step = () => options.step?.() ?? 1;
  const minSize = () => Math.max(options.minSize?.() ?? step(), step());
  const axis = () => options.axis ?? "y";
  const snap = (n, round = Math.round) => onGrid(n, { min: min(), max: max(), step: step() }, round);
  function fit(span, keep) {
    let { start, end } = span;
    const lo = min();
    const hi = max();
    const longest = options.maxSize?.() ?? hi - lo;
    if (keep === "size") {
      const size = end - start;
      start = Math.min(Math.max(start, lo), hi - size);
      end = start + size;
    } else if (keep === "start") {
      end = Math.min(hi, start + longest, Math.max(end, start + minSize()));
    } else {
      start = Math.max(lo, end - longest, Math.min(start, end - minSize()));
    }
    return { ...span, start, end };
  }
  const label = (span) => options.label?.(span) ?? `${span.track}, ${span.start} to ${span.end}`;
  const say = (type, span) => announce(
    (options.message ?? spansMessage)({ type, span, label: label(span) })
  );
  const order = () => {
    const given = options.tracks?.();
    if (given) {
      return given;
    }
    return [...tracks.entries()].filter(([, el]) => el.isConnected).sort(([, a], [, b]) => documentOrder(a, b)).map(([track]) => track);
  };
  function valueAt(track, x, y) {
    const el = tracks.get(track);
    if (!el) {
      return min();
    }
    const rect = el.getBoundingClientRect();
    let fraction = axis() === "y" ? rect.height ? (y - rect.top) / rect.height : 0 : rect.width ? (x - rect.left) / rect.width : 0;
    if (axis() === "x" && isRTL(el)) {
      fraction = 1 - fraction;
    }
    return min() + Math.min(1, Math.max(0, fraction)) * (max() - min());
  }
  function trackAt(x, y) {
    let best;
    for (const [track, el] of tracks) {
      if (!el.isConnected) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      const [at, from, to] = axis() === "y" ? [x, rect.left, rect.right] : [y, rect.top, rect.bottom];
      const distance = at < from ? from - at : at > to ? at - to : 0;
      if (!best || distance < best.distance) {
        best = { track, distance };
      }
    }
    return best?.track;
  }
  const replaced = (spans2, span) => spans2.some((other) => other.id === span.id) ? spans2.map((other) => other.id === span.id ? span : other) : [...spans2, span];
  const allowed = (spans2, span) => options.overlap !== false || isSpanFree(spans2, span);
  const focusLater = (id) => keepFocus(() => elements.get(id));
  function commit(spans2, details) {
    const span = spans2.find((other) => other.id === details.id) ?? value().find((other) => other.id === details.id);
    if (!options.set(spans2, details)) {
      return false;
    }
    if (span) {
      say(details.action, span);
    }
    return true;
  }
  let held = false;
  let moved = false;
  deriveState(context, [options.draft], (state) => {
    const current = state[options.draft];
    const now = state[options.key];
    if (!current || !held) {
      return;
    }
    if (current.action !== "draw" && !now.some((span2) => span2.id === current.id)) {
      return { [options.draft]: null };
    }
    const span = moved ? current.spans.find((other) => other.id === current.id) : void 0;
    const spans2 = span ? replaced(now, span) : now;
    if (span && !allowed(spans2, span)) {
      return { [options.draft]: null };
    }
    if (spans2.length === current.spans.length && spans2.every((other, i) => other === current.spans[i])) {
      return;
    }
    return { [options.draft]: { ...current, spans: spans2 } };
  });
  const drags = createDragSession(context.onDestroy);
  function drag(el, event, id, action, next, click) {
    const before = value();
    let dragging = false;
    let last;
    let point = { x: event.clientX, y: event.clientY };
    const update = () => {
      const span = next(point.x, point.y);
      const current = draft();
      if (!span || !current) {
        return;
      }
      const spans2 = replaced(current.spans, span);
      if (!allowed(spans2, span)) {
        return;
      }
      moved = true;
      setDraft({ id, action, spans: spans2 });
    };
    const scroller = options.createAutoScroll === false ? void 0 : createAutoScroll({
      ...options.createAutoScroll,
      ignore: () => elements.get(id),
      onScroll: update
    });
    drags.start(el, event, {
      threshold: dragThreshold,
      cancelOnEscape: true,
      onStart: () => {
        if (draft()) {
          return false;
        }
        dragging = true;
        held = true;
        moved = false;
        setDraft({ id, action, spans: value() });
      },
      onMove: ({ x, y, event: moveEvent }) => {
        moveEvent.preventDefault();
        last = moveEvent;
        point = { x, y };
        scroller?.update(x, y);
        update();
      },
      onEnd: (endEvent, canceled) => {
        const dragged = dragging;
        scroller?.stop();
        dragging = false;
        held = false;
        if (!dragged) {
          return canceled ? void 0 : click?.();
        }
        const current = draft();
        if (canceled && action !== "draw") {
          const span = before.find((other) => other.id === id);
          if (span) {
            say("cancel", span);
          }
        }
        if (!current || canceled || !moved) {
          return setDraft(null);
        }
        const base = value();
        if (!commit(current.spans, {
          reason: "drag",
          event: last ?? endEvent,
          id,
          action
        })) {
          setDraft(null);
        } else {
          settleDraft(store, value, base, () => {
            if (draft() === current) {
              setDraft(null);
            }
          });
        }
      }
    });
  }
  const spans = {
    /** Joins a track's element, so drags find it. Return its cleanup from the track slot's `bind`. */
    bindTrack(el, track) {
      tracks.set(track, el);
      return () => {
        if (tracks.get(track) === el) {
          tracks.delete(track);
        }
      };
    },
    /** Joins a span's element. Return its cleanup from the span slot's `bind`. */
    bindSpan(el, id) {
      elements.set(id, el);
      return () => {
        if (elements.get(id) === el) {
          elements.delete(id);
        }
      };
    },
    /** The spans to render: the draft's while a pointer drags, else the value. Pure, so `state` and `attrs` can call it. */
    spans(state) {
      return state[options.draft]?.spans ?? state[options.key];
    },
    /** One track's spans, from `spans(state)`. */
    spansOn(state, track) {
      return spans.spans(state).filter((span) => span.track === track);
    },
    /** What a pointer is doing to a span, if anything. */
    action(state, id) {
      const current = state[options.draft];
      return current?.id === id ? current.action : void 0;
    },
    /**
     * A span's place in its track, as a `style` attribute: its start and
     * length in percentages along the axis, and its lane across it from
     * `stackSpans`, if passed. Also `--span-start` and `--span-size`, from 0 to 1.
     */
    spanStyle(span, lane) {
      const range = max() - min() || 1;
      const from = (span.start - min()) / range;
      const size = (span.end - span.start) / range;
      const percent = (n) => `${Math.round(n * 1e4) / 100}%`;
      const [along, length, across, breadth] = axis() === "y" ? ["top", "height", "inset-inline-start", "width"] : ["inset-inline-start", "width", "top", "height"];
      const lanes = lane ? `;${across}:${percent(lane.lane / lane.lanes)};${breadth}:${percent(1 / lane.lanes)}` : "";
      return `position:absolute;${along}:${percent(from)};${length}:${percent(size)}${lanes};--span-start:${from};--span-size:${size}`;
    },
    /** A span's attributes: `data-span-id` for drags to find it, and `data-dragging`, `data-resizing` or `data-drawing` while a pointer does. */
    spanAttrs(state, id) {
      const action = spans.action(state, id);
      return {
        "data-span-id": id,
        "data-dragging": action === "move" ? "" : void 0,
        "data-resizing": action === "resize" ? "" : void 0,
        "data-drawing": action === "draw" ? "" : void 0
      };
    },
    /** The value under a point on a track, snapped. For a hover line or a "new event at" menu. */
    valueAt: (track, x, y) => snap(valueAt(track, x, y)),
    /**
     * Draws a span from where a track was pressed, once the pointer moves a
     * few pixels; a click makes one `size` long, if `size` is set. Presses
     * on a span are left to `spanPointerdown`.
     */
    trackPointerdown(event, track) {
      const el = tracks.get(track);
      const target = event.target;
      if (!el || !drags.accepts(event) || !options.create || target?.closest("[data-span-id]")) {
        return;
      }
      const at = snap(valueAt(track, event.clientX, event.clientY), Math.floor);
      const base = options.create({
        id: "",
        track,
        start: at,
        end: at + step()
      });
      if (!base) {
        return;
      }
      const made = (start, end) => fit({ ...base, track, start, end }, "start");
      drag(
        el,
        event,
        base.id,
        "draw",
        (x, y) => {
          const v = valueAt(track, x, y);
          return v >= at ? made(at, snap(v, Math.ceil)) : fit(
            { ...base, start: snap(v, Math.floor), end: at + step() },
            "end"
          );
        },
        () => {
          const size = options.size?.();
          if (size === void 0) {
            return;
          }
          const span = fit({ ...base, start: at, end: at + size }, "size");
          const next = replaced(value(), span);
          if (allowed(next, span)) {
            commit(next, { reason: "drag", event, id: span.id, action: "draw" });
          }
        }
      );
      event.preventDefault();
    },
    /**
     * Moves a span, or resizes it from an edge marked `data-span-edge`, once
     * the pointer moves a few pixels, so a click stays a click.
     */
    spanPointerdown(event, id) {
      const el = elements.get(id);
      const span = value().find((other) => other.id === id);
      if (!el || !span || !drags.accepts(event) || options.disabled?.(span)) {
        return;
      }
      const edge = event.target?.closest(
        "[data-span-edge]"
      )?.dataset.spanEdge;
      const grabbed = valueAt(span.track, event.clientX, event.clientY) - span.start;
      if (edge === "start" || edge === "end") {
        drag(el, event, id, "resize", (x, y) => {
          const v = snap(valueAt(span.track, x, y));
          return edge === "start" ? fit({ ...span, start: v }, "end") : fit({ ...span, end: v }, "start");
        });
      } else {
        drag(el, event, id, "move", (x, y) => {
          const track = trackAt(x, y) ?? span.track;
          const start = snap(valueAt(track, x, y) - grabbed);
          return fit(
            { ...span, track, start, end: start + span.end - span.start },
            "size"
          );
        });
      }
    },
    /**
     * Handles a key on a span and returns whether it did. Arrows along the
     * axis move it a step, with Shift they move its end; arrows across move
     * it to the next track; Delete and Backspace delete it. Each change
     * commits, and screen readers hear the span's new place.
     */
    keydown(event, id) {
      const span = value().find((other) => other.id === id);
      if (!span || event.defaultPrevented || draft() || event.altKey || event.ctrlKey || event.metaKey) {
        return false;
      }
      const target = event.target;
      if (options.disabled?.(span) || target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? "")) {
        return false;
      }
      const rtl = event.target instanceof Element && isRTL(event.target);
      const keys = axis() === "y" ? {
        back: "ArrowUp",
        forward: "ArrowDown",
        before: rtl ? "ArrowRight" : "ArrowLeft",
        after: rtl ? "ArrowLeft" : "ArrowRight"
      } : {
        back: rtl ? "ArrowRight" : "ArrowLeft",
        forward: rtl ? "ArrowLeft" : "ArrowRight",
        before: "ArrowUp",
        after: "ArrowDown"
      };
      let next;
      let action = "move";
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        return commit(
          value().filter((other) => other.id !== id),
          { reason: "remove-press", event, id, action: "delete" }
        );
      } else if (event.key === keys.back || event.key === keys.forward) {
        const by = event.key === keys.forward ? step() : -step();
        if (event.shiftKey) {
          action = "resize";
          next = fit({ ...span, end: span.end + by }, "start");
        } else {
          next = fit(
            { ...span, start: span.start + by, end: span.end + by },
            "size"
          );
        }
      } else if ((event.key === keys.before || event.key === keys.after) && !event.shiftKey) {
        const names = order();
        const track = names[names.indexOf(span.track) + (event.key === keys.after ? 1 : -1)];
        if (track !== void 0) {
          next = { ...span, track };
        }
      }
      if (!next) {
        return false;
      }
      event.preventDefault();
      const result = replaced(value(), next);
      if (next.start === span.start && next.end === span.end && next.track === span.track) {
        return true;
      }
      if (allowed(result, next) && commit(result, { reason: "move-key", event, id, action }) && next.track !== span.track) {
        focusLater(id);
      }
      return true;
    },
    /** Changes a span at once, like from a form. Returns whether it went through. */
    update(id, patch) {
      const span = value().find((other) => other.id === id);
      if (!span) {
        return false;
      }
      const keep = patch.start === void 0 ? "start" : patch.end === void 0 ? "end" : "size";
      const next = fit({ ...span, ...patch }, keep);
      const result = replaced(value(), next);
      return allowed(result, next) && commit(result, { reason: "imperative", id, action: "move" });
    },
    /** Deletes a span. Returns whether it went through. */
    remove(id) {
      if (!value().some((other) => other.id === id)) {
        return false;
      }
      return commit(
        value().filter((other) => other.id !== id),
        { reason: "imperative", id, action: "delete" }
      );
    },
    /** Ends a pointer drag and puts its span back. */
    cancel() {
      drags.cancel();
      setDraft(null);
    }
  };
  return spans;
}
export {
  createSpans,
  isSpanFree,
  spansMessage,
  stackSpans
};
