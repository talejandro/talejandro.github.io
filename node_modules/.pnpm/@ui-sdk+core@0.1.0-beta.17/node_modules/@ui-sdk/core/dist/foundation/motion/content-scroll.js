// src/foundation/motion/content-scroll.ts
import { handoff } from "./handoff.js";
import {
  initialState,
  largestExtent,
  startDragging
} from "./machine.js";
var none = [];
var contentScroll = {
  // Past the slop, whether the scroll area under the finger takes the gesture.
  // Returns the scrolling state when it does.
  claim(state, event, towardMore, config) {
    if (!event.scroll) {
      return;
    }
    const owner = handoff({
      towardMore,
      scrollAtStart: event.scroll.atStart,
      atLargest: state.extent >= largestExtent(config) - 0.5,
      expandOnScroll: config.expandOnScroll
    });
    if (owner !== "scroll") {
      return;
    }
    return {
      phase: "scrolling",
      extent: state.extent,
      restingIndex: state.restingIndex,
      lastY: event.y
    };
  },
  // A move while the content scrolls. The content reached its top while the
  // finger keeps pulling down: the rest of the same gesture moves the sheet.
  move(state, event) {
    const isMovingDown = event.y > state.lastY;
    if (isMovingDown && event.scroll?.atStart) {
      return { state: startDragging(state, event.y), effects: none };
    }
    return { state: { ...state, lastY: event.y }, effects: none };
  },
  // A drag move the content takes, or undefined when the sheet moves.
  // `delta` is positive when the finger moves up, and `fingerExtent` is where
  // the finger would put the sheet.
  drag(state, event, delta, fingerExtent, config) {
    const scroll = event.scroll;
    if (!scroll) {
      return;
    }
    if (state.isScrollingContent && (delta > 0 ? !scroll.atEnd : !scroll.atStart)) {
      const effects2 = [{ type: "scroll", delta }];
      return { state: { ...state, lastY: event.y }, effects: effects2 };
    }
    const largest = largestExtent(config);
    if (!(delta > 0 && fingerExtent > largest && state.extent <= largest && !scroll.atEnd)) {
      return;
    }
    const effects = [
      { type: "scroll", delta: fingerExtent - largest }
    ];
    if (state.extent !== largest) {
      effects.unshift({ type: "move", extent: largest });
    }
    const scrolling = {
      ...state,
      extent: largest,
      anchorY: event.y,
      anchorExtent: largest,
      lastY: event.y,
      isScrollingContent: true
    };
    return { state: scrolling, effects };
  },
  // A release while the content scrolls: the sheet reached its largest snap
  // point on the way, rests there, and the content coasts.
  release(state, event, config) {
    if (!state.isScrollingContent) {
      return;
    }
    const largestIndex = config.snapPoints.length - 1;
    const effects = [
      { type: "fling-scroll", velocity: -event.velocity }
    ];
    if (state.restingIndex !== largestIndex) {
      effects.push({
        type: "snap",
        id: config.snapPoints[largestIndex].id,
        reason: "swipe"
      });
    }
    return { state: initialState(state.extent, largestIndex), effects };
  }
};
export {
  contentScroll
};
