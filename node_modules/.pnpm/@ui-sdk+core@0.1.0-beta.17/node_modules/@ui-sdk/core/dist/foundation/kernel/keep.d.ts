type Start = () => (() => void) | void;
declare function whileDestroying(run: () => void): void;
declare const isDestroying: () => boolean;
/**
 * Makes an instance with a lifecycle of its own, kept at once in a browser,
 * unless `unwatched` is making it, or another instance is being made, which
 * then keeps and releases it with its own work.
 */
declare function withLifecycle<T extends object>(make: () => T): T;
/**
 * Makes an instance that starts nothing outside itself until `keep()`, for a
 * framework that may make instances during a render and throw them away,
 * like React's state initializer under StrictMode.
 */
declare function unwatched<T>(make: () => T): T;
/**
 * Runs `start` once the framework keeps the instance being made, and again
 * at each `keep()` after a `release()`, which runs what it returns. Only an
 * instance's setup calls it: outside one, nothing would ever stop the work.
 */
declare function whenKept(start: Start): void;
/**
 * Runs `run` as part of making `instance`, after it was made, like an api
 * built once the instance wakes. What it registers with `whenKept` starts at
 * once while the instance is kept.
 */
declare function extendLifecycle(instance: object, run: () => void): void;
/** Starts what waits on the framework keeping an instance. Safe to call again. */
declare function keep(instance: object): void;
/**
 * Stops what `keep()` started, while the framework holds on to the instance
 * without showing it, like React's <Activity> hiding it, or before it's
 * destroyed. The instance keeps its state, and `keep()` starts it all again.
 */
declare function release(instance: object): void;
/** Stops what `keep()` started for good, as the instance is destroyed. */
declare function discard(instance: object): void;
export { discard, extendLifecycle, isDestroying, keep, release, unwatched, whenKept, whileDestroying, withLifecycle, };
