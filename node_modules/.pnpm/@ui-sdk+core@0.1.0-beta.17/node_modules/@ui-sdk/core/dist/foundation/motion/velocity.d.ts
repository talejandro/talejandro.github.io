declare const defaults: {
    /** How far back samples count, in ms before the newest. Defaults to 70. */
    horizon: number;
    /** How old the newest sample can be, in ms, before the pointer counts as stopped and reads 0. Defaults to 40. */
    staleAfter: number;
    /** The fastest the tracker reads, in px/ms either way. Defaults to 8. */
    maxSpeed: number;
    /** How many samples it keeps. Defaults to 20, enough for the horizon at 240 Hz. */
    capacity: number;
};
declare function leastSquaresVelocity(times: ArrayLike<number>, positions: ArrayLike<number>, start?: number, end?: number): number;
/**
 * Release velocity along one axis, the way Drawer and Carousel measure a
 * flick: `add(time, position)` on each move, then `velocity(now)` on release,
 * in px/ms. A pointer that stopped before letting go reads 0. Track x and y
 * with one tracker each.
 * @experimental
 */
declare function createVelocityTracker(options?: Partial<typeof defaults>): {
    add: (time: number, position: number) => void;
    velocity: (now: number) => number;
    reset: () => void;
};
export { createVelocityTracker, leastSquaresVelocity };
