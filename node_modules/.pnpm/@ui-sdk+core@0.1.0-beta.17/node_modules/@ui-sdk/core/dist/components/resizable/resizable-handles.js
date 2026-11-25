// src/components/resizable/resizable-handles.ts
import { swallowNextClick } from "../../foundation/drag-and-drop/pointer.js";
import { pressedScrollbar } from "../../foundation/platform/scrollbar.js";
import { writeStyle } from "../../foundation/platform/style.js";
var hitSize = { fine: 10, coarse: 24 };
var targets = /* @__PURE__ */ new Set();
var listening = /* @__PURE__ */ new WeakSet();
var hovered = [];
var active = [];
var activeTouch = false;
var releaseTouch = () => {
};
function registerHandle(target) {
  targets.add(target);
  listen(target.el.ownerDocument);
  return () => {
    targets.delete(target);
    if (hovered.includes(target)) {
      setHovered(hovered.filter((other) => other !== target));
    }
    releaseHandle(target);
  };
}
function releaseHandle(target) {
  active = active.filter((other) => other !== target);
  if (!active.length) {
    releaseTouch();
  }
  updateCursor(target.el.ownerDocument);
}
var refreshCursor = (doc) => updateCursor(doc);
var owns = (target, top) => target.el.contains(top) || target.root()?.contains(top);
function hitTest(x, y, coarse, top) {
  if (top && !someOwns(top)) {
    return [];
  }
  const pad = coarse ? hitSize.coarse : hitSize.fine;
  const hits = [];
  for (const target of targets) {
    const axis = target.axis();
    if (!axis || !target.el.isConnected) {
      continue;
    }
    const rect = target.el.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      continue;
    }
    const thickness = axis === "x" ? rect.width : rect.height;
    const reach = Math.max(0, (pad - thickness) / 2);
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    if (dx <= reach && dy <= reach) {
      hits.push({ target, axis, distance: Math.hypot(dx, dy) });
    }
  }
  if (top && !hits.some(({ target }) => owns(target, top))) {
    return [];
  }
  hits.sort((a, b) => a.distance - b.distance);
  const nearest = hits[0];
  if (!nearest) {
    return [];
  }
  const crossing = hits.find((hit) => hit.axis !== nearest.axis);
  return crossing ? [nearest.target, crossing.target] : [nearest.target];
}
function someOwns(top) {
  for (const target of targets) {
    if (owns(target, top)) {
      return true;
    }
  }
  return false;
}
function listen(doc) {
  if (listening.has(doc)) {
    return;
  }
  listening.add(doc);
  const view = doc.defaultView ?? window;
  let frame = 0;
  let point;
  doc.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !event.isPrimary || event.defaultPrevented || !targets.size) {
      return;
    }
    const top = event.target;
    const mouse = event.pointerType === "mouse";
    const hits = hitTest(event.clientX, event.clientY, !mouse, top);
    if (!hits.length || top && !hits.some((hit) => hit.el.contains(top)) && pressedScrollbar(event, top)) {
      return;
    }
    event.preventDefault();
    if (top && !hits.some((hit) => hit.el.contains(top))) {
      swallowNextClick(doc, true);
    }
    active = hits;
    activeTouch = event.pointerType === "touch";
    if (activeTouch) {
      holdTouch(doc);
    }
    for (const hit of hits) {
      hit.start(event);
    }
    updateCursor(doc);
  });
  doc.addEventListener(
    "pointermove",
    (event) => {
      if (event.buttons || active.length || !targets.size) {
        return;
      }
      point = {
        x: event.clientX,
        y: event.clientY,
        coarse: event.pointerType !== "mouse"
      };
      frame ||= view.requestAnimationFrame(() => {
        frame = 0;
        if (!point || active.length) {
          return;
        }
        setHovered(
          hitTest(
            point.x,
            point.y,
            point.coarse,
            doc.elementFromPoint(point.x, point.y)
          )
        );
        updateCursor(doc);
      });
    },
    { passive: true }
  );
  doc.documentElement.addEventListener("pointerleave", () => {
    point = void 0;
    setHovered([]);
    updateCursor(doc);
  });
}
function holdTouch(doc) {
  releaseTouch();
  const hold = (event) => event.preventDefault();
  const end = (event) => {
    if (!event.touches.length) {
      releaseTouch();
    }
  };
  releaseTouch = () => {
    doc.removeEventListener("touchmove", hold, true);
    doc.removeEventListener("touchend", end, true);
    doc.removeEventListener("touchcancel", end, true);
    releaseTouch = () => {
    };
  };
  doc.addEventListener("touchmove", hold, { capture: true, passive: false });
  doc.addEventListener("touchend", end, true);
  doc.addEventListener("touchcancel", end, true);
}
function setHovered(next) {
  for (const target of hovered) {
    if (!next.includes(target)) {
      target.hover(false);
    }
  }
  for (const target of next) {
    if (!hovered.includes(target)) {
      target.hover(true);
    }
  }
  hovered = next;
}
function updateCursor(doc) {
  const shown = active.length ? active : hovered;
  if (!shown.length || active.length && activeTouch) {
    return setPageStyle(doc, "");
  }
  const cursor = shown.length > 1 ? "move" : shown[0].cursor();
  const dragging = active.length ? "user-select:none!important;-webkit-user-select:none!important}iframe{pointer-events:none!important" : "";
  setPageStyle(
    doc,
    `*,*::before,*::after{cursor:${cursor}!important;${dragging}}`
  );
}
var sheets = /* @__PURE__ */ new WeakMap();
function setPageStyle(doc, css) {
  let sheet = sheets.get(doc);
  if (!sheet) {
    if (!css) {
      return;
    }
    sheet = { css: "", set: pageSheet(doc) };
    sheets.set(doc, sheet);
  }
  if (sheet.css === css) {
    return;
  }
  sheet.css = css;
  sheet.set(css);
}
function pageSheet(doc) {
  const View = doc.defaultView;
  try {
    const sheet = new View.CSSStyleSheet();
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
    return (css) => sheet.replaceSync(css);
  } catch {
    return (css) => writeStyle(doc, "ui-sdk-resizable", css);
  }
}
export {
  refreshCursor,
  registerHandle,
  releaseHandle
};
