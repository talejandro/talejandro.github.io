// src/components/file-input/file-input-dropzone.ts
import {
  carriesFiles,
  claim,
  createDragTracker,
  draggedTypes,
  droppedFiles,
  guardFileDrops,
  isClaimed,
  isFileInput,
  pastedFiles
} from "./file-drop.js";
import { isDisabled } from "./file-input-api.js";
import { dragStatus } from "../../foundation/forms/files.js";
import { on } from "../../foundation/kernel/events.js";
var zoneOf = (node) => node instanceof Element ? node.closest('[data-slot="file-input-dropzone"]') : null;
function resolvePasteTarget(target, doc) {
  if (typeof target === "function") {
    return target();
  }
  if (typeof target === "string" && target !== "document") {
    return doc.querySelector(target);
  }
  return target;
}
function bindDropzone(el, {
  key,
  store,
  api,
  props
}) {
  const targetsDocument = () => props().target === "document";
  const disabled = () => isDisabled(store.get());
  function take(files, event) {
    if (Array.isArray(files)) {
      api.internal.receive(files, "drop", event);
    } else {
      files.then((read) => api.internal.receive(read, "drop", event));
    }
  }
  function onPaste(event) {
    if (disabled() || isClaimed(event)) {
      return;
    }
    const files = pastedFiles(event);
    if (!files.length) {
      return;
    }
    claim(event);
    event.preventDefault();
    api.internal.receive(files, "paste", event);
  }
  function trackDrags(target, active) {
    let status = "accept";
    const tracker = createDragTracker(
      (over) => api.internal.setDrag(key, over && !disabled() ? status : null)
    );
    return [
      on(target, "dragenter", (event) => {
        if (!active() || !carriesFiles(event)) {
          return;
        }
        status = dragStatus(
          draggedTypes(event.dataTransfer),
          api.internal.rules()
        );
        tracker.enter(event);
      }),
      on(target, "dragleave", (event) => tracker.leave(event)),
      on(target, "dragover", (event) => {
        if (!active() || !carriesFiles(event) || isClaimed(event) || isFileInput(event.target)) {
          return;
        }
        claim(event);
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = disabled() ? "none" : "copy";
        }
      }),
      // A drop anywhere ends the drag, even one another zone took.
      on(window, "drop", () => tracker.reset(), { capture: true })
    ];
  }
  const cleanups = [
    guardFileDrops(),
    ...trackDrags(el, () => !targetsDocument()),
    ...trackDrags(window, targetsDocument),
    // In the capture phase, so the zone takes the drop before anything inside
    // it, and no native drop reaches listeners past the zone. On web
    // components, the root's own events are the only ones they hear.
    on(
      el,
      "drop",
      (event) => {
        if (targetsDocument() || !event.dataTransfer || !carriesFiles(event) || zoneOf(event.target) !== el) {
          return;
        }
        claim(event);
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!disabled()) {
          take(droppedFiles(event.dataTransfer), event);
        }
      },
      { capture: true }
    ),
    // A page-wide zone takes what no other zone did, since those stop their drops.
    on(window, "drop", (event) => {
      if (!targetsDocument() || !event.dataTransfer || !carriesFiles(event)) {
        return;
      }
      if (isClaimed(event) || isFileInput(event.target)) {
        return;
      }
      claim(event);
      event.preventDefault();
      if (!disabled()) {
        take(droppedFiles(event.dataTransfer), event);
      }
    }),
    on(el, "paste", onPaste),
    // Pastes into `pasteTarget`, read when the paste happens, so the target can render after the zone.
    on(
      el.ownerDocument,
      "paste",
      (event) => {
        const target = resolvePasteTarget(props().pasteTarget, el.ownerDocument);
        if (target === "document" || target instanceof Node && target.contains(event.target)) {
          onPaste(event);
        }
      },
      { capture: true }
    ),
    () => api.internal.setDrag(key, null)
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
export {
  bindDropzone
};
