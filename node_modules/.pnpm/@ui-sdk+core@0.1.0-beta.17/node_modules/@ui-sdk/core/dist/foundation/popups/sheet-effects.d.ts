/**
 * Keyframes for an element that follows a sheet, like `{ scale: [1, 0.94] }`. Index 0 is closed, the last is fully expanded.
 * @stable
 */
type SheetKeyframes = Record<string, (string | number)[]>;
/** Something that follows the sheet besides the backdrop: an element and the keyframes it plays. */
type SheetOutlet = {
    el: HTMLElement;
    keyframes?: SheetKeyframes;
};
/** The sheet moving without a finger: a settle in time, or native scrolling on a timeline. */
type SheetMotion = {
    type: "settle";
    extentAt: (elapsed: number) => number;
    /** When it starts. An open moves it to the sheet's first frame later (see `sync`). */
    startTime: number;
    duration: number;
} | {
    type: "timeline";
    timeline: AnimationTimeline;
    extentAt: (progress: number) => number;
};
type Values = {
    dim: number;
    progress: number;
    expand: number;
};
declare function prepareVariables(): void;
declare const supportsLinear: () => boolean;
declare function createSheetEffects(targets: {
    sheet: HTMLElement;
    backdrop: () => HTMLElement | undefined;
    dimmed?: HTMLElement;
    outlets: () => readonly SheetOutlet[];
    ancestors: () => readonly HTMLElement[];
    themeColor?: (dim: number) => void;
}): {
    configure: (next: {
        snapExtents: readonly number[];
        undimmedIndex: number;
    }) => void;
    compute: (extent: number, into?: Values) => Values;
    apply: (extent: number, { rest }?: {
        rest?: boolean | undefined;
    }) => void;
    play: (motion: SheetMotion) => void;
    sync: (startTime: number) => void;
    follow: (motion: SheetMotion) => void;
    stop: () => void;
    destroy: () => void;
};
type SheetEffects = ReturnType<typeof createSheetEffects>;
export { createSheetEffects, prepareVariables, type SheetEffects, type SheetKeyframes, type SheetMotion, type SheetOutlet, supportsLinear, };
