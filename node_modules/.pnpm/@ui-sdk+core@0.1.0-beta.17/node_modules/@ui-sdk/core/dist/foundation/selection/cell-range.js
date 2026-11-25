// src/foundation/selection/cell-range.ts
import { announce } from "../platform/announce.js";
import { createAutoScroll } from "../drag-and-drop/auto-scroll.js";
import { isRTL } from "../platform/env.js";
import { createDragSession } from "../drag-and-drop/pointer.js";
function cellRangeMessage({ top, left, bottom, right }) {
  const rows = bottom - top + 1;
  const cols = right - left + 1;
  return rows * cols === 1 ? "1 cell selected" : `${rows} ${rows === 1 ? "row" : "rows"} by ${cols} ${cols === 1 ? "column" : "columns"} selected`;
}
var boundsOf = ({ anchor, end }) => ({
  top: Math.min(anchor.row, end.row),
  left: Math.min(anchor.col, end.col),
  bottom: Math.max(anchor.row, end.row),
  right: Math.max(anchor.col, end.col)
});
function eachOutside(bounds, other, notify) {
  for (let row = bounds.top; row <= bounds.bottom; row++) {
    const inside = !!other && row >= other.top && row <= other.bottom;
    for (let col = bounds.left; col <= bounds.right; col++) {
      if (inside && col >= other.left && col <= other.right) {
        col = other.right;
      } else {
        notify(`${row}:${col}`);
      }
    }
  }
}
function eachMovedSide(before, after, notify) {
  const row = (bounds, at) => {
    for (let col2 = bounds.left; col2 <= bounds.right; col2++) {
      notify(`${at}:${col2}`);
    }
  };
  const col = (bounds, at) => {
    for (let row2 = bounds.top; row2 <= bounds.bottom; row2++) {
      notify(`${row2}:${at}`);
    }
  };
  if (before.top !== after.top) {
    ;
    row(before, before.top), row(after, after.top);
  }
  if (before.bottom !== after.bottom) {
    ;
    row(before, before.bottom), row(after, after.bottom);
  }
  if (before.left !== after.left) {
    ;
    col(before, before.left), col(after, after.left);
  }
  if (before.right !== after.right) {
    ;
    col(before, before.right), col(after, after.right);
  }
}
var byCellRange = {
  values: ({ props }) => [`${props.row}:${props.col}`],
  moved(previous, next, notify) {
    const before = previous ? boundsOf(previous) : null;
    const after = next ? boundsOf(next) : null;
    if (before) {
      eachOutside(before, after, notify);
    }
    if (after) {
      eachOutside(after, before, notify);
    }
    if (before && after) {
      eachMovedSide(before, after, notify);
    }
  }
};
function cellsToText(rows) {
  const quote = (value) => /[\t\n\r"]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return rows.map((row) => row.map(quote).join("	")).join("\n");
}
function textToCells(text) {
  const rows = [[]];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      quoted = true;
    } else if (char === "	") {
      rows[rows.length - 1].push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      rows[rows.length - 1].push(cell);
      cell = "";
      rows.push([]);
    } else {
      cell += char;
    }
  }
  rows[rows.length - 1].push(cell);
  if (rows.length > 1 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}
