import { type ListFilter } from "./listbox.js";
import { type MatchSegment } from "../text/match.js";
import type { BaseSlotProps } from "../kernel/primitive-types.js";
import type { Store } from "../kernel/store.js";
/**
 * What a list announces to screen readers: how many items match after typing, or a removed value.
 * @stable
 */
type ListAnnouncement = {
    type: "results";
    /** How many items match. */
    count: number;
    /** The text they match. */
    query: string;
    /** Whether results are still loading. */
    loading: boolean;
} | {
    type: "removed";
    /** The label of the value that was removed. */
    label: string;
};
/** What a list announces by default, in English: "3 results", "No results", "Loading" or "Pear removed". */
declare function describeList(change: ListAnnouncement): string;
/** What an item's text part receives: its text split where it matched what was typed. */
type ListItemTextState = {
    /** The text in pieces, each marked when it matched. Joined, they're the whole text. */
    segments: MatchSegment[];
    /** Whether any piece matched. */
    matched: boolean;
};
/** Props of an item's text part, in every framework. */
type ListItemTextProps = {
    /** @internal The text to mark, from the part's content or its item's label. */
    text: string;
    /** @internal Writes the marked text into the element, for web components. */
    write?: boolean;
};
declare function matchMode(filter: ListFilter<unknown> | "fuzzy" | undefined): "startsWith" | "contains" | "fuzzy" | undefined;
type ItemTextApi = {
    internal: {
        matchQuery: () => string;
        matchMode: () => "contains" | "startsWith" | "fuzzy" | undefined;
    };
};
declare function itemTextPart<State extends object, Api extends ItemTextApi>(): {
    props: {
        text: "string";
        write: "boolean";
        id: "id";
    };
    state: (state: State, { api, key, props }: {
        id: string;
        key: string;
        props: ListItemTextProps & BaseSlotProps;
        api: Api;
    }) => ListItemTextState;
    attrs: (state: State, { api, key, props }: {
        id: string;
        key: string;
        props: ListItemTextProps & BaseSlotProps;
        api: Api;
    }) => {
        "data-matched": string | undefined;
    };
    bind(el: HTMLElement, { api, key, props, store }: import("../../index.js").Part<State, Api, ListItemTextProps & BaseSlotProps>): (() => void) | undefined;
};
declare const opensIntoList: (event?: Event) => boolean;
declare function announceResults({ store, query, count, loading, shown, silent, announcement, }: {
    store: Store<object>;
    query: () => string;
    count: () => number;
    loading: () => boolean;
    shown: () => boolean;
    silent: () => boolean;
    announcement: () => ((change: ListAnnouncement) => string | null | undefined) | undefined;
}): void;
declare function createLoadMore({ count, status, onLoadMore, }: {
    count: () => number;
    status: () => "idle" | "loading" | "error";
    onLoadMore: () => (() => void) | undefined;
}): {
    reached: () => void;
    bind: (el: HTMLElement) => () => void;
};
export { announceResults, createLoadMore, describeList, itemTextPart, type ListAnnouncement, type ListItemTextProps, type ListItemTextState, matchMode, opensIntoList, };
