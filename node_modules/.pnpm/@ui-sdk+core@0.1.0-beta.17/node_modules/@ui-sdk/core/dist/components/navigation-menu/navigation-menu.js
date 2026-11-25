// src/components/navigation-menu/navigation-menu.ts
import { triggerKeydown } from "../../foundation/disclosure/disclosure.js";
import {
  ownsEvent,
  registerPopupElement
} from "../../foundation/popups/popup-elements.js";
import "../../foundation/platform/position.js";
import {
  itemIconPart
} from "../../foundation/lists/item-icon.js";
import { motionOf } from "./navigation-menu-keyboard.js";
import {
  isShown,
  navigationMenuApi
} from "./navigation-menu-api.js";
import { idPart, openAttrs } from "../../foundation/kernel/attrs.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { orientationOf } from "../../foundation/focus/collection.js";
function createNavigationMenuController() {
  return createController();
}
var contentId = (id, key) => `${id}-content-${idPart(key)}`;
var navigationMenuPrimitive = /* @__PURE__ */ definePrimitive({
  name: "navigation-menu",
  options: {
    container: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    onOpenChangeComplete: "callback",
    delay: "number",
    closeDelay: "number",
    openOnHover: "boolean",
    closeOnSelect: "boolean",
    orientation: "string",
    controller: "value",
    // Internal: passed by renderers.
    parent: "value"
  },
  state: (options) => {
    const value = options.value ?? options.defaultValue ?? null;
    return {
      value,
      orientation: orientationOf(options.orientation, "horizontal"),
      mounted: value !== null,
      active: value,
      previous: null,
      forward: null,
      exiting: [],
      contents: value === null ? [] : [value],
      viewport: false,
      nested: !!options.parent
    };
  },
  sync: (options) => ({
    orientation: orientationOf(options.orientation, "horizontal"),
    ...options.value !== void 0 && { value: options.value }
  }),
  api: navigationMenuApi,
  slots: (slot) => ({
    // A <nav> landmark, or a plain element when nested inside another menu's content.
    root: slot({
      state: (state) => ({
        value: state.value,
        open: state.value !== null,
        orientation: state.orientation,
        nested: state.nested
      }),
      attrs: (state) => ({
        "data-orientation": state.orientation,
        "data-nested": state.nested ? "" : void 0
      }),
      on: { keydown: (event, { api }) => api.internal.rootKeydown(event) }
    }),
    list: slot({
      state: (state) => ({
        open: state.value !== null,
        orientation: state.orientation
      }),
      attrs: (state) => ({ "data-orientation": state.orientation }),
      on: {
        keydown: (event, { api, el }) => api.internal.listKeydown(event, el)
      }
    }),
    item: slot({
      props: { value: "id" },
      state: (state, { key }) => ({ open: state.value === key }),
      attrs: (state, { key }) => openAttrs(state.value === key),
      bind: (el, { api, key }) => api.internal.ensureSurface(key)
    }),
    // A button that opens and closes its item's panel, like a disclosure.
    trigger: slot({
      props: { value: { kind: "string", from: "item" }, disabled: "boolean" },
      state: (state, { key, props }) => ({
        open: state.value === key,
        disabled: !!props.disabled
      }),
      attrs: (state, { id, key, props }) => ({
        id: `${id}-trigger-${idPart(key)}`,
        type: "button",
        "aria-expanded": String(state.value === key),
        "aria-controls": isShown(state, key) ? contentId(id, key) : void 0,
        disabled: props.disabled ? "" : void 0,
        "data-disabled": props.disabled ? "" : void 0,
        ...openAttrs(state.value === key)
      }),
      on: {
        pointerenter: (event, { api, key, props }) => api.internal.hoverEnter(event, key, props.disabled),
        pointermove: (event, { api, key, props }) => api.internal.hoverMove(event, key, props.disabled),
        pointerleave: (event, { api, key }) => api.internal.leaveTrigger(event, key),
        keydown(event, { api, el, key, store }) {
          triggerKeydown(event, el);
          if (store.get().value === key) {
            api.internal.surface().triggerKeydown(event);
          }
        }
      },
      press(context, event) {
        if (!context.props.disabled) {
          context.api.internal.triggerPress(context.key, context.el, event);
        }
      },
      bind: (el, { api, key }) => api.internal.ensureSurface(key)
    }),
    content: slot({
      props: {
        side: "string",
        align: "string",
        sideOffset: "number",
        alignOffset: "number",
        collisionPadding: "number",
        arrowPadding: "number",
        anchor: "string",
        container: "value",
        value: { kind: "string", from: "item" },
        keepMounted: "boolean",
        hiddenUntilFound: "boolean"
      },
      connect: registerPopupElement,
      state: (state, { key }) => ({
        open: state.value === key,
        motion: motionOf(key, state) ?? null,
        orientation: state.orientation
      }),
      present: (state, { key, props }) => isShown(state, key) || !!props.keepMounted || !!props.hiddenUntilFound,
      attrs: (state, { id, key, props }) => {
        const shown = isShown(state, key);
        return {
          id: contentId(id, key),
          // Without a viewport, the content is a popup that touch can focus.
          tabindex: state.viewport ? void 0 : "-1",
          hidden: shown ? void 0 : props.hiddenUntilFound ? "until-found" : "",
          "data-motion": motionOf(key, state),
          "data-orientation": state.orientation,
          ...openAttrs(state.value === key)
        };
      },
      on: {
        keydown(event, { api, el, store }) {
          api.internal.panelKeydown(event, el);
          if (ownsEvent(el, event) && !store.get().viewport) {
            api.internal.surface().keydown(event);
          }
        },
        pointerenter(event, { api, store }) {
          if (!store.get().viewport) {
            api.internal.enterPanel(event);
          }
        },
        pointerleave(event, { api, store }) {
          if (!store.get().viewport) {
            api.internal.leavePanel(event);
          }
        }
      },
      bind: (el, part) => part.api.internal.bindContent(el, part.key, part.props, part)
    }),
    link: slot({
      props: { id: "id", current: "boolean", closeOnSelect: "boolean" },
      state: (_, { props }) => ({ current: !!props.current }),
      attrs: (_, { props }) => ({
        "aria-current": props.current ? "page" : void 0,
        "data-current": props.current ? "" : void 0
      }),
      bind: (el, { api, key }) => api.internal.bindLink(el, key)
    }),
    "link-icon": slot(
      itemIconPart({
        component: "navigation-menu",
        item: '[data-slot="navigation-menu-link"]',
        list: '[data-slot="navigation-menu-content"], [data-slot="navigation-menu-list"]'
      })
    ),
    // The one popup every content renders into, sized to the open one.
    viewport: slot({
      props: {
        side: "string",
        align: "string",
        sideOffset: "number",
        alignOffset: "number",
        collisionPadding: "number",
        arrowPadding: "number",
        anchor: "string",
        container: "value"
      },
      state: (state) => ({
        open: state.value !== null,
        orientation: state.orientation
      }),
      attrs: (state, { id }) => ({
        id: `${id}-viewport`,
        tabindex: "-1",
        hidden: state.mounted ? void 0 : "",
        "data-orientation": state.orientation,
        ...openAttrs(state.value !== null)
      }),
      bind: (el, part) => part.api.internal.bindViewport(el, part)
    }),
    // Covers the open trigger, or the current page's link while closed.
    indicator: slot({
      state: (state) => ({
        open: state.value !== null,
        orientation: state.orientation
      }),
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-orientation": state.orientation,
        ...openAttrs(state.value !== null)
      }),
      bind: (el, { api }) => api.internal.bindIndicator(el)
    })
  }),
  agent: { actions: ["setValue", "close"], reveals: true }
});
var navigationMenu = navigationMenuPrimitive;
export {
  createNavigationMenuController,
  navigationMenu
};
