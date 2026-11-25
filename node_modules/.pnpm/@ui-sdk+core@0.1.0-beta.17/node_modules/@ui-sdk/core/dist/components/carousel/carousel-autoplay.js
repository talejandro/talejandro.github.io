// src/components/carousel/carousel-autoplay.ts
function createAutoplay(options) {
  const now = options.now ?? (() => performance.now());
  const pauses = /* @__PURE__ */ new Set();
  let running = false;
  let timer;
  let remaining = 0;
  let startedAt = 0;
  const isPaused = () => running && pauses.size > 0;
  function arm() {
    clearTimeout(timer);
    timer = void 0;
    if (!running || pauses.size > 0) {
      return;
    }
    startedAt = now();
    timer = setTimeout(tick, remaining);
  }
  function tick() {
    timer = void 0;
    remaining = options.interval();
    options.onTick();
    arm();
  }
  function setPaused(cause, paused) {
    const was = isPaused();
    if (paused === pauses.has(cause)) {
      return;
    }
    if (paused) {
      if (pauses.size === 0 && running && timer) {
        remaining = Math.max(0, remaining - (now() - startedAt));
      }
      pauses.add(cause);
      clearTimeout(timer);
      timer = void 0;
    } else {
      pauses.delete(cause);
      arm();
    }
    if (isPaused() !== was) {
      options.onPausedChange(isPaused());
    }
  }
  return {
    /** Starts or stops rotating. Starting gives the current page a full interval. */
    setRunning(value) {
      if (value === running) {
        return;
      }
      const was = isPaused();
      running = value;
      remaining = options.interval();
      arm();
      if (isPaused() !== was) {
        options.onPausedChange(isPaused());
      }
    },
    /** The page changed: it gets a full interval from now. */
    restart() {
      remaining = options.interval();
      arm();
    },
    setPaused,
    isPaused,
    destroy() {
      running = false;
      clearTimeout(timer);
    }
  };
}
export {
  createAutoplay
};
