/**
 * The numbers behind a sheet's motion. Every driver reads the same preset.
 * @stable
 */
type SheetPhysics = {
    /** Spring period in seconds, for releases without momentum and for programmatic moves. */
    response: number;
    /** Damping ratio for releases without momentum and programmatic moves. 1 never overshoots. */
    dampingRatio: number;
    /** Damping ratio once a release carries momentum, which lets it overshoot a little. */
    momentumDampingRatio: number;
    /** Per-millisecond deceleration used to project where a fling would stop. */
    projectionRate: number;
    /** Below this speed, in px per ms, a release settles on the nearest snap point. */
    minFlingVelocity: number;
    /** Whether a fast fling can pass over snap points. */
    skipSnapPoints: boolean;
    /** The rubber band's coefficient, past the largest snap point or a refused dismissal. */
    rubberBand: number;
    /** The most the rubber band can stretch, in px, or null for the container's size. */
    rubberBandDimension: number | null;
    /** Travel, in px, before a touch or pen drag moves the sheet. */
    touchSlop: number;
    /** Travel, in px, before a mouse drag moves the sheet. */
    mouseSlop: number;
    /** How dark `themeColor` makes the browser's theme color, as the opacity of black. */
    dim: number;
    /** How far back, in ms, the release velocity looks at input samples. */
    velocityHorizon: number;
};
/**
 * Physics presets. `ios` is the default everywhere.
 * @stable
 */
declare const sheetPhysics: {
    ios: SheetPhysics;
};
export { sheetPhysics, type SheetPhysics };
