// src/components/file-input/file-drop.ts
import { setRelativePath } from "../../foundation/forms/files.js";
var pageDrag = false;
function carriesFiles(event) {
  const data = event.dataTransfer;
  if (pageDrag || !data) {
    return false;
  }
  const types = Array.from(data.types ?? []);
  return types.includes("Files") || types.includes("application/x-moz-file") || Array.from(data.items ?? []).some((item) => item.kind === "file");
}
function draggedTypes(dataTransfer) {
  if (!dataTransfer?.items) {
    return [];
  }
  return Array.from(dataTransfer.items).filter((item) => item.kind === "file").map((item) => item.type);
}
function pastedFiles(event) {
  const data = event.clipboardData;
  if (!data) {
    return [];
  }
  const files = Array.from(data.files ?? []);
  if (files.length) {
    return files;
  }
  return Array.from(data.items ?? []).filter((item) => item.kind === "file").map((item) => item.getAsFile()).filter((file) => !!file);
}
var systemFiles = /* @__PURE__ */ new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
var folderFileLimit = 1e3;
async function readEntries(entries, limit = folderFileLimit) {
  const files = [];
  const visit = async (entry) => {
    if (files.length >= limit) {
      return;
    }
    if (entry.isFile && entry.file) {
      if (systemFiles.has(entry.fullPath.split("/").pop())) {
        return;
      }
      const file = await new Promise(
        (resolve, reject) => entry.file(resolve, reject)
      );
      setRelativePath(file, entry.fullPath.replace(/^\//, ""));
      files.push(file);
      return;
    }
    const reader = entry.isDirectory ? entry.createReader?.() : void 0;
    if (!reader) {
      return;
    }
    for (; ; ) {
      const batch = await new Promise(
        (resolve, reject) => reader.readEntries(resolve, reject)
      );
      if (!batch.length || files.length >= limit) {
        return;
      }
      for (const child of batch) {
        await visit(child);
      }
    }
  };
  for (const entry of entries) {
    await visit(entry).catch(() => {
    });
  }
  return files;
}
function droppedFiles(dataTransfer) {
  const items = Array.from(dataTransfer.items ?? []).filter(
    (item) => item.kind === "file"
  );
  const entries = items.map(
    (item) => item.webkitGetAsEntry?.() ?? null
  );
  if (!entries.some((entry) => entry?.isDirectory)) {
    return Array.from(dataTransfer.files);
  }
  const loose = items.flatMap(
    (item, index) => entries[index] ? [] : [item.getAsFile()]
  );
  return readEntries(
    entries.filter((entry) => !!entry)
  ).then((files) => [...loose.filter((file) => !!file), ...files]);
}
var claimed = /* @__PURE__ */ new WeakSet();
function claim(event) {
  claimed.add(event);
}
function isClaimed(event) {
  return claimed.has(event);
}
function isFileInput(target) {
  return target instanceof HTMLInputElement && target.type === "file";
}
var guards = 0;
var releaseGuard;
function guardFileDrops() {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  if (guards++ === 0) {
    const onDragStart = () => pageDrag = true;
    const onDragEnd = () => pageDrag = false;
    const onDragOver = (event) => {
      if (isClaimed(event) || !carriesFiles(event) || isFileInput(event.target)) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
    };
    const onDrop = (event) => {
      if (isClaimed(event) || !carriesFiles(event) || isFileInput(event.target)) {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("dragstart", onDragStart, true);
    window.addEventListener("dragend", onDragEnd, true);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    releaseGuard = () => {
      window.removeEventListener("dragstart", onDragStart, true);
      window.removeEventListener("dragend", onDragEnd, true);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
      pageDrag = false;
    };
  }
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    if (--guards === 0) {
      releaseGuard?.();
    }
  };
}
function createDragTracker(onChange) {
  const entered = /* @__PURE__ */ new Set();
  return {
    enter(event) {
      if (event.target) {
        entered.add(event.target);
      }
      if (entered.size === 1) {
        onChange(true);
      }
    },
    leave(event) {
      if (!event.target || !entered.delete(event.target)) {
        return;
      }
      for (const node of entered) {
        if (node instanceof Node && !node.isConnected) {
          entered.delete(node);
        }
      }
      if (!entered.size) {
        onChange(false);
      }
    },
    reset() {
      if (!entered.size) {
        return;
      }
      entered.clear();
      onChange(false);
    }
  };
}
export {
  carriesFiles,
  claim,
  createDragTracker,
  draggedTypes,
  droppedFiles,
  guardFileDrops,
  isClaimed,
  isFileInput,
  pastedFiles,
  readEntries
};
