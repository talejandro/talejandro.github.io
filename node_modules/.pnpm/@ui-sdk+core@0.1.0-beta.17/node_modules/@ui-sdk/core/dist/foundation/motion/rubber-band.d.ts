/**
 * How far something dragged `overshoot` px past an edge shows, resisting more the further it goes, like iOS.
 * @experimental
 */
declare function rubberBand(overshoot: number, dimension: number, coefficient?: number): number;
declare function rubberBandInverse(shown: number, dimension: number, coefficient?: number): number;
declare function rubberBandSlope(overshoot: number, dimension: number, coefficient?: number): number;
export { rubberBand, rubberBandInverse, rubberBandSlope };
