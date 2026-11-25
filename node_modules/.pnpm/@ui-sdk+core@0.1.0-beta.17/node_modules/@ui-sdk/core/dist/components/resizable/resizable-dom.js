// src/components/resizable/resizable-dom.ts
import { isAfter } from "../../foundation/kernel/order.js";
import { bindDrag } from "../../foundation/drag-and-drop/pointer.js";
import { isRTL } from "../../foundation/platform/env.js";
import { onProps } from "../../foundation/kernel/part.js";
import {
  refreshCursor,
  registerHandle,
  releaseHandle
} from "./resizable-handles.js";
import { elements } from "../../foundation/kernel/elements.js";
var sizeProps = [
  "defaultSize",
  "minSize",
  "maxSize",
  "collapsible",
  "collapsedSize"
];
function resizableDom(context, group) {
  const { store, element } = context;
  let space = 0;
  function spaceOf() {
    const axis = group().vertical() ? "height" : "width";
    let total = 0;
    for (const { el } of elements(context, "panel")) {
      total += el.getBoundingClientRect()[axis];
    }
    return total;
  }
  function measure() {
    space = spaceOf();
    group().setSpace(space);
  }
  function readPanels() {
    const panels = elements(context, "panel");
    space = spaceOf();
    group().setPanels(
      panels.map((panel) => panel.key),
      panels.map((panel) => panel.props ?? {}),
      space
    );
    return panels;
  }
  function refresh() {
    if (!element("panel")) {
      return;
    }
    const { ids } = store.get();
    group().setPanels(
      ids,
      ids.map((id) => context.props("panel", id) ?? {}),
      space
    );
  }
  function reconcile() {
    const panels = readPanels();
    const handles = {};
    let before = -1;
    for (const { el, key } of elements(context, "handle")) {
      while (before + 1 < panels.length && isAfter(panels[before + 1].el, el)) {
        before++;
      }
      handles[key] = before;
    }
    group().setHandles(handles);
  }
  let scheduled = false;
  function schedule() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      reconcile();
    });
  }
  function press(event, key, el, release) {
    const handle = group().handleIndex(key);
    if (handle === null) {
      return;
    }
    measure();
    if (!space || !group().startDrag(handle, key)) {
      return release();
    }
    const rtl = isRTL(element("root") ?? el);
    const vertical = group().vertical();
    const origin = vertical ? event.clientY : event.clientX;
    const stop = bindDrag(el, event, {
      cancelOnEscape: true,
      onMove: (sample) => {
        const moved = (vertical ? sample.y : sample.x) - origin;
        group().dragBy(
          (rtl && !vertical ? -moved : moved) / space * 100,
          sample.event
        );
        refreshCursor(el.ownerDocument);
      },
      onEnd: (end, canceled) => {
        drags.delete(key);
        group().endDrag(end, canceled && end.type !== "pointercancel");
        release();
      }
    });
    drags.set(key, () => {
      stop();
      release();
    });
  }
  const drags = /* @__PURE__ */ new Map();
  function cursor(key, el) {
    const value = group().handleValue(key);
    const vertical = group().vertical();
    const both = vertical ? "ns-resize" : "ew-resize";
    if (!value) {
      return both;
    }
    const atMin = value.now <= value.min + 1e-6;
    const atMax = value.now >= value.max - 1e-6;
    if (atMin === atMax) {
      return both;
    }
    if (vertical) {
      return atMin ? "s-resize" : "n-resize";
    }
    return atMin !== isRTL(el) ? "e-resize" : "w-resize";
  }
  const bindings = {
    bindRoot(el) {
      schedule();
      if (typeof ResizeObserver === "undefined") {
        return;
      }
      const view = el.ownerDocument.defaultView ?? window;
      let frame = 0;
      const observer = new ResizeObserver(() => {
        frame ||= view.requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
      });
      observer.observe(el);
      return () => {
        observer.disconnect();
        view.cancelAnimationFrame(frame);
      };
    },
    bindPanel(part) {
      schedule();
      let sizes = part.props;
      const unwatch = onProps(part, () => {
        const next = part.props;
        if (sizeProps.every((name) => next[name] === sizes[name])) {
          return;
        }
        sizes = next;
        schedule();
      });
      return () => {
        unwatch();
        schedule();
      };
    },
    bindHandle(el, part) {
      const key = part.key;
      schedule();
      const target = {
        el,
        root: () => element("root"),
        axis: () => group().handleDisabled(key) || group().handleIndex(key) === null ? null : group().vertical() ? "y" : "x",
        cursor: () => cursor(key, el),
        start: (event) => press(event, key, el, () => releaseHandle(target)),
        hover: (hovered) => {
          if (hovered) {
            store.set({ hovering: key });
          } else if (store.get().hovering === key) {
            store.set({ hovering: null });
          }
        }
      };
      const unregister = registerHandle(target);
      let disabled = !!part.props.disabled;
      const unwatch = onProps(part, () => {
        const next = !!part.props.disabled;
        if (next !== disabled) {
          disabled = next;
          group().relock();
        }
        const stop = drags.get(key);
        if (!stop || !disabled) {
          return;
        }
        drags.delete(key);
        stop();
        group().endDrag();
      });
      return () => {
        unwatch();
        unregister();
        const stop = drags.get(key);
        drags.delete(key);
        if (stop && store.get().dragging === key) {
          stop();
          group().endDrag();
        }
        schedule();
      };
    }
  };
  const stopAll = () => {
    for (const stop of drags.values()) {
      stop();
    }
    drags.clear();
  };
  return { refresh, bindings, stopAll };
}
export {
  resizableDom
};
