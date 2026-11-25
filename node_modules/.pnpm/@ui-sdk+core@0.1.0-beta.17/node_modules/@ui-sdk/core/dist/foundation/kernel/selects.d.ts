import type { Part } from "./primitive-types.js";
import { type Listener, type Store } from "./store.js";
type Selected<State, Key extends keyof State> = NonNullable<State[Key]> extends readonly (infer Item)[] ? Item : NonNullable<State[Key]> extends Record<string, unknown> ? string : State[Key];
/**
 * Reads a key no part can compare its own value with, like a grid's active
 * cell, by name: `values` names what a part reads, and `moved` names what a
 * change reaches, or returns `true` to reach every part that reads the key.
 */
type Reader<Value, View> = {
    values: (part: View) => readonly string[];
    moved: (previous: Value, next: Value, notify: (name: string) => void) => boolean | void;
};
type Reads<State, Api, Props> = {
    [Key in keyof State]?: readonly Selected<State, Key>[] | ((part: {
        id: string;
        key: string;
        props: Props;
        api: Api;
    }) => readonly Selected<State, Key>[]) | Reader<State[Key], {
        id: string;
        key: string;
        props: Props;
        api: Api;
    }>;
};
type Moved = (previous: unknown, next: unknown, notify: (name: any) => void) => boolean | void;
/**
 * Narrows which changes reach a slot's parts. Each key maps to the values a
 * part reads it by comparing with, like `highlighted === key`: a change to
 * the key reaches the part only when the key takes or leaves one of them. A
 * key that holds an array is read by membership, like `panels.includes(key)`:
 * the part hears when one of its values joins or leaves the array. A key that
 * holds a plain object is read by entry, like `values[key]`: the part hears
 * when an entry its values name is added, removed or changed. A fixed list
 * holds values every part of the slot shares, and an empty one means the
 * part never reads the key. Changes to every other key reach every part. A
 * key read any other way must not be listed: the part would miss changes.
 * Each primitive with `selects` has a test that proves it.
 * @stable
 */
declare function selects<State extends object, Api, Props>(reads: NoInfer<Reads<State, Api, Props>>): {
    /**
     * The values a part reads each key it lists by, an empty list for a key it
     * never reads. A key it doesn't list, it reads whole.
     */
    reading(part: Part<State, Api, Props>, props: Props): Map<PropertyKey, readonly unknown[]>;
    /** The values a part selects on, which it subscribes again for when they change. */
    selection(part: Part<State, Api, Props>, props: Props): string;
    /**
     * Runs `listener` when a change can affect the part: a key it selects on
     * took or left one of its values, or any other key changed. Every part of
     * the slot skips the listed keys as one group.
     */
    subscribe(part: Part<State, Api, Props>, listener: Listener, props: Props): () => void;
};
type Selects<State extends object, Api, Props> = ReturnType<typeof selects<State, Api, Props>>;
/**
 * Runs `listener` when `key` takes `value` or leaves it, for an array, when
 * `value` joins it or leaves it, and for a plain object, when its entry named
 * `value` is added, removed or changed.
 */
declare function select<State extends object, Key extends keyof State>(store: Store<State>, key: Key, value: Selected<State, Key>, listener: Listener, moved?: Moved): () => void;
declare function eachMoved(before: unknown, after: unknown, notify: (value: unknown) => void): void;
export { eachMoved, select, selects, type Reader, type Selects };
