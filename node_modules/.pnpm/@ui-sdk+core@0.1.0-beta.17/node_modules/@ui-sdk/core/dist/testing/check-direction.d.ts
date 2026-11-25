import type { OptionsOf, Primitive } from "../foundation/kernel/primitive-types.js";
/**
 * Mounts a primitive left to right and right to left, Tabs into it, and
 * presses each horizontal arrow, checking ArrowLeft in right to left does
 * what ArrowRight does in left to right, and the other way around. Fails too
 * when the arrows do nothing, since there's nothing to check. Markup is
 * `mount`'s. Throws one error that lists every problem.
 *
 * @example
 * await checkDirection(tabs, { defaultValue: "a" }, `<root><list><tab value="a">A</tab><tab value="b">B</tab></list></root>`)
 *
 * @experimental
 */
declare function checkDirection<P extends Primitive>(primitive: P, options: OptionsOf<P>, markup: string): Promise<void>;
export { checkDirection };
