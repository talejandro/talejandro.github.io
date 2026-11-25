// src/components/token-input/token-input-editing.ts
import { isComposing } from "../../foundation/kernel/events.js";
import { isRTL } from "../../foundation/platform/env.js";
import { isApple } from "../../foundation/platform/platform.js";
import {
  fromText,
  lineBoundary,
  offsetText,
  replaceRange,
  sliceValue,
  toLabel,
  toText,
  tokenAt,
  valueLength,
  wordBoundary
} from "./token-input-model.js";
var escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
var unescapeHtml = (text) => text.replace(
  /&(#\d+|quot|amp|lt|gt);/g,
  (_, code) => code[0] === "#" ? String.fromCharCode(Number(code.slice(1))) : { quot: '"', amp: "&", lt: "<", gt: ">" }[code]
);
function charLength(text, offset, direction) {
  const code = text.charCodeAt(direction < 0 ? offset - 1 : offset);
  const surrogate = direction < 0 ? code >= 56320 && code <= 57343 : code >= 55296 && code <= 56319;
  return surrogate ? 2 : 1;
}
function deletionTarget(type, value, at, direction) {
  if (type.includes("Word")) {
    return wordBoundary(value, at, direction);
  }
  if (type.includes("Line")) {
    return lineBoundary(value, at, direction);
  }
  return at + direction * charLength(offsetText(value), at, direction);
}
function bindTokenEditing(el, view, api) {
  const { internal } = api;
  const doc = el.ownerDocument;
  let lastEnd = -1;
  let afterSpace = false;
  let dragged = null;
  let armed = null;
  const value = () => internal.latest();
  function edit(next, selection, details) {
    if (details.group && details.at !== void 0 && details.at !== lastEnd) {
      internal.seal();
    }
    internal.commit(next, { ...details, selection });
    lastEnd = details.group ? selection.end : -1;
  }
  function remove(type, range, event) {
    const current = value();
    if (range.start !== range.end) {
      armed = null;
      return edit(
        replaceRange(current, range, []),
        internal.caretAt(range.start),
        {
          reason: type === "deleteByCut" ? "cut" : "input-change",
          event,
          inputType: type
        }
      );
    }
    const direction = type.includes("Backward") ? -1 : 1;
    const at = range.start;
    const neighbour = direction < 0 ? at - 1 : at;
    const token = tokenAt(current, neighbour);
    if (token && /^delete(Content|Word)/.test(type)) {
      return removeToken(token, neighbour, event, type);
    }
    armed = null;
    const target = Math.max(
      0,
      Math.min(
        deletionTarget(type, current, at, direction),
        valueLength(current)
      )
    );
    if (target === at) {
      return;
    }
    const start = Math.min(at, target);
    edit(
      replaceRange(current, { start, end: Math.max(at, target) }, []),
      internal.caretAt(start),
      {
        reason: "input-change",
        event,
        inputType: type,
        group: "delete",
        at
      }
    );
  }
  function removeToken(token, offset, event, inputType) {
    const current = value();
    const tokenId = token.id;
    const policy = internal.options().tokenDeletion ?? "whole";
    const range = { start: offset, end: offset + 1 };
    if (policy === "select" && armed !== tokenId) {
      armed = tokenId;
      view.select(range);
      internal.say(
        `${token.label}, ${internal.describe(token)}, selected. Press Backspace again to remove it`
      );
      return;
    }
    armed = null;
    const text = policy === "revert" ? `${token.data?.trigger ?? ""}${token.label}` : "";
    const replacement = text ? [text] : [];
    const end = offset + text.length;
    edit(replaceRange(current, range, replacement), internal.caretAt(end), {
      reason: "input-change",
      event,
      inputType
    });
  }
  function onBeforeInput(event) {
    const type = event.inputType;
    if (!internal.editable()) {
      return event.preventDefault();
    }
    if (type === "historyUndo" || type === "historyRedo") {
      event.preventDefault();
      return type === "historyUndo" ? internal.undo(event) : internal.redo(event);
    }
    if (type === "insertCompositionText" || internal.composing()) {
      return;
    }
    const range = view.selection();
    if (!range) {
      return;
    }
    const anchor = doc.getSelection()?.anchorNode ?? null;
    if (type === "insertText" || type === "insertReplacementText") {
      const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
      const target = targetRange(event) ?? range;
      if (type === "insertText" && target.start === target.end && !view.inHost(anchor)) {
        return;
      }
      event.preventDefault();
      return insertText(text, target, event);
    }
    event.preventDefault();
    if (type === "insertParagraph" || type === "insertLineBreak") {
      return insertText("\n", range, event);
    }
    if (type.startsWith("delete")) {
      return remove(type, range, event);
    }
    if (type === "insertFromYank") {
      insertText(event.data ?? "", range, event);
    }
  }
  function targetRange(event) {
    const [target] = event.getTargetRanges?.() ?? [];
    if (!target) {
      return null;
    }
    return {
      start: view.offsetAt(target.startContainer, target.startOffset),
      end: view.offsetAt(target.endContainer, target.endOffset)
    };
  }
  function insertText(text, range, event) {
    if (afterSpace && /\S/.test(text)) {
      internal.seal();
    }
    afterSpace = /\s$/.test(text);
    edit(
      replaceRange(value(), range, [text]),
      internal.caretAt(range.start + text.length),
      {
        reason: "input-change",
        event,
        inputType: event.inputType,
        group: "insert",
        at: range.start
      }
    );
  }
  function onInput(event) {
    if (internal.composing() || event.isComposing) {
      return;
    }
    reconcile(event);
  }
  function reconcile(event) {
    if (!internal.editable()) {
      return view.render(value());
    }
    const next = view.read();
    const selection = view.selection() ?? internal.caretAt(valueLength(next));
    const text = event?.data ?? "";
    if (afterSpace && /\S/.test(text)) {
      internal.seal();
    }
    if (text) {
      afterSpace = /\s$/.test(text);
    }
    edit(next, selection, {
      reason: "input-change",
      event,
      inputType: event?.inputType,
      group: event ? "insert" : void 0,
      at: selection.end - text.length
    });
  }
  function onKeyDown(event) {
    if (event.defaultPrevented || isComposing(event)) {
      return;
    }
    const mod = isApple() ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();
    if (mod && !event.altKey && key === "z") {
      event.preventDefault();
      if (!internal.editable()) {
        return;
      }
      return event.shiftKey ? internal.redo(event) : internal.undo(event);
    }
    if (!isApple() && event.ctrlKey && key === "y") {
      event.preventDefault();
      if (internal.editable()) {
        internal.redo(event);
      }
      return;
    }
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !event.shiftKey && !mod && !event.altKey) {
      return crossToken(event);
    }
    if (mod && (key === "b" || key === "i" || key === "u")) {
      return event.preventDefault();
    }
    if (event.key === "Enter") {
      const shortcut = internal.options().submitShortcut ?? "enter";
      const submits = shortcut === "enter" ? !event.shiftKey && !mod && !event.altKey : mod && !event.shiftKey;
      if (!submits || !internal.canSubmit()) {
        return;
      }
      event.preventDefault();
      internal.submit(event);
    }
  }
  function crossToken(event) {
    const range = view.selection();
    if (!range || range.start !== range.end) {
      return;
    }
    const forward = event.key === "ArrowRight" !== isRTL(el);
    const target = forward ? range.end : range.start - 1;
    if (!tokenAt(value(), target)) {
      return;
    }
    event.preventDefault();
    view.select(internal.caretAt(forward ? target + 1 : target));
  }
  function writeClipboard(data, range) {
    if (!data) {
      return;
    }
    const part = sliceValue(value(), range.start, range.end);
    const text = toText(part, internal.codec());
    data.setData(
      "text/plain",
      internal.options().copy === "label" ? toLabel(part) : text
    );
    data.setData(
      "text/html",
      `<span data-ui-tokens="${escapeHtml(text)}">${escapeHtml(toLabel(part))}</span>`
    );
  }
  function readClipboard(data) {
    if (!data) {
      return [];
    }
    const tokens = /data-ui-tokens="([^"]*)"/.exec(data.getData("text/html"));
    return fromText(
      tokens ? unescapeHtml(tokens[1]) : data.getData("text/plain"),
      internal.codec()
    );
  }
  function onCopy(event) {
    const range = view.selection();
    if (!range || range.start === range.end) {
      return;
    }
    event.preventDefault();
    writeClipboard(event.clipboardData, range);
  }
  function onCut(event) {
    const range = view.selection();
    if (!range || range.start === range.end) {
      return;
    }
    event.preventDefault();
    if (!internal.editable()) {
      return;
    }
    writeClipboard(event.clipboardData, range);
    edit(replaceRange(value(), range, []), internal.caretAt(range.start), {
      reason: "cut",
      event
    });
  }
  function onPaste(event) {
    event.preventDefault();
    const range = view.selection();
    if (!range || !internal.editable()) {
      return;
    }
    const content = readClipboard(event.clipboardData);
    if (!content.length) {
      return;
    }
    edit(
      replaceRange(value(), range, content),
      internal.caretAt(range.start + valueLength(content)),
      {
        reason: "paste",
        event
      }
    );
  }
  function onDragStart(event) {
    const range = view.selection();
    if (!range || range.start === range.end) {
      return;
    }
    dragged = range;
    writeClipboard(event.dataTransfer, range);
  }
  function onDragEnd() {
    dragged = null;
  }
  function onDrop(event) {
    event.preventDefault();
    const source = dragged;
    dragged = null;
    if (!internal.editable()) {
      return;
    }
    const point = pointFrom(event);
    let at = point ? view.offsetAt(point[0], point[1]) : valueLength(value());
    const content = readClipboard(event.dataTransfer);
    let current = value();
    if (source && !(event.ctrlKey || event.altKey)) {
      if (at > source.start && at < source.end) {
        return;
      }
      current = replaceRange(current, source, []);
      if (at >= source.end) {
        at -= source.end - source.start;
      }
    }
    edit(
      replaceRange(current, internal.caretAt(at), content),
      internal.caretAt(at + valueLength(content)),
      {
        reason: "drop",
        event
      }
    );
  }
  function pointFrom(event) {
    const position = doc.caretPositionFromPoint?.(event.clientX, event.clientY);
    if (position) {
      return [position.offsetNode, position.offset];
    }
    const range = doc.caretRangeFromPoint?.(event.clientX, event.clientY);
    return range ? [range.startContainer, range.startOffset] : null;
  }
  function onCompositionStart() {
    internal.setComposing(true);
  }
  function onCompositionEnd() {
    internal.setComposing(false);
    internal.seal();
    reconcile();
    internal.seal();
  }
  function onSelectionChange() {
    const selected = doc.getSelection();
    if (!selected?.rangeCount || !el.contains(selected.anchorNode)) {
      return;
    }
    const range = view.selection();
    if (!range) {
      return;
    }
    if (view.inHost(selected.anchorNode) || view.inHost(selected.focusNode)) {
      view.select(range);
    }
    if (armed && !(range.end - range.start === 1 && tokenAt(value(), range.start)?.id === armed)) {
      armed = null;
    }
    internal.setSelection(range);
  }
  function onFocus() {
    internal.setFocused(true);
    internal.setSelection(view.selection());
  }
  function onBlur() {
    if (internal.composing()) {
      internal.setComposing(false);
    }
    internal.setFocused(false);
  }
  const listeners = [
    [el, "beforeinput", onBeforeInput],
    [el, "input", onInput],
    [el, "keydown", onKeyDown],
    [el, "copy", onCopy],
    [el, "cut", onCut],
    [el, "paste", onPaste],
    [el, "dragstart", onDragStart],
    [el, "dragend", onDragEnd],
    [el, "drop", onDrop],
    [el, "compositionstart", onCompositionStart],
    [el, "compositionend", onCompositionEnd],
    [el, "focus", onFocus],
    [el, "blur", onBlur],
    [doc, "selectionchange", onSelectionChange]
  ];
  for (const [target, type, listener] of listeners) {
    target.addEventListener(type, listener);
  }
  if (doc.activeElement === el) {
    onFocus();
  }
  return () => {
    for (const [target, type, listener] of listeners) {
      target.removeEventListener(type, listener);
    }
  };
}
export {
  bindTokenEditing
};
