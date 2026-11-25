import { createListboxEngine, type ListData, type ListFilter, type ListItem } from "./listbox-engine.js";
declare function textMatches(text: string, query: string, mode: "contains" | "startsWith"): boolean;
declare function itemMatches<T>(item: ListItem<T>, query: string, filter: ListFilter<T> | undefined): boolean;
declare function filterData<T>(data: ListData<T>, query: string, filter: ListFilter<T> | undefined, { rank }?: {
    rank?: boolean;
}): ListData<T>;
/** The listbox engine, filtering by `query` the way `filter` asks. */
declare function createFilteredListbox(config: Parameters<typeof createListboxEngine>[0]): {
    entries: () => import("./listbox-engine.js").ListEntry[];
    visibleData: () => {
        data: ListData<unknown>;
        query: string;
        filter: unknown;
        rank: boolean;
        list: ListData<unknown>;
        flat: import("./listbox-engine.js").ListEntry[];
    } | undefined;
    dataItems: () => import("./listbox-engine.js").ListEntry[] | undefined;
    find: (key: string | null) => import("./listbox-engine.js").ListEntry | undefined;
    disabled: (entry: import("./listbox-engine.js").ListEntry) => boolean;
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
    search: (char: string, from: string | null) => import("./listbox-engine.js").ListEntry | undefined;
    register: (key: string, el: HTMLElement, meta: () => {
        value: unknown;
        label?: string;
        keywords?: string[];
        disabled?: boolean;
        group?: string;
        pinned?: boolean;
        index?: number;
    }) => () => void;
    typing: () => boolean;
    resetTyping: () => void;
    labelOf(key: string): string | undefined;
    valueOf(key: string): unknown;
    matches: (key: string, meta: {
        value: unknown;
        label?: string;
        keywords?: string[];
        disabled?: boolean;
        group?: string;
        pinned?: boolean;
        index?: number;
    }) => boolean;
    listing(more?: (key: string, value: unknown) => string): Record<string, string>;
    listingInputs: () => (string | number | boolean | ListData<unknown, ListItem<unknown>> | ((item: ListItem<unknown>, query: string) => boolean | number) | undefined)[];
    selectable(group?: string): string[];
    count(): number;
    groupMatches(group: string): boolean;
    element: (key: string) => HTMLElement | undefined;
    labelsVersion: () => number;
    remember(key: string, label: string, value: unknown, keywords?: string[]): void;
};
/**
 * Reads a list's `filter` attribute on a custom element: `"false"` keeps
 * every item, one of `modes` filters that way, and any other value, like a
 * bare `filter`, the way `fallback` does.
 */
declare function filterAttribute<Mode extends string>(modes: readonly Mode[], fallback: NoInfer<Mode>): (attribute: string | null) => false | Mode | undefined;
export { createFilteredListbox, filterAttribute, filterData, itemMatches, textMatches, };
export { flattenData, highlightable, highlightedValue, highlightFromCode, itemKey, revealInList, toListItem, type ListData, type ListEmptyState, type ListEntry, type ListFilter, type ListGroup, type ListHighlightDetails, type ListItem, type Listbox, type ListSeparator, type ListStatusState, } from "./listbox-engine.js";
