import type { VirtualItem } from "./virtualizer.js";
type FindableSlot = {
    el: HTMLElement;
    token: number;
};
type FindableHost = {
    count: () => number;
    pieces: (index: number) => string[];
    horizontal: () => boolean;
    scroller: () => HTMLElement | undefined;
    items: () => readonly VirtualItem[];
    range: () => readonly [number, number];
    elements: Map<number, HTMLElement>;
    slots: Map<number, (FindableSlot | undefined)[]>;
    place: (index: number) => {
        start: number;
        size: number;
    };
    reveal: (index: number) => void;
};
declare function attachFindable(host: FindableHost, parent: HTMLElement): {
    sync: () => void;
    refresh: () => void;
    adopt: (index: number) => void;
    restore(index: number, part: number, el: HTMLElement): void;
    matching: () => number;
    release: () => void;
    detach(): void;
} | undefined;
type FindableRows = NonNullable<ReturnType<typeof attachFindable>>;
export { attachFindable, type FindableHost, type FindableRows, type FindableSlot, };
