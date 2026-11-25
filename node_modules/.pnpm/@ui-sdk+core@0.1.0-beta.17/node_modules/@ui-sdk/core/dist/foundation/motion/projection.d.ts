/**
 * How far something thrown at `velocity` px/ms travels before it stops, slowing by `rate` per ms, like 0.998 for a scroll view.
 * @experimental
 */
declare function projectDistance(velocity: number, rate: number): number;
declare function chooseSnapTarget(input: {
    /** The extent at release, in px. */
    extent: number;
    /** px/ms, positive toward a larger extent. */
    velocity: number;
    /** Ascending resting extents, in px. */
    candidates: readonly number[];
    /** Per-millisecond deceleration used for the projection. */
    rate: number;
    /** Below this speed, in px/ms, the nearest candidate wins. */
    minFlingVelocity: number;
    /** Whether a fling can pass over a candidate. */
    skipSnapPoints: boolean;
}): number;
declare function nearestIndex(candidates: readonly number[], value: number): number;
export { chooseSnapTarget, nearestIndex, projectDistance };
