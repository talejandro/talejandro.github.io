// src/components/timeline/timeline.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import { orientationOf } from "../../foundation/focus/collection.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { idPart } from "../../foundation/kernel/attrs.js";
import {
  flagWhileBound,
  keyWhileBound
} from "../../foundation/kernel/bound-keys.js";
import { createController } from "../../foundation/kernel/controller.js";
import { direct, live } from "../../foundation/kernel/live.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { selects } from "../../foundation/kernel/selects.js";
function createTimelineController() {
  return createController();
}
var noPositions = {};
var itemSelector = '[data-slot="timeline-item"]';
var fromOptions = (options) => ({
  orientation: orientationOf(options.orientation, "vertical"),
  feed: !!options.feed,
  busy: !!options.busy
});
var statusAttrs = (status) => ({
  "data-complete": status === "complete" ? "" : void 0,
  "data-current": status === "current" ? "" : void 0,
  "data-upcoming": status === "upcoming" ? "" : void 0
});
var pageStep = (event) => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ? void 0 : event.key === "PageDown" ? 1 : event.key === "PageUp" ? -1 : void 0;
var partId = (id, part, key) => `${id}-${part}-${idPart(key)}`;
function timelineApiBody(context) {
  const { store, options } = context;
  const roving = createRovingFocus(context, {
    slot: "item",
    key: "stop",
    orientation: () => store.get().orientation,
    loop: () => options().loop ?? true,
    preferred: (item) => item.props?.status === "current",
    onItemsChange: measure
  });
  function measure() {
    const items = roving.items();
    const keys = items.map((item) => item.key);
    context.element("root")?.style.setProperty("--timeline-count", String(keys.length));
    items.forEach(
      (item, index) => item.el.style.setProperty("--timeline-index", String(index))
    );
    const { feed } = store.get();
    store.set({
      first: keys[0] ?? null,
      last: keys[keys.length - 1] ?? null,
      positions: feed ? Object.fromEntries(keys.map((key, index) => [key, index + 1])) : noPositions,
      size: feed ? keys.length : 0
    });
  }
  function keydown(event, el) {
    if (event.defaultPrevented) {
      return;
    }
    const step = store.get().feed ? pageStep(event) : void 0;
    if (step) {
      const items = roving.items();
      const next = items[items.findIndex((item) => item.el === el) + step];
      if (next) {
        event.preventDefault();
        next.el.focus();
      }
      return;
    }
    if (event.target === el && !event.shiftKey) {
      roving.keydown(event, el);
    }
  }
  return {
    focus: (value) => roving.focus(value),
    internal: {
      roving,
      measure,
      keydown
    }
  };
}
var timelineApi = timelineApiBody;
var itemState = (state, props) => ({
  status: props.status,
  orientation: state.orientation
});
var itemPartAttrs = (state, props) => ({
  ...statusAttrs(props.status),
  "data-orientation": state.orientation
});
var insideItem = selects({
  stop: [],
  first: [],
  last: [],
  positions: [],
  size: [],
  titles: [],
  times: [],
  descriptions: [],
  bound: []
});
var itemProps = {
  value: { kind: "string", from: "item" },
  status: { kind: "string", from: "item.status" }
};
var timelinePrimitive = /* @__PURE__ */ definePrimitive({
  name: "timeline",
  options: {
    orientation: "string",
    loop: "boolean",
    feed: "boolean",
    busy: "boolean",
    controller: "value"
  },
  state: (options) => ({
    ...fromOptions(options),
    stop: null,
    first: null,
    last: null,
    positions: noPositions,
    size: 0,
    titles: [],
    times: [],
    descriptions: [],
    bound: false
  }),
  live: ["first", "last", "positions", "size", "times", "descriptions"],
  sync: fromOptions,
  api: timelineApi,
  slots: (slot) => ({
    root: slot({
      role: (state) => state.feed ? "feed" : "list",
      roles: ["list", "feed"],
      selects: selects({
        stop: [],
        first: [],
        last: [],
        positions: [],
        size: [],
        titles: [],
        times: [],
        descriptions: [],
        bound: []
      }),
      state: (state) => ({
        orientation: state.orientation,
        feed: state.feed,
        busy: state.busy
      }),
      attrs: (state) => ({
        "aria-busy": state.feed && state.busy ? "true" : void 0,
        "data-orientation": state.orientation,
        "data-busy": state.feed && state.busy ? "" : void 0
      }),
      bind(el, { api, id, store }) {
        if (dev && store.get().feed) {
          checkName(el, "Timeline", { component: "timeline", id });
        }
        api.internal.measure();
        let feed = store.get().feed;
        const unflag = flagWhileBound(store, "bound");
        const unsubscribe = store.subscribe(() => {
          if (store.get().feed !== feed) {
            feed = store.get().feed;
            queueMicrotask(api.internal.measure);
          }
        });
        if (typeof MutationObserver === "undefined") {
          return () => {
            unflag();
            unsubscribe();
          };
        }
        const observer = new MutationObserver((records) => {
          const moved = records.some(
            ({ addedNodes }) => [...addedNodes].some(
              (node) => node instanceof Element && (node.matches(itemSelector) || !!node.querySelector(itemSelector))
            )
          );
          if (moved) {
            queueMicrotask(api.internal.measure);
          }
        });
        observer.observe(el, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          unflag();
          unsubscribe();
          el.style.removeProperty("--timeline-count");
        };
      }
    }),
    item: slot({
      role: (state) => state.feed ? "article" : "listitem",
      roles: ["listitem", "article"],
      props: { value: "id", status: "string" },
      selects: selects({
        stop: ({ key }) => [key, null],
        first: ({ key }) => [key],
        last: ({ key }) => [key],
        positions: ({ key }) => [key],
        titles: ({ key }) => [key],
        times: ({ key }) => [key],
        descriptions: ({ key }) => [key]
      }),
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { id, key, props, api }) => ({
        tabindex: api.internal.roving.tabIndex(state, { key, props }),
        "aria-current": props.status === "current" ? "step" : void 0,
        "aria-labelledby": !state.bound || state.titles.includes(key) ? partId(id, "title", key) : void 0,
        ...itemPartAttrs(state, props)
      }),
      // A title binding moves the name without rendering the item again.
      direct: direct(["aria-labelledby"]),
      live: live((state, { id, key }) => {
        const position = state.positions[key];
        const described = [
          state.times.includes(key) && partId(id, "time", key),
          state.descriptions.includes(key) && partId(id, "description", key)
        ].filter(Boolean);
        return {
          "aria-describedby": described.length ? described.join(" ") : void 0,
          "aria-posinset": position === void 0 ? void 0 : String(position),
          "aria-setsize": position === void 0 ? void 0 : String(state.size),
          "data-first": state.first === key ? "" : void 0,
          "data-last": state.last === key ? "" : void 0
        };
      }),
      on: {
        keydown: (event, { el, api }) => api.internal.keydown(event, el)
      },
      bind(el, part) {
        const leave = part.api.internal.roving.bind(el, part);
        return () => {
          leave();
          el.style.removeProperty("--timeline-index");
        };
      }
    }),
    marker: slot({
      props: itemProps,
      selects: insideItem,
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { props }) => ({
        "aria-hidden": "true",
        ...itemPartAttrs(state, props)
      })
    }),
    connector: slot({
      props: itemProps,
      selects: insideItem,
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { props }) => ({
        "aria-hidden": "true",
        ...itemPartAttrs(state, props)
      })
    }),
    time: slot({
      props: itemProps,
      selects: insideItem,
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { id, key, props }) => ({
        id: partId(id, "time", key),
        ...itemPartAttrs(state, props)
      }),
      bind: (el, { key, store }) => keyWhileBound(store, "times", key)
    }),
    title: slot({
      props: itemProps,
      selects: insideItem,
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { id, key, props }) => ({
        id: partId(id, "title", key),
        ...itemPartAttrs(state, props)
      }),
      bind: (el, { key, store }) => keyWhileBound(store, "titles", key)
    }),
    description: slot({
      props: itemProps,
      selects: insideItem,
      state: (state, { props }) => itemState(state, props),
      attrs: (state, { id, key, props }) => ({
        id: partId(id, "description", key),
        ...itemPartAttrs(state, props)
      }),
      bind: (el, { key, store }) => keyWhileBound(store, "descriptions", key)
    })
  })
});
var timeline = timelinePrimitive;
export {
  createTimelineController,
  timeline
};
