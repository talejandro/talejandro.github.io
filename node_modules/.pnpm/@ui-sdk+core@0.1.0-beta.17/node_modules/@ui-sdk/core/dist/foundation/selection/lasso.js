// src/foundation/selection/lasso.ts
import { elements } from "../kernel/elements.js";
import { announce } from "../platform/announce.js";
import { createDragSession, dragThreshold } from "../drag-and-drop/pointer.js";
var touches = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
function createLasso(context, options) {
  const { store } = context;
  const setDraft = (draft) => store.set({ [options.draft]: draft });
  const drags = createDragSession(context.onDestroy);
  return {
    /** Starts a rectangle on `surface` once the pointer moves past `dragThreshold`. Escape lets go without selecting. */
    pointerdown(event, surface) {
      if (!drags.accepts(event)) {
        return;
      }
      const box = surface.getBoundingClientRect();
      const x0 = event.clientX - box.left;
      const y0 = event.clientY - box.top;
      const base = event.shiftKey ? options.selected() : [];
      const items = elements(context, options.slot).filter((item) => options.selectable?.(item.key) ?? true).map((item) => {
        const r = item.el.getBoundingClientRect();
        return {
          key: item.key,
          rect: {
            left: r.left - box.left,
            top: r.top - box.top,
            right: r.right - box.left,
            bottom: r.bottom - box.top
          }
        };
      });
      drags.start(surface, event, {
        threshold: dragThreshold,
        cancelOnEscape: true,
        onMove: ({ x, y }) => {
          const x1 = x - box.left;
          const y1 = y - box.top;
          const rect = {
            left: Math.min(x0, x1),
            top: Math.min(y0, y1),
            right: Math.max(x0, x1),
            bottom: Math.max(y0, y1),
            keys: []
          };
          const hit = items.filter((item) => touches(rect, item.rect)).map((item) => item.key);
          setDraft({ ...rect, keys: [.../* @__PURE__ */ new Set([...base, ...hit])] });
        },
        onEnd: (end, canceled) => {
          const draft = store.get()[options.draft];
          setDraft(null);
          if (!draft || canceled) {
            return;
          }
          if (options.set(draft.keys, { reason: "lasso", event: end })) {
            announce(
              options.message?.(draft.keys.length) ?? `${draft.keys.length} ${draft.keys.length === 1 ? "item" : "items"} selected.`
            );
          }
        }
      });
    },
    /** Whether the rectangle touches an item now. */
    touches(state, key) {
      return !!state[options.draft]?.keys.includes(key);
    },
    /** The rectangle as a `style` attribute for its part, hidden while none is drawn. */
    style(state) {
      const draft = state[options.draft];
      if (!draft) {
        return "display:none";
      }
      return `position:absolute;pointer-events:none;left:${draft.left}px;top:${draft.top}px;width:${draft.right - draft.left}px;height:${draft.bottom - draft.top}px`;
    }
  };
}
export {
  createLasso
};
