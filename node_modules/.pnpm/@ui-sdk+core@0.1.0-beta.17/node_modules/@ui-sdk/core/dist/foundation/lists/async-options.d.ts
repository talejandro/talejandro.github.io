/**
 * Whether options are loading, loaded or failed.
 * @stable
 */
type AsyncOptionsStatus = "idle" | "loading" | "error";
/**
 * What async options hold.
 * @stable
 */
type AsyncOptionsState<Item> = {
    /** The text the items are for, or are loading for. */
    query: string;
    /** The loaded items. The previous ones stay while the next load runs. */
    items: Item[];
    /** Whether a load is waiting for typing to pause or running, or the last one failed. */
    status: AsyncOptionsStatus;
    /** Why the last load failed. */
    error: unknown;
    /** Whether `loadMore()` has another page to load. */
    hasMore: boolean;
};
/**
 * What `load` receives besides the text.
 * @stable
 */
type AsyncOptionsContext = {
    /** Aborted when a newer load replaces this one. Pass it to `fetch`. */
    signal: AbortSignal;
    /** Which page to load: 0 first, then 1, 2… from `loadMore()`. */
    page: number;
};
/**
 * The options `createAsyncOptions` takes.
 * @stable
 */
type AsyncOptionsOptions = {
    /**
     * Milliseconds typing must pause before a load starts.
     * @defaultValue 200
     */
    debounce?: number;
    /**
     * The text to load for at first.
     * @defaultValue ""
     */
    query?: string;
    /**
     * Whether to load for the first text right away, before anyone types.
     * @defaultValue false
     */
    immediate?: boolean;
    /**
     * How many characters the trimmed text needs before anything loads. Shorter
     * text clears the items and loads nothing.
     * @defaultValue 0
     */
    minLength?: number;
};
/**
 * Loads options for a text, latest first. `load` returns the items, or
 * `{ items, hasMore }` for pages.
 * @stable
 */
declare function createAsyncOptions<Item>(load: (query: string, context: AsyncOptionsContext) => Promise<Item[] | {
    items: Item[];
    hasMore?: boolean;
}>, { debounce, query, immediate, minLength, }?: AsyncOptionsOptions): {
    /** The current items, text and status. */
    getState: () => AsyncOptionsState<Item>;
    /** Runs `listener` after every change. Returns an unsubscribe. */
    subscribe(listener: () => void): () => void;
    /** Loads for new text once typing pauses, replacing any load still running. */
    setQuery(next: string): void;
    /** Loads the current text again, now. */
    reload(): void;
    /** Loads the next page and appends it, when `load` said there's more. */
    loadMore(): void;
    /** Stops any pending or running load. */
    cancel(): void;
};
/**
 * What `createAsyncOptions` returns: the loaded items, their status, and
 * methods to load more.
 * @stable
 */
type AsyncOptions<Item> = ReturnType<typeof createAsyncOptions<Item>>;
export { type AsyncOptions, type AsyncOptionsContext, type AsyncOptionsOptions, type AsyncOptionsState, type AsyncOptionsStatus, createAsyncOptions, };
