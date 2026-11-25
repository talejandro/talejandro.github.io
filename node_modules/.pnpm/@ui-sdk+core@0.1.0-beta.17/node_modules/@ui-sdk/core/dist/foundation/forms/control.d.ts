/**
 * The control at or inside `root` that a label names: `root` itself when it's
 * one, else a ui-sdk control inside it, or its first native one. `accepts`
 * skips controls that belong to something else, like a nested field.
 */
declare function findControl(root: HTMLElement, accepts?: (el: HTMLElement) => boolean): HTMLElement | undefined;
/** Activates a control the way a native label does, and prevents the press's own default. */
declare function activateControl(control: HTMLElement, event?: Event): void;
export { activateControl, findControl };
