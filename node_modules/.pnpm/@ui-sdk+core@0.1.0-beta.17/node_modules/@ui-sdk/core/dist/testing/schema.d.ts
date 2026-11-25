import type { PropSpec } from "../foundation/kernel/primitive-types.js";
declare const kindOf: (spec: PropSpec) => "string" | "number" | "boolean" | "action" | "list" | "value" | "id" | "key" | "callback";
declare function fromOf(spec: PropSpec, key: string): {
    slot: string;
    prop: string;
} | undefined;
declare const camel: (name: string) => string;
/**
 * A slot's props from its markup attributes, parsed by the slot's schema,
 * with those left out taken from the parts around it (`around`, by slot) or
 * made unique (`makeId`). Other attributes stay on the element, and `as`
 * names its tag.
 */
declare function slotProps(own: Record<string, PropSpec>, attributes: [name: string, value: string][], around: Record<string, Record<string, unknown>>, makeId: () => string): {
    props: Record<string, unknown>;
    extra: [name: string, value: string][];
    as: string | undefined;
};
declare function tagOf(rendered: Record<string, unknown>): "button" | "a" | "input" | "div" | "label";
export { camel, fromOf, kindOf, slotProps, tagOf };
