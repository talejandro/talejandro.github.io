/**
 * A quarter turn clockwise, in degrees.
 * @experimental
 */
type ImageRotation = 0 | 90 | 180 | 270;
/**
 * A region of an image, in the image's own pixels, as it shows after its
 * rotation and flips.
 * @experimental
 */
type ImageCrop = {
    /** Pixels from the left edge of the turned image. */
    x: number;
    /** Pixels from the top edge of the turned image. */
    y: number;
    /** The region's width, in the image's own pixels. */
    width: number;
    /** The region's height, in the image's own pixels. */
    height: number;
    /**
     * Turns the image clockwise before the region is taken.
     * @defaultValue 0
     */
    rotation?: ImageRotation;
    /**
     * Mirrors the turned image left to right.
     * @defaultValue false
     */
    flipX?: boolean;
    /**
     * Mirrors the turned image top to bottom.
     * @defaultValue false
     */
    flipY?: boolean;
};
/**
 * Options for `cropImage`.
 * @experimental
 */
type CropImageOptions = {
    /**
     * The file's type. A browser that can't write it writes PNG, which the returned file's `type` says.
     * @defaultValue "image/png"
     */
    type?: string;
    /** From 0 to 1, for JPEG and WebP. The browser picks when it's left out. */
    quality?: number;
    /** The output's width in pixels. Left out, it follows `height` at the crop's ratio, or the crop's own width. */
    width?: number;
    /** The output's height in pixels. Left out, it follows `width` at the crop's ratio, or the crop's own height. */
    height?: number;
    /**
     * `"circle"` keeps the ellipse inside the crop and leaves the corners
     * transparent, which PNG and WebP keep and JPEG fills with black.
     * @defaultValue "rectangle"
     */
    shape?: "rectangle" | "circle";
    /** The file's name. Left out, it's the source file's name with the new extension, or `"image"` and the extension. */
    name?: string;
};
/**
 * What `cropImage` reads: an image file, a URL, or anything a canvas draws.
 * @experimental
 */
type ImageSource = Blob | string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;
/**
 * Cuts a region out of an image and returns it as a new image file. The
 * region is in the image's own pixels, after `rotation` and the flips, as
 * an Image Cropper hands it back.
 *
 * @example
 * const avatar = await cropImage(photo, { x: 120, y: 40, width: 600, height: 600 }, {
 *   type: "image/webp",
 *   width: 256,
 *   shape: "circle",
 * })
 * @experimental
 */
declare function cropImage(source: ImageSource, crop: ImageCrop, options?: CropImageOptions): Promise<File>;
export { cropImage, type CropImageOptions, type ImageCrop, type ImageRotation, type ImageSource, };
