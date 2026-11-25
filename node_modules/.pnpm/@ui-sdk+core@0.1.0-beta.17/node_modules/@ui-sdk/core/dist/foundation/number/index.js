// src/foundation/number/index.ts
import {
  displayOptions,
  formatNumber,
  formatNumberRange,
  formatNumberToParts,
  numberFormatter
} from "./format.js";
import { stepFromKey } from "./keys.js";
import { isPartialNumber, parseNumber, parseRange } from "./parse.js";
import { fractionOf, valueAt } from "./scale.js";
import {
  clamp,
  decimalsOf,
  maxOnGrid,
  onGrid,
  roundTo,
  scrubTo,
  snapToStep,
  stepBy,
  stepOnGrid,
  stepValue,
  wrap
} from "./steps.js";
export {
  clamp,
  decimalsOf,
  displayOptions,
  formatNumber,
  formatNumberRange,
  formatNumberToParts,
  fractionOf,
  isPartialNumber,
  maxOnGrid,
  numberFormatter,
  onGrid,
  parseNumber,
  parseRange,
  roundTo,
  scrubTo,
  snapToStep,
  stepBy,
  stepFromKey,
  stepOnGrid,
  stepValue,
  valueAt,
  wrap
};
