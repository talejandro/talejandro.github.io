import type { Primitive } from "./primitive-types.js";
/**
 * A framework's cached derivation, like a Vue `computed`, a Svelte
 * `$derived` or a Solid `createMemo`: it runs `compute` again only once
 * something it read changed, and tells what reads it only when the result is
 * another value.
 */
type Memo = <Value>(compute: () => Value) => () => Value;
/**
 * Makes, for one instance, a function that replaces the lists in the options
 * a renderer is about to hand over with ones the instance can compare. A Vue
 * `reactive`, Svelte `$state` or Solid store array pushed into is still the
 * same array: handed over as it is, the framework never tracks its items and
 * the instance compares it with itself. A list a parent controls is copied as
 * the options are made, which reads every item, so the framework hands the
 * options over again when one changes, and while it holds the same items
 * every call returns the same copy. A data list like `items` can be long and
 * nested, so a `memo` made for each array reads it apart from the options: a
 * prop changing elsewhere reads none of its items, and the framework checks
 * none of them.
 */
declare function createListSnapshots(primitive: Primitive, memo: Memo): <Options extends object>(options: Options) => Options;
export { createListSnapshots };
