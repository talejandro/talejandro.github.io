// src/components/dialog/dialog-api.ts
import { announcePending, runAction } from "../../foundation/kernel/action.js";
import { measureViewportEarly } from "../../foundation/platform/keyboard.js";
import { measureScrollerEarly } from "../../foundation/popups/modal.js";
import { isBrowser } from "../../foundation/platform/env.js";
import { activeElement } from "../../foundation/platform/platform.js";
import {
  createPopup
} from "../../foundation/popups/create-popup.js";
import {
  alertDialogPreset
} from "../../foundation/popups/popup-presets.js";
import { isTabbable } from "../../foundation/focus/tabbable.js";
import { isDismissal } from "../../foundation/kernel/details.js";
import { log } from "../../foundation/kernel/change.js";
import { changeSource } from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
import { shortcutOf } from "../../foundation/shortcuts/shortcut-slot.js";
var dialogLayers = /* @__PURE__ */ new WeakMap();
var ownContent = [
  '[data-slot="dialog-content"]',
  '[data-slot="alert-dialog-content"]',
  '[data-slot="drawer-content"]'
].join(",");
var closesWhilePending = ["imperative", "action", "parent-close"];
function dialogRefusal(reason, policy) {
  const dismissal = isDismissal(reason);
  const refused = policy.pending && !closesWhilePending.includes(reason) || dismissal && (!policy.dismissible || reason === "outside-press" && !policy.outsidePress);
  if (!refused) {
    return void 0;
  }
  return dismissal && !(reason === "outside-press" && policy.beside) ? "attempt" : "silent";
}
function resolveElements(list) {
  if (!list || !isBrowser) {
    return [];
  }
  if (typeof list === "function") {
    return list();
  }
  return list.flatMap(
    (item) => typeof item === "string" ? Array.from(document.querySelectorAll(item)) : [item]
  );
}
function dialogApiBody(context, alert, extra = {}) {
  const { store, element } = context;
  const options = context.options;
  announcePending(context, () => store.get().pending !== null);
  const modal = () => store.get().modal;
  let session = 0;
  const closesOnOutsidePress = () => !alert && (options().closeOnOutsidePress ?? modal() !== false);
  let parent;
  const children = /* @__PURE__ */ new Set();
  function restack() {
    const stack = children.size ? Math.max(...[...children].map((child) => child.stack() + 1)) : 0;
    if (stack === store.get().stack) {
      return;
    }
    store.set({ stack });
    parent?.add(nesting);
  }
  const nesting = {
    close: (reason) => control.hide({ reason }),
    stack: () => store.get().stack,
    add(child) {
      children.add(child);
      restack();
    },
    remove(child) {
      children.delete(child);
      restack();
    }
  };
  const popup = createPopup(
    context,
    {
      // A modal dialog wraps Tab, pauses the page's shortcuts and blocks the
      // page, its trigger included. A non-modal one is part of the page, and
      // focus leaving doesn't close it. Either stays open whatever has focus.
      preset: extra.preset ?? alertDialogPreset,
      role: alert ? "alertdialog" : "dialog",
      rules: (core) => ({
        persistent: () => resolveElements(options().persistentElements),
        onEscape(event) {
          if (modal() === false && !core.popup.element()?.contains(activeElement())) {
            return;
          }
          core.control.hide({ reason: "escape-key", event });
        },
        onShow(layer) {
          dialogLayers.set(layer, nesting);
          parent = void 0;
          for (let up = layer.parent; up && !parent; up = up.parent) {
            parent = dialogLayers.get(up);
          }
          parent?.add(nesting);
          store.set({ nested: !!parent });
          const cleanup = extra.onShow?.(layer);
          return () => {
            cleanup?.();
            dialogLayers.delete(layer);
          };
        },
        onOpenChange(open) {
          extra.onOpenChange?.(open);
          if (open) {
            if (isBrowser) {
              const doc = core.triggerElement()?.ownerDocument ?? document;
              if (modal() === true) {
                measureScrollerEarly(doc);
              }
              measureViewportEarly(doc.defaultView);
            }
            return;
          }
          session++;
          store.set({ pending: null });
          for (const child of [...children]) {
            child.close("parent-close");
          }
          parent?.remove(nesting);
          parent = void 0;
        },
        // Close parts' errors are from the last time it was open.
        open(_, open) {
          store.set({ errors: {} });
          open();
        },
        // How Dialog refuses a close, before any rule hears it.
        refusal: (reason) => dialogRefusal(reason, {
          dismissible: options().dismissible !== false,
          outsidePress: closesOnOutsidePress(),
          pending: store.get().pending !== null,
          beside: modal() !== true && !alert
        }),
        refused: (reason) => extra.onRefuse?.(reason),
        dismiss(reason, details) {
          if (!extra.intercept?.(reason, details.event)) {
            core.control.hide({ reason, ...details });
          }
        },
        // `"auto"` focuses an autofocused element first, and an alert dialog its
        // least destructive action, before the first focusable element.
        preferredFocus() {
          const content = core.popup.element();
          const auto = content?.querySelector(
            "[autofocus], [data-autofocus]"
          );
          if (auto && isTabbable(auto)) {
            return auto;
          }
          if (alert) {
            return elements(context, "close").find(({ el }) => isTabbable(el))?.el;
          }
        },
        bind: extra.bind
      })
    }
  );
  const { control } = popup.internal;
  function closePress(key, props, event) {
    if (!store.get().open || store.get().pending !== null) {
      return;
    }
    const action = props.action;
    if (!action) {
      return control.hide({
        reason: "close-press",
        event,
        returnValue: props.value
      });
    }
    const { [key]: _, ...errors } = store.get().errors;
    store.set({ errors });
    const source = changeSource("action", event);
    let waited = false;
    const started = session;
    runAction((details) => action(event, details), source, {
      pending(pending) {
        if (started !== session) {
          return;
        }
        waited = true;
        store.set({ pending: pending ? key : null });
        log(context, "pending", pending, { reason: "action", source });
      },
      done() {
        if (started !== session) {
          return;
        }
        control.hide({
          reason: "action",
          event: waited ? void 0 : event,
          returnValue: props.value
        });
      },
      failed: (error) => {
        if (started !== session) {
          return;
        }
        store.set({ errors: { ...store.get().errors, [key]: error } });
        log(context, "error", error, { reason: "action", source });
      }
    });
  }
  function shortcutPress(key, event) {
    const props = context.props("trigger", key) ?? {};
    if (props.disabled) {
      return;
    }
    if (store.get().open) {
      return control.hide({ reason: "shortcut", event });
    }
    control.show({
      event,
      by: "keyboard",
      reason: "shortcut",
      trigger: key,
      payload: props.payload
    });
  }
  return {
    ...popup,
    // Internal. Used by slots and adapters.
    internal: Object.assign(popup.internal, {
      options,
      show: control.show,
      hide: control.hide,
      takeOver: control.takeOver,
      alert,
      // Where focus goes on open, for a drawer, which binds its content itself.
      initialFocus: () => {
        const { press, popup: layer, contentProps, rules } = popup.internal;
        return press.initialFocus(
          layer.element(),
          contentProps().initialFocus,
          rules?.preferredFocus
        );
      },
      closePress,
      shortcutPress,
      // The shortcut of the trigger an element sits in or beside.
      shortcutOf: (el) => shortcutOf(context, "trigger", el, { beside: true }),
      backdropElement: () => element("backdrop")
    })
  };
}
var dialogApi = dialogApiBody;
export {
  dialogApi,
  dialogRefusal,
  ownContent
};
