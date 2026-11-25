/**
 * One row to render: where it starts along the scroller, in pixels, and its
 * size. `found` marks the row find in page matched last, until the next
 * match, until it scrolls away, or until someone presses or types in the list.
 * @experimental
 */
type VirtualItem = {
    index: number;
    key: string;
    start: number;
    size: number;
    found?: true;
};
/**
 * Where `scrollToIndex` puts a row. `auto` scrolls only as far as it takes to show it.
 * @experimental
 */
type VirtualAlign = "auto" | "start" | "center" | "end";
/**
 * How `createVirtualizer` reads the list.
 * @experimental
 */
type VirtualizerOptions = {
    /** How many rows the list has. Read on every update, so it can grow, like a list that loads more. */
    count: () => number;
    /** The size of a row before it's measured, in pixels. A close guess keeps the scrollbar steady. */
    estimate: (index: number) => number;
    /**
     * A stable key for each row, so a measured size follows its row when the
     * list sorts or filters. Defaults to the index.
     */
    key?: (index: number) => string;
    /**
     * How many rows to render past each edge, so a fast scroll or Tab doesn't
     * show a gap. @defaultValue 4
     */
    overscan?: number;
    /** Whether the list scrolls sideways. @defaultValue false */
    horizontal?: boolean;
    /** Pixels in the scroller before the first row, like a sticky header. @defaultValue 0 */
    scrollMargin?: number;
    /**
     * Rows rendered wherever the scroller is, like the one with focus, so
     * scrolling it away doesn't drop focus to the page.
     */
    keep?: () => readonly number[];
    /**
     * Runs when the rendered rows come within `endThreshold` rows of the last,
     * to load more. Runs once per `count`, so it doesn't ask again before the
     * list grows.
     */
    onEnd?: () => void;
    /** How close to the end `onEnd` runs, in rows. @defaultValue 10 */
    endThreshold?: number;
    /**
     * The text the browser's find in page should find in a row, like its
     * title, so it finds rows that aren't rendered too. Keep it what the row
     * shows. Return a list of pieces to give each its own `findableText`.
     */
    findable?: (index: number) => string | readonly string[];
};
/**
 * Renders a long list by rendering only what's in view. Connect it to the
 * scroller once it mounts, render `items()` absolutely positioned inside a
 * box `size()` tall, and measure each rendered row:
 *
 * ```ts
 * const rows = createVirtualizer({ count: () => data.length, estimate: () => 36 })
 * const disconnect = rows.connect(scroller)
 * rows.subscribe(render)
 * // For each of rows.items(): <div style="position:absolute; top:{start}px" ref={(el) => rows.measure(index, el)}>
 * ```
 *
 * `items()` keeps its identity until something changes, so it works as a
 * snapshot for `useSyncExternalStore` and its kind.
 * @experimental
 */
declare function createVirtualizer(options: VirtualizerOptions): {
    /** The rows to render now, in order. Same array until something changes. */
    items(): VirtualItem[];
    /** The height, or width when horizontal, of every row together, for the box the rows sit in. */
    size(): number;
    /** Calls `listener` whenever `items()` changes, until the returned function runs. */
    subscribe(listener: () => void): () => undefined;
    /**
     * Reads the scroller on every scroll and resize, until the returned
     * function runs. With `findable`, also adds the layers that keep rows
     * that aren't rendered findable.
     */
    connect(el: HTMLElement, connectOptions?: {
        /** Keeps rows that aren't rendered findable, through layers at the start and end of `el`. Needs the `findable` option. */
        findable?: boolean;
    }): () => void;
    /**
     * Measures a rendered row, now and whenever it resizes, until the returned
     * function runs. Call it from the row's ref. Fixed-size rows can skip it.
     */
    measure(index: number, el: HTMLElement | null): () => void;
    /** Scrolls so a row shows, measuring as it goes. */
    scrollToIndex(index: number, { align, behavior, }?: {
        align?: VirtualAlign;
        behavior?: ScrollBehavior;
    }): void;
    /** Reads the list again, like after its rows change without a scroll. Find in page sees the new text. */
    refresh(): void;
    /**
     * Renders a piece of a row's `findable` text into `el`, from the row's
     * ref, until the returned function runs. Render `el` empty: it holds the
     * very text find in page searches, so the browser highlights the match in
     * the row itself. `part` picks the piece when `findable` returns several.
     */
    findableText(index: number, el: HTMLElement | null, part?: number): () => void;
    /** Forgets every measured size, like after a change that resizes every row. */
    reset(): void;
};
/**
 * What `createVirtualizer` returns.
 * @experimental
 */
type Virtualizer = ReturnType<typeof createVirtualizer>;
export { createVirtualizer, type VirtualAlign, type VirtualItem, type Virtualizer, type VirtualizerOptions, };
