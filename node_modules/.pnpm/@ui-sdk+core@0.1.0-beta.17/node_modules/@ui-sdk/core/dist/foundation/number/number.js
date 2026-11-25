// src/foundation/number/number.ts
import {
  formatNumber,
  formatNumberRange,
  formatNumberToParts,
  numberFormatter
} from "./format.js";
import { stepFromKey } from "./keys.js";
import { isPartialNumber, parseNumber } from "./parse.js";
import { fractionOf, valueAt } from "./scale.js";
import {
  clamp,
  decimalsOf,
  maxOnGrid,
  roundTo,
  scrubTo,
  stepBy,
  stepValue,
  wrap
} from "./steps.js";
export {
  clamp,
  decimalsOf,
  formatNumber,
  formatNumberRange,
  formatNumberToParts,
  fractionOf,
  isPartialNumber,
  maxOnGrid,
  numberFormatter,
  parseNumber,
  roundTo,
  scrubTo,
  stepBy,
  stepFromKey,
  stepValue,
  valueAt,
  wrap
};
