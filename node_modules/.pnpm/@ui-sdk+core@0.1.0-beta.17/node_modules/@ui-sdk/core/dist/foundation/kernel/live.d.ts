import type { Attrs, Part } from "./primitive-types.js";
/**
 * Attributes from live state, written straight to the bound element on every
 * change, without a render. A slot's `live`, like
 * `live((state, { key }) => ({ "data-highlighted": … }))`.
 * @stable
 */
declare function live<State extends object, Api, Props>(read: NoInfer<(state: State, part: {
    id: string;
    key: string;
    props: Props;
    api: Api;
}) => Attrs>): {
    read: (state: State, part: {
        id: string;
        key: string;
        props: Props;
        api: Api;
    }) => Attrs;
    /**
     * Writes the attributes to `el` now and on every change the part hears.
     * Returns the cleanup, which removes them again.
     */
    attach(part: Part<State, Api, Props>, el: HTMLElement): () => void;
};
type Live<State extends object, Api, Props> = ReturnType<typeof live<State, Api, Props>>;
/**
 * Attributes of `attrs` that core keeps current on an element a framework
 * rendered, so a change to only these doesn't re-render the part. Unlike
 * `live`, they render too, on the server and on every render. Like `hidden`
 * on an option: a keystroke can hide hundreds, and rendering each one cost
 * more than the filter. A slot's `direct`, like `direct(["hidden"])`.
 * @stable
 */
declare function direct(names: readonly string[]): {
    names: readonly string[];
    /** Keeps the attributes current on `el` on every change the part hears. Returns the cleanup. */
    attach: (part: Part, el: HTMLElement) => () => void;
};
type Direct = ReturnType<typeof direct>;
/**
 * Writes attributes and removes the ones a previous call wrote but this one
 * doesn't. Attributes it never wrote, like an author's own, stay, and so do
 * an id and an author's name, description or typing hints it didn't write,
 * like a translated `aria-label`. `channel` keeps render and live attributes, and two
 * components sharing one element (a tooltip on a popover's trigger), from
 * removing each other's.
 */
declare function applyAttrs(el: HTMLElement, attrs: Attrs, channel?: string): void;
/**
 * Lets go of an element, like a part leaving its owner: removes what `channel`
 * added, and puts back what it found there, like an author's `disabled`, even
 * where it wrote the same value.
 */
declare function releaseAttrs(el: HTMLElement, channel: string): void;
/**
 * Marks an attribute someone other than a channel just wrote or removed as
 * theirs, even with the value a channel wrote, like `disabled` set again on a
 * checkbox its group disabled, so letting go of the element keeps it as they
 * left it. A channel's own writes, which an observer hears too, change nothing.
 */
declare function markAuthored(el: HTMLElement, name: string): void;
export { applyAttrs, direct, type Direct, live, type Live, markAuthored, releaseAttrs, };
