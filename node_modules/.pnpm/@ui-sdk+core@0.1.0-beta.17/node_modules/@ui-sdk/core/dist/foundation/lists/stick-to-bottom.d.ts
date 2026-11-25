/**
 * Where a log stands.
 * @experimental
 */
type StickToBottomState = {
    /** Whether new content scrolls into view. */
    following: boolean;
    /** Whether the end is in view now. */
    atBottom: boolean;
    /** Whether content arrived below while not following. Clears at the bottom. */
    unseen: boolean;
};
/**
 * How `createStickToBottom` follows.
 * @experimental
 */
type StickToBottomOptions = {
    /** How close to the end, in pixels, still counts as at the bottom. @defaultValue 24 */
    threshold?: number;
    /** Whether it follows from the start. @defaultValue true */
    initial?: boolean;
    /** Runs when `get()` changes. */
    onChange?: (state: StickToBottomState) => void;
};
/**
 * Follows a scroller's end as its content grows. Connect it to the scroller
 * once it mounts; it watches the scroller's children grow, so content that
 * streams in, like a reply typed out a word at a time, keeps the end in view:
 *
 * ```ts
 * const log = createStickToBottom({ onChange: render })
 * const disconnect = log.connect(scroller)
 * // A "Jump to latest" button while !log.get().following:
 * button.onclick = () => log.scrollToBottom({ behavior: "smooth" })
 * // Before adding older messages above:
 * log.prepend()
 * ```
 * @experimental
 */
declare function createStickToBottom(options?: StickToBottomOptions): {
    /** Where the log stands now. Same object until something changes. */
    get: () => StickToBottomState;
    /** Calls `listener` whenever `get()` changes, until the returned function runs. */
    subscribe(listener: () => void): () => undefined;
    /**
     * Follows `el`'s end, watching its children's size, until the returned
     * function runs. Turns the browser's own scroll anchoring off on it, which
     * would fight the following.
     */
    connect(el: HTMLElement): () => void;
    /** Scrolls to the end and follows again. */
    scrollToBottom({ behavior }?: {
        behavior?: ScrollBehavior;
    }): void;
    /** Stops following, as if the reader scrolled up. */
    release(): void;
    /**
     * Call right before adding content above, like older messages: the next
     * growth keeps what's in view where it is instead of pushing it down.
     */
    prepend(): void;
};
/**
 * What `createStickToBottom` returns.
 * @experimental
 */
type StickToBottom = ReturnType<typeof createStickToBottom>;
export { createStickToBottom, type StickToBottom, type StickToBottomOptions, type StickToBottomState, };
