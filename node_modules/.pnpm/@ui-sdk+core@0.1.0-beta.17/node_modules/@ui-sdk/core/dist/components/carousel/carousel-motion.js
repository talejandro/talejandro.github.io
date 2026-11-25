// src/components/carousel/carousel-motion.ts
import {
  initialState,
  next
} from "../../foundation/motion/machine.js";
import { projectDistance } from "../../foundation/motion/projection.js";
import { settleTime, solveSpring } from "../../foundation/motion/spring.js";
import { createVelocityTracker } from "../../foundation/motion/velocity.js";
import { clamp } from "../../foundation/number/steps.js";
import { nearestPage } from "./carousel-layout.js";
import { on } from "../../foundation/kernel/events.js";
import { swallowNextClick } from "../../foundation/drag-and-drop/pointer.js";
var ignoredTargets = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-carousel-no-drag]';
var restTimeout = 120;
var freeDecelerationRate = 0.998;
function createCarouselMotion(options) {
  const { viewport } = options;
  const doc = viewport.ownerDocument;
  const view = doc.defaultView ?? window;
  let state = initialState(0, 0);
  let spring = null;
  let pendingPosition = null;
  let moveFrame = 0;
  let overshoot = 0;
  let written = null;
  let touching = false;
  let touched = false;
  let userScrolled = false;
  let restMissed = false;
  let restTimer = 0;
  let pointerId = null;
  let dragging = false;
  let mouseDragged = false;
  let offPointer = [];
  let lastScrollEvent;
  let destroyed = false;
  const point = { x: 0, y: 0 };
  const tracker = createVelocityTracker();
  const supportsScrollEnd = "onscrollend" in viewport;
  const offs = [
    on(viewport, "scroll", onScroll, { passive: true }),
    ...supportsScrollEnd ? [on(viewport, "scrollend", (event) => onRest(event))] : [],
    on(viewport, "touchstart", onTouchStart, { passive: true }),
    on(viewport, "touchend", onTouchEnd, { passive: true }),
    on(viewport, "touchcancel", onTouchEnd, { passive: true }),
    on(viewport, "pointerdown", onPointerDown),
    // A dragged image or link would start the browser's drag and drop instead.
    on(viewport, "dragstart", (event) => {
      if (options.canDrag()) {
        event.preventDefault();
      }
    })
  ];
  function position() {
    const { vertical, rtl } = options.axis();
    if (vertical) {
      return viewport.scrollTop;
    }
    return rtl ? -viewport.scrollLeft : viewport.scrollLeft;
  }
  function write(target) {
    if (destroyed) {
      return;
    }
    const { vertical, rtl } = options.axis();
    const scroll = clamp(target, 0, options.maxScroll());
    written = scroll;
    if (vertical) {
      viewport.scrollTop = scroll;
    } else {
      viewport.scrollLeft = rtl ? -scroll : scroll;
    }
    writeOvershoot(target - scroll);
    options.onScroll();
  }
  function writeOvershoot(amount) {
    const content = options.content();
    if (!content || amount === 0 && overshoot === 0) {
      return;
    }
    overshoot = amount;
    if (amount === 0) {
      return content.style.removeProperty("translate");
    }
    const { vertical, rtl } = options.axis();
    const offset = `${Math.round(-amount * (rtl && !vertical ? -1 : 1) * 100) / 100}px`;
    content.style.translate = vertical ? `0 ${offset}` : `${offset} 0`;
  }
  function config() {
    return {
      snapPoints: options.positions().map((extent, index) => ({ id: String(index), extent })),
      dimension: options.viewportSize(),
      dismissible: false,
      expandOnScroll: false,
      physics: options.physics()
    };
  }
  function restHere() {
    const at = position();
    state = initialState(at, Math.max(0, nearestPage(pagesAt(), at)));
  }
  const pagesAt = () => options.positions().map((position2) => ({ position: position2 }));
  function dispatch(event, source) {
    if (destroyed || options.positions().length === 0) {
      return;
    }
    const result = next(state, event, config());
    state = result.state;
    setDragging(state.phase === "dragging");
    const time = "time" in event ? event.time : performance.now();
    for (const effect of result.effects) {
      run(effect, time, source);
    }
  }
  function setDragging(value) {
    if (value === dragging) {
      return;
    }
    dragging = value;
    options.onDragChange(value);
  }
  function run(effect, time, source) {
    if (effect.type === "move") {
      if (spring) {
        stopSpring();
        return write(effect.extent);
      }
      options.setSnapping(false);
      pendingPosition = effect.extent;
      moveFrame ||= view.requestAnimationFrame(flushMove);
      return;
    }
    if (effect.type === "settle") {
      return startSpring(effect, time);
    }
    if (effect.type === "snap" && effect.reason === "swipe" && source instanceof PointerEvent) {
      options.onRelease(Number(effect.id), source);
    }
  }
  function flushMove() {
    moveFrame = 0;
    if (pendingPosition === null) {
      return;
    }
    write(pendingPosition);
    pendingPosition = null;
  }
  function startSpring(effect, startTime) {
    stopSpring();
    pendingPosition = null;
    const { from, to, velocity } = effect;
    const isStill = Math.abs(to - from) < 0.5 && Math.abs(velocity) < 0.01;
    if (isStill || options.reducedMotion()) {
      write(to);
      return finishSpring();
    }
    options.setSnapping(false);
    const solver = solveSpring(
      effect.response,
      effect.dampingRatio,
      from - to,
      velocity
    );
    const duration = settleTime(solver);
    const running = { frame: 0, to };
    const step = (now) => {
      if (spring !== running) {
        return;
      }
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        write(running.to);
        return finishSpring();
      }
      write(running.to + solver.position(Math.max(0, elapsed)));
      running.frame = view.requestAnimationFrame(step);
    };
    spring = running;
    running.frame = view.requestAnimationFrame(step);
  }
  function stopSpring() {
    if (spring) {
      view.cancelAnimationFrame(spring.frame);
    }
    spring = null;
  }
  function finishSpring() {
    spring = null;
    dispatch({ type: "settled" });
    if (state.phase !== "idle") {
      return;
    }
    if (!options.dragFree() || isOnPage()) {
      options.setSnapping(true);
    }
    options.onSettle();
  }
  function isOnPage() {
    const at = position();
    return options.positions().some((position2) => Math.abs(position2 - at) < 1);
  }
  function onScroll(event) {
    const at = position();
    const isOwn = written !== null && Math.abs(at - written) < 1;
    written = null;
    if (spring || dragging || isOwn) {
      return;
    }
    userScrolled = true;
    lastScrollEvent = event;
    options.onScroll();
    if (supportsScrollEnd) {
      return;
    }
    view.clearTimeout(restTimer);
    restTimer = view.setTimeout(() => onRest(event), restTimeout);
  }
  function onRest(event) {
    if (spring || dragging || !userScrolled) {
      return;
    }
    if (touching) {
      restMissed = true;
      return;
    }
    userScrolled = false;
    const touch = touched;
    touched = false;
    restHere();
    options.onScrollRest(position(), { touch, event: event ?? lastScrollEvent });
  }
  function onTouchStart() {
    touching = true;
    touched = true;
    restMissed = false;
    if (spring) {
      stopSpring();
      restHere();
      userScrolled = true;
    }
  }
  function onTouchEnd() {
    touching = false;
    if (restMissed) {
      restMissed = false;
      onRest();
    }
  }
  function isHeld() {
    return touching || dragging || userScrolled || pointerId !== null;
  }
  function isIgnored(target) {
    return target instanceof Element && target.closest(ignoredTargets) !== null;
  }
  function axisPoint(clientX, clientY) {
    const { vertical, rtl } = options.axis();
    point.y = vertical ? clientY : rtl ? -clientX : clientX;
    point.x = vertical ? clientX : clientY;
    return point;
  }
  function onPointerDown(event) {
    if (event.pointerType === "touch" || event.button !== 0 || pointerId !== null) {
      return;
    }
    if (!options.canDrag() || isIgnored(event.target)) {
      return;
    }
    if (state.phase === "idle") {
      restHere();
    }
    pointerId = event.pointerId;
    mouseDragged = false;
    viewport.style.userSelect = "none";
    tracker.reset();
    axisPoint(event.clientX, event.clientY);
    tracker.add(event.timeStamp, point.y);
    offPointer = [
      on(doc, "pointermove", onPointerMove, { capture: true }),
      on(doc, "pointerup", onPointerUp, { capture: true }),
      on(doc, "pointercancel", onPointerUp, { capture: true })
    ];
    const pointer = event.pointerType === "pen" ? "pen" : "mouse";
    dispatch(
      { type: "down", time: event.timeStamp, x: point.x, y: point.y, pointer },
      event
    );
  }
  function onPointerMove(event) {
    if (event.pointerId !== pointerId) {
      return;
    }
    const coalesced = event.getCoalescedEvents?.();
    for (const sample of coalesced?.length ? coalesced : [event]) {
      tracker.add(sample.timeStamp, axisPoint(sample.clientX, sample.clientY).y);
    }
    axisPoint(event.clientX, event.clientY);
    dispatch(
      {
        type: "move",
        time: event.timeStamp,
        x: point.x,
        y: point.y,
        scroll: null
      },
      event
    );
    if (state.phase !== "dragging" || mouseDragged) {
      return;
    }
    mouseDragged = true;
    doc.getSelection()?.removeAllRanges();
    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
    }
  }
  function onPointerUp(event) {
    if (event.pointerId !== pointerId) {
      return;
    }
    pointerId = null;
    offPointer.forEach((off) => off());
    offPointer = [];
    viewport.style.removeProperty("user-select");
    const velocity = event.type === "pointercancel" ? 0 : tracker.velocity(event.timeStamp);
    if (state.phase === "dragging" && options.dragFree()) {
      releaseFree(event, velocity);
    } else {
      dispatch({ type: "up", time: event.timeStamp, velocity }, event);
    }
    if (mouseDragged) {
      swallowNextClick(doc);
    }
  }
  function releaseFree(event, fingerVelocity) {
    if (state.phase !== "dragging") {
      return;
    }
    const velocity = -fingerVelocity;
    const target = clamp(
      state.extent + projectDistance(velocity, freeDecelerationRate),
      0,
      options.maxScroll()
    );
    const physics = options.physics();
    const index = Math.max(0, nearestPage(pagesAt(), target));
    state = {
      phase: "settling",
      extent: state.extent,
      restingIndex: state.restingIndex,
      targetIndex: index,
      from: state.extent,
      to: target,
      velocity,
      response: physics.response,
      dampingRatio: 1,
      startTime: event.timeStamp
    };
    setDragging(false);
    startSpring({ type: "settle", ...state }, event.timeStamp);
    options.onRelease(index, event);
  }
  return {
    position,
    /** Whether the user holds or scrolls it: a finger, a drag, or a scroll that hasn't come to rest. */
    isHeld,
    /** Whether it's held, or a spring is moving it, so new layout shouldn't jump it. */
    isMoving: () => isHeld() || spring !== null,
    /** Moves to a page index: springs there from wherever it is, or jumps without `animate`. */
    moveTo(index, { animate = true } = {}) {
      const positions = options.positions();
      if (destroyed || index < 0 || index >= positions.length) {
        return;
      }
      if (touching || dragging || pointerId !== null) {
        return;
      }
      if (!animate) {
        stopSpring();
        write(positions[index]);
        state = initialState(positions[index], index);
        options.setSnapping(true);
        return;
      }
      if (state.phase === "idle") {
        restHere();
      }
      dispatch({
        type: "snap-to",
        time: performance.now(),
        id: String(index),
        reason: "imperative"
      });
    },
    /**
     * Moves the scroll position from `from` by `delta` after a looping track
     * rotated by as much, so the same slides stay in view, along with a
     * running spring. `from` is read before the rotation, since the browser
     * may snap the moved slides on its own. `remap` turns the old page
     * indexes into the new ones.
     */
    shift(from, delta, remap) {
      if (destroyed) {
        return;
      }
      if (spring) {
        spring.to += delta;
      }
      if (state.phase === "settling") {
        state = {
          ...state,
          extent: state.extent + delta,
          from: state.from + delta,
          to: state.to + delta,
          restingIndex: remap(state.restingIndex),
          targetIndex: remap(state.targetIndex)
        };
      }
      write(from + delta);
      if (state.phase === "idle") {
        restHere();
      }
    },
    destroy() {
      destroyed = true;
      stopSpring();
      if (moveFrame) {
        view.cancelAnimationFrame(moveFrame);
      }
      view.clearTimeout(restTimer);
      offs.forEach((off) => off());
      offPointer.forEach((off) => off());
      if (dragging) {
        options.onDragChange(false);
      }
      viewport.style.removeProperty("user-select");
      options.content()?.style.removeProperty("translate");
    }
  };
}
export {
  createCarouselMotion
};
