// src/components/navigation-menu/navigation-menu-dom.ts
import { supportsHiddenUntilFound } from "../../foundation/disclosure/disclosure.js";
import { layoutBox, layoutSize } from "../../foundation/platform/layout.js";
function createViewportSize(config) {
  const sizes = /* @__PURE__ */ new WeakMap();
  const resize = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.borderBoxSize?.[0];
      sizes.set(
        entry.target,
        box ? { width: box.inlineSize, height: box.blockSize } : {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        }
      );
    }
    write();
  });
  function write() {
    const viewport = config.viewport();
    const content = config.content();
    const size = content && sizes.get(content);
    if (!viewport || !size) {
      return;
    }
    const frame = frameOf(viewport);
    viewport.style.setProperty(
      "--viewport-width",
      `${size.width + frame.width}px`
    );
    viewport.style.setProperty(
      "--viewport-height",
      `${size.height + frame.height}px`
    );
  }
  return {
    write,
    // Starts watching a content in the viewport. Returns a cleanup.
    observe(el) {
      resize?.observe(el);
      return () => {
        resize?.unobserve(el);
        sizes.delete(el);
      };
    },
    // Measures a content now, a forced layout, for a viewport about to show
    // that can't wait for the observer.
    measure(el) {
      sizes.set(el, layoutSize(el));
      write();
    },
    disconnect: () => resize?.disconnect()
  };
}
function frameOf(el) {
  const style = getComputedStyle(el);
  if (style.boxSizing !== "border-box") {
    return { width: 0, height: 0 };
  }
  const sum = (...names) => names.reduce(
    (total, name) => total + (parseFloat(style.getPropertyValue(name)) || 0),
    0
  );
  return {
    width: sum("border-left-width", "border-right-width"),
    height: sum("border-top-width", "border-bottom-width")
  };
}
var collapsed = {
  position: "absolute",
  width: "0",
  height: "0",
  padding: "0",
  "border-width": "0",
  overflow: "hidden",
  "pointer-events": "none"
};
function collapseWhileHidden(el, shown, store) {
  const styles = supportsHiddenUntilFound() ? collapsed : { ...collapsed, display: "none" };
  const set = /* @__PURE__ */ new Map();
  const release = () => {
    for (const [name, { before, after }] of set) {
      if (el.style.getPropertyValue(name) !== after) {
        continue;
      }
      if (before) {
        el.style.setProperty(name, before);
      } else {
        el.style.removeProperty(name);
      }
    }
    set.clear();
  };
  const update = () => {
    const hide = !shown();
    if (hide === set.size > 0) {
      return;
    }
    if (!hide) {
      return release();
    }
    for (const [name, value] of Object.entries(styles)) {
      const before = el.style.getPropertyValue(name);
      el.style.setProperty(name, value);
      set.set(name, { before, after: el.style.getPropertyValue(name) });
    }
  };
  update();
  const unsubscribe = store.subscribe(update);
  return () => {
    unsubscribe();
    release();
  };
}
function bindIndicator(el, config) {
  const update = () => {
    const target = config.target();
    const container = el.offsetParent ?? el.parentElement;
    if (!target || !container) {
      el.removeAttribute("data-visible");
      return;
    }
    const box = layoutBox(target, container);
    el.style.setProperty("--active-item-left", `${box.left}px`);
    el.style.setProperty("--active-item-right", `${box.right}px`);
    el.style.setProperty("--active-item-top", `${box.top}px`);
    el.style.setProperty("--active-item-bottom", `${box.bottom}px`);
    el.style.setProperty("--active-item-width", `${box.width}px`);
    el.style.setProperty("--active-item-height", `${box.height}px`);
    el.setAttribute("data-visible", "");
  };
  const sized = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(update);
  const current = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(update);
  const root = config.root();
  if (root) {
    current?.observe(root, { subtree: true, attributeFilter: ["aria-current"] });
  }
  const unsubscribe = config.onChange(update);
  let observed = /* @__PURE__ */ new Set();
  const watch = () => {
    const next = new Set(
      config.watched().filter((target) => !!target)
    );
    for (const target of observed) {
      if (!next.has(target)) {
        sized?.unobserve(target);
      }
    }
    for (const target of next) {
      if (!observed.has(target)) {
        sized?.observe(target);
      }
    }
    observed = next;
  };
  const items = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(watch);
  let bound = true;
  queueMicrotask(() => {
    if (!bound) {
      return;
    }
    watch();
    const list = config.watched()[0];
    if (list) {
      items?.observe(list, { childList: true, subtree: true });
    }
    update();
  });
  return () => {
    bound = false;
    unsubscribe();
    sized?.disconnect();
    current?.disconnect();
    items?.disconnect();
  };
}
export {
  bindIndicator,
  collapseWhileHidden,
  createViewportSize
};
