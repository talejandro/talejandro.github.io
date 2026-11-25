// src/components/menubar/menubar.ts
import { moveIndex, orientationOf } from "../../foundation/focus/collection.js";
import { isRTL } from "../../foundation/platform/env.js";
import { pointerModalAttribute } from "../../foundation/popups/modal-attribute.js";
import { createSafeArea } from "../../foundation/popups/safe-area.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import {
  createTypeahead,
  isTypeaheadKey,
  labelOf
} from "../../foundation/text/typeahead.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createMenubarController() {
  return createController();
}
function menubarApiBody(context) {
  const { store, options, element } = context;
  const members = /* @__PURE__ */ new Map();
  const typeahead = createTypeahead();
  const orientation = () => store.get().orientation;
  const loop = () => options().loop ?? true;
  const roving = createRovingFocus(context, {
    slot: "trigger",
    key: "stop",
    orientation,
    loop,
    claims: (state, trigger) => state.disabled || !trigger.props.disabled
  });
  let held = null;
  const release = (event) => {
    if (event.target === held) {
      held = null;
    }
  };
  const aim = createSafeArea();
  let pointerOn = null;
  const openMember = () => {
    const open = store.get().open;
    return open === null ? void 0 : members.get(open);
  };
  function moveTo(next, event, open) {
    if (!next) {
      return;
    }
    const member = members.get(next.key);
    if (open && member && !member.disabled()) {
      member.open({ focus: "first", reason: "trigger-press", event });
    } else if (openMember()?.close({ reason: "submenu-switch", event, focus: false }) !== false) {
      next.el.focus();
    }
    const current = store.get().open;
    if (current === null || current === next.key) {
      roving.remember(next.key);
    }
  }
  const api = {
    focus: () => roving.focus(),
    isOpen: () => store.get().open !== null,
    close: ({
      reason = "imperative",
      event
    } = {}) => openMember()?.close({ reason, event, focus: true }) ?? false,
    internal: {
      orientation,
      disabled: () => store.get().disabled,
      modal: () => store.get().modal,
      stop: () => store.get().stop,
      subscribe: store.subscribe,
      element: () => element("root"),
      isStop: (key, enabled) => roving.tabIndex(store.get(), { key, props: { disabled: !enabled } }) === "0",
      join(key, el, member) {
        members.set(key, member);
        const leave = roving.bind(el, { key, props: {} });
        return () => {
          if (members.get(key) === member) {
            members.delete(key);
          }
          leave();
        };
      },
      // Whether a press lands on one of the menubar's triggers, which never
      // counts as outside its open menu: it switches menus instead.
      onTrigger: (target) => roving.items().some((item) => item.el.contains(target)),
      // One menu is open at a time. Another opening closes it, unless it refuses.
      opening: (key, event) => [...members].every(
        ([other, member]) => other === key || !member.isOpen() || member.close({ reason: "submenu-switch", event, focus: false })
      ),
      openChanged(key, open) {
        aim.stop();
        if (open) {
          held = null;
          store.set({ open: key });
        } else if (store.get().open === key) {
          store.set({ open: null });
        }
      },
      // Left and Right inside an open menu, on an item without a submenu. A
      // horizontal menubar opens the neighbouring menu at its first item, as
      // the APG asks, and returns "moved". A vertical one opens its menus to
      // the side, so the key back toward the menubar returns "close", for the
      // menu to close like a submenu, and the other does nothing.
      menuArrow(key, by, event) {
        if (orientation() === "vertical") {
          return by === -1 ? "close" : void 0;
        }
        const list = roving.items();
        const index = list.findIndex((item) => item.key === key);
        const next = list[moveIndex(index, by, list.length, loop())];
        if (next && next.key !== key) {
          moveTo(next, event, true);
        }
        return "moved";
      },
      // Keys on a trigger. Arrows along the menubar, Home, End and typeahead
      // move between triggers, and a menu open from the trigger moves along.
      // Returns where focus goes when the key opens the trigger's menu: the
      // arrow across the menubar, Enter and Space open it at its first item,
      // and Up at its last.
      triggerKeydown(event, key, el, disabled) {
        if (event.key === "Escape") {
          held = null;
        }
        const wasOpen = members.get(key)?.isOpen() ?? false;
        const moved = event.shiftKey ? void 0 : roving.keydown(event, el);
        if (moved) {
          if (wasOpen && moved.key !== moved.from) {
            moveTo(
              roving.items().find((item) => item.key === moved.key),
              event,
              true
            );
          }
          return;
        }
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (isTypeaheadKey(event) && event.key !== " ") {
          const list = roving.items();
          const found = typeahead(
            event.key,
            list.map((item) => labelOf(item.el)),
            list.findIndex((item) => item.key === key)
          );
          if (found === -1) {
            return;
          }
          event.preventDefault();
          return moveTo(list[found], event, wasOpen);
        }
        if (disabled) {
          return;
        }
        const vertical = orientation() === "vertical";
        const first = vertical ? event.key === (isRTL(el) ? "ArrowLeft" : "ArrowRight") : event.key === "ArrowDown";
        const last = !vertical && event.key === "ArrowUp";
        const activate = el.tagName !== "BUTTON" && (event.key === "Enter" || event.key === " ");
        if (!first && !last && !activate) {
          return;
        }
        event.preventDefault();
        return last ? "last" : "first";
      },
      // While a menu is open, resting the pointer on another trigger switches
      // to its menu, like a desktop menubar.
      hover(key, event) {
        const open = store.get().open;
        const member = members.get(key);
        if (open === null && !held || open === key || !member || event.pointerType === "touch") {
          return;
        }
        pointerOn = key;
        const rested = () => pointerOn === key && api.internal.hover(key, event);
        if (aim.contains({ x: event.clientX, y: event.clientY }, rested)) {
          return;
        }
        aim.stop();
        if (member.disabled()) {
          const next = roving.items().find((item) => item.key === key);
          if (!next) {
            return;
          }
          moveTo(next, event, false);
          if (store.get().open !== null) {
            return;
          }
          held = next.el;
          next.el.addEventListener("blur", release, { once: true });
          return;
        }
        roving.remember(key);
        member.open({
          focus: "popup",
          reason: "trigger-hover",
          event,
          by: "pointer"
        });
      },
      hoverMove(key, event) {
        if (aim.active()) {
          api.internal.hover(key, event);
        }
      },
      leave(key, event, menu) {
        if (pointerOn === key) {
          pointerOn = null;
        }
        if (store.get().open !== key || !menu) {
          return;
        }
        aim.start(
          { x: event.clientX, y: event.clientY },
          menu,
          orientation() === "vertical" ? "x" : "y"
        );
      },
      enterMenu: () => aim.stop()
    }
  };
  return api;
}
var menubarApi = menubarApiBody;
var menubarPrimitive = /* @__PURE__ */ definePrimitive({
  name: "menubar",
  options: {
    orientation: "string",
    loop: "boolean",
    disabled: "boolean",
    modal: pointerModalAttribute,
    controller: "value"
  },
  state: (options) => ({
    orientation: orientationOf(options.orientation, "horizontal"),
    disabled: !!options.disabled,
    modal: options.modal ?? "pointer",
    stop: null,
    open: null
  }),
  // Nothing here is a controllable `open`.
  controlled: [],
  sync: (options) => ({
    orientation: orientationOf(options.orientation, "horizontal"),
    disabled: !!options.disabled,
    modal: options.modal ?? "pointer"
  }),
  api: menubarApi,
  slots: (slot) => ({
    root: slot({
      role: "menubar",
      keys: {
        none: "Each menu's trigger, an item of the menubar, handles them."
      },
      state: (state) => ({
        orientation: state.orientation,
        disabled: state.disabled,
        open: state.open !== null,
        modal: state.modal
      }),
      attrs: (state) => ({
        "aria-orientation": state.orientation,
        "data-orientation": state.orientation,
        "data-disabled": state.disabled ? "" : void 0,
        "data-open": state.open !== null ? "" : void 0
      })
    })
  }),
  agent: { actions: ["close"] }
});
var menubar = menubarPrimitive;
export {
  createMenubarController,
  menubar
};
