import type { AnySlot, Attrs, Part } from "./primitive-types.js";
import { type Listener } from "./store.js";
/**
 * Who renders a bound element. Core renders a custom element and attaches
 * every handler. A framework attaches the `handlers()` it can through its own
 * props, so user handlers run first, and names them in `attaches`: `"all"`, or
 * the event types it maps. Core listens for every other type itself, so a
 * slot's `on` works for any event in every framework. Core also keeps
 * `direct` attributes current on a framework's element, since the framework
 * skips renders for them.
 */
type Host = {
    by: "core";
} | {
    by: "framework";
    attaches: "all" | readonly string[];
};
type PartRecord = Part & {
    readonly owner: PartOwner;
    binding?: object;
    leases: number;
    ref?: (el: HTMLElement | null) => void;
    propsListeners?: Set<() => void>;
    own?: string;
};
type PartOwner = {
    readonly name: string;
    readonly label: string;
    readonly slots: Record<string, AnySlot>;
    readonly parts: Map<string, PartRecord>;
    sleeping?: {
        wake: () => void;
        binds: Set<() => void>;
    };
    released: PartRecord[];
    named?: Set<PartRecord>;
    aliases?: {
        version: number;
        map: Map<string, string>;
    };
    unread?: Set<PartRecord>;
    renamed?: boolean;
};
declare const view: <Api, Props>(part: Part<any, Api>, props: Props) => {
    id: string;
    key: string;
    props: Props;
    api: Api;
};
declare function provisional(part: PartRecord): void;
/**
 * HTML attributes for the part. SSR-safe. Once an element binds with an id
 * other than the one its slot makes, like an author's, references to the made
 * id point at it.
 * @stable
 */
declare function attrs(part: Part, props?: any, state?: any): Attrs;
declare const authorOwned: Set<string>;
/** The part's attributes without the ones the author gives, for `given(name)` to say which. */
declare function yieldToAuthor(attrs: Attrs, given: (name: string) => boolean): Attrs;
/** Whether a label reference points only at ids ui-sdk made, like a component's own label or a copied element's, rather than the author's. */
declare const madeLabel: (value: unknown) => boolean;
/**
 * What `render` functions and state-based class names receive.
 * @stable
 */
declare function partState(part: Part, props?: any, state?: any): any;
/**
 * Whether the part's element should exist.
 * @stable
 */
declare function present(part: Part, props?: any, state?: any): boolean;
/** Whether the part's presence depends on state, so a renderer shows and hides it. */
declare function conditional(part: Part): boolean;
/** Whether something leases the part, its bound element or a subscription, so a page renders it. */
declare const held: (part: Part) => boolean;
/** Live attributes, which core writes to a bound element itself. */
declare function liveAttrs(part: Part, props?: any): Attrs;
/** The attributes core keeps current on an element a framework rendered. */
declare const directNames: (part: Part) => readonly string[] | undefined;
/**
 * The values the part selects on. Empty without `selects`. Adapters
 * subscribe again when it changes.
 */
declare const selectedKeys: (part: Part, props?: any) => string;
/**
 * The names a part reads `synced` by, the state a framework delivers through
 * `instance.follow`: a key's name for a key it reads whole, and `key:value`
 * for a value it selects on, like `value:billing` for one tab, which only the
 * changes that take or leave that value touch (`touched`). `"#keys"` changes
 * when a key starts or stops being delivered.
 */
declare function followed(part: Part, synced: object | undefined, props?: any): string[];
/**
 * Runs `notify` for every name `followed` reads that changes from `previous`
 * to `next`, once or more.
 */
declare function touched(previous: Record<string, unknown> | undefined, next: Record<string, unknown> | undefined, notify: (name: string) => void): void;
/**
 * Runs `listener` when a change can affect the part, narrowed by the slot's
 * `selects`, or on every change without it, always after the component's own
 * listeners. Leases the part while subscribed.
 */
declare function subscribe(part: Part, listener: Listener, props?: any): () => void;
/** Event handlers, for adapters that attach events through the framework. */
declare function handlers(part: Part): Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;
/**
 * Gives a part the props of the render a framework committed, for one that
 * renders parts with `instance.part(slot, props, true)` and may throw renders
 * away. Its handlers and the parts around read them from now, and its
 * `onProps` listeners run.
 */
declare function commit(part: Part, props: Part["props"]): void;
declare function propsRendered(part: PartRecord): void;
/** Activation without a DOM event, for headless tests and the docs' generated tables. */
declare function press(part: Part, props?: any): (() => void) | undefined;
/**
 * Runs `listener` whenever an adapter renders the part, with `part.props`
 * already the props it passed. Work that depends on a prop, like registering
 * a shortcut, then runs only while the prop asks for it.
 */
declare function onProps(part: Part, listener: () => void): () => void;
/** Attaches behavior to an element. Leases the part while bound. Returns the cleanup. */
declare function bind(part: Part, el: HTMLElement, host?: Host): () => void;
/**
 * A stable ref callback for frameworks that hand elements over one at a time.
 * Safe to call repeatedly with the same element or with null. The framework
 * may call it again after the part was dropped, like Suspense showing content
 * it hid, and it binds with the props the part last rendered with.
 */
declare function ref(part: Part, host: Host): (el: HTMLElement | null) => void;
/**
 * Runs the slot's `connect` while the element is in the page, present or not,
 * for adapters that keep parts that aren't present, like custom elements.
 * Returns the cleanup.
 */
declare const connect: (part: Part, el: HTMLElement) => () => void;
declare const references: string[];
/**
 * `attrs` with references following the instance's parts' own ids, as a
 * part's do, for attributes an api writes to an element that isn't a part,
 * like a trigger menu's on its editor.
 */
declare function aliasReferences(context: {
    parts(): Iterable<Part>;
}, attrs: Attrs): Attrs;
/**
 * Takes the id an author gives a part's element as the part renders, so the
 * parts that render after it, like a tab's panel, point at it from their
 * first render, on a server too. Parts rendered before it, like a dialog's
 * content before its title, point at it once its element binds. Once bound,
 * the id comes from the element as it changes on the page.
 */
declare function takeOwnId(part: Part, id: unknown): void;
export { aliasReferences, attrs, authorOwned, bind, commit, conditional, connect, directNames, followed, handlers, held, liveAttrs, madeLabel, onProps, type PartOwner, provisional, type PartRecord, partState, present, press, propsRendered, ref, references, selectedKeys, subscribe, takeOwnId, touched, view, yieldToAuthor, };
