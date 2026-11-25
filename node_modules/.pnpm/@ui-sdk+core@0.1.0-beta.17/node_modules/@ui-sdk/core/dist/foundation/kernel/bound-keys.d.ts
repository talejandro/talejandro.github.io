import type { Store } from "./store.js";
type Draft = Record<string, unknown>;
declare function later<State extends object>(store: Store<State>, edit: (draft: Draft) => void): undefined;
declare function keyWhileBound<Field extends string>(store: Store<Record<NoInfer<Field>, readonly string[]>>, field: Field, key: string): () => void;
/**
 * Sets a flag while a part is in the page, like whether a list part holds the
 * options. Returns the cleanup for `bind`. With `now`, it's set as the part
 * binds, for a flag only the part's ancestors read, which have hydrated by
 * then, like whether a title names its popup: the popup moves focus before a
 * render a microtask asks for, and a screen reader announces the name it
 * finds then (`tests/specs/dialog.spec.ts`).
 */
declare function flagWhileBound<Key extends string>(store: Store<Record<NoInfer<Key>, boolean | null>>, key: Key, { now }?: {
    now?: boolean | undefined;
}): () => void;
/**
 * A flag that's null until the parts bind, like whether a title renders, is
 * false once they have without its part. Call it as the part that needs the
 * answer binds: parts bound with it have set the flag by the time it settles.
 */
declare function settleFlag<Key extends string>(store: Store<Record<NoInfer<Key>, boolean | null>>, key: Key): void;
export { flagWhileBound, keyWhileBound, later, settleFlag };
