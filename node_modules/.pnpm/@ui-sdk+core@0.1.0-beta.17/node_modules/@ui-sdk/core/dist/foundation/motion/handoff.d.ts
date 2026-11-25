declare function handoff(input: {
    /** The finger moves toward a larger extent. */
    towardMore: boolean;
    /** The scroll area is at its start (scrollTop 0 for a bottom sheet). */
    scrollAtStart: boolean;
    /** The sheet rests at its largest snap point. */
    atLargest: boolean;
    /** Dragging up on scrollable content first expands the sheet. */
    expandOnScroll: boolean;
}): "scroll" | "sheet";
export { handoff };
