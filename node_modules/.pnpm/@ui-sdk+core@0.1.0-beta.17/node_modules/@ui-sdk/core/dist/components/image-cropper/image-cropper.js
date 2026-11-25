// src/components/image-cropper/image-cropper.ts
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { imageCropperApi, initialState, syncState } from "./image-cropper-api.js";
import { imageCropperSlots } from "./image-cropper-parts.js";
function createImageCropperController() {
  return createController();
}
var imageCropperPrimitive = /* @__PURE__ */ definePrimitive({
  name: "image-cropper",
  options: {
    src: "string",
    crop: "value",
    defaultCrop: "value",
    onCropChange: "callback",
    onCropCommit: "callback",
    mode: "string",
    aspectRatio: "number",
    shape: "string",
    minWidth: "number",
    minHeight: "number",
    maxZoom: "number",
    disabled: "boolean",
    controller: "value"
  },
  state: initialState,
  sync: syncState,
  controlled: ["crop"],
  commits: ["crop"],
  live: ["crop", "box", "dragging"],
  api: imageCropperApi,
  slots: imageCropperSlots,
  agent: { actions: ["setCrop", "rotate", "flip", "setZoom"] }
});
var imageCropper = imageCropperPrimitive;
export {
  createImageCropperController,
  imageCropper
};
