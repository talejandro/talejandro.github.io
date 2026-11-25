// src/foundation/direct-manipulation/swipe-actions.ts
import { isRTL } from "../platform/env.js";
import { on } from "../kernel/events.js";
import { createDragSession } from "../drag-and-drop/pointer.js";
import { rubberBand } from "../motion/rubber-band.js";
import { createVelocityTracker } from "../motion/velocity.js";
var slop = 8;
var flick = 0.3;
function createSwipeActions(context, options) {
  const { store } = context;
  const rows = /* @__PURE__ */ new Map();
  const actions = /* @__PURE__ */ new Map();
  const actionsId = (key, side) => `${side}:${key}`;
  const drags = createDragSession(context.onDestroy);
  let offOutside;
  context.onDestroy(() => offOutside?.());
  const open = () => store.get()[options.key];
  const rtl = (key) => {
    const el = rows.get(key);
    return !!el && isRTL(el);
  };
  const sign = (key, side) => side === "start" !== rtl(key) ? 1 : -1;
  const sideOf = (key, x) => x > 0 !== rtl(key) ? "start" : "end";
  const width = (key, side) => actions.get(actionsId(key, side))?.getBoundingClientRect().width ?? 0;
  const buttons = (key, side) => [
    ...actions.get(actionsId(key, side))?.querySelectorAll("button, [href], [tabindex]") ?? []
  ];
  function setOpen(next) {
    store.set({ [options.key]: next, [options.draft]: null });
    offOutside?.();
    offOutside = void 0;
    if (!next) {
      return;
    }
    const doc = rows.get(next.key)?.ownerDocument;
    if (doc) {
      offOutside = on(
        doc,
        "pointerdown",
        (event) => {
          if (event.isPrimary && !rows.get(next.key)?.contains(event.target)) {
            api.close();
          }
        },
        { capture: true }
      );
    }
  }
  const api = {
    /** The row whose actions show, if any. */
    open,
    /** How far a row has moved, in pixels, positive to the right: the swipe's, or the open side's width. */
    offset(state, key) {
      const swiping = state[options.draft];
      if (swiping?.key === key) {
        return swiping.x;
      }
      const shown = state[options.key];
      return shown?.key === key ? sign(key, shown.side) * width(key, shown.side) : 0;
    },
    /**
     * Live attributes for the row's moving content: `--swipe-x`, its offset;
     * `data-swipe`, the side it shows, to show only that side's actions;
     * `data-swiping` while a pointer moves it, to turn off a transition; and
     * `data-full` while letting go would run the first action.
     */
    contentAttrs(state, key) {
      const swiping = state[options.draft];
      const mine = swiping?.key === key;
      const x = api.offset(state, key);
      return {
        style: `--swipe-x:${x}px`,
        "data-swipe": x ? sideOf(key, x) : void 0,
        "data-swiping": mine ? "" : void 0,
        "data-full": mine && swiping.full ? "" : void 0
      };
    },
    /** The actions on a side: `data-side`, and `inert` unless the row is open on that side, so Tab skips hidden buttons. */
    actionsAttrs(state, key, side) {
      const shown = state[options.key];
      const visible = shown?.key === key && shown.side === side;
      return { "data-side": side, inert: visible ? void 0 : "" };
    },
    /** Joins a row, for its direction and to close it on a press elsewhere. Return its cleanup from `bind`. */
    bindRow(el, key) {
      rows.set(key, el);
      return () => {
        if (rows.get(key) === el) {
          rows.delete(key);
        }
      };
    },
    /** Joins the actions on one side of a row, which a swipe measures to know how far it opens. */
    bindActions(el, key, side) {
      const id = actionsId(key, side);
      actions.set(id, el);
      return () => {
        if (actions.get(id) === el) {
          actions.delete(id);
        }
      };
    },
    /** Opens a row's actions on a side, closing any other row's. With `focus`, its first action takes focus. */
    show(key, side, { focus = false } = {}) {
      if (!width(key, side) || options.disabled?.(key)) {
        return false;
      }
      setOpen({ key, side });
      if (focus) {
        const el = actions.get(actionsId(key, side));
        if (el) {
          el.inert = false;
        }
        buttons(key, side)[0]?.focus();
      }
      return true;
    },
    /** Closes the open row. With `focus`, the row takes focus back, as after Escape. */
    close({ focus = false } = {}) {
      const shown = open();
      if (!shown) {
        return false;
      }
      if (focus) {
        rows.get(shown.key)?.focus();
      }
      setOpen(null);
      return true;
    },
    /**
     * Follows a press on a row that may become a swipe across it. The press
     * stays a press until the pointer moves a few pixels across, so clicks
     * and vertical scrolls keep working.
     */
    pointerdown(event, key, el) {
      if (!drags.accepts(event) || options.disabled?.(key)) {
        return;
      }
      const shown = open();
      if (shown?.key === key && actions.get(actionsId(key, shown.side))?.contains(event.target)) {
        return;
      }
      const from = shown?.key === key ? sign(key, shown.side) * width(key, shown.side) : 0;
      if (!from && !width(key, "start") && !width(key, "end")) {
        return;
      }
      const rowWidth = el.getBoundingClientRect().width || 1;
      const fraction = options.fullSwipe?.() ?? 0.6;
      const velocity = createVelocityTracker();
      velocity.add(event.timeStamp, event.clientX);
      let last = { x: from, side: sideOf(key, from), full: false };
      const place = (dx) => {
        const raw = from + dx;
        const side = sideOf(key, raw);
        const room = width(key, side);
        const full = !!options.onFullSwipe && room > 0;
        const limit = full ? rowWidth : room;
        const past = Math.abs(raw) - limit;
        const x = past > 0 ? Math.sign(raw) * (limit + rubberBand(past, rowWidth)) : raw;
        last = { x, side, full: full && Math.abs(raw) >= rowWidth * fraction };
        store.set({ [options.draft]: { key, ...last } });
      };
      const finish = (end, canceled) => {
        if (options.disabled?.(key)) {
          return setOpen(null);
        }
        const { x, side, full } = last;
        if (!canceled && full && options.onFullSwipe?.(key, side, { event: end })) {
          return setOpen(null);
        }
        const room = width(key, side);
        const speed = canceled ? 0 : velocity.velocity(end.timeStamp);
        const opening = Math.abs(speed) >= flick ? Math.sign(speed) === Math.sign(x) : Math.abs(x) >= room / 2;
        setOpen(opening && room && x ? { key, side } : null);
      };
      drags.startOnMove(el, event, {
        pick(move) {
          const dx = move.clientX - event.clientX;
          const dy = move.clientY - event.clientY;
          if (Math.hypot(dx, dy) < slop) {
            return void 0;
          }
          if (Math.abs(dy) >= Math.abs(dx)) {
            return false;
          }
          velocity.add(move.timeStamp, move.clientX);
          place(dx);
          return true;
        },
        onMove: ({ x, event: next }) => {
          velocity.add(next.timeStamp, x);
          place(x - event.clientX);
        },
        onEnd: finish,
        // A tap on an open row closes it, as a tap on its content would on a phone.
        onTap: () => from && api.close()
      });
    },
    /**
     * Handles a key on a row or its actions and returns whether it did. Left
     * and Right open the actions on the side the row would swipe toward and
     * focus the first, then move between them; toward the row's content from
     * the last one, or Escape, closes them and puts focus back on the row.
     */
    keydown(event, key) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return false;
      }
      const shown = open()?.key === key ? open() : null;
      if (event.key === "Escape" && shown) {
        event.preventDefault();
        return api.close({ focus: true });
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return false;
      }
      const dx = event.key === "ArrowRight" ? 1 : -1;
      if (!shown) {
        if (!api.show(key, sideOf(key, dx), { focus: true })) {
          return false;
        }
        event.preventDefault();
        return true;
      }
      event.preventDefault();
      const list = buttons(key, shown.side);
      const index = list.indexOf(event.target);
      const next = index === -1 ? 0 : index + (rtl(key) ? -dx : dx);
      if (index === -1 ? dx === sign(key, shown.side) : next < 0 || next >= list.length) {
        if (dx === sign(key, shown.side)) {
          api.close({ focus: true });
        }
        return true;
      }
      list[next].focus();
      return true;
    }
  };
  return api;
}
export {
  createSwipeActions
};
