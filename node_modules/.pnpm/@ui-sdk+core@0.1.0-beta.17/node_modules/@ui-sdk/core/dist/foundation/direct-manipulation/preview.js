// src/foundation/direct-manipulation/preview.ts
import { elements } from "../kernel/elements.js";
import { announce } from "../platform/announce.js";
import { createDragSession } from "../drag-and-drop/pointer.js";
function createPreview(context, options) {
  const { store } = context;
  const current = () => store.get()[options.key] ?? null;
  const set = (value, details) => options.set ? options.set(value, details) : (store.set({ [options.key]: value }), true);
  const label = (key) => options.label?.(key) ?? key;
  let sliding = false;
  const drags = createDragSession(context.onDestroy);
  const api = {
    /** Shows an option without choosing it. The chosen option and disabled ones show as nothing. */
    show(key, details = {
      reason: "imperative"
    }) {
      const next = key && !options.disabled?.(key) && key !== options.value?.() ? key : null;
      if (next === current()) {
        return false;
      }
      const done = set(next, details);
      if (done && next && details.reason === "list-navigation") {
        announce(
          options.message?.(label(next)) ?? `Previewing ${label(next)}. Enter to keep it.`
        );
      }
      return done;
    },
    /** Puts the page back. */
    clear(details = {
      reason: "imperative"
    }) {
      return current() !== null && set(null, details);
    },
    /** Chooses the previewed option, or `key`, and ends the preview. */
    choose(key, details = {}) {
      const target = key ?? current();
      if (!target || options.disabled?.(target)) {
        return false;
      }
      const done = options.choose(target, {
        reason: "item-press",
        event: details.event
      });
      api.clear({ reason: "item-press", event: details.event });
      return done;
    },
    /** Whether a pointer is pressed and sliding across the options. */
    dragging: () => sliding,
    /** Starts a press and slide from an option: each option the pointer slides over previews, letting go on one chooses it. */
    pointerdown(event, key, surface) {
      if (!drags.accepts(event)) {
        return;
      }
      event.preventDefault();
      const boxes = elements(context, options.slot).map((item) => ({
        key: item.key,
        box: item.el.getBoundingClientRect()
      }));
      const under = (x, y) => boxes.find(
        ({ box }) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom
      )?.key ?? null;
      sliding = true;
      api.show(key, { reason: "item-hover", event });
      drags.start(surface, event, {
        cancelOnEscape: true,
        onMove: ({ x, y, event: move }) => {
          const next = under(x, y);
          if (next !== current()) {
            api.show(next, { reason: "item-hover", event: move });
          }
        },
        onEnd: (end, canceled) => {
          sliding = false;
          const landed = canceled ? null : under(end.clientX, end.clientY);
          if (landed && landed !== options.value?.()) {
            api.choose(landed, { event: end });
          } else {
            api.clear({
              reason: landed ? "item-press" : "focus-out",
              event: end
            });
          }
        }
      });
    },
    /** Enter or Space keeps the preview, or chooses `key`; Escape puts the page back. Returns whether it handled the key. */
    keydown(event, key) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        api.choose(current() ?? key, { event });
        return true;
      }
      if (event.key === "Escape" && current()) {
        event.preventDefault();
        api.clear({ reason: "escape-key", event });
        return true;
      }
      return false;
    }
  };
  return api;
}
export {
  createPreview
};
