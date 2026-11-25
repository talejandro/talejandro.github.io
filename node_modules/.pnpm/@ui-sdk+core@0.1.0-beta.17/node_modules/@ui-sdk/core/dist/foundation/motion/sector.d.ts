/**
 * The wedge a stroke points into, from 0 to `count - 1`, clockwise from the
 * top (or from `start` turns), or `-1` while it's within `deadZone` pixels of
 * the center. Each wedge is centered on its direction: with four, 0 is up, 1
 * right, 2 down, 3 left. Pure.
 *
 * ```ts
 * sectorOf(30, -2, 4) // 1, right
 * sectorOf(3, 4, 8) // -1, too short to point anywhere
 * ```
 * @experimental
 */
declare function sectorOf(dx: number, dy: number, count: number, options?: {
    deadZone?: number;
    start?: number;
}): number;
export { sectorOf };
