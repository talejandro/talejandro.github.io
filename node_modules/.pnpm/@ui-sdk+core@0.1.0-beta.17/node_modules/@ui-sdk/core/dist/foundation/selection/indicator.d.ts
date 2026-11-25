import { layoutBox } from "../platform/layout.js";
/**
 * Keeps an indicator over a list's active item, like the selected tab, without
 * a render: measures the item against the list once they bind, whenever
 * `subscribe` calls back, and whenever the list or an item changes size, and
 * hands the box to `write`. Returns a cleanup.
 */
declare function bindIndicator(options: {
    list: () => HTMLElement | null | undefined;
    active: () => HTMLElement | null | undefined;
    itemSelector: string;
    subscribe: (listener: () => void) => () => void;
    write: (box: ReturnType<typeof layoutBox> | undefined) => void;
}): () => void;
declare function directionBetween(from: {
    left: number;
    top: number;
} | undefined, to: {
    left: number;
    top: number;
} | undefined, orientation: "horizontal" | "vertical"): "none" | "right" | "left" | "up" | "down";
export { bindIndicator, directionBetween };
