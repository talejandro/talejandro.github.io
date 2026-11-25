import type { Store } from "./store.js";
/**
 * Derives the state that comes with options as they arrive, like the panel a
 * closing `open` leaves animating out: `derive` gets what `sync` made, the
 * state before it and the arriving options, and returns what changes with it,
 * of `keys`. It reads options from its third argument, never from
 * `context.options()`, which still holds the ones handed over last. A framework
 * that renders options before it hands them over, through `follow`, renders
 * this with them, in the same pass. Pure: it runs as the framework renders.
 * A change made any other way, like a press, still derives it where it's made.
 * Only what's registered on the instance's own store runs, not on a view of it.
 */
declare function deriveFromOptions<State extends object, Options = unknown>(context: {
    store: Pick<Store<State>, "get">;
    options?: () => Options;
}, keys: (keyof State & string)[], derive: (synced: Partial<State>, state: State, options: Options) => Partial<State> | void): void;
/**
 * Keeps state that's worked out from other state, like what each option of a
 * list shows from the query and the value, current: after every change, and,
 * for a framework that renders options before it hands them over through
 * `follow`, in the same pass as the options. `derive` reads the state it's
 * given, or `store.get()`, which returns the same while it runs, and returns
 * what changed, of `keys`. With `live: false`, a change to live keys only,
 * like a highlight moving, can't change it. Call it before the subscriptions
 * that read it.
 */
declare function deriveState<State extends object>(context: {
    store: Store<State>;
}, keys: (keyof State & string)[], derive: (state: State) => Partial<State> | void, { live }?: {
    live?: boolean | undefined;
}): void;
/**
 * What `sync` made of `options`, `synced`, with what the store's derivations
 * make of it given `state`, the state before it.
 */
declare function withDerived<State extends object>(store: Store<State>, options: object, synced: Partial<State> | undefined, state: State): Partial<State> | undefined;
export { deriveFromOptions, deriveState, withDerived };
