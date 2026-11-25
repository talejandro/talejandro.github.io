// src/components/carousel/carousel-loop.ts
import { clearSlideOrder, writeSlideOrder } from "./carousel-dom.js";
import {
  canLoop,
  loopPages,
  loopRotation,
  measureTrack,
  nearestPage
} from "./carousel-layout.js";
function createCarouselLoop(options) {
  let track = null;
  let view;
  let firstKey = null;
  let ordered = false;
  let rotating = false;
  let unsupported = false;
  const shownFirst = (slides) => Math.max(
    0,
    slides.findIndex((slide) => slide.key === firstKey)
  );
  function reset(slides) {
    firstKey = null;
    if (!ordered) {
      return;
    }
    ordered = false;
    clearSlideOrder(slides);
  }
  function rotate(to, { lazy = false } = {}) {
    const motion = options.motion();
    if (!track || !view || !motion || motion.isHeld()) {
      return;
    }
    const slides = options.slides();
    const first = shownFirst(slides);
    const position = motion.position();
    const pick = loopRotation(track, view, { position, first }, to, { lazy });
    if (!pick || pick.first === first) {
      return;
    }
    const before = options.visual();
    const key = slides[pick.first].key;
    firstKey = key;
    rotating = true;
    try {
      options.measure();
    } finally {
      rotating = false;
    }
    if (firstKey !== key) {
      return;
    }
    const after = options.visual();
    motion.shift(
      position,
      pick.delta,
      (index) => index < 0 ? index : after.indexOf(before[index])
    );
  }
  return {
    /** Whether the carousel loops seamlessly now. */
    isActive: () => track !== null,
    /** Whether a rotation is measuring, which keeps the scroll position for it. */
    isRotating: () => rotating,
    /**
     * Writes the slides' order for the current rotation before a measure, and
     * returns the slide shown first, or undefined when it doesn't loop.
     */
    prepare(slides, loops) {
      if (!loops || unsupported) {
        reset(slides);
        return void 0;
      }
      const first = shownFirst(slides);
      if (first > 0) {
        writeSlideOrder(slides, first);
        ordered = true;
      } else if (ordered) {
        ordered = false;
        clearSlideOrder(slides);
      }
      return first;
    },
    /**
     * A looping carousel's pages from measured slides, with `first` shown
     * first, or null when it can't loop seamlessly and rewinds instead.
     */
    layout(boxes, next, first) {
      view = next;
      track = first === void 0 ? null : measureTrack(boxes, first);
      if (first && !track) {
        unsupported = true;
      }
      if (track && !canLoop(track, view)) {
        track = null;
      }
      if (first && !track) {
        firstKey = null;
      }
      return track && loopPages(track, view, first ?? 0);
    },
    /** Clears the rotation, when the viewport goes. */
    reset(slides) {
      reset(slides);
      unsupported = false;
    },
    /**
     * Rotates, if it must, so the page at `index` lies ahead the way the
     * carousel heads: `heading`, the step's way, or else the short way round.
     */
    rotateToward(index, heading) {
      const motion = options.motion();
      if (!track || !motion) {
        return;
      }
      const pages = options.pages();
      const at = motion.position();
      const ahead = (index - nearestPage(pages, at) + pages.length) % pages.length;
      const way = ahead === 0 ? Math.sign(pages[index].position - at) : heading ?? (ahead <= pages.length / 2 ? 1 : -1);
      rotate({ page: index, heading: way < 0 ? -1 : 1 }, { lazy: true });
    },
    /** Rotates at rest, so the current page sits mid-track. */
    recenter() {
      if (track && !rotating && !options.motion()?.isMoving()) {
        rotate();
      }
    }
  };
}
export {
  createCarouselLoop
};
