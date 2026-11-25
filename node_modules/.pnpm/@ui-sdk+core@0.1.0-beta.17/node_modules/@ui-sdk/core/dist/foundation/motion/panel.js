// src/foundation/motion/panel.ts
import { onProps } from "../kernel/part.js";
import { animateIn, animateOut } from "./presence.js";
function hiddenAttrs(shown, findable) {
  return { hidden: shown ? void 0 : findable ? "until-found" : "" };
}
function supportsHiddenUntilFound() {
  return typeof document !== "undefined" && "onbeforematch" in document.body;
}
function bindFindable(el, panel) {
  const keep = () => {
    if (panel.shown()) {
      return;
    }
    const hidden = el.getAttribute("hidden");
    if (panel.findable()) {
      if (hidden !== "until-found") {
        el.setAttribute("hidden", "until-found");
      }
    } else if (hidden === "until-found") {
      el.setAttribute("hidden", "");
    }
  };
  keep();
  const observer = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(keep);
  observer?.observe(el, { attributes: true, attributeFilter: ["hidden"] });
  el.addEventListener("beforematch", panel.reveal);
  return Object.assign(
    () => {
      observer?.disconnect();
      el.removeEventListener("beforematch", panel.reveal);
    },
    // Call when the panel's state changes.
    { check: keep }
  );
}
function bindPanel(el, panel) {
  const cleanups = [];
  const size = (height, width = height) => panel.size(el, height, width);
  const shown = () => panel.isOpen() || panel.isExiting();
  const findable = bindFindable(el, {
    shown,
    findable: panel.isFindable,
    reveal: panel.reveal
  });
  cleanups.push(findable);
  let stop;
  const halt = () => {
    stop?.();
    stop = void 0;
  };
  const opening = () => {
    halt();
    const how = panel.opening();
    if (how !== "animate") {
      const finish = () => {
        for (const animation of el.getAnimations()) {
          animation.finish();
        }
      };
      if (how === "mount") {
        const frame = requestAnimationFrame(finish);
        stop = () => cancelAnimationFrame(frame);
      } else {
        finish();
      }
      size("auto");
      if (how === "instant") {
        panel.settled(true);
      }
      return;
    }
    el.removeAttribute("hidden");
    el.removeAttribute("data-closed");
    el.setAttribute("data-open", "");
    stop = animateIn(el, () => {
      stop = void 0;
      size("auto");
      panel.settled(true);
    });
    size(`${el.scrollHeight}px`, `${el.scrollWidth}px`);
  };
  const closing = () => {
    halt();
    if (el.contains(document.activeElement)) {
      panel.trigger()?.focus({ preventScroll: true });
    }
    if (!panel.isExiting()) {
      size("0px");
      panel.settled(false);
      return;
    }
    el.removeAttribute("data-open");
    el.setAttribute("data-closed", "");
    const style = getComputedStyle(el);
    size(style.height, style.width);
    void el.offsetHeight;
    stop = animateOut(el, () => {
      size("0px");
      panel.exited();
      panel.settled(false);
    });
  };
  let open = panel.isOpen();
  if (open) {
    opening();
  } else {
    size("0px");
  }
  cleanups.push(
    panel.subscribe(() => {
      findable.check();
      if (panel.isOpen() === open) {
        return;
      }
      open = !open;
      if (open) {
        opening();
      } else {
        closing();
      }
    })
  );
  cleanups.push(halt);
  return () => cleanups.forEach((cleanup) => cleanup());
}
function stateAndRenders(store, part) {
  return (listener) => {
    const offState = store.subscribe(listener);
    const offProps = onProps(part, listener);
    return () => {
      offState();
      offProps();
    };
  };
}
export {
  bindFindable,
  bindPanel,
  hiddenAttrs,
  stateAndRenders,
  supportsHiddenUntilFound
};
