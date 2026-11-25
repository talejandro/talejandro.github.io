declare function onScrollbar(point: {
    x: number;
    y: number;
}, box: {
    width: number;
    height: number;
    clientLeft: number;
    clientTop: number;
    clientWidth: number;
    clientHeight: number;
    borders: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}): boolean;
declare function pressedScrollbar(event: PointerEvent, target: Node): boolean;
export { onScrollbar, pressedScrollbar };
