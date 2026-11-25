/**
 * Starts an element's enter animation: `data-starting-style` for its first
 * frame, so CSS transitions from it. `done` runs once the animation has
 * finished, for parts that hold a measured size while animating. Returns a
 * cleanup that stops it.
 * @stable
 */
declare function animateIn(el: HTMLElement, done?: () => void): () => void;
/**
 * Writes `data-open` or `data-closed` now, ahead of the framework's render,
 * which writes the same one. Exit keyframes keyed on `[data-closed]` are then
 * running when `animateOut` reads them.
 */
declare function writeOpen(el: HTMLElement, open: boolean): void;
/**
 * Plays an element's exit animation: `data-ending-style` and `inert` while
 * it animates out, then `done`, once every running animation has finished or
 * a timeout from the computed durations has passed. Unmount the element in
 * `done`: after an animation it keeps `data-ending-style` until then, and
 * loses it and `inert` two frames later if it stays mounted. Returns a
 * cleanup that stops it.
 * @stable
 */
declare function animateOut(el: HTMLElement, done: () => void): () => void;
export { animateIn, animateOut, writeOpen };
