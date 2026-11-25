// src/foundation/motion/physics.ts
var sheetPhysics = {
  ios: {
    response: 0.34,
    dampingRatio: 1,
    momentumDampingRatio: 0.88,
    projectionRate: 0.99,
    minFlingVelocity: 0.5,
    skipSnapPoints: true,
    // UIKit's sheet band stops near 23pt: d 24, c 1.9 fit the recording.
    rubberBand: 1.9,
    rubberBandDimension: 24,
    touchSlop: 8,
    mouseSlop: 4,
    dim: 0.2,
    velocityHorizon: 70
  }
};
export {
  sheetPhysics
};
