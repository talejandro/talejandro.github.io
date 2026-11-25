import { click, drag, hover, settle } from "./input.js";
import type { OptionsOf, Primitive, SlotName } from "../foundation/kernel/primitive-types.js";
import { type ObservedChange } from "../page/observe/registry.js";
type Rerender = {
    setOptions: (patch: Record<string, unknown>) => void;
    setProps: (slot: string, key: string, patch: Record<string, unknown>) => void;
};
/**
 * Renders a primitive's slots from markup, without a framework, wired the way
 * a renderer wires them: attributes, handlers, presence and `bind`, kept
 * current on every change. Each tag in `markup` is a slot, and its attributes
 * are the slot's props, parsed by the slot's schema; other attributes and
 * text stay on the element. Needs a DOM, like jsdom or happy-dom; it fills in
 * the animations and hit testing those leave out.
 *
 * @example
 * const list = mount(sortable, { defaultValue: ["a", "b"] }, `<root><item value="a">A</item><item value="b">B</item></root>`)
 * await list.keys("Tab", "Space", "ArrowDown", "Space")
 * expect(list.state.value).toEqual(["b", "a"])
 *
 * @experimental
 */
declare function mount<P extends Primitive>(primitive: P, options: OptionsOf<P>, markup: string): {
    /** The first element of the markup, usually the root part. */
    root: HTMLElement;
    /** The element of a part, by slot and, for a slot with several parts, its key, like an item's value. */
    part: (slot: SlotName<P>, key?: string) => HTMLElement | undefined;
    /** The instance's state now. */
    readonly state: ReturnType<P>["types"]["state"];
    /** The instance's api, the methods a controller calls. */
    api: ReturnType<P>["types"]["api"];
    /** Every change that went through, step by step, with its reason and source. */
    changes: ObservedChange[];
    /** Changes as `observe` reports them: one per interaction a commit settles. */
    settled: ObservedChange[];
    /** What screen readers would read, in order. */
    announced: string[];
    /** Presses keys one after another on the focused element, like `"Tab"`, `"Shift+Tab"` or `"Space"`. Tab from elsewhere in the page goes into the markup. */
    keys: (...names: string[]) => Promise<void>;
    /** Types text into the focused element, a key per character. */
    type: (text: string) => Promise<void>;
    /** Clicks an element with a mouse. */
    click: typeof click;
    /** Drags an element with a mouse onto another, or by a distance. */
    drag: typeof drag;
    /** Moves a mouse onto an element. */
    hover: typeof hover;
    /** Waits for what the primitive scheduled: microtasks, a timer and two frames. */
    settle: typeof settle;
    /** Unbinds every part, destroys the instance and removes the markup. */
    unmount: () => void;
};
/** Renders a mount again with new options or slot props, as a framework does after its first render. For this repo's tests. */
declare const rerenderOf: (mounted: object) => Rerender;
export { mount, rerenderOf };
