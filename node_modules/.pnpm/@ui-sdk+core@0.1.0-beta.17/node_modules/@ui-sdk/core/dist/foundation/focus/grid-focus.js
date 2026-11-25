// src/foundation/focus/grid-focus.ts
import { isRTL } from "../platform/env.js";
var sameCell = (a, b) => !!a && !!b && a.row === b.row && a.col === b.col;
var cellName = (cell) => `${cell.row}:${cell.col}`;
var byCell = {
  values: ({ props }) => [cellName(props)],
  moved(previous, next, notify) {
    if (!previous || !next) {
      return true;
    }
    notify(cellName(previous));
    notify(cellName(next));
  }
};
function createGridFocus(context, options) {
  const { store } = context;
  const cells = /* @__PURE__ */ new Map();
  const active = () => store.get()[options.key];
  let pending = null;
  let first;
  const allowed = (cell) => cell.row >= 0 && cell.col >= 0 && cell.row < options.rows() && cell.col < options.cols() && !options.disabled?.(cell);
  function firstAllowed(state) {
    const rows = options.rows();
    const cols = options.cols();
    const current = context.options();
    if (first?.state === state && first.options === current && first.rows === rows && first.cols === cols) {
      return first.cell;
    }
    let cell = null;
    for (let row = 0; row < rows && !cell; row++) {
      for (let col = 0; col < cols && !cell; col++) {
        if (allowed({ row, col })) {
          cell = { row, col };
        }
      }
    }
    first = { state, options: current, rows, cols, cell };
    return cell;
  }
  function step(cell, dr, dc) {
    let next = { row: cell.row + dr, col: cell.col + dc };
    while (next.row >= 0 && next.col >= 0 && next.row < options.rows() && next.col < options.cols()) {
      if (allowed(next)) {
        return next;
      }
      next = { row: next.row + dr, col: next.col + dc };
    }
    return cell;
  }
  function places() {
    const rendered = new Map(cells);
    for (const part of context.parts()) {
      const props = part.props;
      if (part.el && cells.has(part.el) && typeof props.row === "number" && typeof props.col === "number") {
        rendered.set(part.el, { row: props.row, col: props.col });
      }
    }
    return rendered;
  }
  function elementAt(cell) {
    let found;
    for (const [el, place] of places()) {
      if (sameCell(place, cell)) {
        found = el;
      }
    }
    return found;
  }
  function focusElement(cell) {
    const el = elementAt(cell);
    if (el?.isConnected) {
      pending = null;
      if (el.ownerDocument.activeElement !== el) {
        el.focus({ preventScroll: false });
      }
    } else {
      pending = cell;
    }
  }
  const api = {
    /** The active cell, which has the tab stop. */
    active,
    /**
     * `"0"` for the active cell, else `"-1"`, for a `tabindex` attribute. Before
     * the grid is entered, the first cell that isn't disabled has it, row by row.
     */
    tabIndex(state, cell) {
      return sameCell(
        state[options.key] ?? firstAllowed(state),
        cell
      ) ? "0" : "-1";
    },
    /** Whether a cell is the active one. */
    isActive(state, cell) {
      return sameCell(state[options.key], cell);
    },
    /** Where a joined cell's element is now, like the one under a dragging pointer. */
    placeOf: (el) => places().get(el),
    /** Joins a rendered cell, so focus can reach it. Return its cleanup from the slot's `bind`. */
    bind(el, cell) {
      cells.delete(el);
      cells.set(el, { row: cell.row, col: cell.col });
      if (sameCell(pending, cell)) {
        queueMicrotask(() => sameCell(pending, cell) && focusElement(cell));
      }
      return () => {
        cells.delete(el);
      };
    },
    /** Makes a cell active and focuses it, scrolling it in through `reveal` first. */
    focus(cell, details = {
      reason: "imperative"
    }) {
      if (!allowed(cell)) {
        return false;
      }
      const from = active();
      if (!sameCell(from, cell)) {
        store.set({
          [options.key]: { row: cell.row, col: cell.col }
        });
      }
      options.reveal?.(cell);
      focusElement(cell);
      if (!sameCell(from, cell)) {
        options.onMove?.(cell, {
          from,
          reason: details.reason,
          event: details.event,
          shift: !!details.shift
        });
      }
      return true;
    },
    /**
     * Handles a key pressed in the grid and returns whether it moved. Arrows
     * move a cell, flipped left to right in right-to-left text; Home and End
     * go to the row's ends, or with Control (Command on a Mac) the grid's;
     * Page Up and Page Down move `pageSize` rows.
     */
    keydown(event) {
      if (event.defaultPrevented || event.altKey) {
        return false;
      }
      const from = active() ?? firstAllowed(store.get());
      if (!from) {
        return false;
      }
      const rtl = event.target instanceof Element && isRTL(event.target);
      const page = options.pageSize?.() ?? 10;
      const last = { row: options.rows() - 1, col: options.cols() - 1 };
      let to;
      const ctrl = event.ctrlKey || event.metaKey;
      if (event.key === "ArrowUp" && !ctrl) {
        to = step(from, -1, 0);
      } else if (event.key === "ArrowDown" && !ctrl) {
        to = step(from, 1, 0);
      } else if (event.key === "ArrowLeft" && !ctrl) {
        to = step(from, 0, rtl ? 1 : -1);
      } else if (event.key === "ArrowRight" && !ctrl) {
        to = step(from, 0, rtl ? -1 : 1);
      } else if (event.key === "Home") {
        to = ctrl ? step({ row: -1, col: 0 }, 1, 0) : step({ row: from.row, col: -1 }, 0, 1);
      } else if (event.key === "End") {
        to = ctrl ? step({ row: last.row + 1, col: last.col }, -1, 0) : step({ row: from.row, col: last.col + 1 }, 0, -1);
      } else if (event.key === "PageUp") {
        to = step(
          { row: Math.max(0, from.row - page) + 1, col: from.col },
          -1,
          0
        );
      } else if (event.key === "PageDown") {
        to = step(
          { row: Math.min(last.row, from.row + page) - 1, col: from.col },
          1,
          0
        );
      }
      if (!to) {
        return false;
      }
      event.preventDefault();
      return api.focus(to, {
        reason: "list-navigation",
        event,
        shift: event.shiftKey
      });
    }
  };
  return api;
}
export {
  byCell,
  createGridFocus
};
