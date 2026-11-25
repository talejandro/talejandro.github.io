// src/foundation/popups/frame-guards.ts
import { on } from "../kernel/events.js";
import { tabbables } from "../focus/tabbable.js";
var hidden = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;outline:none";
function guardFrames(popup, trapping) {
  const doc = popup.ownerDocument;
  let frame;
  let guards = [];
  const remove = () => {
    guards.forEach((guard2) => guard2.remove());
    guards = [];
    frame = void 0;
  };
  const guard = () => {
    const el = doc.createElement("span");
    el.tabIndex = 0;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = hidden;
    return el;
  };
  const watch = () => {
    const active = doc.activeElement;
    if (guards.length || !trapping() || !(active instanceof HTMLIFrameElement) || !popup.contains(active)) {
      return;
    }
    frame = active;
    guards = [guard(), guard()];
    active.before(guards[0]);
    active.after(guards[1]);
  };
  const later = () => {
    watch();
    setTimeout(watch);
  };
  const offBlur = on(doc.defaultView ?? window, "blur", later);
  const offFocusOut = on(doc, "focusout", later);
  const offFocus = on(doc, "focusin", (event) => {
    const side = guards.indexOf(event.target);
    const from = frame;
    remove();
    if (side < 0 || !from) {
      return;
    }
    const stops = tabbables(popup);
    const step = side === 0 ? -1 : 1;
    const next = stops.at((stops.indexOf(from) + step) % stops.length);
    (next ?? popup).focus({ preventScroll: true });
  });
  return () => {
    offBlur();
    offFocusOut();
    offFocus();
    remove();
  };
}
export {
  guardFrames
};