function createCellRange(context, options) {
  const { store } = context;
  const { grid } = options;
  const joined = /* @__PURE__ */ new WeakSet();
  const drags = createDragSession(context.onDestroy);
  const current = () => store.get()[options.key];
  const set = (range, details) => options.set ? options.set(range, details) : (store.set({ [options.key]: range }), true);
  const clamp = (cell) => ({
    row: Math.max(0, Math.min(options.rows() - 1, cell.row)),
    col: Math.max(0, Math.min(options.cols() - 1, cell.col))
  });
  const everyCell = () => ({
    anchor: { row: 0, col: 0 },
    end: { row: options.rows() - 1, col: options.cols() - 1 }
  });
  const say = (range) => {
    const bounds = api.bounds({ [options.key]: range });
    if (bounds) {
      announce((options.message ?? cellRangeMessage)(bounds));
    }
  };
  const api = {
    /** The selected rows and columns: the range, or the active cell alone, or `null` before the grid is entered. */
    bounds(state) {
      const range = state[options.key];
      if (range) {
        return boundsOf(range);
      }
      const active = grid.active();
      return active ? {
        top: active.row,
        left: active.col,
        bottom: active.row,
        right: active.col
      } : null;
    },
    /** Whether a cell is in the range. */
    contains(state, cell) {
      const bounds = api.bounds(state);
      return !!bounds && cell.row >= bounds.top && cell.row <= bounds.bottom && cell.col >= bounds.left && cell.col <= bounds.right;
    },
    /**
     * A cell's `aria-selected`, `data-selected`, and `data-range-edge`, the
     * range's sides it sits on, like `"top left"`, for drawing its outline
     * with `[data-range-edge~="top"]`.
     */
    cellAttrs(state, cell) {
      const range = state[options.key];
      const selected = !!range && api.contains(state, cell);
      if (!selected) {
        return { "aria-selected": "false" };
      }
      const { top, left, bottom, right } = boundsOf(range);
      const edges = [
        cell.row === top && "top",
        cell.col === right && "right",
        cell.row === bottom && "bottom",
        cell.col === left && "left"
      ].filter(Boolean);
      return {
        "aria-selected": "true",
        "data-selected": "",
        "data-range-edge": edges.length ? edges.join(" ") : void 0
      };
    },
    /** Selects a range, or `null` for the active cell alone. */
    select(range, details = {
      reason: "imperative"
    }) {
      const next = range && {
        anchor: clamp(range.anchor),
        end: clamp(range.end)
      };
      const previous = current();
      if (previous === next || previous && next && previous.anchor.row === next.anchor.row && previous.anchor.col === next.anchor.col && previous.end.row === next.end.row && previous.end.col === next.end.col) {
        return false;
      }
      return set(next, details);
    },
    /** Selects every cell, keeping the active one. */
    selectAll(details) {
      return api.select(everyCell(), details);
    },
    /** Selects whole rows, from one to another. */
    selectRows(from, to = from, details) {
      return api.select(
        {
          anchor: { row: from, col: 0 },
          end: { row: to, col: options.cols() - 1 }
        },
        details
      );
    },
    /** Selects whole columns, from one to another. */
    selectColumns(from, to = from, details) {
      return api.select(
        {
          anchor: { row: 0, col: from },
          end: { row: options.rows() - 1, col: to }
        },
        details
      );
    },
    /** Joins a rendered cell, for focus and for finding it under a dragging pointer. Return its cleanup from `bind`. */
    bind(el, cell) {
      joined.add(el);
      const leave = grid.bind(el, cell);
      return () => {
        joined.delete(el);
        leave();
      };
    },
    /**
     * Handles a key pressed in the grid and returns whether it did anything.
     * Shift with an arrow grows the range a cell, with Control to the grid's
     * edge, and Shift with Home or End to the row's ends; Shift+Space takes
     * the rows, Control+Space the columns, Control+A every cell, and Escape
     * goes back to the active cell. Anything else moves the active cell
     * through the grid, which drops the range.
     */
    keydown(event) {
      if (event.defaultPrevented || event.altKey) {
        return false;
      }
      const active = grid.active() ?? { row: 0, col: 0 };
      const range = current();
      const mod = event.ctrlKey || event.metaKey;
      const done = (next) => {
        event.preventDefault();
        if (api.select(next, { reason: "list-navigation", event })) {
          say(next);
        }
        return true;
      };
      if (mod && !event.shiftKey && event.key.toLowerCase() === "a") {
        return done(everyCell());
      }
      if (event.key === " " && event.shiftKey && !mod) {
        const { top, bottom } = range ? boundsOf(range) : { top: active.row, bottom: active.row };
        return done({
          anchor: { row: top, col: 0 },
          end: { row: bottom, col: options.cols() - 1 }
        });
      }
      if (event.key === " " && mod && !event.shiftKey) {
        const { left, right } = range ? boundsOf(range) : { left: active.col, right: active.col };
        return done({
          anchor: { row: 0, col: left },
          end: { row: options.rows() - 1, col: right }
        });
      }
      if (event.key === "Escape" && range) {
        return done(null);
      }
      if (event.shiftKey) {
        const rtl = event.target instanceof Element && isRTL(event.target);
        const end = range?.end ?? active;
        const last = { row: options.rows() - 1, col: options.cols() - 1 };
        const far = (to2, edge) => mod ? edge : to2;
        let to;
        if (event.key === "ArrowUp") {
          to = { row: far(end.row - 1, 0), col: end.col };
        } else if (event.key === "ArrowDown") {
          to = { row: far(end.row + 1, last.row), col: end.col };
        } else if (event.key === "ArrowLeft") {
          to = {
            row: end.row,
            col: far(end.col + (rtl ? 1 : -1), rtl ? last.col : 0)
          };
        } else if (event.key === "ArrowRight") {
          to = {
            row: end.row,
            col: far(end.col + (rtl ? -1 : 1), rtl ? 0 : last.col)
          };
        } else if (event.key === "Home") {
          to = mod ? { row: 0, col: 0 } : { row: end.row, col: 0 };
        } else if (event.key === "End") {
          to = mod ? last : { row: end.row, col: last.col };
        }
        if (to) {
          const next = { anchor: range?.anchor ?? active, end: clamp(to) };
          options.reveal?.(next.end);
          return done(
            next.anchor.row === next.end.row && next.anchor.col === next.end.col ? null : next
          );
        }
      }
      if (!grid.keydown(event)) {
        return false;
      }
      api.select(null, { reason: "list-navigation", event });
      return true;
    },
    /**
     * Starts a range on a press: the cell becomes active, and dragging paints
     * the range to the cell under the pointer, scrolling near the grid's
     * edges. Shift stretches the range from the active cell instead.
     */
    pointerdown(event, cell) {
      if (!drags.accepts(event)) {
        return;
      }
      const active = grid.active();
      if (event.shiftKey && active) {
        event.preventDefault();
        api.select(
          { anchor: current()?.anchor ?? active, end: cell },
          { reason: "item-press", event }
        );
        return;
      }
      grid.focus(cell, { reason: "item-press", event });
      api.select(null, { reason: "item-press", event });
      const pressed = event.currentTarget;
      let el = pressed instanceof Element && joined.has(pressed) ? pressed : event.target instanceof Element ? event.target : null;
      while (el && !joined.has(el)) {
        el = el.parentElement;
      }
      if (!(el instanceof HTMLElement)) {
        return;
      }
      let last = { x: event.clientX, y: event.clientY };
      const paint = () => {
        const hit = el.ownerDocument.elementsFromPoint(last.x, last.y).map((node) => joined.has(node) ? grid.placeOf(node) : void 0).find(Boolean);
        if (!hit) {
          return;
        }
        api.select(
          hit.row === cell.row && hit.col === cell.col ? null : { anchor: cell, end: hit },
          {
            reason: "drag",
            event
          }
        );
      };
      const scroll = createAutoScroll({ onScroll: paint });
      drags.start(el, event, {
        onMove: ({ x, y }) => {
          last = { x, y };
          scroll.update(x, y);
          paint();
        },
        onEnd: () => scroll.stop()
      });
    },
    /** The range's text, read cell by cell, with tabs between cells and newlines between rows. */
    text(state, read) {
      const bounds = api.bounds(state);
      if (!bounds) {
        return "";
      }
      const rows = [];
      for (let row = bounds.top; row <= bounds.bottom; row++) {
        const cells = [];
        for (let col = bounds.left; col <= bounds.right; col++) {
          cells.push(read({ row, col }));
        }
        rows.push(cells);
      }
      return cellsToText(rows);
    }
  };
  return api;
}
export {
  byCellRange,
  cellRangeMessage,
  cellsToText,
  createCellRange,
  textToCells
};
