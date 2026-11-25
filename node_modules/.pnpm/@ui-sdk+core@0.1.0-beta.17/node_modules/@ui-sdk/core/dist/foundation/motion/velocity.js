// src/foundation/motion/velocity.ts
var defaults = {
  /** How far back samples count, in ms before the newest. Defaults to 70. */
  horizon: 70,
  /** How old the newest sample can be, in ms, before the pointer counts as stopped and reads 0. Defaults to 40. */
  staleAfter: 40,
  /** The fastest the tracker reads, in px/ms either way. Defaults to 8. */
  maxSpeed: 8,
  /** How many samples it keeps. Defaults to 20, enough for the horizon at 240 Hz. */
  capacity: 20
};
function leastSquaresVelocity(times, positions, start = 0, end = times.length) {
  const count = end - start;
  if (count < 2) {
    return 0;
  }
  const newest = times[end - 1];
  if (count < 4) {
    return linearSlope(times, positions, start, end);
  }
  let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
  let x0 = 0, x1 = 0, x2 = 0;
  for (let index = start; index < end; index++) {
    const t = times[index] - newest;
    const x = positions[index];
    const t2 = t * t;
    s0 += 1;
    s1 += t;
    s2 += t2;
    s3 += t2 * t;
    s4 += t2 * t2;
    x0 += x;
    x1 += x * t;
    x2 += x * t2;
  }
  const determinant = s0 * (s2 * s4 - s3 * s3) - s1 * (s1 * s4 - s3 * s2) + s2 * (s1 * s3 - s2 * s2);
  if (Math.abs(determinant) < 1e-9) {
    return linearSlope(times, positions, start, end);
  }
  const numerator = s0 * (x1 * s4 - s3 * x2) - x0 * (s1 * s4 - s3 * s2) + s2 * (s1 * x2 - x1 * s2);
  return numerator / determinant;
}
function linearSlope(times, positions, start, end) {
  let meanTime = 0, meanPosition = 0;
  const count = end - start;
  for (let index = start; index < end; index++) {
    meanTime += times[index] / count;
    meanPosition += positions[index] / count;
  }
  let covariance = 0, variance = 0;
  for (let index = start; index < end; index++) {
    const dt = times[index] - meanTime;
    covariance += dt * (positions[index] - meanPosition);
    variance += dt * dt;
  }
  return variance > 0 ? covariance / variance : 0;
}
function createVelocityTracker(options = {}) {
  const { horizon, staleAfter, maxSpeed, capacity } = {
    ...defaults,
    ...options
  };
  const times = new Float64Array(capacity);
  const positions = new Float64Array(capacity);
  const windowTimes = new Float64Array(capacity);
  const windowPositions = new Float64Array(capacity);
  let count = 0;
  let newestIndex = -1;
  function add(time, position) {
    if (count > 0 && time <= times[newestIndex]) {
      return;
    }
    newestIndex = (newestIndex + 1) % capacity;
    times[newestIndex] = time;
    positions[newestIndex] = position;
    count = Math.min(count + 1, capacity);
  }
  function velocity(now) {
    if (count < 2) {
      return 0;
    }
    const newest = times[newestIndex];
    if (now - newest > staleAfter) {
      return 0;
    }
    let windowCount = 0;
    for (let age = count - 1; age >= 0; age--) {
      const index = (newestIndex - age + capacity) % capacity;
      if (newest - times[index] > horizon) {
        continue;
      }
      windowTimes[windowCount] = times[index];
      windowPositions[windowCount] = positions[index];
      windowCount++;
    }
    const fitted = leastSquaresVelocity(
      windowTimes,
      windowPositions,
      0,
      windowCount
    );
    return Math.max(-maxSpeed, Math.min(maxSpeed, fitted));
  }
  function reset() {
    count = 0;
    newestIndex = -1;
  }
  return { add, velocity, reset };
}
export {
  createVelocityTracker,
  leastSquaresVelocity
};
