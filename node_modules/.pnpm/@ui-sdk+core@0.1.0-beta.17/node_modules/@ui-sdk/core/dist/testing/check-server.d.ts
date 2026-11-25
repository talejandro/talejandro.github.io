import type { OptionsOf, Primitive } from "../foundation/kernel/primitive-types.js";
/**
 * Renders a primitive's parts from markup the way a server does. Checks that
 * creating the instance reads no browser global, clock or randomness, and that
 * each part's attributes, state and presence read none of those nor options.
 * A pass rules out those reads as a cause of server and client HTML differing;
 * it doesn't run a framework's hydration. Markup is `mount`'s. Needs no DOM.
 * Returns the HTML; throws one error that lists every problem.
 *
 * @example
 * const html = checkServer(tabs, { defaultValue: "a" }, `<root><list><tab value="a">A</tab></list></root>`)
 *
 * @experimental
 */
declare function checkServer<P extends Primitive>(primitive: P, options: OptionsOf<P>, markup: string): string;
export { checkServer };
