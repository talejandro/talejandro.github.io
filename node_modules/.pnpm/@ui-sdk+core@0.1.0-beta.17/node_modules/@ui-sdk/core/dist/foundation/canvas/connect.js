// src/foundation/canvas/connect.ts
import { elements } from "../kernel/elements.js";
import { announce } from "../platform/announce.js";
import { createDragSession } from "../drag-and-drop/pointer.js";
import { nearestInDirection } from "../focus/spatial.js";
function connectMessage(message, label) {
  if (message.type === "start") {
    return `Connecting from ${label(message.from)}. Arrows choose a port, Enter connects, Escape cancels.`;
  }
  if (message.type === "target") {
    return `To ${label(message.to)}.`;
  }
  if (message.type === "connect") {
    return `Connected ${label(message.from)} to ${label(message.to)}.`;
  }
  return "Canceled.";
}
var arrows = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};
var center = (el) => {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
function createConnect(context, options) {
  const { store } = context;
  const draft = () => store.get()[options.draft];
  const setDraft = (value) => store.set({ [options.draft]: value });
  const point = (x, y) => options.point?.(x, y) ?? { x, y };
  const label = (key) => options.label?.(key) ?? key;
  const say = (message) => announce((options.message ?? connectMessage)(message, label), {
    priority: "assertive"
  });
  const can = (from, to) => from !== to && (options.canConnect?.(from, to) ?? true);
  const ports = () => elements(context, options.slot);
  const drags = createDragSession(context.onDestroy);
  const api = {
    /** Whether a connection is being drawn. */
    active() {
      return !!draft();
    },
    /** Starts a connection from a port with the keyboard. Returns whether it started. */
    start(from) {
      const el = ports().find((port) => port.key === from)?.el;
      if (!el || !ports().some((port) => can(from, port.key))) {
        return false;
      }
      const at = center(el);
      setDraft({ from, to: null, ...point(at.x, at.y), keyboard: true });
      say({ type: "start", from });
      return true;
    },
    /** Points the connection at a port, or at none. */
    target(to) {
      const current = draft();
      if (!current || to && !can(current.from, to)) {
        return false;
      }
      const el = to ? ports().find((port) => port.key === to)?.el : void 0;
      const at = el ? center(el) : void 0;
      setDraft({ ...current, to, ...at ? point(at.x, at.y) : {} });
      if (to) {
        say({ type: "target", from: current.from, to });
      }
      return true;
    },
    /** Makes the connection the draft points at, and ends it. */
    commit(details = {
      reason: "connect-key"
    }) {
      const current = draft();
      setDraft(null);
      if (!current?.to) {
        return false;
      }
      const done = options.connect(current.from, current.to, details);
      if (done) {
        say({ type: "connect", from: current.from, to: current.to });
      }
      return done;
    },
    /** Lets go of the connection without making it. */
    cancel() {
      const current = draft();
      drags.cancel();
      setDraft(null);
      if (current?.keyboard) {
        say({ type: "cancel", from: current.from });
      }
    },
    /**
     * While connecting from the keyboard: arrows go to the nearest port that
     * can take it in their direction, Enter or Space connects, Escape and Tab
     * let go. Returns whether it handled the key.
     */
    keydown(event) {
      const current = draft();
      if (!current) {
        return false;
      }
      const direction = arrows[event.key];
      if (direction) {
        event.preventDefault();
        const all = ports();
        const fromEl = all.find(
          (port) => port.key === (current.to ?? current.from)
        )?.el;
        if (!fromEl) {
          return true;
        }
        const candidates = all.filter(
          (port) => port.key !== current.to && can(current.from, port.key)
        ).map((port) => ({
          key: port.key,
          rect: port.el.getBoundingClientRect()
        }));
        const next = nearestInDirection(
          fromEl.getBoundingClientRect(),
          candidates,
          direction
        );
        if (next) {
          api.target(next);
        }
        return true;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (current.to) {
          api.commit({ reason: "connect-key", event });
        }
        return true;
      }
      if (event.key === "Escape" || event.key === "Tab") {
        if (event.key === "Escape") {
          event.preventDefault();
        }
        api.cancel();
        return true;
      }
      return false;
    },
    /** Drags a loose line out of a port; letting go near a port that can take it connects. */
    pointerdown(event, from, el) {
      if (!drags.accepts(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const radius = options.radius?.() ?? 28;
      const targets = ports().filter((port) => can(from, port.key)).map((port) => ({ key: port.key, at: center(port.el) }));
      const nearest = (x, y) => {
        let best;
        for (const target of targets) {
          const distance = Math.hypot(target.at.x - x, target.at.y - y);
          if (distance <= radius && (!best || distance < best.distance)) {
            best = { key: target.key, distance };
          }
        }
        return best ? targets.find((target) => target.key === best.key) : void 0;
      };
      setDraft({
        from,
        to: null,
        ...point(event.clientX, event.clientY),
        keyboard: false
      });
      drags.start(el, event, {
        cancelOnEscape: true,
        onMove: ({ x, y }) => {
          const near = nearest(x, y);
          setDraft({
            from,
            to: near?.key ?? null,
            ...near ? point(near.at.x, near.at.y) : point(x, y),
            keyboard: false
          });
        },
        onEnd: (end, canceled) => {
          if (canceled) {
            api.cancel();
          } else {
            api.commit({ reason: "drag", event: end });
          }
        }
      });
    },
    /** A port's part in the connection being drawn, for a data attribute: `source`, `target`, `candidate`, or `undefined`. */
    role(state, key) {
      const current = state[options.draft];
      if (!current) {
        return void 0;
      }
      if (current.from === key) {
        return "source";
      }
      if (current.to === key) {
        return "target";
      }
      return can(current.from, key) ? "candidate" : void 0;
    }
  };
  return api;
}
export {
  connectMessage,
  createConnect
};
