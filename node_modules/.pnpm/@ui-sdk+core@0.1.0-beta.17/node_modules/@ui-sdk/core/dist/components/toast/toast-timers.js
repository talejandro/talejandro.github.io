// src/components/toast/toast-timers.ts
function createToastTimers(expire, now = () => Date.now()) {
  const countdowns = /* @__PURE__ */ new Map();
  const reasons = /* @__PURE__ */ new Set();
  let shown = [];
  function stop(countdown) {
    if (countdown.startedAt === void 0) {
      return;
    }
    clearTimeout(countdown.timer);
    countdown.remaining -= now() - countdown.startedAt;
    countdown.startedAt = void 0;
    countdown.timer = void 0;
  }
  function start(id, countdown) {
    if (countdown.startedAt !== void 0 || !Number.isFinite(countdown.remaining)) {
      return;
    }
    countdown.startedAt = now();
    countdown.timer = setTimeout(
      () => {
        countdown.startedAt = void 0;
        countdown.timer = void 0;
        countdown.remaining = 0;
        if (expire(id) === false && countdowns.get(id) === countdown) {
          countdown.remaining = countdown.duration;
          apply();
        }
      },
      Math.max(0, countdown.remaining)
    );
  }
  function apply() {
    const ids = new Set(shown.map((toast) => toast.id));
    for (const [id, countdown] of countdowns) {
      if (!ids.has(id)) {
        stop(countdown);
      }
    }
    for (const toast of shown) {
      let countdown = countdowns.get(toast.id);
      if (!countdown || countdown.version !== toast.version) {
        if (countdown) {
          stop(countdown);
        }
        countdown = {
          version: toast.version,
          duration: toast.duration,
          remaining: toast.duration
        };
        countdowns.set(toast.id, countdown);
      }
      if (reasons.size || toast.held) {
        stop(countdown);
      } else {
        start(toast.id, countdown);
      }
    }
  }
  return {
    /**
     * The toasts on screen now, and the ids still in the queue. Countdowns for
     * toasts that left the queue are dropped.
     */
    update(next, queued) {
      shown = next;
      for (const [id, countdown] of countdowns) {
        if (!queued.has(id)) {
          stop(countdown);
          countdowns.delete(id);
        }
      }
      apply();
    },
    /** Pauses every countdown for a reason, until that reason is cleared. */
    pause(reason) {
      if (reasons.has(reason)) {
        return;
      }
      reasons.add(reason);
      apply();
    },
    /** Clears one reason. Countdowns resume once no reason is left. */
    resume(reason) {
      if (!reasons.delete(reason)) {
        return;
      }
      apply();
    },
    /** Whether anything pauses the countdowns now. */
    isPaused: () => reasons.size > 0,
    /** The time a toast has left, in ms, for tests and devtools. */
    remaining(id) {
      const countdown = countdowns.get(id);
      if (!countdown) {
        return void 0;
      }
      return countdown.startedAt === void 0 ? countdown.remaining : countdown.remaining - (now() - countdown.startedAt);
    },
    /** Stops every countdown, for when the region leaves the page. */
    destroy() {
      for (const countdown of countdowns.values()) {
        stop(countdown);
      }
      countdowns.clear();
    }
  };
}
export {
  createToastTimers
};
