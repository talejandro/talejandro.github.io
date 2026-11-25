// src/foundation/platform/index.ts
import { announce, prepareAnnouncements, setAnnouncer } from "./announce.js";
import {
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole,
  opensElsewhere
} from "./button.js";
import { isBrowser, isIOS, isRTL } from "./env.js";
import { measureViewportEarly, trackKeyboard } from "./keyboard.js";
import {
  activeLayers,
  bindPersistentLayer,
  escapeLayer,
  findLayer,
  inPersistentLayer,
  lastClosed,
  lastEscape,
  layerContains,
  layerCount,
  markClosed,
  openedSince,
  persistentLayers,
  pushLayer
} from "./layers.js";
import { layoutBox, layoutOrigin, layoutSize } from "./layout.js";
import {
  activeElement,
  ariaKeyshortcuts,
  composedClosest,
  composedContains,
  formatShortcut,
  hasCommandModifier,
  initialApple,
  isApple,
  matchesShortcut,
  prefersReducedMotion,
  supportsTopLayer
} from "./platform.js";
import {
  position,
  preparePosition
} from "./position.js";
import { pressedScrollbar } from "./scrollbar.js";
import { physicalSide } from "./sides.js";
import {
  afterPaint,
  ahead,
  enforceHidden,
  registerUninherited,
  setStyle,
  writeStyle
} from "./style.js";
export {
  activeElement,
  activeLayers,
  afterPaint,
  ahead,
  announce,
  ariaKeyshortcuts,
  bindPersistentLayer,
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole,
  composedClosest,
  composedContains,
  enforceHidden,
  escapeLayer,
  findLayer,
  formatShortcut,
  hasCommandModifier,
  inPersistentLayer,
  initialApple,
  isApple,
  isBrowser,
  isIOS,
  isRTL,
  lastClosed,
  lastEscape,
  layerContains,
  layerCount,
  layoutBox,
  layoutOrigin,
  layoutSize,
  markClosed,
  matchesShortcut,
  measureViewportEarly,
  openedSince,
  opensElsewhere,
  persistentLayers,
  physicalSide,
  position,
  prefersReducedMotion,
  prepareAnnouncements,
  preparePosition,
  pressedScrollbar,
  pushLayer,
  registerUninherited,
  setAnnouncer,
  setStyle,
  supportsTopLayer,
  trackKeyboard,
  writeStyle
};
