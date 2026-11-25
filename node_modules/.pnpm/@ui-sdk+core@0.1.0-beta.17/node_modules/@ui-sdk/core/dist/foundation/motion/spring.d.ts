/**
 * A damped spring from `displacement` px away from its target with `velocity`
 * px/ms: `position(t)` and `velocity(t)` at `t` ms, so a frame loop samples
 * it with no allocation. `response` is the period in seconds, `dampingRatio`
 * 1 for no bounce, below 1 to bounce.
 * @experimental
 */
declare function solveSpring(response: number, dampingRatio: number, displacement: number, velocity: number): {
    position: (t: number) => number;
    velocity: (t: number) => number;
};
declare function settleTime(solver: ReturnType<typeof solveSpring>, { positionTolerance, velocityTolerance, step, limit, }?: {
    positionTolerance?: number | undefined;
    velocityTolerance?: number | undefined;
    step?: number | undefined;
    limit?: number | undefined;
}): number;
declare function springLinearEasing(solver: ReturnType<typeof solveSpring>, from: number, to: number, duration: number, step?: number): string;
export { settleTime, solveSpring, springLinearEasing };
