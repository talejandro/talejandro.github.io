// src/foundation/motion/index.ts
import { contentScroll } from "./content-scroll.js";
import { dimAmount, expandAmount, progressAmount } from "./curves.js";
import { handoff } from "./handoff.js";
import {
  initialState,
  next
} from "./machine.js";
import {
  bindFindable,
  bindPanel,
  hiddenAttrs,
  stateAndRenders,
  supportsHiddenUntilFound
} from "./panel.js";
import { sheetPhysics } from "./physics.js";
import { animateIn, animateOut, writeOpen } from "./presence.js";
import { nearestIndex, projectDistance } from "./projection.js";
import { rubberBand } from "./rubber-band.js";
import {
  findSnapIndex,
  isAtOrBelow,
  resolveSnapPoints
} from "./snap-points.js";
import { settleTime, solveSpring, springLinearEasing } from "./spring.js";
import { createVelocityTracker } from "./velocity.js";
export {
  animateIn,
  animateOut,
  bindFindable,
  bindPanel,
  contentScroll,
  createVelocityTracker,
  dimAmount,
  expandAmount,
  findSnapIndex,
  handoff,
  hiddenAttrs,
  initialState,
  isAtOrBelow,
  nearestIndex,
  next,
  progressAmount,
  projectDistance,
  resolveSnapPoints,
  rubberBand,
  settleTime,
  sheetPhysics,
  solveSpring,
  springLinearEasing,
  stateAndRenders,
  supportsHiddenUntilFound,
  writeOpen
};
