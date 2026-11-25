declare function createHoverIntent(options: {
    trigger: () => HTMLElement | undefined;
    popup: () => HTMLElement | undefined;
    closesOnLeave: () => boolean;
    closeDelay: () => number;
    close: (event: PointerEvent) => void;
}): {
    clear: () => void;
    enter(event: PointerEvent, open?: () => void, delay?: number): void;
    leave(event: PointerEvent): void;
};
type HoverIntent = ReturnType<typeof createHoverIntent>;
export { createHoverIntent, type HoverIntent };
