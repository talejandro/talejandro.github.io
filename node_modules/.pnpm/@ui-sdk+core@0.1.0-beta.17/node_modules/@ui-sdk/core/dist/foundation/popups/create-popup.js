// src/foundation/popups/create-popup.ts
import { deriveFromOptions } from "../kernel/derive.js";
import { createChange } from "../kernel/input-source.js";
import { elements } from "../kernel/elements.js";
import {
  createPopupLayer,
  modalTriple
} from "./popup.js";
import { createOpenSteps } from "./popup-steps.js";
function createPopup(primitiveContext, config) {
  const context = primitiveContext;
  const { store, element, options } = context;
  const { preset } = config;
  const contentSlot = config.slot ?? "content";
  const triggerSlot = config.trigger ?? "trigger";
  const change = createChange(context);
  const contentProps = (key) => key !== void 0 && context.props(contentSlot, key) || elements(context, contentSlot)[0]?.props || context.props(contentSlot) || {};
  const triggerElement = () => {
    if (rules?.trigger) {
      return rules.trigger();
    }
    const key = store.get().trigger;
    return key !== null && element(triggerSlot, key) || element(triggerSlot);
  };
  let goneAtOpen = null;
  let onlyTrigger;
  const openedFrom = () => {
    const key = store.get().trigger;
    if (rules?.trigger || key === null || key === goneAtOpen) {
      return triggerElement();
    }
    const only = onlyTrigger ?? elements(context, triggerSlot).length <= 1;
    return element(triggerSlot, key) ?? (only ? element(triggerSlot) : void 0);
  };
  let wasOpen = store.get().open;
  store.subscribe(() => {
    const { open, trigger } = store.get();
    if (open === wasOpen) {
      return;
    }
    wasOpen = open;
    if (!open) {
      return;
    }
    goneAtOpen = trigger !== null && !element(triggerSlot, trigger) ? trigger : null;
    onlyTrigger = elements(context, triggerSlot).length <= 1;
  });
  const core = {
    label: context.label,
    role: config.role ?? preset.role,
    store,
    options,
    onOptions: context.onOptions,
    onDestroy: context.onDestroy,
    element,
    parts: context.parts,
    preset,
    // The layer and the steps are made last, since they call the features,
    // which reach them through these once something happens.
    get popup() {
      return popup;
    },
    get control() {
      return control;
    },
    triggerElement,
    triggerSlot,
    triggerDisabled: (key) => !!context.props(triggerSlot, key)?.disabled,
    contentProps
  };
  const rules = core.rules = config.rules?.(core);
  const dismissal = preset.dismissal?.(options, rules);
  const presentation = preset.presentation?.(core, dismissal);
  const press = preset.press?.(core);
  const group = preset.group?.(core);
  const hover = preset.hover?.(core, group);
  const focus = preset.focus?.(core);
  const triggerName = preset.triggerName?.(core);
  preset.resetStyles?.prepare(context.label, contentSlot);
  preset.placement?.prepare();
  function modalOf(arriving, state) {
    if (preset.modal === void 0) {
      return;
    }
    return {
      modal: arriving.modal ?? (state.presentation === "sheet" ? true : preset.modal)
    };
  }
  function updateModal() {
    const patch = modalOf(options(), store.get());
    if (patch) {
      store.set(patch);
    }
  }
  function dismiss(reason, details) {
    if (rules?.dismiss) {
      rules.dismiss(reason, details);
    } else {
      control.hide({ reason, ...details });
    }
  }
  const popup = createPopupLayer({
    ...config.behavior,
    preset: preset.behavior,
    position: preset.placement?.position,
    owner: { component: context.label, id: context.id },
    store,
    trigger: triggerElement,
    returnTrigger: openedFrom,
    contains: (target, event) => rules?.contains ? rules.contains(target, event) : !!triggerElement()?.contains(target) || !!press?.contains(target, event),
    close: dismiss,
    modal: () => rules?.modal?.() ?? modalTriple(store.get().modal),
    parent: () => rules?.parent?.(),
    persistent: () => rules?.persistent?.() ?? [],
    finalFocus: () => contentProps().finalFocus,
    onEscape: (event) => rules?.onEscape ? rules.onEscape(event) : dismiss("escape-key", { event, focus: true }),
    onShow: (layer) => rules?.onShow?.(layer),
    onOpenChange(open, closed) {
      rules?.onOpenChange?.(open, closed);
      group?.change(open);
      if (open) {
        presentation?.open();
        updateModal();
        return;
      }
      hover?.clear();
      focus?.clear();
    },
    onOpenChangeComplete(open, closed) {
      rules?.onOpenChangeComplete?.(open, closed);
      options().onOpenChangeComplete?.(open);
    }
  });
  const control = createOpenSteps({
    dismissal,
    popup,
    store,
    payload: preset.payload?.(
      store,
      (payload, details) => change("payload", payload, details)
    ),
    change: (open, details) => change("open", open, { ...details, ...rules?.details?.() }),
    onDestroy: context.onDestroy,
    // Read on every close, once the rules exist.
    get returnFocus() {
      return rules?.returnFocus;
    },
    rules: {
      // A pending hover open or close never fires once something else opens it.
      open(request, open) {
        hover?.clear();
        group?.opening(request.event);
        if (rules?.open) {
          rules.open(request, open);
        } else {
          open();
        }
      },
      // Another trigger that shares the open popup takes it over, with its payload.
      reopen(request) {
        hover?.clear();
        if (rules?.reopen) {
          return rules.reopen(request);
        }
        const { trigger, payload, payloadReason, event } = request;
        if (trigger !== void 0 && trigger !== store.get().trigger) {
          control.takeOver({ trigger, payload, reason: payloadReason, event });
        }
      },
      close: (request, close) => rules?.close ? rules.close(request, close) : close()
    }
  });
  updateModal();
  deriveFromOptions(
    context,
    ["modal"],
    (synced, state, arriving) => modalOf(arriving, { ...state, ...synced })
  );
  let modalShown = store.get().modal;
  store.subscribe(() => {
    const { modal } = store.get();
    if (modal === modalShown) {
      return;
    }
    modalShown = modal;
    popup.updateModal();
  });
  const features = {
    dismissal,
    presentation,
    press,
    group,
    hover,
    focus,
    triggerName,
    rules
  };
  const controller = {
    ...control.api,
    getPayload: () => store.get().payload,
    focus: () => triggerElement()?.focus()
  };
  return {
    ...controller,
    // Internal. Used by parts and adapters: the core the features share, with
    // them and what the parts call.
    internal: Object.assign(core, features)
  };
}
function popupState(options) {
  const open = options.open ?? options.defaultOpen ?? false;
  const state = {
    open,
    mounted: open,
    trigger: null,
    payload: void 0,
    titled: null,
    described: false,
    modal: false,
    presentation: "popover"
  };
  return state;
}
export {
  createPopup,
  popupState
};
