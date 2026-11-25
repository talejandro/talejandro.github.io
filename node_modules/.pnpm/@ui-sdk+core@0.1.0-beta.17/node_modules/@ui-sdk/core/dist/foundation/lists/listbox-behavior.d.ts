import { type ListData, type ListFilter, type ListHighlightDetails } from "./listbox-engine.js";
import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * An option as `createListbox` sees it: its key and the props of its newest render.
 * @stable
 */
type ListboxOption = {
    /** The part's key: its `id`, else its `value`. */
    key: string;
    /** The props of the part's newest render. Without `items`, `label`, `keywords` and `disabled` describe the option. */
    props: {
        value?: unknown;
        label?: string;
        keywords?: string[];
        disabled?: boolean;
    };
};
/**
 * What `createListbox` takes.
 * @stable
 */
type ListboxBehaviorOptions<State extends object, T = string> = {
    /** The state key that holds the highlighted option's key. Start it at `null`. */
    key: keyof State & string;
    /** `"real"` moves focus to the highlighted option. `"virtual"` keeps it where it is, like in an input that points `aria-activedescendant` at `activeId(state)`. Defaults to `"real"`. */
    focus?: "real" | "virtual";
    /** The options as data: items, plain strings, groups and separators. Without it, the bound parts are the options, in document order. */
    items?: () => ListData<T>;
    /** The text options are filtered by. Empty shows every option. */
    query?: () => string;
    /** How `query` narrows the options. A function that returns a number ranks them too, best first. Defaults to `"contains"`. */
    filter?: () => ListFilter<T>;
    /** Whether moving past either end wraps around. Defaults to `true`. */
    loop?: () => boolean;
    /** Runs when the highlight moves, with the option's index among those that match, for a virtualizer to scroll to. */
    onHighlight?: (key: string | null, details: ListHighlightDetails) => void;
    /** Runs when the highlight reaches the last option, so the next page can load. */
    onEnd?: () => void;
};
/**
 * A highlight that moves through options with the keys, the way the WAI-ARIA
 * listbox and combobox patterns ask, and options filtered and ranked by a
 * query. Call it once in `api`, keep it on the api for the slots, and wire
 * the option slot:
 *
 * ```ts
 * option: slot({
 *   role: "option",
 *   focus: "active-descendant",
 *   present: (state, part) => part.api.listbox.shows(part),
 *   attrs: (state, part) => part.api.listbox.attrs(state, part),
 *   on: { pointermove: (event, { key, api }) => api.listbox.highlight(key, { event }) },
 *   bind: (el, part) => part.api.listbox.bind(el, part),
 * })
 * ```
 *
 * With `focus: "virtual"`, the element that keeps focus calls `keydown` and
 * sets `aria-activedescendant` to `activeId(state)`. Choosing an option is
 * yours: write it with `createChange`, or `createSelection` for several.
 * @stable
 */
declare function createListbox<State extends object, T = string>(context: Pick<PrimitiveContext<any, State, any>, "id" | "store">, options: ListboxBehaviorOptions<State, T>): {
    /** Joins a bound option. Call it from the option slot's `bind` and return its cleanup. */
    bind(el: HTMLElement, part: ListboxOption): () => void;
    /** An option's attributes: its `id`, `data-highlighted` and `aria-disabled`, with `tabindex` for real focus. */
    attrs: (state: State, part: ListboxOption) => {
        id: string;
        tabindex: string | undefined;
        "data-highlighted": string | undefined;
        "aria-disabled": string | undefined;
    };
    /** The id of the highlighted option, for `aria-activedescendant` with virtual focus. */
    activeId(state: State): string | undefined;
    /**
     * Moves the highlight for the arrows, PageUp and PageDown, and with real
     * focus also Home, End and typing an option's name. Returns the key it
     * moved to, or undefined for a key it leaves alone, like Enter.
     */
    keydown(event: KeyboardEvent): string | undefined;
    /** Highlights an option, or none with `null`. */
    highlight(key: string | null, { event }?: {
        event?: Event;
    }): void;
    /**
     * Moves the highlight by a step, or to the first or last option, and to
     * none when no option matches. The first or last stays there as options
     * mount, like after the query changed.
     */
    move(step: number | "first" | "last", event?: Event): void;
    /** The data to render now: `items` filtered by `query`. Empty without `items`. */
    items: () => ListData<T>;
    /** Whether a bound option matches `query`. Options from `items` always do, since `items()` already left the others out. */
    shows: (part: ListboxOption) => boolean;
    /** How many options match `query`. */
    count: () => number;
};
/**
 * What `createListbox` returns.
 * @stable
 */
type ListboxBehavior = ReturnType<typeof createListbox>;
export { createListbox, type ListboxBehavior, type ListboxBehaviorOptions, type ListboxOption, };
