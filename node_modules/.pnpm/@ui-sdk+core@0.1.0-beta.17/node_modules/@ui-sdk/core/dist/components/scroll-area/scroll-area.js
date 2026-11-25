// src/components/scroll-area/scroll-area.ts
import { css } from "../../foundation/kernel/inline-style.js";
import { createController } from "../../foundation/kernel/controller.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { onProps } from "../../foundation/kernel/part.js";
import { mainAxis } from "./scroll-area-model.js";
import {
  createScrollView,
  liveKeys
} from "./scroll-area-view.js";
import { orientationOf } from "../../foundation/focus/collection.js";
import { live } from "../../foundation/kernel/live.js";
function createScrollAreaController() {
  return createController();
}
var axisOf = (orientation) => orientation === "horizontal" ? "x" : "y";
function alongAxis(part, bindAxis) {
  let axis = axisOf(part.props.orientation);
  let unbind = bindAxis(axis);
  const unwatch = onProps(part, () => {
    if (axisOf(part.props.orientation) === axis) {
      return;
    }
    unbind();
    axis = axisOf(part.props.orientation);
    unbind = bindAxis(axis);
  });
  return () => {
    unwatch();
    unbind();
  };
}
var atStart = (state) => mainAxis(state) === "x" ? state.atXStart : state.atYStart;
var atEnd = (state) => mainAxis(state) === "x" ? state.atXEnd : state.atYEnd;
var hasScrollbars = (state) => state.scrollbarsX + state.scrollbarsY > 0;
var endButtonShown = (state) => !atEnd(state) && !(state.stickToEnd && state.sticking);
var flag = (value) => value ? "" : void 0;
var areaState = (state) => ({
  overflowX: state.overflowX,
  overflowY: state.overflowY,
  atStart: atStart(state),
  atEnd: atEnd(state),
  scrolling: state.scrollingX || state.scrollingY,
  hovering: state.hovering,
  sticking: state.stickToEnd && state.sticking
});
var overflowAttrs = (state) => ({
  "data-overflow-x": flag(state.overflowX),
  "data-overflow-y": flag(state.overflowY)
});
var scrollAttrs = (state) => ({
  "data-at-start": flag(atStart(state)),
  "data-at-end": flag(atEnd(state)),
  "data-at-x-start": flag(state.atXStart),
  "data-at-x-end": flag(state.atXEnd),
  "data-at-y-start": flag(state.atYStart),
  "data-at-y-end": flag(state.atYEnd),
  "data-scrolling": flag(state.scrollingX || state.scrollingY),
  "data-hovering": flag(state.hovering),
  "data-sticking": flag(state.stickToEnd && state.sticking)
});
var contentShield = Object.fromEntries(
  ["x", "y"].flatMap(
    (axis) => [
      "overflow-" + axis + "-start",
      "overflow-" + axis + "-end",
      "progress-" + axis
    ].map((name) => [`--scroll-area-${name}`, "initial"])
  )
);
var settings = (options) => ({
  type: options.type ?? "hover",
  scrollHideDelay: options.scrollHideDelay ?? 600,
  stickToEnd: options.stickToEnd ?? false
});
var scrollAreaPrimitive = /* @__PURE__ */ definePrimitive({
  name: "scroll-area",
  options: {
    type: "string",
    scrollHideDelay: "number",
    stickToEnd: "boolean",
    controller: "value"
  },
  state: (options) => ({
    ...settings(options),
    scrollbarsX: 0,
    scrollbarsY: 0,
    counted: false,
    overflowX: false,
    overflowY: false,
    atXStart: true,
    atXEnd: true,
    atYStart: true,
    atYEnd: true,
    scrollingX: false,
    scrollingY: false,
    hovering: false,
    visibleX: false,
    visibleY: false,
    dragging: null,
    sticking: !!options.stickToEnd
  }),
  live: liveKeys,
  sync: settings,
  // Nothing here is a value a user sets and gets back through a callback.
  controlled: [],
  api: (context) => {
    const { store, onDestroy } = context;
    const view = createScrollView(store);
    deriveFromOptions(
      context,
      ["sticking"],
      (synced, state) => synced.stickToEnd === void 0 || synced.stickToEnd === state.stickToEnd ? void 0 : { sticking: synced.stickToEnd }
    );
    let { stickToEnd, type, scrollHideDelay } = store.get();
    let destroyed = false;
    onDestroy(() => destroyed = true);
    onDestroy(
      store.subscribe(() => {
        const state = store.get();
        if (state.stickToEnd === stickToEnd && state.type === type && state.scrollHideDelay === scrollHideDelay) {
          return;
        }
        ;
        ({ stickToEnd, type, scrollHideDelay } = state);
        queueMicrotask(() => destroyed || view.refresh());
      })
    );
    return {
      scrollToEnd: (options) => view.scrollToEdge("end", options),
      scrollToStart: (options) => view.scrollToEdge("start", options),
      isAtEnd: () => view.isAt("end") ?? atEnd(store.get()),
      isAtStart: () => view.isAt("start") ?? atStart(store.get()),
      isSticking: () => store.get().stickToEnd && store.get().sticking,
      internal: view
    };
  },
  slots: (slot) => ({
    // Positions the scrollbars, which sit over the viewport's edges.
    root: slot({
      state: areaState,
      attrs: (state) => ({
        ...overflowAttrs(state),
        style: "position:relative"
      }),
      live: live(scrollAttrs),
      bind: (el, { api }) => api.internal.bindRoot(el)
    }),
    // The native scroller. Its own scrollbars hide once custom ones are on the
    // page, and stay when there are none. On the server, custom ones are assumed.
    viewport: slot({
      state: areaState,
      attrs: (state) => ({
        ...overflowAttrs(state),
        style: css({
          overflow: "auto",
          "scrollbar-width": !state.counted || hasScrollbars(state) ? "none" : void 0
        })
      }),
      live: live(scrollAttrs),
      bind: (el, { api }) => api.internal.bindViewport(el)
    }),
    // Wraps the content. It grows wider than the viewport only when there's a
    // horizontal scrollbar, so text truncates as usual otherwise. Scrolling
    // must never restyle the whole content: 4.5ms a frame for 10,000 nodes in
    // Chrome, against 0.03ms for the root alone.
    content: slot({
      state: areaState,
      attrs: (state) => ({
        ...overflowAttrs(state),
        style: css({
          "min-width": state.scrollbarsX > 0 ? "fit-content" : void 0,
          ...contentShield
        })
      }),
      live: live(scrollAttrs)
    }),
    // Hidden from assistive technology: the viewport scrolls natively, which
    // screen readers already use.
    scrollbar: slot({
      props: { orientation: "string" },
      state: (state, { props }) => {
        const axis = axisOf(props.orientation);
        return {
          orientation: orientationOf(props.orientation, "vertical"),
          visible: axis === "x" ? state.visibleX : state.visibleY,
          scrolling: axis === "x" ? state.scrollingX : state.scrollingY,
          hovering: state.hovering,
          dragging: state.dragging === axis
        };
      },
      attrs: (state, { props }) => {
        const axis = axisOf(props.orientation);
        const overflow = axis === "x" ? state.overflowX : state.overflowY;
        return {
          "aria-hidden": "true",
          "data-orientation": orientationOf(props.orientation, "vertical"),
          ...overflowAttrs(state),
          style: css({
            position: "absolute",
            "touch-action": "none",
            "user-select": "none",
            "-webkit-user-select": "none",
            ...axis === "y" ? {
              top: 0,
              bottom: "var(--scroll-area-corner-height,0px)",
              "inset-inline-end": 0
            } : {
              bottom: 0,
              "inset-inline-start": 0,
              "inset-inline-end": "var(--scroll-area-corner-width,0px)"
            },
            display: overflow || state.type === "always" ? void 0 : "none"
          })
        };
      },
      live: live((state, { props }) => {
        const axis = axisOf(props.orientation);
        const visible = axis === "x" ? state.visibleX : state.visibleY;
        return {
          "data-visible": flag(visible),
          "data-scrolling": flag(
            axis === "x" ? state.scrollingX : state.scrollingY
          ),
          "data-hovering": flag(state.hovering),
          "data-dragging": flag(state.dragging === axis),
          // A hidden scrollbar must not catch presses meant for the content under it.
          style: visible ? void 0 : "pointer-events:none"
        };
      }),
      bind: (el, part) => alongAxis(part, (axis) => part.api.internal.bindScrollbar(el, axis))
    }),
    // Sized and moved by CSS variables its scrollbar writes once per frame.
    thumb: slot({
      props: { orientation: { kind: "string", from: "scrollbar" } },
      state: (state, { props }) => ({
        orientation: orientationOf(props.orientation, "vertical"),
        dragging: state.dragging === axisOf(props.orientation)
      }),
      attrs: (state, { props }) => {
        const axis = axisOf(props.orientation);
        const overflow = axis === "x" ? state.overflowX : state.overflowY;
        return {
          "data-orientation": orientationOf(props.orientation, "vertical"),
          style: css(
            axis === "y" ? {
              height: "var(--scroll-area-thumb-height)",
              transform: "translate3d(0,var(--scroll-area-thumb-offset,0px),0)",
              display: overflow ? void 0 : "none"
            } : {
              width: "var(--scroll-area-thumb-width)",
              transform: "translate3d(var(--scroll-area-thumb-offset,0px),0,0)",
              display: overflow ? void 0 : "none"
            }
          )
        };
      },
      live: live((state, { props }) => ({
        "data-dragging": flag(state.dragging === axisOf(props.orientation))
      })),
      bind: (el, part) => alongAxis(part, (axis) => part.api.internal.bindThumb(el, axis))
    }),
    // Where the two scrollbars meet. Only there while both show.
    corner: slot({
      attrs: (state) => ({
        "aria-hidden": "true",
        style: css({
          position: "absolute",
          bottom: 0,
          "inset-inline-end": 0,
          width: "var(--scroll-area-corner-width)",
          height: "var(--scroll-area-corner-height)",
          display: state.overflowX && state.overflowY && state.scrollbarsX > 0 && state.scrollbarsY > 0 ? void 0 : "none"
        })
      })
    }),
    // A button that scrolls to the end, like "Jump to latest" in a chat. While
    // it shouldn't show, it's inert, so it can fade out without taking focus.
    "scroll-to-end": slot({
      state: (state) => ({ visible: endButtonShown(state) }),
      attrs: () => ({ type: "button" }),
      live: live((state) => ({
        "data-visible": flag(endButtonShown(state)),
        inert: flag(!endButtonShown(state))
      })),
      press: ({ api, el }, event) => {
        if (el && el.ownerDocument.activeElement === el) {
          api.internal.focusViewport();
        }
        api.scrollToEnd();
        event?.preventDefault();
      }
    })
  })
});
var scrollArea = scrollAreaPrimitive;
export {
  createScrollAreaController,
  scrollArea
};
