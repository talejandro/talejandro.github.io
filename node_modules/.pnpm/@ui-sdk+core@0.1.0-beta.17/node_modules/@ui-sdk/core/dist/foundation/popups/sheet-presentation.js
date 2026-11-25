// src/foundation/popups/sheet-presentation.ts
import { on } from "../kernel/events.js";
import { setStyle, writeStyle } from "../platform/style.js";
import { attachSheet, parentSheet, sheetLayers } from "./sheet.js";
import { prepareVariables } from "./sheet-effects.js";
function styleBackdrop(host) {
  const slot = host.getAttribute("data-slot");
  if (!slot) {
    return;
  }
  writeStyle(
    host.ownerDocument,
    `ui-sdk-sheet-${slot}`,
    `@layer ui-sdk { :where([data-slot="${slot}"])::backdrop { background: var(--sheet-backdrop, rgb(0 0 0 / 0.2)); pointer-events: auto } }`
  );
}
function isolate(container, keep) {
  const restores = [];
  const walk = (node) => {
    for (const child of Array.from(node.children)) {
      if (keep.includes(child)) {
        continue;
      }
      if (keep.some((el) => el && child.contains(el))) {
        walk(child);
      } else if (child instanceof HTMLElement) {
        restores.push(setStyle(child, "display", "none"));
      }
    }
  };
  walk(container);
  return () => restores.forEach((restore) => restore());
}
function drillIn(el, popup, config) {
  let restore;
  const unbind = popup.bind(el, {
    ...config,
    position: void 0,
    inline: true,
    onShow() {
      const [parent, trigger] = config.drillIn();
      if (parent) {
        restore = isolate(parent, [el, trigger]);
      }
      return () => restore?.();
    },
    onClose() {
      restore?.();
      restore = setStyle(el, "display", "none");
    }
  });
  return () => {
    unbind();
    restore?.();
  };
}
function presentSheet(el, popup, config) {
  if (config.drillIn) {
    return drillIn(el, popup, config);
  }
  const host = el.parentElement;
  if (!host) {
    return;
  }
  styleBackdrop(host);
  let sheet;
  return popup.bind(el, {
    ...config,
    position: void 0,
    host: () => host,
    onShow(layer) {
      const shown = showSheet(el, host, popup, config, layer);
      sheet = shown.sheet;
      return () => {
        shown.hide();
        sheet = void 0;
      };
    },
    onClose: () => sheet?.close()
  });
}
function showSheet(el, host, popup, config, layer) {
  let rest = null;
  const stackedOn = parentSheet(layer);
  const dimsHost = !config.backdrop?.();
  const sheet = attachSheet(el, {
    host,
    snapPoints: () => config.snapPoints ?? ["content"],
    snapPoint: () => rest,
    backdrop: config.backdrop,
    hostBackdrop: dimsHost,
    dismissible: config.dismissible,
    onDismissAttempt: config.onDismissAttempt,
    parent: () => stackedOn?.(),
    onSnap: (point) => rest = point,
    onDismiss(event) {
      popup.requestClose("swipe", event);
      requestAnimationFrame(() => {
        const point = rest ?? sheet.snapPoints()[0]?.value;
        if (layer.active() && point !== void 0) {
          sheet.snapTo(point, "imperative");
        }
      });
    }
  });
  sheetLayers.set(layer, () => sheet);
  config.onSheet?.(sheet);
  const offGrow = on(el, "focusin", (event) => {
    const largest = sheet.snapPoints().at(-1);
    if (largest && sheet.snapPoints().length > 1 && event.target.matches("input, textarea")) {
      sheet.snapTo(largest.value, "imperative");
    }
  });
  const color = dimsHost ? getComputedStyle(el).getPropertyValue("--sheet-backdrop") : "transparent";
  if (color) {
    host.style.setProperty("--sheet-backdrop", color);
  }
  if (layer.active()) {
    sheet.open(popup.opener() !== "initial");
  }
  return {
    sheet,
    hide() {
      offGrow();
      sheetLayers.delete(layer);
      sheet.destroy();
      config.onSheet?.(void 0);
      host.style.removeProperty("--sheet-backdrop");
    }
  };
}
export {
  prepareVariables,
  presentSheet
};
