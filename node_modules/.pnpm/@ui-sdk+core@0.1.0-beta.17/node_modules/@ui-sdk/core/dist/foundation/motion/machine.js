// src/foundation/motion/machine.ts
import { chooseSnapTarget, nearestIndex } from "./projection.js";
import { rubberBand, rubberBandInverse, rubberBandSlope } from "./rubber-band.js";
import { solveSpring } from "./spring.js";
var none = [];
var nudgeVelocity = 1;
function initialState(extent, restingIndex) {
  return { phase: "idle", extent, restingIndex };
}
function next(state, event, config) {
  switch (event.type) {
    case "down":
      return onDown(state, event, config);
    case "move":
      return onMove(state, event, config);
    case "up":
      return onUp(state, event, config);
    case "settled":
      return onSettled(state);
    case "rest":
      return onRest(state, event, config);
    case "snap-to":
      return onSnapTo(state, event, config);
    case "nudge":
      return onNudge(state, event, config);
    case "close":
      return settleTo(state, config, {
        targetIndex: -1,
        motion: currentMotion(state, event.time),
        time: event.time,
        reason: "imperative",
        outcome: { type: "dismiss", reason: "imperative" }
      });
  }
}
function currentMotion(state, time) {
  if (state.phase !== "settling") {
    return { extent: state.extent, velocity: 0 };
  }
  const solver = solveSpring(
    state.response,
    state.dampingRatio,
    state.from - state.to,
    state.velocity
  );
  const elapsed = Math.max(0, time - state.startTime);
  return {
    extent: state.to + solver.position(elapsed),
    velocity: solver.velocity(elapsed)
  };
}
function onDown(state, event, config) {
  const slop = event.pointer === "mouse" ? config.physics.mouseSlop : config.physics.touchSlop;
  if (state.phase === "idle" && state.restingIndex >= 0) {
    return {
      state: {
        ...state,
        phase: "pending",
        originX: event.x,
        originY: event.y,
        slop
      },
      effects: none
    };
  }
  if (state.phase !== "settling") {
    return { state, effects: none };
  }
  const { extent } = currentMotion(state, event.time);
  const dragging = {
    phase: "dragging",
    extent,
    restingIndex: state.restingIndex,
    anchorY: event.y,
    anchorExtent: unconstrainExtent(extent, config),
    lastY: event.y,
    isScrollingContent: false
  };
  return {
    state: dragging,
    effects: [{ type: "move", extent }]
  };
}
function onMove(state, event, config) {
  if (state.phase === "pending") {
    return leavePending(state, event, config);
  }
  if (state.phase === "scrolling" && config.contentScroll) {
    return config.contentScroll.move(state, event);
  }
  if (state.phase === "dragging") {
    return drag(state, event, config);
  }
  return { state, effects: none };
}
function leavePending(state, event, config) {
  const dx = event.x - state.originX;
  const dy = event.y - state.originY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < state.slop) {
    return { state, effects: none };
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      state: initialState(state.extent, state.restingIndex),
      effects: none
    };
  }
  const scrolling = config.contentScroll?.claim(state, event, dy < 0, config);
  if (scrolling) {
    return { state: scrolling, effects: none };
  }
  const dragging = {
    ...startDragging(state, state.originY + Math.sign(dy) * state.slop),
    lastY: event.y
  };
  const extent = constrainExtent(
    dragging.anchorExtent + (dragging.anchorY - event.y),
    config
  );
  return {
    state: { ...dragging, extent },
    effects: [{ type: "move", extent }]
  };
}
function startDragging(state, y) {
  return {
    phase: "dragging",
    extent: state.extent,
    restingIndex: state.restingIndex,
    anchorY: y,
    anchorExtent: state.extent,
    lastY: y,
    isScrollingContent: false
  };
}
function drag(state, event, config) {
  const delta = state.lastY - event.y;
  const anchor = state.isScrollingContent ? { anchorY: state.lastY, anchorExtent: state.extent } : state;
  const fingerExtent = anchor.anchorExtent + (anchor.anchorY - event.y);
  const scrolled = config.contentScroll?.drag(
    state,
    event,
    delta,
    fingerExtent,
    config
  );
  if (scrolled) {
    return scrolled;
  }
  const extent = constrainExtent(fingerExtent, config);
  const dragging = {
    ...state,
    anchorY: anchor.anchorY,
    anchorExtent: anchor.anchorExtent,
    extent,
    lastY: event.y,
    isScrollingContent: false
  };
  return {
    state: dragging,
    effects: [{ type: "move", extent }]
  };
}
function onUp(state, event, config) {
  if (state.phase === "pending" || state.phase === "scrolling") {
    return {
      state: initialState(state.extent, state.restingIndex),
      effects: none
    };
  }
  if (state.phase !== "dragging") {
    return { state, effects: none };
  }
  const released = config.contentScroll?.release(state, event, config);
  if (released) {
    return released;
  }
  const velocity = -event.velocity * bandSlope(state.extent, config);
  const candidates = [0, ...snapExtents(config)];
  const physics = config.physics;
  const target = {
    candidates,
    rate: physics.projectionRate,
    minFlingVelocity: physics.minFlingVelocity,
    skipSnapPoints: physics.skipSnapPoints
  };
  const candidate = chooseSnapTarget({
    ...target,
    extent: state.extent,
    velocity
  });
  const release = {
    motion: { extent: state.extent, velocity },
    time: event.time,
    reason: "swipe"
  };
  if (config.dismissible) {
    if (candidate > 0) {
      return settleTo(state, config, { ...release, targetIndex: candidate - 1 });
    }
    return settleTo(state, config, {
      ...release,
      targetIndex: -1,
      outcome: { type: "dismiss", reason: "swipe" }
    });
  }
  const fingerExtent = state.anchorExtent + (state.anchorY - state.lastY);
  const wouldDismiss = chooseSnapTarget({
    ...target,
    extent: fingerExtent,
    velocity: -event.velocity
  }) === 0;
  const index = Math.max(0, candidate - 1);
  if (!wouldDismiss) {
    return settleTo(state, config, { ...release, targetIndex: index });
  }
  return settleTo(state, config, {
    ...release,
    targetIndex: 0,
    outcome: { type: "attempt-dismiss", reason: "swipe" }
  });
}
function onSettled(state) {
  if (state.phase !== "settling") {
    return { state, effects: none };
  }
  return { state: initialState(state.to, state.targetIndex), effects: none };
}
function onRest(state, event, config) {
  if (event.extent < 1 && config.dismissible) {
    return {
      state: initialState(0, -1),
      effects: [{ type: "dismiss", reason: "swipe" }]
    };
  }
  const index = nearestIndex(snapExtents(config), event.extent);
  const effects = index === state.restingIndex ? [] : [{ type: "snap", id: config.snapPoints[index].id, reason: "swipe" }];
  return { state: initialState(event.extent, index), effects };
}
function onSnapTo(state, event, config) {
  const index = config.snapPoints.findIndex((point) => point.id === event.id);
  if (index === -1 || state.phase === "dragging") {
    return { state, effects: none };
  }
  return settleTo(state, config, {
    targetIndex: index,
    motion: currentMotion(state, event.time),
    time: event.time,
    reason: event.reason
  });
}
function onNudge(state, event, config) {
  if (state.phase !== "idle" || state.restingIndex < 0) {
    return { state, effects: none };
  }
  return settleTo(state, config, {
    targetIndex: state.restingIndex,
    motion: { extent: state.extent, velocity: -nudgeVelocity },
    time: event.time,
    reason: "imperative"
  });
}
function settleTo(state, config, options) {
  const { targetIndex, motion, time, reason } = options;
  const physics = config.physics;
  const to = targetIndex < 0 ? 0 : config.snapPoints[targetIndex].extent;
  const hasMomentum = Math.abs(motion.velocity) >= physics.minFlingVelocity;
  const dampingRatio = hasMomentum ? physics.momentumDampingRatio : physics.dampingRatio;
  const settling = {
    phase: "settling",
    extent: motion.extent,
    restingIndex: state.restingIndex,
    targetIndex,
    from: motion.extent,
    to,
    velocity: motion.velocity,
    response: physics.response,
    dampingRatio,
    startTime: time
  };
  const effects = [
    {
      type: "settle",
      from: motion.extent,
      to,
      velocity: motion.velocity,
      response: physics.response,
      dampingRatio
    }
  ];
  if (targetIndex >= 0 && targetIndex !== state.restingIndex) {
    effects.push({
      type: "snap",
      id: config.snapPoints[targetIndex].id,
      reason
    });
  }
  if (options.outcome) {
    effects.push(options.outcome);
  }
  return { state: settling, effects };
}
function constrainExtent(fingerExtent, config) {
  const largest = largestExtent(config);
  const { coefficient, dimension } = band(config);
  if (fingerExtent > largest) {
    return largest + rubberBand(fingerExtent - largest, dimension, coefficient);
  }
  if (config.dismissible) {
    return Math.max(0, fingerExtent);
  }
  const smallest = config.snapPoints[0].extent;
  if (fingerExtent < smallest) {
    return smallest - rubberBand(smallest - fingerExtent, dimension, coefficient);
  }
  return fingerExtent;
}
function unconstrainExtent(extent, config) {
  const largest = largestExtent(config);
  const { coefficient, dimension } = band(config);
  if (extent > largest) {
    return largest + rubberBandInverse(extent - largest, dimension, coefficient);
  }
  const smallest = config.snapPoints[0].extent;
  if (!config.dismissible && extent < smallest) {
    return smallest - rubberBandInverse(smallest - extent, dimension, coefficient);
  }
  return extent;
}
function band(config) {
  return {
    coefficient: config.physics.rubberBand,
    dimension: config.physics.rubberBandDimension ?? config.dimension
  };
}
function bandSlope(extent, config) {
  const { coefficient, dimension } = band(config);
  const largest = largestExtent(config);
  const smallest = config.snapPoints[0].extent;
  const overshoot = extent > largest ? extent - largest : !config.dismissible && extent < smallest ? smallest - extent : 0;
  if (overshoot <= 0) {
    return 1;
  }
  return rubberBandSlope(
    rubberBandInverse(overshoot, dimension, coefficient),
    dimension,
    coefficient
  );
}
function largestExtent(config) {
  return config.snapPoints[config.snapPoints.length - 1].extent;
}
function snapExtents(config) {
  return config.snapPoints.map((point) => point.extent);
}
export {
  currentMotion,
  initialState,
  largestExtent,
  next,
  snapExtents,
  startDragging
};
