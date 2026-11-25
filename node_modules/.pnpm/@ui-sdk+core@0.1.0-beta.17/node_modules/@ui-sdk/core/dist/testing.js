// src/testing.ts
import {
  attrs,
  partState,
  present
} from "./foundation/kernel/part.js";
import { setPlatform } from "./foundation/platform/platform.js";
import { checkDirection } from "./testing/check-direction.js";
import { checkPattern } from "./testing/check-pattern.js";
import { checkServer } from "./testing/check-server.js";
import { settle } from "./testing/input.js";
import { mount } from "./testing/mount.js";
export {
  checkDirection,
  checkPattern,
  checkServer,
  mount,
  attrs as partAttrs,
  present as partPresent,
  partState,
  setPlatform,
  settle
};
