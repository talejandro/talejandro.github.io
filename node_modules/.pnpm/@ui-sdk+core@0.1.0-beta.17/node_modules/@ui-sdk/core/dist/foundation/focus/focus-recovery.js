// src/foundation/focus/focus-recovery.ts
function createFocusRecovery(options) {
  const bound = /* @__PURE__ */ new WeakMap();
  let holder = null;
  const innermost = (node) => {
    for (let el = node instanceof Element ? node : null; el; el = el.parentElement) {
      if (bound.has(el)) {
        return el;
      }
    }
    return null;
  };
  return {
    /** Tracks a bound part. Call it from the slot's `bind` and return its cleanup. */
    bind(el, part) {
      bound.set(el, part);
      const focusin = (event) => {
        if (innermost(event.target) === el) {
          holder = el;
        }
      };
      const focusout = () => queueMicrotask(() => {
        if (holder === el && el.isConnected && !el.contains(document.activeElement)) {
          holder = null;
        }
      });
      el.addEventListener("focusin", focusin);
      el.addEventListener("focusout", focusout);
      return () => {
        el.removeEventListener("focusin", focusin);
        el.removeEventListener("focusout", focusout);
        bound.delete(el);
        const active = typeof document === "undefined" ? null : document.activeElement;
        const held = el.contains(active) || holder === el && (!active || active === document.body);
        if (holder === el) {
          holder = null;
        }
        if (!held) {
          return;
        }
        const lost = { key: part.key, props: part.props, el };
        queueMicrotask(() => {
          const now = document.activeElement;
          if (now && now !== document.body && now.isConnected && !el.contains(now)) {
            return;
          }
          const target = options.fallback(lost);
          if (target?.isConnected) {
            target.focus({ preventScroll: true });
          }
        });
      };
    }
  };
}
export {
  createFocusRecovery
};
