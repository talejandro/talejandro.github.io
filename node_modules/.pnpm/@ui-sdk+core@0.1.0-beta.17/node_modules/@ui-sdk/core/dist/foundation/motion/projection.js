// src/foundation/motion/projection.ts
function projectDistance(velocity, rate) {
  return velocity * rate / (1 - rate);
}
function chooseSnapTarget(input) {
  const { extent, velocity, candidates } = input;
  if (Math.abs(velocity) < input.minFlingVelocity) {
    return nearestIndex(candidates, extent);
  }
  const projected = extent + projectDistance(velocity, input.rate);
  const nextInDirection = firstBeyond(candidates, extent, Math.sign(velocity));
  let target = nearestIndex(candidates, projected);
  const isBehind = velocity > 0 ? candidates[target] <= extent + 0.5 : candidates[target] >= extent - 0.5;
  if (isBehind && nextInDirection !== -1) {
    target = nextInDirection;
  }
  if (!input.skipSnapPoints && nextInDirection !== -1) {
    target = velocity > 0 ? Math.min(target, nextInDirection) : Math.max(target, nextInDirection);
  }
  return target;
}
function nearestIndex(candidates, value) {
  let best = 0;
  for (let index = 1; index < candidates.length; index++) {
    if (Math.abs(candidates[index] - value) < Math.abs(candidates[best] - value)) {
      best = index;
    }
  }
  return best;
}
function firstBeyond(candidates, extent, direction) {
  if (direction > 0) {
    return candidates.findIndex((candidate) => candidate > extent + 0.5);
  }
  for (let index = candidates.length - 1; index >= 0; index--) {
    if (candidates[index] < extent - 0.5) {
      return index;
    }
  }
  return -1;
}
export {
  chooseSnapTarget,
  nearestIndex,
  projectDistance
};
