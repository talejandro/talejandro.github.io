import type { Part } from "../kernel/primitive-types.js";
/**
 * A panel's `hidden` attribute: absent when shown, `"until-found"` when find in page may open it, else `""`.
 * @stable
 */
declare function hiddenAttrs(shown: boolean, findable: boolean): {
    hidden: string | undefined;
};
/**
 * Whether find in page can reveal `hidden="until-found"` content in this browser.
 * @stable
 */
declare function supportsHiddenUntilFound(): boolean;
/**
 * Keeps a closed panel findable with `hidden="until-found"`, and calls
 * `reveal` when find in page matches text in it. Frameworks render `hidden` as
 * a boolean, and find in page removes it even when the opening is canceled;
 * either way, the value goes back, and back to plain `hidden` once it isn't findable. Returns a cleanup with a `check()` to call
 * when the panel's state changes. `bindPanel` calls it for you.
 * @stable
 */
declare function bindFindable(el: HTMLElement, panel: {
    shown: () => boolean;
    findable: () => boolean;
    reveal: (event: Event) => void;
}): (() => void) & {
    check: () => void;
};
/**
 * What `bindPanel` asks of the primitive that owns a panel.
 * @stable
 */
type PanelBinding = {
    /**
     * Writes the panel's size variables, like `--accordion-panel-height`: the
     * measured size while animating, `auto` once open and `0px` while closed.
     */
    size: (el: HTMLElement, height: string, width: string) => void;
    /** Whether the panel is open now. */
    isOpen: () => boolean;
    /** Whether a closed panel is still shown while it animates out. Keep the panel `present` while it is. */
    isExiting: () => boolean;
    /** Whether a closed panel stays in the page, findable with `hidden="until-found"`. */
    isFindable: () => boolean;
    /** How the panel opens: as it mounts with the page, at once, or animated. */
    opening: () => "mount" | "instant" | "animate";
    /** Find in page matched text in the closed panel. Open it here. */
    reveal: (event: Event) => void;
    /** Where focus goes when the panel closes with focus inside it, like its trigger. */
    trigger: () => HTMLElement | undefined;
    /** Runs `listener` when the panel's state may have changed, like `store.subscribe`. Returns the unsubscribe. */
    subscribe: (listener: () => void) => () => void;
    /** The open or close animation finished, or there was none. Never on mount. */
    settled: (open: boolean) => void;
    /** The exit animation finished, so the panel can leave the page: stop counting it as exiting here. */
    exited: () => void;
};
/**
 * Binds a panel element that opens and closes: `data-starting-style` and
 * `data-ending-style` for enter and exit animations, which it waits for
 * before `exited`, size variables to animate height, `hidden="until-found"`
 * and focus out of a panel closing around it. Call it from the panel slot's
 * `bind` and return its cleanup. Returns the cleanup.
 * @stable
 */
declare function bindPanel(el: HTMLElement, panel: PanelBinding): () => void;
declare function stateAndRenders(store: {
    subscribe: (listener: () => void) => () => void;
}, part: Part): (listener: () => void) => () => void;
export { bindFindable, bindPanel, hiddenAttrs, type PanelBinding, stateAndRenders, supportsHiddenUntilFound, };
