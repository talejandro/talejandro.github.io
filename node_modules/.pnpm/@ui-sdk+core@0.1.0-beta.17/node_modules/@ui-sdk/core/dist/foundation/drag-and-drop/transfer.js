// src/foundation/drag-and-drop/transfer.ts
import { announce } from "../platform/announce.js";
import { createAutoScroll } from "./auto-scroll.js";
import { bindDragPreview } from "./drag-preview.js";
import { createDraftMove } from "./draft-move.js";
import { isRTL } from "../platform/env.js";
import { createDragSession, dragThreshold } from "./pointer.js";
import { labelOf } from "../text/typeahead.js";
import { dropIndex } from "./reorder.js";
function transferMessage({
  type,
  label,
  list,
  position,
  total
}) {
  const at = `${list}, position ${position} of ${total}`;
  if (type === "grab") {
    return `Picked up ${label}, ${at}.`;
  }
  if (type === "move") {
    return `${label}, ${at}.`;
  }
  if (type === "drop") {
    return `Dropped ${label} in ${at}.`;
  }
  return `Moved ${label} back to ${at}.`;
}
function transferred(lists, key, list, index) {
  const next = {};
  for (const [name, keys] of Object.entries(lists)) {
    next[name] = keys.filter((k) => k !== key);
  }
  const target = [...next[list] ?? []];
  target.splice(Math.max(0, Math.min(target.length, index)), 0, key);
  next[list] = target;
  return next;
}
var listWith = (lists, key) => Object.keys(lists).find((list) => lists[list].includes(key));
var sameLists = (a, b) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(
    (list) => a[list].length === b[list]?.length && a[list].every((key, i) => b[list][i] === key)
  );
};
function createTransfer(context, options) {
  const { store } = context;
  const items = /* @__PURE__ */ new Map();
  const lists = /* @__PURE__ */ new Map();
  const { draft, value, setDraft, focusLater, drop, cancel } = createDraftMove({
    store,
    draft: options.draft,
    value: options.key,
    shown: (current) => current.lists,
    same: sameLists,
    rebase(current, now, moved) {
      const from = listWith(now, current.key);
      if (from === void 0) {
        return null;
      }
      if (!moved) {
        return { ...current, from, lists: now };
      }
      const list = listWith(current.lists, current.key);
      if (!now[list] || list !== from && options.accepts && !options.accepts(current.key, list)) {
        return null;
      }
      const keys = current.lists[list];
      const index = keys.slice(0, keys.indexOf(current.key)).filter((key) => now[list].includes(key)).length;
      return {
        ...current,
        from,
        lists: transferred(now, current.key, list, index)
      };
    },
    commit(current, details) {
      const to = listWith(current.lists, current.key) ?? current.from;
      const index = current.lists[to]?.indexOf(current.key) ?? 0;
      return options.set(current.lists, {
        ...details,
        key: current.key,
        from: current.from,
        to,
        index
      });
    },
    say: (type, current, lists2) => say(type, current.key, lists2),
    element: (key) => items.get(key)
  });
  const order = () => options.order?.() ?? Object.keys(value());
  function say(type, key, current) {
    const el = items.get(key);
    const list = listWith(current, key) ?? "";
    const message = {
      type,
      key,
      label: options.label?.(key) ?? (el ? labelOf(el) : key),
      list: options.listLabel?.(list) ?? list,
      position: (current[list]?.indexOf(key) ?? 0) + 1,
      total: current[list]?.length ?? 0
    };
    announce((options.message ?? transferMessage)(message), {
      priority: "assertive"
    });
  }
  function grab(key, pointer) {
    const from = listWith(value(), key);
    if (draft() || from === void 0 || options.disabled?.(key)) {
      return false;
    }
    setDraft({ key, from, lists: value(), pointer });
    say("grab", key, value());
    return true;
  }
  function moveTo(list, index) {
    const current = draft();
    if (!current) {
      return false;
    }
    const changesList = list !== listWith(current.lists, current.key);
    if (changesList && options.accepts && !options.accepts(current.key, list)) {
      return false;
    }
    const next = transferred(current.lists, current.key, list, index);
    if (sameLists(next, current.lists)) {
      return false;
    }
    setDraft({ ...current, lists: next });
    say("move", current.key, next);
    if (!current.pointer) {
      focusLater(current.key);
    }
    return true;
  }
  function listAt(x, y) {
    let best;
    for (const [list, el] of lists) {
      if (!el.isConnected) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
      const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      const distance = Math.hypot(dx, dy);
      if (!best || distance < best.distance) {
        best = { list, distance };
      }
    }
    return best?.list;
  }
  const drags = createDragSession(context.onDestroy);
  function pointerdown(event, key) {
    const start = items.get(key);
    if (!start || !drags.accepts(event) || draft()) {
      return;
    }
    let pointer = { x: event.clientX, y: event.clientY };
    let dragging = false;
    let focused = false;
    let lastMove;
    let preview;
    const track = () => {
      const current = draft();
      const list = listAt(pointer.x, pointer.y);
      if (!current || list === void 0) {
        return;
      }
      const others = (current.lists[list] ?? []).filter((k) => k !== key);
      const middles = others.map((k) => {
        const rect = items.get(k)?.getBoundingClientRect();
        return rect ? rect.top + rect.height / 2 : 0;
      });
      moveTo(list, dropIndex(middles, pointer.y));
    };
    const scroller = options.createAutoScroll === false ? void 0 : createAutoScroll({
      ...options.createAutoScroll,
      ignore: () => items.get(key),
      onScroll: track
    });
    drags.start(start, event, {
      threshold: dragThreshold,
      cancelOnEscape: true,
      onStart: () => {
        if (!grab(key, true)) {
          return false;
        }
        preview = bindDragPreview(start, { x: event.clientX, y: event.clientY });
        preview.el.removeAttribute("data-moving");
        preview.el.removeAttribute("data-dragging");
        dragging = true;
        focused = start.contains(start.ownerDocument.activeElement);
      },
      onMove: ({ x, y, event: moveEvent }) => {
        moveEvent.preventDefault();
        lastMove = moveEvent;
        pointer = { x, y };
        preview?.move(x, y);
        scroller?.update(x, y);
        track();
      },
      onEnd: (endEvent, canceled) => {
        const dragged = dragging;
        scroller?.stop();
        preview?.remove();
        preview = void 0;
        dragging = false;
        if (!dragged) {
          return;
        }
        if (canceled) {
          cancel();
        } else {
          drop("drag", lastMove ?? endEvent);
        }
        if (focused) {
          focusLater(key);
        }
      }
    });
  }
  const transfer = {
    /** Joins a list's element, so drags find it. Return its cleanup from the list slot's `bind`. */
    bindList(el, list) {
      lists.set(list, el);
      return () => {
        if (lists.get(list) === el) {
          lists.delete(list);
        }
      };
    },
    /** Joins an item's element. Return its cleanup from the item slot's `bind`. */
    bindItem(el, key) {
      items.set(key, el);
      return () => {
        if (items.get(key) === el) {
          items.delete(key);
        }
      };
    },
    /** The lists to render: the draft's while an item moves, else the value. Pure, so `state` and `attrs` can call it. */
    lists(state) {
      return state[options.draft]?.lists ?? state[options.key];
    },
    /** Whether an item is being moved. */
    moving(state, key) {
      return state[options.draft]?.key === key;
    },
    /** Whether a pointer is dragging the item. */
    dragging(state, key) {
      const current = state[options.draft];
      return current?.key === key && current.pointer;
    },
    /**
     * Handles a key pressed on an item and returns whether it did. Space or
     * Enter picks the item up; while it's up, Up and Down move it in its
     * list, Home and End to its ends, Left and Right to the next list that
     * takes it, Space or Enter drops it, Escape puts it back and Tab puts it
     * back and moves on. Every other key is swallowed while it's up.
     */
    keydown(event, key) {
      const current = draft();
      if (event.defaultPrevented || current?.pointer) {
        return !!current;
      }
      const modified = event.altKey || event.ctrlKey || event.metaKey;
      if (!current) {
        if (modified || event.key !== " " && event.key !== "Enter" || !grab(key, false)) {
          return false;
        }
        event.preventDefault();
        return true;
      }
      if (event.key === "Tab") {
        cancel(false);
        return true;
      }
      const list = listWith(current.lists, current.key) ?? current.from;
      const index = current.lists[list].indexOf(current.key);
      const rtl = event.target instanceof Element && isRTL(event.target);
      const across = event.key === "ArrowLeft" ? rtl ? 1 : -1 : event.key === "ArrowRight" ? rtl ? -1 : 1 : 0;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        drop("move-key", event);
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        moveTo(list, index + (event.key === "ArrowUp" ? -1 : 1));
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        moveTo(list, event.key === "Home" ? 0 : current.lists[list].length);
      } else if (across && !modified) {
        event.preventDefault();
        const names = order();
        for (let i = names.indexOf(list) + across; i >= 0 && i < names.length; i += across) {
          if (moveTo(names[i], index)) {
            break;
          }
        }
      }
      return true;
    },
    /** Starts a pointer drag of an item once the pointer moves a few pixels, so a click stays a click. */
    pointerdown,
    /** Picks an item up, as Space does. Returns whether it did. */
    grab: (key) => grab(key, false),
    /** Moves the picked-up item to `index` in `list`, in the draft. Returns whether it moved. */
    moveTo,
    /** Drops the picked-up item where it is, committing the draft. */
    drop: (event) => drop("move-key", event),
    /** Puts the picked-up item back where it was. */
    cancel: () => cancel(),
    /** Moves an item to `index` in `list` at once, like a "Move to Done" menu item. Returns whether it went through. */
    move(key, list, index) {
      const from = listWith(value(), key);
      if (from === void 0 || from !== list && options.accepts && !options.accepts(key, list)) {
        return false;
      }
      const next = transferred(value(), key, list, index);
      if (sameLists(next, value())) {
        return false;
      }
      if (!options.set(next, { reason: "imperative", key, from, to: list, index })) {
        return false;
      }
      say("drop", key, next);
      return true;
    }
  };
  return transfer;
}
export {
  createTransfer,
  transferMessage
};
