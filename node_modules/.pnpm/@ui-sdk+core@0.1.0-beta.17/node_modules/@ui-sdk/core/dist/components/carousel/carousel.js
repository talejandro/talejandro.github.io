// src/components/carousel/carousel.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import {
  carouselApi,
  snapType
} from "./carousel-api.js";
import { idPart } from "../../foundation/kernel/attrs.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { orientationOf } from "../../foundation/focus/collection.js";
import { live } from "../../foundation/kernel/live.js";
function createCarouselController() {
  return createController();
}
function slidesPerPageAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  return attribute === "auto" ? "auto" : Number(attribute);
}
var checkPartName = (part) => (el, { id }) => {
  queueMicrotask(
    () => el.isConnected && checkName(el, part, { component: "carousel", id })
  );
};
function viewportStyle(state) {
  const vertical = state.orientation === "vertical";
  const overflow = state.drag ? "auto" : "hidden";
  return [
    "position:relative",
    `overflow-x:${vertical ? "hidden" : overflow}`,
    `overflow-y:${vertical ? overflow : "hidden"}`,
    `scroll-snap-type:${snapType(state, state.snapping)}`,
    `overscroll-behavior-${vertical ? "y" : "x"}:contain`
  ].join(";");
}
function itemStyle(state) {
  const declarations = ["flex-shrink:0"];
  if (state.slidesPerPage === 1) {
    declarations.push(`scroll-snap-align:${state.align}`);
  }
  if (!state.skipSnaps) {
    declarations.push("scroll-snap-stop:always");
  }
  return declarations.join(";");
}
var contentId = (id) => `${id}-content`;
var slideId = (id, key) => `${id}-slide-${idPart(key)}`;
var stepAttrs = (disabled, id) => ({
  type: "button",
  "aria-controls": contentId(id),
  "aria-disabled": disabled ? "true" : void 0,
  "data-disabled": disabled ? "" : void 0
});
var carouselPrimitive = /* @__PURE__ */ definePrimitive({
  name: "carousel",
  options: {
    page: "number",
    defaultPage: "number",
    onPageChange: "callback",
    onPageChangeComplete: "callback",
    playing: "boolean",
    defaultPlaying: "boolean",
    onPlayingChange: "callback",
    interval: "number",
    orientation: "string",
    align: "string",
    slidesPerPage: slidesPerPageAttribute,
    loop: "boolean",
    skipSnaps: "boolean",
    dragFree: "boolean",
    drag: "boolean",
    controller: "value"
  },
  state: (options) => ({
    page: Math.max(1, Math.floor(options.defaultPage ?? 1)),
    playing: options.defaultPlaying ?? false,
    orientation: "horizontal",
    align: "start",
    slidesPerPage: 1,
    loop: false,
    skipSnaps: false,
    dragFree: false,
    drag: true,
    interval: 5e3,
    pageCount: null,
    snapping: true,
    indicators: [],
    stop: null,
    pages: [],
    order: [],
    inView: [],
    focused: null,
    dragging: false,
    paused: false
  }),
  live: ["pages", "order", "inView", "focused", "dragging", "paused"],
  controlled: ["page", "playing"],
  sync: (options) => ({
    orientation: orientationOf(options.orientation, "horizontal"),
    align: options.align ?? "start",
    slidesPerPage: options.slidesPerPage ?? 1,
    loop: options.loop ?? false,
    skipSnaps: options.skipSnaps ?? false,
    dragFree: options.dragFree ?? false,
    drag: options.drag ?? true,
    interval: options.interval ?? 5e3,
    ...options.page === void 0 ? {} : { page: options.page },
    ...options.playing === void 0 ? {} : { playing: options.playing }
  }),
  api: carouselApi,
  slots: (slot) => ({
    root: slot({
      role: "region",
      state: (state) => ({
        page: state.page,
        pageCount: state.pageCount,
        playing: state.playing,
        orientation: state.orientation
      }),
      attrs: (state) => ({
        "aria-roledescription": "carousel",
        "data-orientation": state.orientation,
        "data-playing": state.playing ? "" : void 0
      }),
      live: live((state) => ({
        "data-paused": state.playing && state.paused ? "" : void 0
      })),
      bind: (el, { api }) => api.internal.bindRoot(el)
    }),
    viewport: slot({
      state: (state) => ({
        orientation: state.orientation,
        dragging: state.dragging
      }),
      attrs: (state) => ({
        "data-orientation": state.orientation,
        style: viewportStyle(state)
      }),
      live: live((state) => ({
        "data-dragging": state.dragging ? "" : void 0
      })),
      on: {
        keydown: (event, { api }) => api.internal.onViewportKeyDown(event)
      },
      bind: (el, { api }) => api.internal.bindViewport(el)
    }),
    content: slot({
      state: (state) => ({ orientation: state.orientation }),
      attrs: (state, { id }) => ({
        id: contentId(id),
        // Slides coming into view are read out, except while rotating, as the carousel pattern asks.
        "aria-live": state.playing ? "off" : "polite",
        "aria-atomic": "false",
        "data-orientation": state.orientation,
        style: state.orientation === "vertical" ? "display:flex;flex-direction:column" : "display:flex"
      })
    }),
    item: slot({
      role: "group",
      props: { id: "id" },
      state: (state, { key }) => ({
        index: state.order.indexOf(key),
        active: !!state.pages[state.page - 1]?.includes(key),
        inView: state.inView.includes(key)
      }),
      attrs: (state, { id, key }) => ({
        id: slideId(id, key),
        "aria-roledescription": "slide",
        "data-orientation": state.orientation,
        style: itemStyle(state)
      }),
      // Slides out of view leave the tab order and the accessibility tree,
      // except one that holds focus, until focus leaves it.
      live: live((state, { key }) => {
        const hidden = state.pageCount !== null && !state.inView.includes(key) && state.focused !== key;
        return {
          inert: hidden ? "" : void 0,
          "aria-hidden": hidden ? "true" : void 0,
          "data-active": state.pages[state.page - 1]?.includes(key) ? "" : void 0,
          "data-in-view": state.inView.includes(key) ? "" : void 0
        };
      }),
      bind: (el, { api, key }) => api.internal.bindItem(el, key)
    }),
    previous: slot({
      state: (state, { api }) => ({ disabled: !api.internal.canStep(-1) }),
      attrs: (state, { id, api }) => stepAttrs(!api.internal.canStep(-1), id),
      press: ({ api }, event) => {
        api.previous({ reason: "previous-press", event });
      },
      bind: dev ? checkPartName("CarouselPrevious") : void 0
    }),
    next: slot({
      state: (state, { api }) => ({ disabled: !api.internal.canStep(1) }),
      attrs: (state, { id, api }) => stepAttrs(!api.internal.canStep(1), id),
      press: ({ api }, event) => {
        api.next({ reason: "next-press", event });
      },
      bind: dev ? checkPartName("CarouselNext") : void 0
    }),
    "indicator-group": slot({
      role: "tablist",
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"],
      state: (state) => ({ page: state.page, pageCount: state.pageCount }),
      on: {
        keydown: (event, { api }) => api.internal.onIndicatorKeyDown(event)
      }
    }),
    indicator: slot({
      role: "tab",
      focus: "roving",
      props: { page: "number", id: "id" },
      state: (state, { key, props, api }) => {
        const page = api.internal.indicatorPage(state, key, props);
        return { page, selected: page === state.page };
      },
      attrs: (state, { id, key, props, api }) => {
        const page = api.internal.indicatorPage(state, key, props);
        const selected = page > 0 && page === state.page;
        return {
          id: `${id}-indicator-${idPart(key)}`,
          type: "button",
          tabindex: api.internal.roving.tabIndex(state, { key, props }),
          "aria-selected": String(selected),
          "data-selected": selected ? "" : void 0,
          hidden: state.pageCount !== null && page > state.pageCount ? "" : void 0
        };
      },
      live: live((state, { id, key, props, api }) => {
        const page = api.internal.indicatorPage(state, key, props);
        const slides = state.pages[page - 1];
        return {
          "aria-controls": slides?.map((slide) => slideId(id, slide)).join(" ") || void 0
        };
      }),
      press: ({ api, el, key, props }, event) => api.internal.pressIndicator(el, key, props, event),
      bind: (el, part) => part.api.internal.bindIndicator(el, part)
    }),
    "play-toggle": slot({
      state: (state) => ({ playing: state.playing, paused: state.paused }),
      attrs: (state, { id }) => ({
        type: "button",
        "aria-controls": contentId(id),
        "data-playing": state.playing ? "" : void 0
      }),
      live: live((state) => ({
        "data-paused": state.playing && state.paused ? "" : void 0
      })),
      press: ({ api, store }, event) => {
        api.setPlaying(!store.get().playing, { reason: "toggle-press", event });
      },
      bind: dev ? checkPartName("CarouselPlayToggle") : void 0
    })
  }),
  agent: {
    actions: ["setPage", "next", "previous", "setPlaying", "play", "pause"]
  }
});
var carousel = carouselPrimitive;
export {
  carousel,
  createCarouselController
};
