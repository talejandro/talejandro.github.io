// src/foundation/motion/spring.ts
function solveSpring(response, dampingRatio, displacement, velocity) {
  const omega = 2 * Math.PI / (response * 1e3);
  const zeta = dampingRatio;
  if (Math.abs(zeta - 1) < 1e-6) {
    return criticallyDamped(omega, displacement, velocity);
  }
  if (zeta < 1) {
    return underdamped(omega, zeta, displacement, velocity);
  }
  return overdamped(omega, zeta, displacement, velocity);
}
function underdamped(omega, zeta, x0, v0) {
  const decay = zeta * omega;
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  const b = (v0 + decay * x0) / damped;
  return {
    position: (t) => Math.exp(-decay * t) * (x0 * Math.cos(damped * t) + b * Math.sin(damped * t)),
    velocity: (t) => {
      const cos = Math.cos(damped * t);
      const sin = Math.sin(damped * t);
      return Math.exp(-decay * t) * ((b * damped - decay * x0) * cos - (x0 * damped + decay * b) * sin);
    }
  };
}
function criticallyDamped(omega, x0, v0) {
  const b = v0 + omega * x0;
  return {
    position: (t) => Math.exp(-omega * t) * (x0 + b * t),
    velocity: (t) => Math.exp(-omega * t) * (b - omega * (x0 + b * t))
  };
}
function overdamped(omega, zeta, x0, v0) {
  const root = Math.sqrt(zeta * zeta - 1);
  const fast = -omega * (zeta + root);
  const slow = -omega * (zeta - root);
  const slowWeight = (v0 - fast * x0) / (slow - fast);
  const fastWeight = x0 - slowWeight;
  return {
    position: (t) => slowWeight * Math.exp(slow * t) + fastWeight * Math.exp(fast * t),
    velocity: (t) => slowWeight * slow * Math.exp(slow * t) + fastWeight * fast * Math.exp(fast * t)
  };
}
function settleTime(solver, {
  positionTolerance = 0.5,
  velocityTolerance = 0.02,
  step = 1,
  limit = 1e4
} = {}) {
  for (let t = 0; t <= limit; t += step) {
    if (Math.abs(solver.position(t)) <= positionTolerance && Math.abs(solver.velocity(t)) <= velocityTolerance) {
      return t;
    }
  }
  return limit;
}
function springLinearEasing(solver, from, to, duration, step = 1e3 / 120) {
  const distance = to - from;
  if (Math.abs(distance) < 1e-6) {
    return "linear";
  }
  const stops = [];
  for (let t = 0; t < duration; t += step) {
    stops.push(round(1 + solver.position(t) / distance));
  }
  stops.push("1");
  return `linear(${stops.join(", ")})`;
}
function round(value) {
  return String(Math.round(value * 1e4) / 1e4);
}
export {
  settleTime,
  solveSpring,
  springLinearEasing
};
