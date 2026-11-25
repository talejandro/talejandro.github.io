// src/components/navigation-menu/navigation-menu-api.ts
import {
  bindFindable,
  focusPressedTrigger
} from "../../foundation/disclosure/disclosure.js";
import { createHoverIntent } from "../../foundation/popups/hover.js";
import { createSafeArea } from "../../foundation/popups/safe-area.js";
import { ownsEvent } from "../../foundation/popups/popup-elements.js";
import {
  contentAnchor,
  placementOptions
} from "../../foundation/popups/popup-features.js";
import { restoreFocus } from "../../foundation/kernel/modality.js";
import {
  modalTriple,
  openerOf,
  prepareReset,
  resetPopoverStyles
} from "../../foundation/popups/popup.js";
import { createSteppedPopup } from "../../foundation/popups/popup-steps.js";
import { position } from "../../foundation/platform/position.js";
import "../../foundation/platform/sides.js";
import {
  animateIn,
  animateOut,
  writeOpen
} from "../../foundation/motion/presence.js";
import {
  bindIndicator,
  collapseWhileHidden,
  createViewportSize
} from "./navigation-menu-dom.js";
import { createFocus } from "./navigation-menu-focus.js";
import { opensElsewhere } from "./navigation-menu-keyboard.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { isComposing, on } from "../../foundation/kernel/events.js";
import { onProps } from "../../foundation/kernel/part.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
import { whenKept } from "../../foundation/kernel/keep.js";
var popupSelectors = [
  '[data-slot="navigation-menu-viewport"]',
  '[data-slot="navigation-menu-content"]'
];
var warmFor = 300;
function navigationMenuApiBody(context) {
  const { store, options, element } = context;
  const change = createChange(context);
  whenKept(() => prepareReset(popupSelectors));
  let closedAt = -Infinity;
  let asked = null;
  let changed = false;
  let reportedOpen = store.get().value !== null;
  let openedSinceClose = reportedOpen;
  const triggerOf = (key) => key === null ? void 0 : element("trigger", key);
  const shownItem = () => store.get().value ?? store.get().active;
  function followUp(from, state) {
    if (state.value === null) {
      return { previous: null, forward: null };
    }
    const order = elements(context, "trigger").map((entry) => entry.key);
    const switching = from !== null;
    return {
      active: state.value,
      previous: switching ? from : null,
      forward: switching ? order.indexOf(state.value) > order.indexOf(from) : null,
      exiting: [
        ...state.exiting.filter((key) => key !== state.value && key !== from),
        ...switching && state.viewport ? [from] : []
      ]
    };
  }
  deriveFromOptions(
    context,
    ["active", "previous", "forward", "exiting"],
    (synced, state) => "value" in synced && synced.value !== state.value ? followUp(state.value, {
      ...state,
      value: synced.value ?? null
    }) : void 0
  );
  let lastValue = store.get().value;
  store.subscribe(() => {
    const state = store.get();
    if (state.value === lastValue) {
      return;
    }
    const from = lastValue;
    lastValue = state.value;
    store.set(followUp(from, state));
    if (state.value === null) {
      closedAt = performance.now();
      return;
    }
    if (from === null) {
      openedSinceClose = true;
    }
    ensureSurface(state.value);
    writeViewportSize();
  });
  const parent = options().parent;
  if (parent) {
    context.onDestroy(
      parent.api.internal.watch((value) => {
        if (value !== parent.item && store.get().value !== null) {
          close({ reason: "parent-close", focus: false });
        }
      })
    );
  }
  function createSurface(key) {
    const view = (state) => key === null ? { open: state.value !== null, mounted: state.mounted } : { open: state.value === key, mounted: state.contents.includes(key) };
    function mountedPatch(mounted, state) {
      if (key === null) {
        return mounted ? { mounted } : { mounted, exiting: [] };
      }
      const others = state.contents.filter((other) => other !== key);
      return { contents: mounted ? [...others, key] : others };
    }
    const lens = {
      get: () => view(store.get()),
      set({ mounted }) {
        if (mounted !== void 0) {
          store.set(mountedPatch(mounted, store.get()));
        }
      },
      subscribe: store.subscribe
    };
    const { popup, steps } = createSteppedPopup(
      {
        preset: "navigationMenu",
        position,
        owner: { component: "navigation-menu", id: context.id },
        store: lens,
        trigger: () => triggerOf(key ?? shownItem()),
        close: (reason, { event, focus }) => close({ reason, event, focus }),
        modal: () => modalTriple(false),
        // Presses and focus anywhere in the navigation count as inside, so
        // moving between its items never dismisses the open one.
        contains: (target) => !!element("root")?.contains(target),
        onOpenChange(open2) {
          if (!open2) {
            stopHover();
          }
        },
        onOpenChangeComplete(open2) {
          if (key === null && !open2) {
            detachViewport();
          }
          if (surface() !== surfaces.get(key) || open2 !== (store.get().value !== null)) {
            return;
          }
          if (open2 ? reportedOpen : !openedSinceClose) {
            return;
          }
          reportedOpen = open2;
          if (!open2) {
            openedSinceClose = false;
          }
          options().onOpenChangeComplete?.(open2);
        }
      },
      {
        change(open2, { reason, event }) {
          changed = change("value", open2 ? key ?? asked : null, {
            reason,
            event
          });
          return changed;
        },
        onDestroy: context.onDestroy,
        rules: {
          // The viewport stays open while another item takes it over, which opens it anew.
          reopen(_request, open2) {
            if (store.get().value !== asked) {
              open2();
            }
          }
        }
      }
    );
    deriveFromOptions(
      context,
      key === null ? ["mounted", "exiting"] : ["contents"],
      (synced, state) => {
        const next = { ...state, ...synced };
        const { open: open2 } = view(next);
        if (open2 === view(state).open || popup.mountedAs(open2) !== open2) {
          return;
        }
        return mountedPatch(open2, next);
      }
    );
    return { ...popup, show: steps.show, hide: steps.hide };
  }
  const surfaces = /* @__PURE__ */ new Map();
  function ensureSurface(key) {
    if (surfaces.has(key)) {
      return;
    }
    if (store.get().value === key && !store.get().contents.includes(key)) {
      store.set({ contents: [...store.get().contents, key] });
    }
    surfaces.set(key, createSurface(key));
  }
  surfaces.set(null, createSurface(null));
  if (store.get().value !== null) {
    ensureSurface(store.get().value);
  }
  function surface() {
    if (store.get().viewport) {
      return surfaces.get(null);
    }
    const key = shownItem();
    return key !== null && surfaces.get(key) || surfaces.get(null);
  }
  const intent = createHoverIntent({
    trigger: () => triggerOf(store.get().value),
    popup: () => surface().element(),
    closesOnLeave: () => store.get().value !== null && surface().opener() === "hover",
    closeDelay: () => options().closeDelay ?? 50,
    close(event) {
      if (surface().element()?.contains(document.activeElement)) {
        return;
      }
      close({ reason: "trigger-hover", event, focus: false });
    }
  });
  const aim = createSafeArea();
  let pointerOn = null;
  context.onDestroy(stopHover);
  function stopHover() {
    intent.clear();
    aim.stop();
  }
  function open(key, { reason = "imperative", event, by = "imperative" } = {}) {
    stopHover();
    ensureSurface(key);
    asked = key;
    changed = store.get().value === key;
    (store.get().viewport ? surfaces.get(null) : surfaces.get(key)).show({
      reason,
      event,
      by
    });
    return changed;
  }
  function close({
    reason = "imperative",
    event,
    focus = true
  } = {}) {
    if (store.get().value === null) {
      return false;
    }
    changed = false;
    surface().hide({ reason, event, focus });
    return changed;
  }
  function leavePanel(event) {
    const target = event.relatedTarget;
    if (target && triggerOf(store.get().value)?.contains(target)) {
      return;
    }
    intent.leave(event);
  }
  function enterPanel(event) {
    aim.stop();
    intent.enter(event);
  }
  function leaveTrigger(event, key) {
    if (pointerOn === key) {
      pointerOn = null;
    }
    const panel = surface().element();
    if (store.get().value === key && panel && event.pointerType !== "touch") {
      const along = store.get().orientation === "horizontal" ? "y" : "x";
      aim.start({ x: event.clientX, y: event.clientY }, panel, along);
    }
    intent.leave(event);
  }
  function hoverEnter(event, key, disabled) {
    if (options().openOnHover === false || disabled) {
      return;
    }
    pointerOn = key;
    if (store.get().value !== null) {
      intent.enter(event);
      if (store.get().value === key) {
        return;
      }
      const switchTo = () => open(key, { reason: "trigger-hover", event, by: "hover" });
      if (aim.contains(
        { x: event.clientX, y: event.clientY },
        () => pointerOn === key && switchTo()
      )) {
        return;
      }
      switchTo();
      return;
    }
    const warm = store.get().mounted || store.get().contents.length > 0 || performance.now() - closedAt < warmFor;
    const delay = warm ? 0 : options().delay ?? 50;
    intent.enter(
      event,
      () => !context.props("trigger", key)?.disabled && options().openOnHover !== false && open(key, { reason: "trigger-hover", event, by: "hover" }),
      delay
    );
  }
  function triggerPress(key, el, event) {
    focusPressedTrigger(el);
    const by = openerOf(event);
    if (store.get().value !== key) {
      return open(key, { reason: "trigger-press", event, by });
    }
    if (surface().opener() === "hover" && (by === "pointer" || by === "touch")) {
      return open(key, { reason: "trigger-press", event, by });
    }
    close({ reason: "trigger-press", event });
  }
  const keys = createFocus({
    orientation: () => store.get().orientation,
    value: () => store.get().value,
    list: () => element("list"),
    triggers: () => elements(context, "trigger"),
    links: () => elements(context, "link").map((entry) => entry.el),
    trigger: triggerOf,
    content: (key) => element("content", key),
    panel: () => surface().element(),
    open: (key, event) => open(key, { reason: "trigger-press", event, by: "keyboard" })
  });
  const topLevel = keys.topLevel;
  function linkPress(event, closeOnSelect) {
    if (opensElsewhere(event)) {
      return;
    }
    if (!(closeOnSelect ?? options().closeOnSelect ?? true)) {
      return;
    }
    close({ reason: "link-press", event });
    parent?.api.internal.linkPress(event, true);
  }
  function bindLink(el, key) {
    let cancelPress = () => {
    };
    const unlisten = on(el, "click", (event) => {
      cancelPress = afterDispatch(
        el,
        event,
        () => linkPress(
          event,
          context.props("link", key)?.closeOnSelect
        )
      );
    });
    return () => {
      unlisten();
      cancelPress();
    };
  }
  const viewportSize = createViewportSize({
    viewport: () => element("viewport"),
    content: () => store.get().value === null ? void 0 : element("content", store.get().value)
  });
  const writeViewportSize = viewportSize.write;
  context.onDestroy(viewportSize.disconnect);
  function placement(el, props, key, part) {
    return {
      anchor: () => contentAnchor(el, props().anchor, () => triggerOf(key ?? shownItem())),
      // A new orientation moves the side it opens on, like new props.
      rendered(listener) {
        let { orientation } = store.get();
        const offState = store.subscribe(() => {
          if (store.get().orientation === orientation) {
            return;
          }
          orientation = store.get().orientation;
          listener();
        });
        const offProps = onProps(part, listener);
        return () => {
          offState();
          offProps();
        };
      },
      position: () => placementOptions(props(), {
        side: store.get().orientation === "vertical" ? "end" : "bottom",
        align: "start"
      })
    };
  }
  let viewportPopup;
  function attachViewport() {
    if (!viewportPopup || viewportPopup.unbind) {
      return false;
    }
    viewportPopup.unbind = surfaces.get(null).bind(viewportPopup.el, viewportPopup.config);
    return true;
  }
  function showViewport(content) {
    if (!attachViewport()) {
      return;
    }
    viewportSize.measure(content);
    surfaces.get(null).place();
  }
  function detachViewport() {
    viewportPopup?.unbind?.();
    if (viewportPopup) {
      viewportPopup.unbind = void 0;
    }
  }
  function bindViewport(el, part) {
    resetPopoverStyles(el.ownerDocument, popupSelectors);
    const props = () => elements(context, "viewport")[0]?.props ?? context.props("viewport") ?? {};
    const viewport = surfaces.get(null);
    viewportPopup = {
      el,
      config: {
        ...placement(el, props, null, part),
        initialFocus: () => void 0
      }
    };
    store.set({ viewport: true });
    const { value } = store.get();
    const shown = value === null ? void 0 : element("content", value);
    if (shown && el.contains(shown)) {
      showViewport(shown);
    }
    const listeners = [
      on(el, "keydown", (event) => {
        if (ownsEvent(el, event) && !event.defaultPrevented && !isComposing(event)) {
          viewport.keydown(event);
        }
      }),
      on(el, "pointerenter", enterPanel),
      on(el, "pointerleave", leavePanel)
    ];
    return () => {
      listeners.forEach((stop) => stop());
      detachViewport();
      viewportPopup = void 0;
      store.set({ viewport: false });
    };
  }
  function bindContent(el, key, props, part) {
    ensureSurface(key);
    const cleanups = [];
    const viewport = element("viewport");
    if (viewport?.contains(el)) {
      cleanups.push(bindInViewport(el, key));
    } else {
      let unbind;
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled || store.get().viewport) {
          return;
        }
        resetPopoverStyles(el.ownerDocument, popupSelectors);
        const placed = placement(
          el,
          () => context.props("content", key) ?? {},
          key,
          part
        );
        unbind = surfaces.get(key).bind(el, { ...placed, initialFocus: () => void 0 });
      });
      cleanups.push(() => {
        cancelled = true;
        unbind?.();
      });
    }
    const isFindable = () => !!(context.props("content", key) ?? props).hiddenUntilFound;
    let stopFinding;
    const follow = () => {
      if (isFindable() === !!stopFinding) {
        return;
      }
      if (stopFinding) {
        stopFinding();
        stopFinding = void 0;
        return;
      }
      const findable = bindFindable(el, {
        shown: () => isShown(store.get(), key),
        findable: isFindable,
        reveal: (event) => open(key, { reason: "find-in-page", event })
      });
      const stops = [findable, store.subscribe(findable.check)];
      if (!viewport?.contains(el)) {
        stops.push(
          collapseWhileHidden(el, () => isShown(store.get(), key), store)
        );
      }
      stopFinding = () => {
        findable.check();
        stops.forEach((stop) => stop());
      };
    };
    follow();
    cleanups.push(onProps(part, follow), () => stopFinding?.());
    keys.contentBound(key, el);
    return () => cleanups.forEach((cleanup) => cleanup());
  }
  function bindInViewport(el, key) {
    const stopObserving = viewportSize.observe(el);
    showViewport(el);
    let leaving = false;
    let stopAnimation = animateIn(el);
    const unsubscribe = store.subscribe(() => {
      const state = store.get();
      const exiting = state.exiting.includes(key);
      if (exiting && !leaving) {
        leaving = true;
        stopAnimation();
        const trigger = triggerOf(key);
        if (el.contains(document.activeElement) && trigger) {
          restoreFocus(trigger);
        }
        writeOpen(el, false);
        stopAnimation = animateOut(
          el,
          () => store.set({
            exiting: store.get().exiting.filter((other) => other !== key)
          })
        );
      } else if (!exiting && leaving && state.value === key) {
        leaving = false;
        stopAnimation();
        writeOpen(el, true);
        stopAnimation = animateIn(el);
      }
    });
    return () => {
      unsubscribe();
      stopAnimation();
      stopObserving();
    };
  }
  function indicator(el) {
    return bindIndicator(el, {
      target: () => triggerOf(store.get().value) ?? topLevel().find(
        (item) => item.matches(
          '[data-slot="navigation-menu-link"][aria-current="page"]'
        )
      ),
      watched: () => [element("list"), ...topLevel()],
      root: () => element("root"),
      onChange: api.internal.watch
    });
  }
  const api = {
    /** The open item's value, or null when every panel is closed. */
    getValue: () => store.get().value,
    /** Opens an item's panel, or closes the open one with `null`. Returns false when canceled. */
    setValue(value, { reason = "imperative", event } = {}) {
      return value === null ? close({ reason, event }) : open(value, { reason, event });
    },
    /** Whether a panel is open. */
    isOpen: () => store.get().value !== null,
    /** Closes the open panel. Returns false when canceled or already closed. */
    close: ({ reason = "imperative", event } = {}) => close({ reason, event }),
    /** Moves focus to an item's trigger: the open one, or the first one, without a value. */
    focus(value) {
      const key = value ?? store.get().value;
      (key === null ? elements(context, "trigger")[0]?.el : triggerOf(key))?.focus();
    },
    internal: {
      options,
      // The viewport contents render into, once it's bound.
      viewportElement: () => element("viewport"),
      surface,
      ensureSurface,
      surfaces,
      hoverEnter,
      hoverMove(event, key, disabled) {
        if (aim.active() && store.get().value !== key) {
          hoverEnter(event, key, disabled);
        }
      },
      leaveTrigger,
      enterPanel,
      triggerPress,
      listKeydown: keys.listKeydown,
      panelKeydown: keys.panelKeydown,
      rootKeydown: keys.rootKeydown,
      linkPress,
      leavePanel,
      // Listens for the open item to change, like a nested menu watching its parent.
      watch(listener) {
        let value = store.get().value;
        return store.subscribe(() => {
          if (store.get().value === value) {
            return;
          }
          value = store.get().value;
          listener(value);
        });
      },
      bindViewport,
      bindContent,
      bindLink,
      bindIndicator: indicator,
      // Whether an item's content renders inside the viewport: while its item
      // is open or animating out. Closed contents kept in the page stay with
      // their item, in the server's HTML too.
      inViewport(key) {
        const state = store.get();
        return state.viewport && state.mounted && isShownInViewport(state, key);
      }
    }
  };
  return api;
}
var navigationMenuApi = navigationMenuApiBody;
function isShownInViewport(state, key) {
  return key === state.value || state.value === null && key === state.active || state.exiting.includes(key);
}
function isShown(state, key) {
  if (state.viewport) {
    return state.mounted && isShownInViewport(state, key);
  }
  return key === state.value || state.contents.includes(key);
}
function afterDispatch(el, event, run) {
  const view = el.ownerDocument.defaultView;
  if (!view || !el.isConnected) {
    run();
    return () => {
    };
  }
  const cancel = () => {
    view.removeEventListener(event.type, finish);
    view.clearTimeout(timer);
  };
  const finish = () => {
    cancel();
    run();
  };
  const timer = view.setTimeout(finish);
  view.addEventListener(event.type, finish, { once: true });
  return cancel;
}
export {
  isShown,
  navigationMenuApi
};
