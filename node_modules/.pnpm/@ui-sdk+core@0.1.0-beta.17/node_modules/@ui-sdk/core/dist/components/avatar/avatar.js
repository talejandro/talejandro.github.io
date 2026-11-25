// src/components/avatar/avatar.ts
import { css } from "../../foundation/kernel/inline-style.js";
import {
  resolveSource
} from "../../foundation/kernel/details.js";
import { on } from "../../foundation/kernel/events.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { changeFrom } from "../../foundation/kernel/change.js";
import { imageStatus } from "./image-status.js";
var hiddenImageStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  opacity: 0,
  "pointer-events": "none"
});
function statusAttrs(state) {
  return { "data-loading-status": state.loadingStatus };
}
function hasSource(img) {
  return !!(img.getAttribute("src") || img.getAttribute("srcset"));
}
var avatarPrimitive = /* @__PURE__ */ definePrimitive({
  name: "avatar",
  options: {
    onLoadingStatusChange: "callback",
    // Internal: passed by renderers.
    fallbackDelay: "number"
  },
  state: (_options) => ({
    loadingStatus: "idle",
    delayElapsed: false
  }),
  controlled: [],
  api: (context) => {
    const { store, props, element, options } = context;
    const change = changeFrom(
      context,
      (reason) => resolveSource(reason)
    );
    const report = (status, reason, event) => change("loadingStatus", status, { reason, event });
    const startLoading = () => {
      if (store.get().loadingStatus !== "loaded") {
        report("loading", "src-change");
      }
    };
    return {
      internal: {
        // Follows an <img>: its status now, then its load and error events,
        // and a new source starting over.
        watchImage(img) {
          const check = () => {
            const status = imageStatus(img, hasSource(img));
            if (status === "loading") {
              startLoading();
            } else {
              report(status, status === "loaded" ? "image-load" : "image-error");
            }
          };
          check();
          const observer = new MutationObserver(check);
          observer.observe(img, {
            attributeFilter: ["src", "srcset", "sizes", "crossorigin"]
          });
          const cleanups = [
            on(img, "load", (event) => report("loaded", "image-load", event)),
            on(img, "error", (event) => report("error", "image-error", event)),
            () => observer.disconnect()
          ];
          return () => {
            cleanups.forEach((cleanup) => cleanup());
            queueMicrotask(() => {
              if (!element("image")) {
                report("idle", "src-change");
              }
            });
          };
        },
        // An image removed from the page, like a web component's <img>,
        // which nothing unbinds, takes its status with it.
        watchImageRemoval(root) {
          const observer = new MutationObserver(() => {
            if (store.get().loadingStatus !== "idle" && !element("image")) {
              report("idle", "src-change");
            }
          });
          observer.observe(root, { childList: true, subtree: true });
          return () => observer.disconnect();
        },
        // Starts the fallback's delay once the avatar is on the page. The
        // fallback may not be rendered yet, so its props are read a microtask later.
        startDelay() {
          let timer;
          let active = true;
          queueMicrotask(() => {
            if (!active) {
              return;
            }
            const delay = props("fallback")?.delay ?? options().fallbackDelay ?? 0;
            if (delay > 0) {
              timer = setTimeout(() => store.set({ delayElapsed: true }), delay);
            }
          });
          return () => {
            active = false;
            clearTimeout(timer);
          };
        }
      }
    };
  },
  slots: (slot) => ({
    root: slot({
      state: (state) => ({ loadingStatus: state.loadingStatus }),
      attrs: statusAttrs,
      bind: (el, { api }) => {
        const cleanups = [
          api.internal.startDelay(),
          api.internal.watchImageRemoval(el)
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      }
    }),
    // A real <img>, out of sight until it loads. Its alt text names the avatar then.
    image: slot({
      state: (state) => ({ loadingStatus: state.loadingStatus }),
      attrs: (state) => ({
        ...statusAttrs(state),
        "aria-hidden": state.loadingStatus === "loaded" ? void 0 : "true",
        style: state.loadingStatus === "loaded" ? void 0 : hiddenImageStyle
      }),
      bind: (el, { api }) => api.internal.watchImage(el)
    }),
    // Shown while there's no loaded image, after its delay.
    fallback: slot({
      props: { delay: "number" },
      present: (state, { props }) => state.loadingStatus !== "loaded" && (!(props.delay && props.delay > 0) || state.delayElapsed),
      state: (state) => ({ loadingStatus: state.loadingStatus }),
      attrs: statusAttrs
    })
  })
});
var avatar = avatarPrimitive;
export {
  avatar
};
