import type { ResizeHandle } from "../../foundation/direct-manipulation/resize.js";
import type { ImageCrop } from "../../foundation/image/crop.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { ImageCropperChangeOptions, ImageCropperFlipDirection, ImageCropperMode, ImageCropperOptions, ImageCropperShape } from "./image-cropper.js";
import { type Crop, type Rect, type Size } from "./image-cropper-geometry.js";
type State = {
    src: string | undefined;
    crop: Crop | null;
    cropFor: string | undefined;
    natural: Size | null;
    status: "loading" | "loaded" | "error";
    box: Rect | null;
    dragging: ResizeHandle | "pan" | null;
    mode: ImageCropperMode;
    shape: ImageCropperShape;
    aspectRatio: number | undefined;
    minWidth: number;
    minHeight: number;
    maxZoom: number;
    disabled: boolean;
};
declare function initialState(options: ImageCropperOptions): State;
declare function syncState(options: ImageCropperOptions): {
    crop?: Required<ImageCrop> | undefined;
    src: string | undefined;
    mode: ImageCropperMode;
    shape: ImageCropperShape;
    aspectRatio: number | undefined;
    minWidth: number;
    minHeight: number;
    maxZoom: number;
    disabled: boolean;
};
declare const isReady: (state: State) => boolean;
declare const isInert: (state: State) => boolean;
/** Where the image and the selection show, or null until the image and the viewport have sizes. */
declare function layout(state: State): {
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
} | null;
declare const zoomText: (state: State) => number;
declare function imageCropperApiBody(context: PrimitiveContext<ImageCropperOptions, State, string>): {
    /** The crop, or null until the image loads. */
    getCrop: () => Required<ImageCrop> | null;
    /** Sets the crop, as a user would. Returns whether it changed. */
    setCrop(crop: ImageCrop, { reason, event }?: ImageCropperChangeOptions): boolean;
    /** Turns the image a quarter clockwise, or counterclockwise with `-1`. */
    rotate(direction?: 1 | -1, { reason, event }?: ImageCropperChangeOptions): boolean;
    /** Mirrors the image left to right, or top to bottom. */
    flip(direction?: ImageCropperFlipDirection, { reason, event }?: ImageCropperChangeOptions): boolean;
    /** How far the crop magnifies: 1 when it's as large as the image allows at its ratio. */
    getZoom: () => number;
    /** Zooms to a level, about the crop's middle. */
    setZoom(zoom: number, { reason, event }?: ImageCropperChangeOptions): boolean;
    /** Moves focus to the selection. */
    focus(): void;
    internal: {
        loaded(img: HTMLImageElement): void;
        failed(): void;
        measure(el: HTMLElement): void;
        selectionPointerdown(event: PointerEvent, el: HTMLElement, handle: ResizeHandle): void;
        viewportPointerdown(event: PointerEvent, el: HTMLElement): void;
        wheel(event: WheelEvent, el: HTMLElement): void;
        keydown(event: KeyboardEvent, handle: ResizeHandle): void;
        zoomInput(event: Event, el: HTMLInputElement): void;
        zoomCommit(event: Event): void;
    };
};
declare const imageCropperApi: (...args: Parameters<typeof imageCropperApiBody>) => ImageCropperApi;
/**
 * `imageCropper`'s api, which its slots and controller call. Adapters expose it as `api`.
 * @experimental
 */
interface ImageCropperApi extends ReturnType<typeof imageCropperApiBody> {
}
export { imageCropperApi, type ImageCropperApi, initialState, isInert, isReady, layout, type State, syncState, zoomText, };
