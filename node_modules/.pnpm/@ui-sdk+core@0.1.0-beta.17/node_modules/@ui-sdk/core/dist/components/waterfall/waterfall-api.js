// src/components/waterfall/waterfall-api.ts
import { isRTL } from "../../foundation/platform/env.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import {
  createTypeahead,
  isTypeaheadKey
} from "../../foundation/text/typeahead.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import {
  createTreeCollection,
  treeDataNodes,
  visibleTreeRows
} from "../../foundation/lists/tree-collection.js";
import { clamp } from "../../foundation/number/steps.js";
import { localeOf } from "../../foundation/text/locale.js";
import {
  formatTime,
  percentAt,
  spanPlacement,
  spanRange,
  waterfallTicks
} from "./waterfall-time.js";
var cellSelector = '[role="gridcell"], [role="rowheader"]';
var cellsOf = (row) => Array.from(row.querySelectorAll(cellSelector)).filter(
  (cell) => cell.closest('[role="row"]') === row
);
var defaultBarLabel = (_item, { start, duration }) => `Starts at ${start}, lasts ${duration}`;
function visibleWaterfallRows(items, expanded) {
  return visibleTreeRows(items, expanded);
}
function waterfallApiBody(context) {
  const { id, store, options } = context;
  const change = createChange(context);
  const typeahead = createTypeahead();
  const rowElement = (key) => key == null ? void 0 : context.element("row", key);
  let data;
  function known() {
    const { items } = store.get();
    if (data?.items !== items) {
      const nodes = treeDataNodes(items);
      data = {
        items,
        tree: createTreeCollection(nodes),
        byKey: new Map(
          nodes.map((node) => [node.key, node.item])
        ),
        all: nodes.map((node) => node.item),
        range: spanRange(items)
      };
    }
    return data;
  }
  const range = (state = store.get()) => state.range ?? known().range;
  let shown;
  function visible() {
    const keys = known().tree.visible(store.get().expanded);
    if (shown?.keys !== keys) {
      shown = { keys, index: new Map(keys.map((key, index) => [key, index])) };
    }
    return shown;
  }
  const isBranch = (key) => known().tree.isBranch(key);
  const ancestors = (key) => known().tree.ancestors(key);
  const parentOf = (key) => known().tree.parent(key);
  let openFor;
  let open = /* @__PURE__ */ new Set();
  function shows(key, expanded) {
    if (expanded !== openFor) {
      open = new Set(openFor = expanded);
    }
    return ancestors(key).every((ancestor) => open.has(ancestor));
  }
  const roving = createRovingFocus(context, {
    slot: "row",
    key: "active",
    focusable: (row) => shows(row.key, store.get().expanded),
    preferred: (row) => store.get().value === row.key,
    // On the server, the selected row holds the stop when it shows, else the first row.
    claims: (state, row) => {
      if (!shows(row.key, state.expanded)) {
        return false;
      }
      const selected = state.value;
      return selected === null || !known().tree.has(selected) || !shows(selected, state.expanded) || row.key === selected;
    }
  });
  let stopCell = null;
  function holdCell(cell) {
    if (stopCell && stopCell !== cell) {
      stopCell.tabIndex = -1;
    }
    stopCell = cell;
    if (cell) {
      cell.tabIndex = 0;
    }
  }
  let pendingCell = null;
  function focusCell(row, column) {
    const cells = cellsOf(row);
    const cell = cells[Math.min(column, cells.length) - 1];
    if (cell) {
      cell.focus();
    } else {
      row.focus();
    }
  }
  function moveTo(key, column, event) {
    options().onHighlight?.(key, {
      index: visible().index.get(key) ?? -1,
      event
    });
    const row = rowElement(key);
    if (column === 0 || !row) {
      pendingCell = column === 0 ? null : { key, column };
      roving.focus(key);
      return;
    }
    focusCell(row, column);
  }
  function setValue(value, why) {
    return change("value", value, why);
  }
  function setExpanded(expanded, why) {
    return change("expanded", [...new Set(expanded)], why);
  }
  function setOpen(key, opening, why) {
    const { expanded } = store.get();
    if (!isBranch(key) || expanded.includes(key) === opening) {
      return false;
    }
    return setExpanded(
      opening ? [...expanded, key] : expanded.filter((other) => other !== key),
      why
    );
  }
  let seen = store.get().expanded;
  context.onDestroy(
    store.subscribe(() => {
      const { expanded, active } = store.get();
      if (expanded === seen) {
        return;
      }
      seen = expanded;
      if (active === null || shows(active, expanded)) {
        return;
      }
      const target = ancestors(active).find((key) => !expanded.includes(key));
      const row = rowElement(active);
      const doc = row?.ownerDocument;
      const held = !row || row.contains(doc?.activeElement ?? null);
      if (target === void 0) {
        return;
      }
      holdCell(null);
      store.set({ cell: null });
      roving.remember(target);
      if (held) {
        queueMicrotask(() => {
          const now = rowElement(target)?.ownerDocument.activeElement;
          if (!now || now === now.ownerDocument.body || !now.isConnected || row?.contains(now)) {
            roving.focus(target);
          }
        });
      }
    })
  );
  function press(key, el, event) {
    const active = typeof document === "undefined" ? null : document.activeElement;
    if (el && !(active instanceof HTMLElement && el.contains(active))) {
      el.focus({ preventScroll: true });
    }
    if (store.get().active !== key) {
      roving.remember(key);
    }
    if (store.get().value !== key) {
      setValue(key, { reason: "item-press", event });
    }
  }
  function keydown(event, row, key) {
    const target = event.target;
    if (event.defaultPrevented || event.altKey || !(target instanceof HTMLElement) || target.closest('[role="row"]') !== row) {
      return;
    }
    const cells = cellsOf(row);
    const column = target === row ? 0 : cells.indexOf(target) + 1;
    if (target !== row && column === 0) {
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const rtl = horizontal && isRTL(row);
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    const { keys, index } = visible();
    const at = index.get(key) ?? 0;
    const last = keys.length - 1;
    const toRow = (to) => moveTo(keys[clamp(to, 0, last)], column, event);
    if (event.key === "ArrowDown" && !mod) {
      toRow(at + 1);
    } else if (event.key === "ArrowUp" && !mod) {
      toRow(at - 1);
    } else if (event.key === "PageDown") {
      toRow(at + pageSize(row));
    } else if (event.key === "PageUp") {
      toRow(at - pageSize(row));
    } else if (event.key === "Home") {
      if (column > 0 && !mod) {
        cells[0].focus();
      } else {
        toRow(0);
      }
    } else if (event.key === "End") {
      if (column > 0 && !mod) {
        cells[cells.length - 1].focus();
      } else {
        toRow(last);
      }
    } else if (event.key === forward && !mod) {
      const expanded = store.get().expanded.includes(key);
      if (column === 0 && isBranch(key) && !expanded) {
        setOpen(key, true, { reason: "list-navigation", event });
      } else if (column < cells.length) {
        cells[column].focus();
      }
    } else if (event.key === backward && !mod) {
      if (column > 1) {
        cells[column - 2].focus();
      } else if (column === 1) {
        row.focus();
      } else if (store.get().expanded.includes(key)) {
        setOpen(key, false, { reason: "list-navigation", event });
      } else {
        const parent = parentOf(key);
        if (parent === null) {
          return;
        }
        moveTo(parent, 0, event);
      }
    } else if ((event.key === "Enter" || event.key === " " && !typeahead.active()) && !mod) {
      setValue(key, { reason: "item-press", event });
    } else if (isTypeaheadKey(event)) {
      const byKey = known().byKey;
      const found = typeahead(
        event.key,
        keys.map((other) => byKey.get(other)?.label ?? other),
        at
      );
      if (found === -1) {
        return;
      }
      moveTo(keys[found], 0, event);
    } else {
      return;
    }
    event.preventDefault();
  }
  function pageSize(row) {
    const height = row.offsetHeight;
    let scroller = row.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
      scroller = scroller.parentElement;
    }
    const view = scroller?.clientHeight ?? 0;
    return height > 0 && view > height ? Math.floor(view / height) - 1 : 10;
  }
  function focusin(event, row, key) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest('[role="row"]') !== row) {
      return;
    }
    if (target === row) {
      holdCell(null);
      store.set({ cell: null });
      return;
    }
    if (!target.matches(cellSelector)) {
      return;
    }
    holdCell(target);
    roving.remember(key);
    store.set({ cell: key });
  }
  let ticksFor;
  function ticks(state, max) {
    const now = range(state);
    const locale = localeOf(state);
    if (ticksFor && ticksFor.range[0] === now[0] && ticksFor.range[1] === now[1] && ticksFor.locale === locale && ticksFor.format === state.format && ticksFor.max === max) {
      return ticksFor.ticks;
    }
    const list = waterfallTicks(now, max, locale, state.format);
    ticksFor = {
      range: [now[0], now[1]],
      locale,
      format: state.format,
      max,
      ticks: list
    };
    return list;
  }
  const imperative = (why) => ({
    reason: why?.reason ?? "imperative",
    event: why?.event
  });
  const api = {
    id,
    roving,
    getValue: () => store.get().value,
    setValue: (value, why) => setValue(value, imperative(why)),
    getExpanded: () => store.get().expanded,
    setExpanded: (expanded, why) => setExpanded(expanded, imperative(why)),
    isExpanded: (value) => store.get().expanded.includes(value),
    expand: (value, why) => setOpen(value, true, imperative(why)),
    collapse: (value, why) => setOpen(value, false, imperative(why)),
    toggle: (value, why) => setOpen(value, !store.get().expanded.includes(value), imperative(why)),
    expandAll: (why) => setExpanded(known().tree.keys().filter(isBranch), imperative(why)),
    collapseAll: (why) => setExpanded([], imperative(why)),
    reveal(value) {
      if (!known().tree.has(value)) {
        return;
      }
      const { expanded } = store.get();
      const hidden = ancestors(value).filter((key) => !expanded.includes(key));
      if (hidden.length && !setExpanded([...expanded, ...hidden], { reason: "imperative" })) {
        return;
      }
      queueMicrotask(() => moveTo(value, 0));
    },
    focus: (value) => roving.focus(value),
    internal: {
      items: () => store.get().items,
      // Every span, parents before children, for a waterfall that renders all its rows.
      all: () => known().all,
      range,
      isBranch,
      ancestors,
      shows,
      level: (key) => known().tree.level(key),
      position(key) {
        const tree = known().tree;
        return tree.has(key) ? tree.position(key) : void 0;
      },
      placement(state, key) {
        const item = known().byKey.get(key);
        return item ? spanPlacement(item, range(state)) : { start: 0, size: 0 };
      },
      tabIndex: (state, part) => state.cell === part.key ? "-1" : roving.tabIndex(state, part),
      ticks,
      timeState(state, time) {
        const now = range(state);
        const scale = Math.max(Math.abs(now[0]), Math.abs(now[1]));
        return {
          time,
          label: formatTime(time, localeOf(state), state.format, scale),
          position: percentAt(time, now),
          outside: time < now[0] || time > now[1]
        };
      },
      barLabel(state, key) {
        const item = known().byKey.get(key);
        if (!item) {
          return void 0;
        }
        const locale = localeOf(state);
        return (state.getBarLabel ?? defaultBarLabel)(item, {
          start: formatTime(item.start, locale, state.format),
          duration: formatTime(item.duration, locale, state.format)
        });
      },
      press,
      keydown,
      focusin,
      pressIndicator(key, event) {
        event?.preventDefault();
        rowElement(key)?.focus({ preventScroll: true });
        setOpen(key, !store.get().expanded.includes(key), {
          reason: "trigger-press",
          event
        });
      },
      bindRow(el, part) {
        const leave = roving.bind(el, part);
        if (pendingCell?.key === part.key) {
          const { column } = pendingCell;
          pendingCell = null;
          queueMicrotask(() => {
            const doc = el.ownerDocument;
            if (doc.activeElement === el || doc.activeElement === doc.body) {
              focusCell(el, column);
            }
          });
        }
        return () => {
          if (stopCell && el.contains(stopCell)) {
            holdCell(null);
          }
          if (store.get().cell === part.key) {
            store.set({ cell: null });
          }
          leave();
        };
      }
    }
  };
  return api;
}
var waterfallApi = waterfallApiBody;
export {
  visibleWaterfallRows,
  waterfallApi
};
