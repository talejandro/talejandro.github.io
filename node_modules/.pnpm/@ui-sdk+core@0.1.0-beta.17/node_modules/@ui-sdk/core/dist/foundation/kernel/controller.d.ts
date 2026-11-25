import type { PrimitiveContext } from "./primitive-types.js";
/**
 * Whether a controller drives an instance now, like an alert dialog the app
 * rendered for `confirm()`. Hidden behind a symbol, like attaching.
 */
declare function isControllerAttached(controller: unknown): boolean;
declare function attachController(controller: unknown, api: unknown): void;
/**
 * A handle created outside any component and passed as the `controller` option.
 * Calls go to the instance it is attached to. Before it attaches, and once that
 * instance is gone, its methods do nothing and return undefined. Development
 * builds warn once for each action called before it first attaches, like
 * `open()`, but not for reads like `isOpen()`. A method read earlier calls the
 * instance attached when it's called. An api's `internal` is for adapters, so a
 * controller never hands it out.
 * @stable
 */
declare function createController<Api extends object>(): Api;
declare function connectController(context: Pick<PrimitiveContext<{
    controller?: unknown;
}, object, string>, "options" | "onOptions">, api: unknown): void;
export { attachController, connectController, createController, isControllerAttached, };
