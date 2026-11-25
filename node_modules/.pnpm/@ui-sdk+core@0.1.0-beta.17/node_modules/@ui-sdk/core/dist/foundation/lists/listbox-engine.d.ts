import type { Store } from "../kernel/store.js";
/**
 * An item in a select or combobox, as data.
 * @stable
 */
type ListItem<T = string> = {
    /** Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`. */
    value: T;
    /** The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen. */
    label: string;
    /** More words filtering matches, like `["team"]` for a plan called Pro. */
    keywords?: string[];
    /** Keeps the item from being chosen. The keyboard skips it, like in a native select. */
    disabled?: boolean;
};
/**
 * A labelled group of items, as data. `Item` is a component's own item type, like `CommandDataItem`.
 * @stable
 */
type ListGroup<T = string, Item extends ListItem<T> = ListItem<T>> = {
    type: "group";
    /** The group's heading, which names it. */
    label?: string;
    items: (Item | (T & string))[];
};
/**
 * A line between items, as data.
 * @stable
 */
type ListSeparator = {
    type: "separator";
};
/**
 * A list as data: items, plain strings, groups and separators. The same shape renders in every framework.
 * `Item` is a component's own item type, like `CommandDataItem`.
 * @stable
 */
type ListData<T = string, Item extends ListItem<T> = ListItem<T>> = (Item | ListGroup<T, Item> | ListSeparator | (T & string))[];
/**
 * How typing narrows the list. `"contains"` keeps items whose label or keywords
 * contain the text, and `"startsWith"` those that start with it, ignoring case
 * and accents. A function decides for itself: `true` or `false`, or a score
 * above 0 that ranks the item, and 0 to hide it. `false` keeps every item, for
 * results a server already filtered.
 * @stable
 */
type ListFilter<T = string> = "contains" | "startsWith" | false | ((item: ListItem<T>, query: string) => boolean | number);
type ListEntry = {
    key: string;
    value: unknown;
    label: string;
    keywords?: string[];
    disabled: boolean;
    group?: string;
    pinned?: boolean;
};
declare function itemKey(value: unknown, itemToValue?: (value: unknown) => string): string;
declare function toListItem<T>(entry: ListItem<T> | (T & string)): ListItem<T>;
declare const isGroup: <T>(entry: ListData<T>[number]) => entry is ListGroup<T>;
declare const isSeparator: <T>(entry: ListData<T>[number]) => entry is ListSeparator;
declare function flattenData<T>(data: ListData<T>, toKey: (value: unknown) => string): ListEntry[];
declare function revealInList(el: HTMLElement, stop: HTMLElement | undefined): void;
type ItemMeta = {
    value: unknown;
    label?: string;
    keywords?: string[];
    disabled?: boolean;
    group?: string;
    pinned?: boolean;
    index?: number;
};
/** What the empty part of a filtered list receives: whether it shows, and why. */
type ListEmptyState = {
    /** Whether results are loading. */
    loading: boolean;
    /** Whether no item matches. */
    empty: boolean;
    /** The text the list is filtered by. */
    query: string;
};
/** What the status part of a filtered list receives, for loading and result counts. */
type ListStatusState = {
    /** Whether results are loading or failed. */
    status: "idle" | "loading" | "error";
    /** Whether results are loading. */
    loading: boolean;
    /** How many items are visible. */
    count: number;
};
/**
 * What `onHighlight` receives besides the value: where the item is.
 * @stable
 */
type ListHighlightDetails = {
    /** The item's index among the visible items, for a virtualizer to scroll to. -1 when nothing is highlighted. */
    index: number;
    /** The event behind it, if any. */
    event?: Event;
};
/** How a list narrows its items: by a query with listbox.ts, or never with `noFiltering`. */
type ListFiltering = {
    data: (data: ListData<unknown>, query: string, filter: ListFilter<unknown> | undefined, options: {
        rank: boolean;
    }) => ListData<unknown>;
    matches: (item: ListItem<unknown>, query: string, filter: ListFilter<unknown> | undefined) => boolean;
};
declare function createListboxEngine(config: {
    store: Pick<Store<{
        highlighted: string | null;
    }>, "get" | "set">;
    focus: "real" | "virtual" | (() => "real" | "virtual");
    items: () => ListData<unknown> | undefined;
    emptyItems?: () => ListData<unknown> | undefined;
    showEmpty?: () => boolean;
    toKey: (value: unknown) => string;
    filter: () => ListFilter<unknown> | undefined;
    query: () => string;
    rank?: () => boolean;
    loop: () => boolean;
    skipDisabled?: boolean;
    active: () => boolean;
    blocked?: (entry: ListEntry) => boolean;
    onHighlight?: (key: string | null, index: number, event?: Event) => void;
    container?: () => HTMLElement | undefined;
    scrollRoot?: () => HTMLElement | undefined;
    keepInView?: () => boolean;
    onRegister?: (key: string) => void;
    onLastReached?: () => void;
}, filtering: ListFiltering): {
    entries: () => ListEntry[];
    visibleData: () => {
        data: ListData<unknown>;
        query: string;
        filter: unknown;
        rank: boolean;
        list: ListData<unknown>;
        flat: ListEntry[];
    } | undefined;
    dataItems: () => ListEntry[] | undefined;
    find: (key: string | null) => ListEntry | undefined;
    disabled: (entry: ListEntry) => boolean;
    isItemDisabled: (key: string) => boolean;
    highlight: (key: string | null, { focus, event }?: {
        focus?: boolean;
        event?: Event;
    }) => void;
    move: (step: number | "first" | "last", event?: Event) => void;
    stepKey: (step: number | "first" | "last", { loop }?: {
        loop?: boolean | undefined;
    }) => string | undefined;
    firstEnabled: () => string | undefined;
    search: (char: string, from: string | null) => ListEntry | undefined;
    register: (key: string, el: HTMLElement, meta: () => ItemMeta) => () => void;
    typing: () => boolean;
    resetTyping: () => void;
    labelOf(key: string): string | undefined;
    valueOf(key: string): unknown;
    matches: (key: string, meta: ItemMeta) => boolean;
    listing(more?: (key: string, value: unknown) => string): Record<string, string>;
    listingInputs: () => (string | number | boolean | ListData<unknown, ListItem<unknown>> | ((item: ListItem<unknown>, query: string) => boolean | number) | undefined)[];
    selectable(group?: string): string[];
    count(): number;
    groupMatches(group: string): boolean;
    element: (key: string) => HTMLElement | undefined;
    labelsVersion: () => number;
    remember(key: string, label: string, value: unknown, keywords?: string[]): void;
};
type Listbox = ReturnType<typeof createListboxEngine>;
declare const highlightable: (listbox: Listbox, key: string) => ListEntry | undefined;
declare function highlightFromCode(listbox: Listbox, key: string | null, current: string | null): boolean;
declare function highlightedValue(listbox: Listbox, key: string | null): {} | null;
export { createListboxEngine, highlightable, highlightedValue, highlightFromCode, flattenData, isGroup, isSeparator, itemKey, type Listbox, type ListData, type ListEmptyState, type ListEntry, type ListFilter, type ListFiltering, type ListGroup, type ListHighlightDetails, type ListItem, type ListSeparator, type ListStatusState, revealInList, toListItem, };
