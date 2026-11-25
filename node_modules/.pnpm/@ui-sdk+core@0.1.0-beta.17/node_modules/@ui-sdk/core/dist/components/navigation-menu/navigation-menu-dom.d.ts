declare function createViewportSize(config: {
    viewport: () => HTMLElement | undefined;
    content: () => HTMLElement | undefined;
}): {
    write: () => void;
    observe(el: HTMLElement): () => void;
    measure(el: HTMLElement): void;
    disconnect: () => void | undefined;
};
declare function collapseWhileHidden(el: HTMLElement, shown: () => boolean, store: {
    subscribe: (listener: () => void) => () => void;
}): () => void;
declare function bindIndicator(el: HTMLElement, config: {
    target: () => HTMLElement | undefined;
    watched: () => (HTMLElement | undefined)[];
    root: () => HTMLElement | undefined;
    onChange: (listener: () => void) => () => void;
}): () => void;
export { bindIndicator, collapseWhileHidden, createViewportSize };
