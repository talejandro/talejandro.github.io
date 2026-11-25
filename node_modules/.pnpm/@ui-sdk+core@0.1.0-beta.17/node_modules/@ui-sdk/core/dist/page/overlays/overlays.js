// src/page/overlays/overlays.ts
import { dev, warn } from "#dev";
var count = 0;
function createOverlays() {
  let entries = [];
  const listeners = /* @__PURE__ */ new Set();
  let hosts = 0;
  const notify = () => listeners.forEach((listener) => listener());
  function unmount(id) {
    const next = entries.filter((entry) => entry.id !== id);
    if (next.length === entries.length) {
      return;
    }
    entries = next;
    notify();
  }
  return {
    /**
     * Adds an overlay for the hosts to render. Returns its id; pass it to
     * `unmount()` once the overlay has finished closing. `rendered` says
     * whether something else already shows it, like a region the app placed,
     * so development builds don't warn about a missing host.
     */
    mount(type, data, rendered) {
      const id = `${type}-${++count}`;
      entries = [...entries, { id, type, data }];
      notify();
      if (dev && typeof window !== "undefined") {
        setTimeout(() => {
          if (!hosts && !rendered?.() && entries.some((entry) => entry.id === id)) {
            warn(
              `A ${type} opened, but no host renders it. Mount <OverlayHost /> (or <ui-overlay-host>) once in your app.`
            );
          }
        }, 1e3);
      }
      return id;
    },
    /** Removes an overlay. */
    unmount,
    /** The overlays to render, oldest first. The same array until something changes. */
    entries: () => entries,
    /** Calls `listener` whenever an overlay is added or removed. Returns a function that stops it. */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Counts a host that renders this registry. Hosts call it while mounted. Returns a release. */
    attachHost() {
      hosts++;
      let attached = true;
      return () => {
        if (attached) {
          hosts--;
        }
        attached = false;
      };
    },
    /** Whether a host is mounted to render the overlays. */
    hasHost: () => hosts > 0
  };
}
var overlays = globalThis[/* @__PURE__ */ Symbol.for("ui-sdk.overlays@1")] ??= createOverlays();
export {
  createOverlays,
  overlays
};
