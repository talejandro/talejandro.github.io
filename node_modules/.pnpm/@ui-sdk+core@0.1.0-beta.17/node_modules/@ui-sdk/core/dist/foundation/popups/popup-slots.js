// src/foundation/popups/popup-slots.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import { flagWhileBound, settleFlag } from "../kernel/bound-keys.js";
import { openAttrs } from "../kernel/attrs.js";
import { onProps } from "../kernel/part.js";
import { popupContentAttrs } from "./popup.js";
import { ownsEvent, registerPopupElement } from "./popup-elements.js";
function triggerKeydown(internal, event, el, key, props) {
  if (internal.press?.keydown(event, el, key, props) || internal.focus?.keydown(event)) {
    return;
  }
  internal.popup.triggerKeydown(event);
}
function contentKeydown(internal, event, el) {
  if (ownsEvent(el, event)) {
    internal.popup.keydown(event);
  }
}
function bindPopupContent(el, internal, key, part) {
  const {
    preset,
    control,
    contentProps,
    triggerElement,
    element,
    popup,
    press,
    rules,
    presentation
  } = internal;
  const { placement } = preset;
  preset.resetStyles?.bind(el);
  const inline = !!contentProps(key).inline;
  return (presentation ?? popup).bind(el, {
    inline,
    // What it's placed against: a controller's anchor, the content's, or the trigger.
    anchor: () => control.anchor() ?? placement?.anchor(el, contentProps().anchor, triggerElement),
    // Props are read on every check, so a new side applies while open.
    position: placement && !inline ? () => placement.options(
      contentProps(key),
      { side: preset.side, align: "center" },
      element("arrow")
    ) : void 0,
    rendered: part && ((listener) => onProps(part, listener)),
    // Where focus goes once the popup and its children have bound. Hover content takes none.
    initialFocus: press && (() => press.initialFocus(
      popup.element(),
      contentProps().initialFocus,
      rules?.preferredFocus
    )),
    backdrop: () => element("backdrop"),
    ...rules?.bind?.()
  });
}
function bindTrigger(store, key) {
  if (store.get().trigger === null) {
    store.set({ trigger: key });
  }
  return () => {
    if (store.get().trigger === key && !store.get().open) {
      store.set({ trigger: null });
    }
  };
}
function popupTrigger(slot) {
  return slot({
    props: {
      id: "id",
      disabled: "boolean",
      focusableWhenDisabled: "boolean",
      payload: "value"
    },
    state: (state, { key, props }) => ({
      open: state.open && (state.trigger === null || state.trigger === key),
      disabled: !!props.disabled
    }),
    // What the trigger says it opens comes from the feature that opens it: a
    // press's button, or a hover's link that a tooltip describes.
    attrs: (state, { id, key, props, api }) => {
      const { press, focus, role } = api.internal;
      return (press ?? focus)?.triggerAttrs(state, id, key, props, role) ?? {};
    },
    on: {
      pointerenter: (event, { api, key, props }) => !props.disabled && api.internal.hover?.enter(event, key, props.payload),
      pointerleave: (event, { api }) => api.internal.hover?.leave(event),
      focusin: (event, { api, key, props }) => !props.disabled && api.internal.focus?.enter(key, props.payload, event),
      focusout: (event, { api }) => api.internal.focus?.leave(event),
      keydown: (event, { api, el, key, props }) => el && triggerKeydown(api.internal, event, el, key, props)
    },
    press: ({ api, key, props }, event) => api.internal.press?.press(key, props, event),
    bind(el, { api, key, id, store }) {
      if (dev) {
        checkName(el, "The trigger", { component: api.internal.label, id });
      }
      return bindTrigger(store, key);
    }
  });
}
function popupContent(slot) {
  return slot({
    props: {
      side: "string",
      align: "string",
      sideOffset: "number",
      alignOffset: "number",
      collisionPadding: "number",
      container: "value",
      arrowPadding: "number",
      anchor: "string",
      initialFocus: "string",
      finalFocus: "string",
      keepMounted: "boolean"
    },
    connect: registerPopupElement,
    role: (state, { api }) => api.internal.role,
    roles: ["dialog", "alertdialog", "menu", "tooltip"],
    // Only Tab: a menu built on these parts brings its own arrow keys.
    keys: ["Tab"],
    state: (state) => ({
      open: state.open,
      modal: state.modal,
      presentation: state.presentation,
      payload: state.payload
    }),
    present: (state, { props, api }) => state.mounted || !!props.keepMounted || api.internal.role === "tooltip",
    attrs: (state, { id, api }) => {
      const { role, press, triggerName } = api.internal;
      return {
        ...popupContentAttrs(state, id),
        // A tooltip never takes focus, so it needs no tabindex.
        tabindex: role === "tooltip" ? void 0 : "-1",
        ...press?.contentAttrs(state, id, role),
        ...triggerName?.contentAttrs(state, id)
      };
    },
    on: {
      keydown: (event, { api, el }) => el && contentKeydown(api.internal, event, el),
      pointerenter: (event, { api }) => api.internal.hover?.enter(event),
      pointerleave: (event, { api }) => api.internal.hover?.leaveContent(event)
    },
    bind(el, part) {
      settleFlag(part.store, "titled");
      return bindPopupContent(el, part.api.internal, part.key, part);
    }
  });
}
function popupViewport(slot) {
  return slot({ present: (state) => state.presentation === "sheet" });
}
function popupTitle(slot) {
  return slot({
    attrs: (state, { id }) => ({ id: `${id}-title` }),
    bind: (el, { store }) => flagWhileBound(store, "titled", { now: true })
  });
}
function popupDescription(slot) {
  return slot({
    attrs: (state, { id }) => ({ id: `${id}-description` }),
    bind: (el, { store }) => flagWhileBound(store, "described", { now: true })
  });
}
function popupClose(slot) {
  return slot({
    attrs: () => ({ type: "button" }),
    press: ({ api }, event) => api.internal.control.hide({ reason: "close-press", event })
  });
}
function popupArrow(slot) {
  return slot({
    state: (state) => ({ open: state.open }),
    attrs: (state) => ({ "aria-hidden": "true", ...openAttrs(state.open) }),
    // An arrow that binds after its popup was placed, like one Svelte binds
    // after the content, points at the trigger at once.
    bind(_, { api }) {
      api.internal.popup.checkPlacement();
    }
  });
}
function popupBackdrop(slot) {
  return slot({
    state: (state) => ({ open: state.open }),
    present: (state, { api }) => state.mounted || !!api.internal.contentProps().keepMounted,
    role: "presentation",
    attrs: (state) => ({
      hidden: state.mounted ? void 0 : "",
      ...openAttrs(state.open)
    }),
    bind(el, { api }) {
      api.internal.preset.resetStyles?.bind(el);
      return api.internal.popup.backdrop(el);
    }
  });
}
function popupSlots(slot) {
  return {
    trigger: popupTrigger(slot),
    content: popupContent(slot),
    viewport: popupViewport(slot),
    title: popupTitle(slot),
    description: popupDescription(slot),
    close: popupClose(slot),
    arrow: popupArrow(slot),
    backdrop: popupBackdrop(slot)
  };
}
export {
  bindPopupContent,
  bindTrigger,
  popupArrow,
  popupBackdrop,
  popupClose,
  popupContent,
  popupDescription,
  popupSlots,
  popupTitle,
  popupTrigger,
  popupViewport
};
