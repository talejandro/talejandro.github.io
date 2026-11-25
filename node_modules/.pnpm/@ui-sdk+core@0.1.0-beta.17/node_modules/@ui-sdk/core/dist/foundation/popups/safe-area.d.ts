type Point = {
    x: number;
    y: number;
};
declare function createSafeArea({ restTimeout }?: {
    restTimeout?: number | undefined;
}): {
    start(point: Point, target: HTMLElement, along?: "x" | "y"): void;
    stop(): void;
    active: () => boolean;
    contains(point: Point, onRest: () => void): boolean;
};
export { createSafeArea };
