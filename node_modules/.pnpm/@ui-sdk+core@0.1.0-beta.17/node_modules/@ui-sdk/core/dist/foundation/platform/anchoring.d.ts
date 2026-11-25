import { type PhysicalSide } from "./sides.js";
declare const fillsLayoutViewport: (viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
}) => boolean;
declare function anchorable(anchor: HTMLElement, shown: {
    width: number;
    height: number;
}, el: HTMLElement, style: CSSStyleDeclaration, viewport: Parameters<typeof fillsLayoutViewport>[0]): boolean;
declare function anchorStyles(name: string, side: PhysicalSide, align: "start" | "center" | "end", options: {
    sideOffset: number;
    alignOffset: number;
    collisionPadding: number;
}, size: {
    width: number;
    height: number;
}): {
    [x: string]: string;
    "position-anchor": string;
    "position-try-fallbacks": string;
    "position-visibility": string;
};
declare function nameAnchor(anchor: HTMLElement): string;
declare function unnameAnchor(anchor: HTMLElement): void;
export { anchorable, anchorStyles, fillsLayoutViewport, nameAnchor, unnameAnchor, };
