// src/components/image-cropper/image-cropper-geometry.ts
import {
  resizeBox
} from "../../foundation/direct-manipulation/resize.js";
import { clamp } from "../../foundation/number/steps.js";
var turned = (rotation) => rotation % 180 !== 0;
var shownSize = (natural, rotation) => turned(rotation) ? { width: natural.height, height: natural.width } : natural;
var complete = (crop) => ({
  x: crop.x,
  y: crop.y,
  width: crop.width,
  height: crop.height,
  rotation: crop.rotation ?? 0,
  flipX: !!crop.flipX,
  flipY: !!crop.flipY
});
var sameCrop = (a, b) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height && a.rotation === b.rotation && a.flipX === b.flipX && a.flipY === b.flipY;
var round = (crop) => ({
  ...crop,
  x: Math.round(crop.x),
  y: Math.round(crop.y),
  width: Math.max(1, Math.round(crop.width)),
  height: Math.max(1, Math.round(crop.height))
});
var zoomOf = (crop, natural) => {
  const shown = shownSize(natural, crop.rotation);
  return Math.min(shown.width / crop.width, shown.height / crop.height);
};
function largest(shown, ratio) {
  if (!ratio) {
    return { width: shown.width, height: shown.height };
  }
  const width = Math.min(shown.width, shown.height * ratio);
  return { width, height: width / ratio };
}
function smallest(shown, limits) {
  const { aspect, minWidth, minHeight, maxZoom } = limits;
  if (!aspect) {
    return {
      width: Math.max(minWidth, shown.width / maxZoom),
      height: Math.max(minHeight, shown.height / maxZoom)
    };
  }
  const width = Math.max(
    minWidth,
    minHeight * aspect,
    largest(shown, aspect).width / maxZoom
  );
  return { width, height: width / aspect };
}
function centered(size, center, shown) {
  return {
    x: clamp(
      center.x - size.width / 2,
      0,
      Math.max(0, shown.width - size.width)
    ),
    y: clamp(
      center.y - size.height / 2,
      0,
      Math.max(0, shown.height - size.height)
    ),
    width: size.width,
    height: size.height
  };
}
function initialCrop(natural, limits, mode) {
  const full = largest(natural, limits.aspect);
  const min = smallest(natural, limits);
  const inset = mode === "frame" ? 1 : Math.min(
    1,
    Math.max(0.8, min.width / full.width, min.height / full.height)
  );
  const size = { width: full.width * inset, height: full.height * inset };
  const box = centered(
    size,
    { x: natural.width / 2, y: natural.height / 2 },
    natural
  );
  return round({ ...box, rotation: 0, flipX: false, flipY: false });
}
function resizeCrop(crop, natural, handle, dx, dy, limits, keepRatio = false) {
  const shown = shownSize(natural, crop.rotation);
  const aspect = limits.aspect ?? (keepRatio ? crop.width / crop.height : void 0);
  const box = resizeBox(crop, handle, dx, dy, {
    bounds: { left: 0, top: 0, right: shown.width, bottom: shown.height },
    min: smallest(shown, { ...limits, aspect }),
    aspect
  });
  return round({ ...crop, ...box });
}
function zoomCrop(crop, natural, zoom, limits, at) {
  const shown = shownSize(natural, crop.rotation);
  const ratio = limits.aspect ?? crop.width / crop.height;
  const full = largest(shown, ratio);
  const least = smallest(shown, { ...limits, aspect: ratio });
  const most = Math.max(
    1,
    Math.min(full.width / least.width, full.height / least.height)
  );
  const next = clamp(zoom, 1, most);
  const width = full.width / next;
  const height = full.height / next;
  const point = at ?? {
    x: crop.x + crop.width / 2,
    y: crop.y + crop.height / 2
  };
  const k = width / crop.width;
  const box = {
    x: clamp(point.x - (point.x - crop.x) * k, 0, shown.width - width),
    y: clamp(
      point.y - (point.y - crop.y) * (height / crop.height),
      0,
      shown.height - height
    ),
    width,
    height
  };
  return round({ ...crop, ...box });
}
function rotateCrop(crop, natural, direction, limits) {
  const shown = shownSize(natural, crop.rotation);
  const box = direction === 1 ? {
    x: shown.height - crop.y - crop.height,
    y: crop.x,
    width: crop.height,
    height: crop.width
  } : {
    x: crop.y,
    y: shown.width - crop.x - crop.width,
    width: crop.height,
    height: crop.width
  };
  const rotation = (crop.rotation + (direction === 1 ? 90 : 270)) % 360;
  const next = { ...box, rotation, flipX: crop.flipY, flipY: crop.flipX };
  if (!limits.aspect) {
    return round(next);
  }
  const turnedShown = shownSize(natural, rotation);
  const full = largest(turnedShown, limits.aspect);
  const zoom = Math.min(
    zoomOf(crop, natural),
    full.width / smallest(turnedShown, limits).width
  );
  const size = { width: full.width / zoom, height: full.height / zoom };
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  return round({ ...next, ...centered(size, center, turnedShown) });
}
function flipCrop(crop, natural, direction) {
  const shown = shownSize(natural, crop.rotation);
  return direction === "horizontal" ? { ...crop, x: shown.width - crop.x - crop.width, flipX: !crop.flipX } : { ...crop, y: shown.height - crop.y - crop.height, flipY: !crop.flipY };
}
function fitCrop(crop, natural, limits) {
  const { aspect } = limits;
  if (!aspect || Math.abs(crop.width / aspect - crop.height) <= 1) {
    return crop;
  }
  const shown = shownSize(natural, crop.rotation);
  const full = largest(shown, aspect);
  const zoom = Math.min(
    zoomOf(crop, natural),
    full.width / smallest(shown, limits).width
  );
  const size = { width: full.width / zoom, height: full.height / zoom };
  return round({
    ...crop,
    ...centered(
      size,
      { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 },
      shown
    )
  });
}
function layoutOf(crop, natural, box, mode, aspect) {
  const shown = shownSize(natural, crop.rotation);
  if (mode === "frame") {
    const ratio = aspect ?? crop.width / crop.height;
    const width = Math.min(box.width, box.height * ratio);
    const height = width / ratio;
    const selection2 = {
      left: box.left + (box.width - width) / 2,
      top: box.top + (box.height - height) / 2,
      width,
      height
    };
    const scale2 = width / crop.width;
    const image2 = {
      left: selection2.left - crop.x * scale2,
      top: selection2.top - crop.y * scale2,
      width: shown.width * scale2,
      height: shown.height * scale2
    };
    return { scale: scale2, image: image2, selection: selection2 };
  }
  const scale = Math.min(box.width / shown.width, box.height / shown.height);
  const image = {
    left: box.left + (box.width - shown.width * scale) / 2,
    top: box.top + (box.height - shown.height * scale) / 2,
    width: shown.width * scale,
    height: shown.height * scale
  };
  const selection = {
    left: image.left + crop.x * scale,
    top: image.top + crop.y * scale,
    width: crop.width * scale,
    height: crop.height * scale
  };
  return { scale, image, selection };
}
export {
  complete,
  fitCrop,
  flipCrop,
  initialCrop,
  layoutOf,
  resizeCrop,
  rotateCrop,
  round,
  sameCrop,
  shownSize,
  smallest,
  zoomCrop,
  zoomOf
};
