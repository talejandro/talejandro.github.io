// src/components/waterfall/waterfall.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import { idPart } from "../../foundation/kernel/attrs.js";
import { createController } from "../../foundation/kernel/controller.js";
import { css } from "../../foundation/kernel/inline-style.js";
import { direct } from "../../foundation/kernel/live.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { selects } from "../../foundation/kernel/selects.js";
import { bindPageLocale } from "../../foundation/text/locale.js";
import {
  waterfallApi
} from "./waterfall-api.js";
import { visibleWaterfallRows } from "./waterfall-api.js";
function createWaterfallController() {
  return createController();
}
var flag = (on) => on ? "" : void 0;
var rowOf = (props) => props.value;
function rowState(state, key, api) {
  const branch = api.internal.isBranch(key);
  return {
    expanded: branch && state.expanded.includes(key),
    selected: state.value === key,
    branch,
    level: api.internal.level(key)
  };
}
function rowDataAttrs(row) {
  return {
    "data-level": String(row.level),
    "data-branch": flag(row.branch),
    "data-expanded": flag(row.expanded),
    "data-selected": flag(row.selected)
  };
}
var byRow = ({ props }) => [rowOf(props)];
var rowPartReads = {
  value: byRow,
  expanded: byRow,
  active: [],
  cell: []
};
var noRowReads = { value: [], expanded: [], active: [], cell: [] };
var waterfallPrimitive = /* @__PURE__ */ definePrimitive({
  name: "waterfall",
  options: {
    items: "value",
    range: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    expanded: "list",
    defaultExpanded: "list",
    onExpandedChange: "callback",
    onHighlight: "callback",
    format: "value",
    locale: "string",
    getBarLabel: "value",
    controller: "value"
  },
  controlled: ["value", "expanded"],
  state: (options) => ({
    items: options.items ?? [],
    range: options.range,
    value: options.defaultValue ?? null,
    expanded: options.defaultExpanded ?? [],
    active: null,
    cell: null,
    format: options.format,
    locale: options.locale,
    pageLocale: null,
    getBarLabel: options.getBarLabel
  }),
  sync: (options) => ({
    items: options.items ?? [],
    range: options.range,
    format: options.format,
    locale: options.locale,
    getBarLabel: options.getBarLabel,
    ...options.value === void 0 ? {} : { value: options.value },
    ...options.expanded === void 0 ? {} : { expanded: options.expanded }
  }),
  api: waterfallApi,
  slots: (slot) => ({
    root: slot({
      role: "treegrid",
      keys: {
        none: "Focus stays on a row or a cell, whose keydown handles them."
      },
      selects: selects(noRowReads),
      state: (state, { api }) => ({ range: api.internal.range(state) }),
      bind: (el, { store, id }) => {
        bindPageLocale(el, (pageLocale) => store.set({ pageLocale }));
        if (dev) {
          checkName(el, "Waterfall", { component: "waterfall", id });
        }
      }
    }),
    // The row of column headers, above the rows.
    "header-row": slot({ role: "row" }),
    "column-header": slot({ role: "columnheader" }),
    // The ruler of round times above the bars. Hidden from screen readers, which hear each bar's times.
    axis: slot({
      props: { maxTicks: "number" },
      selects: selects(noRowReads),
      state: (state, { props, api }) => ({
        ticks: api.internal.ticks(state, props.maxTicks ?? 6)
      }),
      attrs: () => ({ "aria-hidden": "true" })
    }),
    tick: slot({
      props: { time: "number" },
      selects: selects(noRowReads),
      state: (state, { props, api }) => api.internal.timeState(state, props.time),
      attrs: (state, { props, api }) => ({
        style: css({
          "--waterfall-tick": `${api.internal.timeState(state, props.time).position}%`
        })
      })
    }),
    // A moment across every row, like DOMContentLoaded.
    mark: slot({
      props: { time: "number" },
      selects: selects(noRowReads),
      state: (state, { props, api }) => api.internal.timeState(state, props.time),
      attrs: (state, { props, api }) => {
        const mark = api.internal.timeState(state, props.time);
        return {
          "data-outside": flag(mark.outside),
          style: css({ "--waterfall-mark": `${mark.position}%` })
        };
      }
    }),
    row: slot({
      role: "row",
      keys: [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "mod+Home",
        "mod+End",
        "PageUp",
        "PageDown",
        "Enter",
        " ",
        "typeahead"
      ],
      props: { value: "string" },
      // A row hears its own selection and focus, and an expand of itself or of an ancestor, which hides or shows it.
      selects: selects({
        value: ({ key }) => [key],
        active: ({ key }) => [key, null],
        cell: ({ key }) => [key],
        expanded: ({ key, api }) => [key, ...api.internal.ancestors(key)]
      }),
      direct: direct(["hidden"]),
      state: (state, { key, api }) => rowState(state, key, api),
      attrs: (state, part) => {
        const { id, key, api } = part;
        const row = rowState(state, key, api);
        const position = api.internal.position(key);
        const placement = api.internal.placement(state, key);
        return {
          id: `${id}-row-${idPart(key)}`,
          tabindex: api.internal.tabIndex(state, part),
          hidden: api.internal.shows(key, state.expanded) ? void 0 : "",
          "aria-level": String(row.level),
          "aria-posinset": position && String(position.index),
          "aria-setsize": position && String(position.size),
          "aria-expanded": row.branch ? String(row.expanded) : void 0,
          "aria-selected": row.selected ? "true" : void 0,
          ...rowDataAttrs(row),
          style: css({
            "--waterfall-level": row.level,
            "--waterfall-start": `${placement.start}%`,
            "--waterfall-size": `${placement.size}%`
          })
        };
      },
      press: ({ api, key, el }, event) => api.internal.press(key, el, event),
      on: {
        keydown: (event, { api, el, key }) => el && api.internal.keydown(event, el, key),
        focusin: (event, { api, el, key }) => el && api.internal.focusin(event, el, key)
      },
      bind: (el, part) => part.api.internal.bindRow(el, part)
    }),
    // The cell that names the span, which screen readers repeat as focus moves down a column.
    "row-header": slot({
      role: "rowheader",
      props: { value: { kind: "string", from: "row" } },
      selects: selects(rowPartReads),
      state: (state, { props, api }) => rowState(state, rowOf(props), api),
      attrs: (state, { props, api }) => ({
        ...rowDataAttrs(rowState(state, rowOf(props), api))
      }),
      bind: (el) => bindCell(el)
    }),
    // The arrow that expands and collapses a span.
    indicator: slot({
      props: { value: { kind: "string", from: "row" } },
      selects: selects(rowPartReads),
      state: (state, { props, api }) => rowState(state, rowOf(props), api),
      attrs: (state, { props, api }) => ({
        "aria-hidden": "true",
        ...rowDataAttrs(rowState(state, rowOf(props), api))
      }),
      press: ({ api, props }, event) => api.internal.pressIndicator(rowOf(props), event)
    }),
    cell: slot({
      role: "gridcell",
      focus: "roving",
      props: { value: { kind: "string", from: "row" } },
      selects: selects(rowPartReads),
      state: (state, { props, api }) => rowState(state, rowOf(props), api),
      attrs: (state, { props, api }) => ({
        ...rowDataAttrs(rowState(state, rowOf(props), api))
      }),
      bind: (el) => bindCell(el)
    }),
    // The cell on the time axis. Style its bar from the row's `--waterfall-start` and `--waterfall-size`.
    bar: slot({
      role: "gridcell",
      focus: "roving",
      props: { value: { kind: "string", from: "row" } },
      selects: selects(rowPartReads),
      state: (state, { props, api }) => rowState(state, rowOf(props), api),
      attrs: (state, { props, api }) => ({
        "aria-label": api.internal.barLabel(state, rowOf(props)),
        ...rowDataAttrs(rowState(state, rowOf(props), api))
      }),
      bind: (el) => bindCell(el)
    })
  }),
  agent: {
    actions: [
      "setValue",
      "setExpanded",
      "expand",
      "collapse",
      "expandAll",
      "collapseAll"
    ],
    items: (api) => api.internal.items()
  }
});
function bindCell(el) {
  if (!el.hasAttribute("tabindex")) {
    el.tabIndex = -1;
  }
}
var waterfall = waterfallPrimitive;
export {
  createWaterfallController,
  visibleWaterfallRows,
  waterfall
};
