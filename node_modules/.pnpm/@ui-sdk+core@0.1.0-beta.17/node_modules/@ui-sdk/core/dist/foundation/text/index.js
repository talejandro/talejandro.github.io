// src/foundation/text/index.ts
import {
  accessibleName,
  hasAccessibleName,
  namedByContent,
  roleOf
} from "./accessible-name.js";
import { textDiff, textFieldAdapter } from "./caret.js";
import { fuzzyFilter } from "./fuzzy.js";
import { createInputHistory } from "./input-history.js";
import { bindPageLocale, localeOf, pageLocale } from "./locale.js";
import {
  foldText,
  leadingSpaces,
  matchRanges,
  matchSegments
} from "./match.js";
import {
} from "./text-editor.js";
import {
  createTypeahead,
  isTypeaheadKey,
  labelOf,
  normalize,
  textOf
} from "./typeahead.js";
export {
  accessibleName,
  bindPageLocale,
  createInputHistory,
  createTypeahead,
  foldText,
  fuzzyFilter,
  hasAccessibleName,
  isTypeaheadKey,
  labelOf,
  leadingSpaces,
  localeOf,
  matchRanges,
  matchSegments,
  namedByContent,
  normalize,
  pageLocale,
  roleOf,
  textDiff,
  textFieldAdapter,
  textOf
};
