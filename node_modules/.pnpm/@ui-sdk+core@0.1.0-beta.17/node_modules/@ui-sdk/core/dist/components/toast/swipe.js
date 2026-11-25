// src/components/toast/swipe.ts
var slop = 8;
function along(direction, x, y) {
  if (direction === "up") {
    return -y;
  }
  if (direction === "down") {
    return y;
  }
  return direction === "left" ? -x : x;
}
function resist(distance) {
  return Math.sign(distance) * 4 * Math.log1p(Math.abs(distance) / 4);
}
function swipeOffset(x, y, axis, directions) {
  const free = (value, negative, positive) => value < 0 && directions.includes(negative) || value > 0 && directions.includes(positive) ? value : resist(value);
  return axis === "x" ? { x: free(x, "left", "right"), y: 0 } : { x: 0, y: free(y, "up", "down") };
}
function swipeOutcome({
  x,
  y,
  velocityX,
  velocityY,
  directions,
  threshold = 40,
  flick = 0.3
}) {
  for (const direction of directions) {
    const distance = along(direction, x, y);
    const speed = along(direction, velocityX, velocityY);
    if (distance >= threshold || distance > slop && speed >= flick) {
      return direction;
    }
  }
  return null;
}
function swipeAxis(x, y, directions) {
  if (Math.hypot(x, y) < slop) {
    return void 0;
  }
  const axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
  const allowed = axis === "x" ? directions.some(
    (direction) => direction === "left" || direction === "right"
  ) : directions.some(
    (direction) => direction === "up" || direction === "down"
  );
  return allowed ? axis : null;
}
function trackSwipe(drags, el, down, directions, callbacks) {
  const start = { x: down.clientX, y: down.clientY };
  const samples = [{ x: start.x, y: start.y, time: down.timeStamp }];
  let axis = "x";
  drags.startOnMove(el, down, {
    pick(move) {
      const picked = swipeAxis(
        move.clientX - start.x,
        move.clientY - start.y,
        directions
      );
      if (picked === void 0) {
        return void 0;
      }
      if (picked === null) {
        return false;
      }
      axis = picked;
      callbacks.onStart(axis);
      return true;
    },
    onMove: ({ x, y, event }) => {
      samples.push({ x, y, time: event.timeStamp });
      if (samples.length > 2) {
        samples.shift();
      }
      callbacks.onMove(swipeOffset(x - start.x, y - start.y, axis, directions));
    },
    onEnd: (event, canceled) => {
      const [from, to] = samples;
      const elapsed = to ? Math.max(1, to.time - from.time) : Infinity;
      const x = event.clientX - start.x;
      const y = event.clientY - start.y;
      const direction = canceled ? null : swipeOutcome({
        x: axis === "x" ? x : 0,
        y: axis === "y" ? y : 0,
        velocityX: to ? (to.x - from.x) / elapsed : 0,
        velocityY: to ? (to.y - from.y) / elapsed : 0,
        directions
      });
      callbacks.onEnd(direction, event);
    }
  });
}
export {
  along,
  swipeAxis,
  swipeOffset,
  swipeOutcome,
  trackSwipe
};
