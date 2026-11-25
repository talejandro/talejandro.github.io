import type { FieldApi, FieldErrorProps } from "./field.js";
import type { Validity } from "./field-control.js";
import type { Store } from "../../foundation/kernel/store.js";
type FieldStore = {
    disabled: boolean;
    name: string | undefined;
    external: boolean | undefined;
    focused: boolean;
    revealed: boolean;
    formDisabled: boolean;
    required: boolean;
    validity: Validity;
    labels: string[];
    descriptions: string[];
    errors: string[];
    bound: boolean;
    controlId: string | null;
    labelable: boolean;
    namedByContent: boolean;
};
declare function fieldState(state: FieldStore, api: FieldApi): {
    disabled: boolean;
    required: boolean;
    focused: boolean;
    invalid: boolean;
    valid: boolean;
};
declare function dataAttrs(state: FieldStore, api: FieldApi): {
    "data-disabled": string | undefined;
    "data-required": string | undefined;
    "data-focused": string | undefined;
    "data-invalid": string | undefined;
    "data-valid": string | undefined;
};
declare function errorState(state: FieldStore, api: FieldApi): {
    message: string;
    disabled: boolean;
    required: boolean;
    focused: boolean;
    invalid: boolean;
    valid: boolean;
};
declare function errorShown(state: FieldStore, api: FieldApi, props: FieldErrorProps): boolean;
declare function controlAttrs(state: FieldStore, api: FieldApi, props: {
    id?: string;
    describedBy?: string;
}, fallback: string): {
    "data-disabled": string | undefined;
    "data-required": string | undefined;
    "data-focused": string | undefined;
    "data-invalid": string | undefined;
    "data-valid": string | undefined;
    id: string;
    "aria-labelledby": string | undefined;
    "aria-describedby": string | undefined;
    "aria-invalid": string | undefined;
    disabled: string | undefined;
};
declare function bindFoundControl(root: HTMLElement, api: FieldApi, store: Store<FieldStore>): () => void;
declare function descriptionId(parts: Iterable<{
    slot: string;
    key: string;
}>, id: string, key: string): string;
export { bindFoundControl, descriptionId, controlAttrs, dataAttrs, errorShown, errorState, fieldState, type FieldStore, };
