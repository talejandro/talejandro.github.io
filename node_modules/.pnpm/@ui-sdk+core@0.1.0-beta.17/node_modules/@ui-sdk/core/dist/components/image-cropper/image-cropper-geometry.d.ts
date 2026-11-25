import { type ResizeHandle } from "../../foundation/direct-manipulation/resize.js";
import type { ImageCrop, ImageRotation } from "../../foundation/image/crop.js";
type Size = {
    width: number;
    height: number;
};
type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
type Crop = Required<ImageCrop>;
type Limits = {
    aspect: number | undefined;
    minWidth: number;
    minHeight: number;
    maxZoom: number;
};
declare const shownSize: (natural: Size, rotation: number) => Size;
declare const complete: (crop: ImageCrop) => {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
declare const sameCrop: (a: Crop, b: Crop) => boolean;
declare const round: (crop: Crop) => {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
declare const zoomOf: (crop: Crop, natural: Size) => number;
declare function smallest(shown: Size, limits: Limits): {
    width: number;
    height: number;
};
/**
 * The crop an image starts with, in the middle: in a box, most of the image
 * at the ratio, so its edges show; in a frame, the largest.
 */
declare function initialCrop(natural: Size, limits: Limits, mode: "box" | "frame"): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
/** The crop after a handle moves by `dx` and `dy` image pixels, or the whole crop with `"move"`. */
declare function resizeCrop(crop: Crop, natural: Size, handle: ResizeHandle, dx: number, dy: number, limits: Limits, keepRatio?: boolean): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
/**
 * The crop at a zoom, keeping the image point `at` where it is, or the
 * crop's middle. Its ratio stays.
 */
declare function zoomCrop(crop: Crop, natural: Size, zoom: number, limits: Limits, at?: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
/**
 * The crop after the image turns a quarter clockwise, or counterclockwise for
 * `-1`. The crop turns with it; at a fixed ratio it keeps its zoom instead.
 * A flip on one axis is on the other once turned.
 */
declare function rotateCrop(crop: Crop, natural: Size, direction: 1 | -1, limits: Limits): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
};
/** The crop after the image mirrors left to right, or top to bottom. */
declare function flipCrop(crop: Crop, natural: Size, direction: "horizontal" | "vertical"): {
    x: number;
    flipX: boolean;
    y: number;
    width: number;
    height: number;
    rotation: ImageRotation;
    flipY: boolean;
};
/** The crop at a new ratio, as large as it was, about its middle. */
declare function fitCrop(crop: Crop, natural: Size, limits: Limits): Required<ImageCrop>;
/**
 * Where the image and the selection sit in the viewport's content box, in CSS
 * pixels, and how many of them one image pixel takes. A box shows the whole
 * image and the crop on it; a frame shows the crop as large as it fits, with
 * the image around it.
 */
declare function layoutOf(crop: Crop, natural: Size, box: Rect, mode: "box" | "frame", aspect: number | undefined): {
    scale: number;
    image: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    selection: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};
type Layout = ReturnType<typeof layoutOf>;
export { complete, type Crop, fitCrop, flipCrop, initialCrop, type Layout, layoutOf, type Limits, type Rect, resizeCrop, rotateCrop, round, sameCrop, shownSize, type Size, smallest, zoomCrop, zoomOf, };
