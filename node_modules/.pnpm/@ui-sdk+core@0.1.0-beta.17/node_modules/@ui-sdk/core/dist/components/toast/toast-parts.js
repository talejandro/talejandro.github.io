// src/components/toast/toast-parts.ts
import { ariaKeyshortcuts } from "../../foundation/platform/platform.js";
import { idPart } from "../../foundation/kernel/attrs.js";
import {
  findItem,
  hasToasts,
  isExpanded
} from "./toast-api.js";
var toastSlots = (slot) => ({
  region: slot({
    // A landmark only while there's something in it.
    role: (state) => hasToasts(state.items) ? "region" : void 0,
    roles: ["region"],
    attrs: (state) => {
      const open = hasToasts(state.items);
      return {
        "aria-label": open ? state.label ?? "Notifications" : void 0,
        "aria-keyshortcuts": open && state.shortcut ? ariaKeyshortcuts(state.shortcut) : void 0,
        "data-side": state.side,
        "data-align": state.align,
        "data-expanded": isExpanded(state) ? "" : void 0
      };
    },
    state: (state) => ({
      side: state.side,
      align: state.align,
      expanded: isExpanded(state),
      toasts: state.items
    }),
    on: {
      keydown: (event, { el, api }) => el && api.internal.regionKeydown(event, el)
    },
    bind: (el, { api }) => api.internal.bindRegion(el)
  }),
  list: slot({}),
  root: slot({
    present: (state, { key }) => !!findItem(state.items, key),
    attrs: (state, { key }) => {
      const item = findItem(state.items, key);
      if (!item) {
        return {};
      }
      return {
        tabindex: "0",
        "data-type": item.toast.type,
        // A closing toast keeps it, so it leaves from where it was.
        "data-front": item.index === 0 ? "" : void 0,
        "data-expanded": isExpanded(state) ? "" : void 0,
        // Swipes are the toast's, not the page's.
        style: item.toast.dismissible === false ? void 0 : "touch-action:none"
      };
    },
    state: (state, { key }) => {
      const item = findItem(state.items, key);
      return {
        type: item?.toast.type ?? "default",
        index: item?.index ?? 0,
        front: !!item && item.index === 0,
        expanded: isExpanded(state),
        // A part can render once more after its toast left the region.
        leaving: !item || item.leaving
      };
    },
    on: {
      keydown: (event, { key, api }) => {
        if (event.key !== "Escape") {
          return;
        }
        const toast = api.internal.toaster().toasts().find((item) => item.id === key);
        if (!toast || toast.dismissible === false) {
          return;
        }
        event.preventDefault();
        api.internal.close(key, "escape-key", event);
      }
    },
    bind: (el, { key, api }) => api.internal.bindToast(el, key)
  }),
  title: slot({
    props: { id: { kind: "string", from: "root" } },
    attrs: (_, { id, key }) => ({ id: `${id}-${idPart(key)}-title` }),
    bind: (_, { key, api }) => {
      api.internal.label(key);
      return () => queueMicrotask(() => api.internal.label(key));
    }
  }),
  description: slot({
    props: { id: { kind: "string", from: "root" } },
    attrs: (_, { id, key }) => ({ id: `${id}-${idPart(key)}-description` }),
    bind: (_, { key, api }) => {
      api.internal.label(key);
      return () => queueMicrotask(() => api.internal.label(key));
    }
  }),
  action: slot({
    props: {
      id: "id",
      toast: { kind: "string", from: "root.id" },
      onAction: "action",
      dismiss: "boolean"
    },
    attrs: (state, { key }) => buttonAttrs(state.buttons[key]),
    state: (state, { key }) => ({
      pending: !!state.buttons[key]?.pending,
      error: state.buttons[key]?.error
    }),
    press: ({ key, props, api }, event) => {
      const action = api.internal.toaster().toasts().find((toast) => toast.id === props.toast)?.action;
      api.internal.press(
        key,
        props.toast,
        props.onAction ?? action?.onAction,
        props.dismiss ?? action?.dismiss ?? true,
        "action",
        event
      );
    }
  }),
  close: slot({
    props: {
      id: "id",
      toast: { kind: "string", from: "root.id" },
      action: "action"
    },
    attrs: (state, { key }) => buttonAttrs(state.buttons[key]),
    state: (state, { key }) => ({
      pending: !!state.buttons[key]?.pending,
      error: state.buttons[key]?.error
    }),
    press: ({ key, props, api }, event) => api.internal.press(
      key,
      props.toast,
      props.action,
      true,
      "close-press",
      event
    )
  })
});
function buttonAttrs(state) {
  return {
    "data-pending": state?.pending ? "" : void 0,
    "aria-busy": state?.pending ? "true" : void 0,
    // Presses do nothing while it's pending. Not the native attribute, which would drop focus.
    "aria-disabled": state?.pending ? "true" : void 0
  };
}
export {
  toastSlots
};
