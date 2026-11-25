// src/foundation/drag-and-drop/tree-reorder.ts
import { announce } from "../platform/announce.js";
import { createAutoScroll } from "./auto-scroll.js";
import { bindDragPreview } from "./drag-preview.js";
import { createDraftMove } from "./draft-move.js";
import { isRTL } from "../platform/env.js";
import { createDragSession, dragThreshold } from "./pointer.js";
import { labelOf } from "../text/typeahead.js";
import { dropIndex } from "./reorder.js";
function treeReorderMessage({
  type,
  label,
  parent,
  level,
  position,
  total
}) {
  const at = `level ${level}${parent ? ` in ${parent}` : ""}, position ${position} of ${total}`;
  if (type === "grab") {
    return `Picked up ${label}, ${at}.`;
  }
  if (type === "move") {
    return `${label}, ${at}.`;
  }
  if (type === "drop") {
    return `Dropped ${label} at ${at}.`;
  }
  return `Moved ${label} back to ${at}.`;
}
function subtreeEnd(rows, index) {
  let end = index + 1;
  while (end < rows.length && rows[end].depth > rows[index].depth) {
    end++;
  }
  return end;
}
function placeOf(rows, index) {
  const depth = rows[index].depth;
  let parent;
  let position = 0;
  for (let i = index - 1; i >= 0 && parent === void 0; i--) {
    if (rows[i].depth === depth) {
      position++;
    } else if (rows[i].depth < depth) {
      parent = i;
    }
  }
  return { parent, position };
}
function depthRange(above, below, maxDepth = Infinity) {
  const max = Math.min(maxDepth, above ? above.depth + 1 : 0);
  const min = below ? below.depth : 0;
  return { min: Math.min(min, max), max };
}
function blockMaxDepth(rows, keys, maxDepth) {
  if (maxDepth === void 0) {
    return void 0;
  }
  const block = rows.filter((row) => keys.has(row.key));
  const below = Math.max(...block.map((row) => row.depth)) - block[0].depth;
  return Math.max(0, maxDepth - below);
}
function movedRows(rows, key, before, depth) {
  const from = rows.findIndex((row) => row.key === key);
  if (from < 0) {
    return rows;
  }
  const end = subtreeEnd(rows, from);
  const shift = depth - rows[from].depth;
  const block = rows.slice(from, end).map((row) => shift ? { key: row.key, depth: row.depth + shift } : row);
  const rest = [...rows.slice(0, from), ...rows.slice(end)];
  const at = before === null ? rest.length : rest.findIndex((row) => row.key === before);
  if (at < 0) {
    return rows;
  }
  if (!shift && at === from) {
    return rows;
  }
  rest.splice(at, 0, ...block);
  return rest;
}
function placedRows(rows, key, before, depth, maxDepth) {
  const from = rows.findIndex((row) => row.key === key);
  if (from < 0) {
    return rows;
  }
  const block = new Set(
    rows.slice(from, subtreeEnd(rows, from)).map((row) => row.key)
  );
  const rest = rows.filter((row) => !block.has(row.key));
  const at = before === null ? rest.length : rest.findIndex((row) => row.key === before);
  const range = depthRange(
    rest[at - 1],
    rest[at],
    blockMaxDepth(rows, block, maxDepth)
  );
  return movedRows(
    rows,
    key,
    before,
    Math.max(range.min, Math.min(range.max, depth))
  );
}
var sameRows = (a, b) => a.length === b.length && a.every((row, i) => row.key === b[i].key && row.depth === b[i].depth);
function createTreeReorder(context, options) {
  const { store } = context;
  const elements = /* @__PURE__ */ new Map();
  const { draft, value, setDraft, focusLater, drop, cancel } = createDraftMove({
    store,
    draft: options.draft,
    value: options.key,
    shown: (current) => current.rows,
    same: sameRows,
    rebase(current, now, moved) {
      const index = now.findIndex((row) => row.key === current.key);
      if (index < 0) {
        return null;
      }
      const keys = now.slice(index, subtreeEnd(now, index)).map((row) => row.key);
      if (!moved) {
        return { ...current, keys, rows: now };
      }
      const present = new Set(now.map((row) => row.key));
      const at = current.rows.findIndex((row) => row.key === current.key);
      const before = current.rows.slice(at).find(
        (row) => present.has(row.key) && !current.keys.includes(row.key) && !keys.includes(row.key)
      );
      const rows = placedRows(
        now,
        current.key,
        before?.key ?? null,
        current.rows[at].depth,
        options.maxDepth?.()
      );
      return { ...current, keys, rows };
    },
    commit: (current, details) => commit(current.rows, current.key, details),
    say: (type, current, rows) => say(type, current.key, rows),
    element: (key) => elements.get(key)
  });
  const shown = (row) => !!elements.get(row.key)?.isConnected;
  function say(type, key, rows) {
    const index = rows.findIndex((row) => row.key === key);
    if (index < 0) {
      return;
    }
    const { parent, position } = placeOf(rows, index);
    let total = 0;
    const depth = rows[index].depth;
    for (let i = parent === void 0 ? 0 : parent + 1; i < rows.length && rows[i].depth >= depth; i++) {
      if (rows[i].depth === depth) {
        total++;
      }
    }
    const name = (k) => options.label?.(k) ?? (elements.get(k) ? labelOf(elements.get(k)) : k);
    const message = {
      type,
      key,
      label: name(key),
      parent: parent === void 0 ? void 0 : name(rows[parent].key),
      level: depth + 1,
      position: position + 1,
      total
    };
    announce((options.message ?? treeReorderMessage)(message), {
      priority: "assertive"
    });
  }
  let aim = 0;
  function grab(key, pointer) {
    const rows = value();
    const index = rows.findIndex((row) => row.key === key);
    if (draft() || index < 0 || options.disabled?.(key)) {
      return false;
    }
    aim = rows[index].depth;
    const keys = rows.slice(index, subtreeEnd(rows, index)).map((row) => row.key);
    setDraft({ key, keys, rows, pointer });
    say("grab", key, rows);
    return true;
  }
  function slots(current) {
    const others = current.rows.filter(
      (row) => !current.keys.includes(row.key) && shown(row)
    );
    const at = current.rows.findIndex((row) => row.key === current.key);
    const slot = current.rows.slice(0, at).filter((row) => !current.keys.includes(row.key) && shown(row)).length;
    return { others, slot, depth: current.rows[at].depth };
  }
  function place(slot, depth) {
    const current = draft();
    if (!current) {
      return false;
    }
    const { others } = slots(current);
    const to = Math.max(0, Math.min(others.length, slot));
    const deepest = blockMaxDepth(
      current.rows,
      new Set(current.keys),
      options.maxDepth?.()
    );
    const range = depthRange(others[to - 1], others[to], deepest);
    const fitted = Math.max(range.min, Math.min(range.max, depth));
    const rows = movedRows(
      current.rows,
      current.key,
      others[to]?.key ?? null,
      fitted
    );
    if (rows === current.rows) {
      return false;
    }
    setDraft({ ...current, rows });
    say("move", current.key, rows);
    if (!current.pointer) {
      focusLater(current.key);
    }
    return true;
  }
  function commit(rows, key, details) {
    const index = rows.findIndex((row) => row.key === key);
    const { parent, position } = placeOf(rows, index);
    return options.set(rows, {
      ...details,
      key,
      parent: parent === void 0 ? null : rows[parent].key,
      index: position
    });
  }
  const drags = createDragSession(context.onDestroy);
  function pointerdown(event, key) {
    const el = elements.get(key);
    if (!el || !drags.accepts(event) || draft()) {
      return;
    }
    const start = { x: event.clientX, y: event.clientY };
    let point = start;
    let startDepth = 0;
    let lastMove;
    let preview;
    let dragging = false;
    const track = () => {
      const current = draft();
      if (!current) {
        return;
      }
      const { others } = slots(current);
      const middles = others.map((row) => {
        const rect = elements.get(row.key).getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const sideways = (point.x - start.x) * (isRTL(el) ? -1 : 1);
      place(
        dropIndex(middles, point.y),
        startDepth + Math.round(sideways / (options.indent?.() ?? 24))
      );
    };
    const scroller = !options.preview || options.createAutoScroll === false ? void 0 : createAutoScroll({
      ...options.createAutoScroll,
      ignore: () => elements.get(key),
      onScroll: track
    });
    drags.start(el, event, {
      threshold: dragThreshold,
      cancelOnEscape: true,
      onStart: () => {
        if (!grab(key, true)) {
          return false;
        }
        startDepth = value().find((row) => row.key === key)?.depth ?? 0;
        dragging = true;
        if (options.preview) {
          preview = bindDragPreview(el, start);
          preview.el.removeAttribute("data-moving");
          preview.el.removeAttribute("data-dragging");
          const count = draft()?.keys.length ?? 1;
          if (count > 1) {
            preview.el.setAttribute("data-drag-count", String(count));
          }
        }
      },
      onMove: ({ x, y, event: moveEvent }) => {
        moveEvent.preventDefault();
        lastMove = moveEvent;
        point = { x, y };
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
      }
    });
  }
  const tree = {
    /** Joins a row's element. Return its cleanup from the row slot's `bind`. */
    bind(el, key) {
      elements.set(key, el);
      return () => {
        if (elements.get(key) === el) {
          elements.delete(key);
        }
      };
    },
    /** The rows to render: the draft's while an item moves, else the value. Pure, so `state` and `attrs` can call it. */
    rows(state) {
      return state[options.draft]?.rows ?? state[options.key];
    },
    /** Whether a row is picked up, by itself or under the item that is. */
    moving(state, key) {
      return !!state[options.draft]?.keys.includes(
        key
      );
    },
    /** Whether a pointer is dragging the row, by itself or under the item it drags. */
    dragging(state, key) {
      const current = state[options.draft];
      return !!current?.pointer && current.keys.includes(key);
    },
    /**
     * Handles a key pressed on a row and returns whether it did. Space or
     * Enter picks the row up; while it's up, Up and Down move it between the
     * rows on screen, Left and Right out a level and in one, Space or Enter
     * drops it, Escape puts it back, and Tab puts it back and moves on.
     * Every other key is swallowed while it's up.
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
      const { slot, depth, others } = slots(current);
      const rtl = event.target instanceof Element && isRTL(event.target);
      const inward = event.key === (rtl ? "ArrowLeft" : "ArrowRight");
      const outward = event.key === (rtl ? "ArrowRight" : "ArrowLeft");
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        drop("move-key", event);
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      } else if (modified) {
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        place(slot + (event.key === "ArrowUp" ? -1 : 1), aim);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        place(event.key === "Home" ? 0 : others.length, aim);
      } else if (inward || outward) {
        event.preventDefault();
        if (place(slot, depth + (inward ? 1 : -1))) {
          aim = slots(draft()).depth;
        }
      }
      return true;
    },
    /** Starts a pointer drag of a row once the pointer moves a few pixels, so a click stays a click. */
    pointerdown,
    /** Picks a row up, as Space does. Returns whether it did. */
    grab: (key) => grab(key, false),
    /** Moves the picked-up row to `slot` among the other rows on screen, as near `depth` as fits there. */
    place,
    /** Drops the picked-up row where it is, committing the draft. */
    drop: (event) => drop("move-key", event),
    /** Puts the picked-up row back where it was. */
    cancel: () => cancel(),
    /**
     * Moves an item and its children before the row `before`, or to the end,
     * at `depth` as near as fits there, like an "Indent" menu item. Returns
     * whether it went through.
     */
    move(key, before, depth) {
      const rows = value();
      const next = placedRows(rows, key, before, depth, options.maxDepth?.());
      if (next === rows || !commit(next, key, { reason: "imperative" })) {
        return false;
      }
      say("drop", key, next);
      return true;
    }
  };
  return tree;
}
export {
  createTreeReorder,
  depthRange,
  movedRows,
  placeOf,
  subtreeEnd,
  treeReorderMessage
};
