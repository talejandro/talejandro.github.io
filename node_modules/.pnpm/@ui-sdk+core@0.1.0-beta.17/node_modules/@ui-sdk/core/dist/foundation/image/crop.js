// src/foundation/image/crop.ts
var extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
var isImage = (source) => "naturalWidth" in source;
var sizeOf = (source) => isImage(source) ? { width: source.naturalWidth, height: source.naturalHeight } : { width: source.width, height: source.height };
async function load(source) {
  if (typeof source === "string") {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = source;
    await image.decode();
    return image;
  }
  if (source instanceof Blob) {
    return createImageBitmap(source);
  }
  if (isImage(source) && !(source.complete && source.naturalWidth)) {
    await source.decode();
  }
  return source;
}
function outputSize(crop, options) {
  const ratio = crop.width / crop.height;
  const width = options.width ?? (options.height === void 0 ? crop.width : options.height * ratio);
  const height = options.height ?? width / ratio;
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height))
  };
}
function drawCrop(context, image, crop, size, circle) {
  const natural = sizeOf(image);
  const rotation = crop.rotation ?? 0;
  const turned = rotation % 180 !== 0;
  const shown = turned ? { width: natural.height, height: natural.width } : natural;
  context.imageSmoothingQuality = "high";
  if (circle) {
    context.beginPath();
    context.ellipse(
      size.width / 2,
      size.height / 2,
      size.width / 2,
      size.height / 2,
      0,
      0,
      Math.PI * 2
    );
    context.clip();
  }
  context.scale(size.width / crop.width, size.height / crop.height);
  context.translate(shown.width / 2 - crop.x, shown.height / 2 - crop.y);
  context.scale(crop.flipX ? -1 : 1, crop.flipY ? -1 : 1);
  context.rotate(rotation * Math.PI / 180);
  context.drawImage(image, -natural.width / 2, -natural.height / 2);
}
async function encode(width, height, draw, type, quality) {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas2 = new OffscreenCanvas(width, height);
    draw(canvas2.getContext("2d"));
    return canvas2.convertToBlob({ type, quality });
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"));
  return new Promise(
    (resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("The image couldn't be encoded.")),
      type,
      quality
    )
  );
}
function nameOf(source, type, name) {
  if (name) {
    return name;
  }
  const extension = extensions[type] ?? type.split("/")[1] ?? "png";
  const base = source instanceof File && source.name ? source.name.replace(/\.[^.]*$/, "") : "image";
  return `${base}.${extension}`;
}
async function cropImage(source, crop, options = {}) {
  if (!(crop.width > 0 && crop.height > 0)) {
    throw new RangeError("A crop needs a width and a height above 0.");
  }
  const image = await load(source);
  try {
    const size = outputSize(crop, options);
    const blob = await encode(
      size.width,
      size.height,
      (context) => drawCrop(context, image, crop, size, options.shape === "circle"),
      options.type ?? "image/png",
      options.quality
    );
    return new File([blob], nameOf(source, blob.type, options.name), {
      type: blob.type
    });
  } finally {
    if (source instanceof Blob) {
      ;
      image.close();
    }
  }
}
export {
  cropImage
};
