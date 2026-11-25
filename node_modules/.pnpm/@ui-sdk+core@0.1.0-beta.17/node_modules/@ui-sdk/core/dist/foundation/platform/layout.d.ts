declare function layoutOrigin(el: HTMLElement): {
    x: number;
    y: number;
};
declare function layoutSize(el: HTMLElement): {
    width: number;
    height: number;
};
declare function layoutBox(el: HTMLElement, container: HTMLElement): {
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
};
export { layoutBox, layoutOrigin, layoutSize };
