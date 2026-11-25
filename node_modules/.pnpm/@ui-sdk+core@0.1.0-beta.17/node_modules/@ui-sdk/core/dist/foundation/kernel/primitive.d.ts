import type { AnySlot, ControlledBy, Feature, OptionsSchema, Part, Primitive, PrimitiveContext, PrimitiveInstance, PrimitiveSchema, PropSpec, SlotFactory, SlotProps } from "./primitive-types.js";
/**
 * Defines a component's behavior without its markup: its state, an api that
 * changes it, and its parts, called slots. Every adapter renders the result
 * with `createParts`, which reads `options` and each slot's `props` to tell
 * them from an element's own. Each slot's element gets `data-slot="<name>-<slot>"`,
 * and the `root` slot's gets `data-slot="<name>"`.
 *
 * @example
 * export const disclosure = definePrimitive({
 *   name: "disclosure",
 *   options: { open: "boolean", defaultOpen: "boolean", onOpenChange: "callback" },
 *   state: (options: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean, details: ChangeDetails<"trigger-press">) => void }) => ({
 *     open: options.open ?? options.defaultOpen ?? false,
 *   }),
 *   sync: (options) => (options.open === undefined ? {} : { open: options.open }),
 *   api: (context) => {
 *     const change = createChange(context)
 *     return { toggle: (event?: Event) => change("open", !context.store.get().open, { reason: "trigger-press", event }) }
 *   },
 *   slots: (slot) => ({
 *     trigger: slot({
 *       attrs: (state) => ({ type: "button", "aria-expanded": String(state.open) }),
 *       press: ({ api }, event) => api.toggle(event),
 *     }),
 *     panel: slot({ present: (state) => state.open }),
 *   }),
 * })
 * @stable
 */
declare function definePrimitive<Options extends object, State extends object, Api extends ControlledBy<Options>, Slots extends Record<string, AnySlot>>(definition: {
    /** Prefixes `data-slot`, and names the component in warnings and the devtools. Kebab case. */
    name: string;
    /** The starting state, from the first options. Read `default<Key>` here. */
    state: (options: Options) => State;
    /** State keys that change often and never affect rendering, like a highlighted item. */
    live?: (keyof State)[];
    /**
     * Whether an instance with these options starts asleep: its parts render
     * and run `asleep`, while its api and each part's `bind` wait for the first
     * event a part handles or the first read of `instance.api`. Like a closed
     * tooltip, which costs little until its trigger is hovered or focused.
     * @experimental
     */
    asleep?: (options: Options) => boolean;
    /** Maps controlled options onto state. Runs whenever options change. */
    sync?: (options: Options) => Partial<State>;
    /**
     * State keys a user can control with `<key>`, `default<Key>` and
     * `on<Key>Change`. Development builds warn when one starts with both `<key>`
     * and `default<Key>`, or was controlled and becomes undefined. Defaults
     * to whichever of `open`, `value` and `checked` the state has.
     */
    controlled?: (keyof State & string)[];
    /**
     * State keys an interaction changes in steps and then commits, through
     * `createCommit`, like a slider's `value` while it's dragged. `observe`
     * reports each of them once per commit rather than per step.
     * @experimental
     */
    commits?: (keyof State & string)[];
    /** Runs once per instance and returns its api, which slots, adapters and a controller call. */
    api: (context: PrimitiveContext<Options, State, string>) => Api;
    /** The parts, built with `slot`. `slot<Props, State>({ ... })` types a slot's props and the state its render functions get. */
    slots: (slot: SlotFactory<State, Api>) => Slots;
    /**
     * What warnings, `debug` and the devtools call it, when that isn't `name`,
     * which prefixes `data-slot`. Like a checkbox group's parts in `checkbox`.
     */
    label?: string;
    /**
     * What `@ui-sdk/core/agent` offers an agent. Without it, the agent takes
     * the api's methods that change something by their names, like `setValue`.
     * @experimental
     */
    agent?: {
        /** The api methods an agent may call, like `["setValue", "setOpen"]`. Development builds warn about one the api lacks. */
        actions?: string[];
        /** Its value is always one of its items, so text that names none is a mistake to refuse. */
        closed?: boolean;
        /** Its items as data, when they aren't its state's `items`, like a tree's built from `paths`. */
        items?: (api: NoInfer<Api>) => unknown;
        /** Its closed items hide other components, like tabs, which a step can open first. */
        reveals?: boolean;
        /** Whether an agent sees it now, like a field only while it has errors. */
        shown?: (state: NoInfer<State>) => boolean;
        /** Its value is hidden from agents and `observe`, like a password's. */
        secret?: boolean;
    };
} & OptionsSchema<Options>): ((initialOptions: Options & {
    id: string;
}) => {
    types: {
        options: Options;
        state: State;
        api: Api;
        slots: Slots;
    };
    name: string;
    id: string;
    get: () => State;
    subscribe: (listener: import("./store.js").Listener) => () => void;
    readonly api: Api;
    part: <S extends keyof Slots & string>(slot: S, props?: SlotProps<Slots[S]>, rendering?: boolean) => Part<State, Api, SlotProps<Slots[S]>>;
    use: (feature: Feature<Api>) => void;
    preview(next: Options & {
        id: string;
    }): State | undefined;
    view<T>(state: State, read: () => T, around?: Record<string, object>): T;
    setOptions(next: Options & {
        id: string;
    }): void;
    startState: (next: Options & {
        id: string;
    }) => State;
    follow(current: () => Options & {
        id: string;
    }): (state?: State, before?: Options) => Partial<State> | undefined;
    destroy(): void;
}) & {
    options: Record<string, PropSpec> | undefined;
    slots: Slots;
};
/** A primitive's options and each slot's props, by name and kind. */
declare function schemaOf(primitive: Primitive): PrimitiveSchema;
/**
 * A number that changes with every change to an instance's state that can
 * change what renders, which a change to live keys alone never is, so a
 * renderer can tell whether to look again.
 */
declare const renderVersion: (instance: PrimitiveInstance) => number;
export { definePrimitive, renderVersion, schemaOf };
