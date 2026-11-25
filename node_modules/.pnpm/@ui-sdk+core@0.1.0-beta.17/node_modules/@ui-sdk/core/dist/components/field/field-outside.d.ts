import type { FieldErrorProps, FieldErrorState } from "./field.js";
type FieldOutsideSlot = "label" | "description" | "error" | "control";
declare const fieldOutsideState: FieldErrorState;
declare const fieldOutsideAttrs: (slot: FieldOutsideSlot) => {
    "data-slot": string;
};
declare const fieldOutsideErrorShown: (props: FieldErrorProps) => boolean;
/**
 * In development, warns when a part outside a field leaves a control without
 * a label: a label that labels no control, or a control nothing names. `fix`
 * says, in the adapter's own words, how to give a label its control.
 */
declare function checkFieldOutside(el: Element | null | undefined, slot: FieldOutsideSlot, fix?: string): void;
export { checkFieldOutside, fieldOutsideAttrs, fieldOutsideErrorShown, type FieldOutsideSlot, fieldOutsideState, };
