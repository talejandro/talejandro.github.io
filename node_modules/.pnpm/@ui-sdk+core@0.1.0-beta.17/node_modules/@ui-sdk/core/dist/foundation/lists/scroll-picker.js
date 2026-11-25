// src/foundation/lists/scroll-picker.ts
import { dragThreshold, swallowNextClick } from "../drag-and-drop/pointer.js";
import { on } from "../kernel/events.js";
import { projectDistance } from "../motion/projection.js";
import { createVelocityTracker } from "../motion/velocity.js";
import { clamp } from "../number/steps.js";
import { isRTL } from "../platform/env.js";
import { pagedElsewhere } from "./listbox-keyboard.js";
import { activeElement, prefersReducedMotion } from "../platform/platform.js";
var restTimeout = 120;
var decelerationRate = 0.998;
function pickerPosition(centers, at) {
  const last = centers.length - 1;
  if (last < 1) {
    return 0;
  }
  let low = 0;
  let high = last - 1;
  while (low < high) {
    const middle = low + high + 1 >> 1;
    if (centers[middle] <= at) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  const span = centers[low + 1] - centers[low];
  return span > 0 ? low + (at - centers[low]) / span : low;
}
function nearestEnabled(position, count, isDisabled) {
  const start = clamp(Math.round(position), 0, count - 1);
  const lean = position >= start ? 1 : -1;
  for (let distance = 0; distance < count; distance++) {
    const near = start + distance * lean;
    if (near >= 0 && near < count && !isDisabled(near)) {
      return near;
    }
    const far = start - distance * lean;
    if (far >= 0 && far < count && !isDisabled(far)) {
      return far;
    }
  }
  return -1;
}
var isDisabledOption = (el) => el.getAttribute("aria-disabled") === "true";
function bindScrollPicker(list, options = {}) {
  const doc = list.ownerDocument;
  const view = doc.defaultView ?? window;
  const supportsScrollEnd = "onscrollend" in list;
  const tracker = createVelocityTracker();
  let vertical = true;
  let rtl = false;
  let items = [];
  let centers = [];
  let sized = false;
  let painted = [];
  let position = 0;
  let selected = -1;
  let target = null;
  let scrolling = false;
  let touching = false;
  let restMissed = false;
  let lastEvent;
  let frame = 0;
  let restTimer = 0;
  let drag = null;
  let offDrag = [];
  const observed = /* @__PURE__ */ new Set();
  const overridden = /* @__PURE__ */ new Map();
  function override(name, value) {
    if (!overridden.has(name)) {
      overridden.set(name, [
        list.style.getPropertyValue(name),
        list.style.getPropertyPriority(name)
      ]);
    }
    list.style.setProperty(name, value);
  }
  function restore(name) {
    const previous = overridden.get(name);
    if (previous) {
      overridden.delete(name);
      list.style.setProperty(name, ...previous);
    }
  }
  const scroll = () => {
    if (vertical) {
      return list.scrollTop;
    }
    return rtl ? -list.scrollLeft : list.scrollLeft;
  };
  const viewSize = () => vertical ? list.clientHeight : list.clientWidth;
  const maxScroll = () => vertical ? list.scrollHeight - list.clientHeight : list.scrollWidth - list.clientWidth;
  const along = (event) => vertical ? event.clientY : rtl ? -event.clientX : event.clientX;
  const isBusy = () => scrolling || touching || !!drag?.moved;
  function writeScroll(to, behavior = "instant") {
    if (vertical) {
      list.scrollTo({ top: to, behavior });
    } else {
      list.scrollTo({ left: rtl ? -to : to, behavior });
    }
  }
  function measure() {
    const orientation = options.orientation ?? list.getAttribute("aria-orientation");
    vertical = orientation !== "horizontal";
    rtl = !vertical && isRTL(list);
    items = [...list.querySelectorAll('[role="option"]')];
    painted = [];
    const box = list.getBoundingClientRect();
    const size = vertical ? box.height : box.width;
    sized = size > 0;
    const layout = vertical ? list.offsetHeight : list.offsetWidth;
    const scale = sized && Math.abs(layout - size) > 0.5 ? layout / size : 1;
    const at = scroll();
    centers = items.map((item) => {
      const rect = item.getBoundingClientRect();
      const offset = vertical ? (rect.top + rect.height / 2 - box.top) * scale - list.clientTop : (rect.left + rect.width / 2 - box.left) * scale - list.clientLeft;
      return (rtl ? list.clientWidth - offset : offset) + at;
    });
    for (const item of items) {
      if (!observed.has(item)) {
        observed.add(item);
        resizes?.observe(item);
      }
    }
    for (const item of observed) {
      if (!item.isConnected) {
        observed.delete(item);
        resizes?.unobserve(item);
      }
    }
  }
  function paint() {
    frame = 0;
    const at = scroll() + viewSize() / 2;
    position = pickerPosition(centers, at);
    const nearest = Math.round(position);
    if (Math.abs((centers[nearest] ?? Infinity) - at) < 1) {
      position = nearest;
    }
    for (let index = 0; index < items.length; index++) {
      const offset = String(Math.round((index - position) * 1e3) / 1e3);
      if (painted[index] !== offset) {
        painted[index] = offset;
        items[index].style.setProperty("--picker-offset", offset);
      }
    }
  }
  function focusAlong(element) {
    const active = activeElement(doc);
    if (active && active !== element && items.includes(active) && element.hasAttribute("tabindex")) {
      element.focus({ preventScroll: true });
    }
  }
  function select(index, event) {
    selected = index;
    const element = items[index];
    options.onSelect?.(index, { element, event });
    focusAlong(element);
  }
  function centerOn(index, animate = true) {
    const to = clamp(centers[index] - viewSize() / 2, 0, maxScroll());
    if (Math.abs(to - scroll()) < 1) {
      return arrive();
    }
    target = to;
    writeScroll(to, animate && !prefersReducedMotion() ? "smooth" : "instant");
    waitForRest();
  }
  function arrive() {
    target = null;
    restore("scroll-snap-type");
  }
  function waitForRest() {
    view.clearTimeout(restTimer);
    if (!supportsScrollEnd || target !== null) {
      restTimer = view.setTimeout(onRest, restTimeout);
    }
  }
  function selectedIndex() {
    return items.findIndex(
      (item) => item.getAttribute("aria-selected") === "true"
    );
  }
  function follow() {
    paint();
    if (target !== null || !scrolling || !items.length) {
      return;
    }
    const index = clamp(Math.round(position), 0, items.length - 1);
    if (index !== selected && !isDisabledOption(items[index])) {
      select(index, lastEvent);
    }
  }
  function settleAt(at, event) {
    const index = nearestEnabled(
      at,
      items.length,
      (each) => isDisabledOption(items[each])
    );
    if (index === -1) {
      return arrive();
    }
    if (index !== selected) {
      select(index, event);
    }
    centerOn(index);
  }
  function onScroll(event) {
    if (!sized) {
      return onResize();
    }
    if (target !== null) {
      if (Math.abs(scroll() - target) < 1) {
        arrive();
      } else {
        waitForRest();
      }
    } else if (!drag?.moved) {
      scrolling = true;
      lastEvent = event;
      waitForRest();
    }
    frame ||= view.requestAnimationFrame(follow);
  }
  function onRest() {
    view.clearTimeout(restTimer);
    if (target !== null) {
      return arrive();
    }
    if (!scrolling || drag?.moved) {
      return;
    }
    if (touching) {
      restMissed = true;
      return;
    }
    scrolling = false;
    paint();
    settleAt(position, lastEvent);
  }
  function onScrollEnd() {
    if (target === null || Math.abs(scroll() - target) < 1) {
      onRest();
    }
  }
  function interrupt() {
    target = null;
  }
  function onTouchStart() {
    touching = true;
    restMissed = false;
    interrupt();
  }
  function onTouchEnd() {
    touching = false;
    if (restMissed) {
      restMissed = false;
      onRest();
    }
  }
  function onPointerDown(event) {
    if (event.pointerType === "touch" || event.button !== 0 || drag) {
      return;
    }
    if (event.target === list && (event.offsetX > list.clientWidth || event.offsetY > list.clientHeight)) {
      return;
    }
    interrupt();
    drag = {
      id: event.pointerId,
      from: along(event),
      scroll: scroll(),
      moved: false
    };
    tracker.reset();
    tracker.add(event.timeStamp, drag.from);
    offDrag = [
      on(doc, "pointermove", onPointerMove, { capture: true }),
      on(doc, "pointerup", onPointerUp, { capture: true }),
      on(doc, "pointercancel", onPointerUp, { capture: true })
    ];
  }
  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.id) {
      return;
    }
    const at = along(event);
    if (!drag.moved) {
      if (Math.abs(at - drag.from) < dragThreshold) {
        return;
      }
      drag.moved = true;
      scrolling = true;
      override("scroll-snap-type", "none");
      override("user-select", "none");
      doc.getSelection()?.removeAllRanges();
      try {
        list.setPointerCapture(event.pointerId);
      } catch {
      }
    }
    tracker.add(event.timeStamp, at);
    lastEvent = event;
    writeScroll(drag.scroll - (at - drag.from));
  }
  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.id) {
      return;
    }
    const { moved } = drag;
    drag = null;
    offDrag.forEach((off) => off());
    offDrag = [];
    if (!moved) {
      return;
    }
    restore("user-select");
    swallowNextClick(doc);
    scrolling = false;
    const velocity = event.type === "pointercancel" ? 0 : tracker.velocity(event.timeStamp);
    const coast = clamp(
      scroll() - projectDistance(velocity, decelerationRate),
      0,
      maxScroll()
    );
    settleAt(pickerPosition(centers, coast + viewSize() / 2), event);
  }
  function onMouseDown(event) {
    if (event.target.closest('[role="option"]')) {
      event.preventDefault();
    }
  }
  function onKeyDown(event) {
    const direction = event.key === "PageDown" ? 1 : event.key === "PageUp" ? -1 : 0;
    if (!direction || event.defaultPrevented || items.length < 2 || !list.contains(event.target)) {
      return;
    }
    event.preventDefault();
    const spacing = (centers[items.length - 1] - centers[0]) / (items.length - 1);
    const page = spacing > 0 ? Math.max(1, Math.round(viewSize() / spacing) - 1) : 1;
    const from = selected === -1 ? Math.round(position) : selected;
    settleAt(clamp(from + direction * page, 0, items.length - 1), event);
  }
  function onMutations(mutations2) {
    if (mutations2.some(
      (mutation) => mutation.type === "childList" || mutation.attributeName !== "aria-selected"
    )) {
      measure();
      paint();
    }
    const index = selectedIndex();
    if (index !== -1 && index !== selected && !isBusy()) {
      const animate = selected !== -1;
      selected = index;
      focusAlong(items[index]);
      centerOn(index, animate);
    }
  }
  function onResize() {
    measure();
    if (selected !== -1 && !isBusy() && target === null) {
      centerOn(selected, false);
    }
    paint();
  }
  const resizes = view.ResizeObserver ? new view.ResizeObserver(onResize) : void 0;
  const mutations = view.MutationObserver ? new view.MutationObserver(onMutations) : void 0;
  measure();
  resizes?.observe(list);
  mutations?.observe(list, {
    subtree: true,
    childList: true,
    attributeFilter: ["aria-selected", "aria-orientation", "role"]
  });
  selected = selectedIndex();
  if (selected !== -1) {
    centerOn(selected, false);
  }
  paint();
  pagedElsewhere.add(list);
  const offs = [
    on(list, "scroll", onScroll, { passive: true }),
    ...supportsScrollEnd ? [on(list, "scrollend", onScrollEnd)] : [],
    on(list, "wheel", interrupt, { passive: true }),
    on(list, "touchstart", onTouchStart, { passive: true }),
    on(list, "touchend", onTouchEnd, { passive: true }),
    on(list, "touchcancel", onTouchEnd, { passive: true }),
    on(list, "pointerdown", onPointerDown),
    on(list, "mousedown", onMouseDown),
    // On the document, so handlers React and Svelte delegate to their root run first and can cancel it.
    on(doc, "keydown", onKeyDown)
  ];
  return () => {
    pagedElsewhere.delete(list);
    offs.forEach((off) => off());
    offDrag.forEach((off) => off());
    resizes?.disconnect();
    mutations?.disconnect();
    view.cancelAnimationFrame(frame);
    view.clearTimeout(restTimer);
    restore("user-select");
    arrive();
    for (const item of items) {
      item.style.removeProperty("--picker-offset");
    }
  };
}
export {
  bindScrollPicker,
  nearestEnabled,
  pickerPosition
};
