declare function chipsThatFit({ available, gap, widths, overflow, reserve, }: {
    available: number;
    gap: number;
    widths: (number | undefined)[];
    overflow: number;
    reserve: number;
}): number;
declare function bindChipsOverflow(container: HTMLElement, { chips, overflow, input, report, subscribe, }: {
    chips: () => HTMLElement[];
    overflow: HTMLElement;
    input: () => HTMLElement | undefined;
    report: (visible: number | null) => void;
    subscribe: (listener: () => void) => () => void;
}): () => void;
export { bindChipsOverflow, chipsThatFit };
