// src/components/avatar/image-status.ts
function imageStatus(img, hasSource) {
  if (!hasSource) {
    return "error";
  }
  if (!img.complete) {
    return "loading";
  }
  return img.naturalWidth > 0 ? "loaded" : "error";
}
export {
  imageStatus
};
