// src/components/resizable/resizable.ts
import { isDisabled, watchFormDisabled } from "../../foundation/forms/form.js";
import { css } from "../../foundation/kernel/inline-style.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { resizableApi, settings } from "./resizable-api.js";
import {
  isCollapsed,
  sameSize,
  toCSS
} from "./resizable-layout.js";
import { selects } from "../../foundation/kernel/selects.js";
import { live } from "../../foundation/kernel/live.js";
import { storageKey } from "./resizable-storage.js";
function createResizableController() {
  return createController();
}
var layoutAttribute = (attribute) => attribute?.split(",").map(Number);
function sizeAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  return /^\s*-?[\d.]+\s*$/.test(attribute) ? Number(attribute) : attribute;
}
var orientationAttrs = (state) => ({
  "data-orientation": state.orientation
});
function panelIndex(state, key) {
  const index = state.ids.indexOf(key);
  return index === -1 || index >= state.layout.length ? null : index;
}
function panelStyle(props) {
  const sized = props.defaultSize !== void 0;
  const basis = sized ? toCSS(props.defaultSize) : "0px";
  return css({
    flex: `${sized ? 0 : 1} 1 var(--resizable-panel-size, ${basis})`,
    "min-width": 0,
    "min-height": 0
  });
}
var resizablePrimitive = /* @__PURE__ */ definePrimitive({
  name: "resizable",
  options: {
    layout: layoutAttribute,
    defaultLayout: layoutAttribute,
    onLayoutChange: "callback",
    onLayoutCommit: "callback",
    orientation: "string",
    disabled: "boolean",
    step: "number",
    largeStep: "number",
    autoSaveId: "string",
    storage: "value",
    controller: "value"
  },
  state: (options) => ({
    ...settings(options),
    formDisabled: false,
    layout: [],
    controlledLayout: options.layout,
    ids: [],
    constraints: [],
    handles: {},
    hovering: null,
    dragging: null,
    sizes: {},
    handleValues: {}
  }),
  live: [
    "layout",
    "controlledLayout",
    "ids",
    "constraints",
    "handles",
    "hovering",
    "sizes",
    "handleValues"
  ],
  sync: (options) => ({
    ...settings(options),
    controlledLayout: options.layout
  }),
  controlled: ["layout"],
  commits: ["layout"],
  api: resizableApi,
  slots: (slot) => ({
    root: slot({
      state: (state) => ({
        orientation: state.orientation,
        disabled: isDisabled(state),
        dragging: state.dragging !== null,
        layout: state.layout
      }),
      attrs: (state) => ({
        ...orientationAttrs(state),
        "data-disabled": isDisabled(state) ? "" : void 0,
        "data-dragging": state.dragging !== null ? "" : void 0,
        style: css({
          display: "flex",
          "flex-direction": state.orientation === "vertical" ? "column" : "row"
        })
      }),
      bind(el, { api, store }) {
        const cleanups = [
          watchFormDisabled(el, store),
          api.internal.bindRoot(el)
        ];
        return () => cleanups.forEach((cleanup) => cleanup?.());
      }
    }),
    panel: slot({
      props: {
        id: "id",
        defaultSize: sizeAttribute,
        minSize: sizeAttribute,
        maxSize: sizeAttribute,
        collapsible: "boolean",
        collapsedSize: sizeAttribute
      },
      // A panel shows its own size, so a move reaches the panels it resizes.
      selects: selects({
        layout: [],
        controlledLayout: [],
        sizes: ({ key }) => [key],
        handleValues: [],
        hovering: [],
        dragging: []
      }),
      state: (state, { key, props }) => {
        const index = panelIndex(state, key);
        const size = index === null ? 0 : state.sizes[key];
        const constraints = index === null ? void 0 : state.constraints[index];
        return {
          orientation: state.orientation,
          size,
          collapsed: !!constraints && isCollapsed(constraints, size),
          collapsible: !!props.collapsible
        };
      },
      attrs: (state, { key, props }) => ({
        id: key,
        ...orientationAttrs(state),
        style: panelStyle(props)
      }),
      live: live((state, { key }) => {
        const index = panelIndex(state, key);
        if (index === null) {
          return {};
        }
        const size = state.sizes[key];
        const constraints = state.constraints[index];
        const collapsed = !!constraints && isCollapsed(constraints, size);
        return {
          style: css({ "--resizable-panel-size": `${size}%` }),
          "data-collapsed": collapsed ? "" : void 0,
          // Nothing shows, so nothing in it should take focus or be read.
          inert: collapsed && sameSize(size, 0) ? "" : void 0
        };
      }),
      bind: (_, part) => part.api.internal.bindPanel(part)
    }),
    // It runs across the group, so a horizontal group's separator is vertical.
    // A focusable separator needs aria-valuenow, so it joins the tab order only
    // once the group lays its panels out, never in the server's HTML.
    handle: slot({
      role: "separator",
      focus: "tab-stop",
      keys: (state) => [
        ...state.orientation === "vertical" ? ["ArrowUp", "ArrowDown", "shift+ArrowUp", "shift+ArrowDown"] : ["ArrowLeft", "ArrowRight", "shift+ArrowLeft", "shift+ArrowRight"],
        "Home",
        "End",
        "Enter"
      ],
      props: { disabled: "boolean", id: "id" },
      // A handle shows its own value, hover and drag, so a move reaches the
      // handles whose value it changes.
      selects: selects({
        layout: [],
        controlledLayout: [],
        sizes: [],
        handleValues: ({ key }) => [key],
        hovering: ({ key }) => [key],
        dragging: ({ key }) => [key]
      }),
      state: (state, { key, props }) => ({
        orientation: state.orientation,
        disabled: isDisabled(state) || !!props.disabled,
        dragging: state.dragging === key,
        hovering: state.hovering === key
      }),
      attrs: (state, { key, props }) => {
        const disabled = isDisabled(state) || !!props.disabled;
        return {
          "aria-disabled": disabled ? "true" : void 0,
          "aria-orientation": state.orientation === "horizontal" ? "vertical" : "horizontal",
          ...orientationAttrs(state),
          "data-disabled": disabled ? "" : void 0,
          "data-dragging": state.dragging === key ? "" : void 0,
          style: css({
            flex: "none",
            "touch-action": "none",
            "user-select": "none"
          })
        };
      },
      live: live((state, { key }) => {
        const value = state.handleValues[key];
        const focusable = !!value && !value.disabled && !isDisabled(state);
        return {
          tabindex: focusable ? "0" : void 0,
          "aria-controls": value?.panel,
          "aria-valuenow": value ? String(Math.round(value.now)) : void 0,
          "aria-valuemin": value ? String(Math.round(value.min)) : void 0,
          "aria-valuemax": value ? String(Math.round(value.max)) : void 0,
          "data-hovering": state.hovering === key ? "" : void 0
        };
      }),
      on: {
        keydown: (event, { api, el, key }) => el && api.internal.keydown(event, key, el),
        keyup: (event, { api }) => api.internal.commitKeys(event),
        focusout: (_, { api }) => api.internal.commitKeys(),
        dblclick: (event, { api, key }) => api.internal.toggle(key, event)
      },
      bind: (el, part) => part.api.internal.bindHandle(el, part)
    })
  }),
  agent: { actions: ["setLayout", "collapse", "expand"] }
});
var resizable = resizablePrimitive;
export {
  createResizableController,
  resizable,
  storageKey as resizableStorageKey
};
