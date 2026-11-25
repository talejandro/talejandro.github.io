/** Why rotation is paused for now. None of these is a change to `playing`. */
type CarouselPause = "hover" | "hidden" | "offscreen" | "touch" | "drag";
declare function createAutoplay(options: {
    interval: () => number;
    onTick: () => void;
    /** Runs when it pauses or resumes. */
    onPausedChange: (paused: boolean) => void;
    /** The clock pauses measure time left with, for tests. */
    now?: () => number;
}): {
    /** Starts or stops rotating. Starting gives the current page a full interval. */
    setRunning(value: boolean): void;
    /** The page changed: it gets a full interval from now. */
    restart(): void;
    setPaused: (cause: CarouselPause, paused: boolean) => void;
    isPaused: () => boolean;
    destroy(): void;
};
export { createAutoplay };
