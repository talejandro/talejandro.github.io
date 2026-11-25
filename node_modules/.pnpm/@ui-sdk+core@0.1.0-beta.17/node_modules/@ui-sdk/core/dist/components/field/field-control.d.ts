/**
 * The browser's validity flags, as `ValidityState` names them.
 * @stable
 */
type ValidityKey = "valueMissing" | "typeMismatch" | "patternMismatch" | "tooLong" | "tooShort" | "rangeUnderflow" | "rangeOverflow" | "stepMismatch" | "badInput" | "customError";
declare const validityKeys: ValidityKey[];
type Validity = {
    valid: boolean;
    flags: Partial<Record<ValidityKey, boolean>>;
    message: string;
};
declare const valid: Validity;
declare function controlsIn(root: HTMLElement): HTMLElement[];
declare function validityOf(el: HTMLElement): {
    willValidate: boolean;
    validity: ValidityState;
    message: string;
};
declare const isRequired: (el: HTMLElement) => boolean;
export { controlsIn, isRequired, valid, type Validity, type ValidityKey, validityKeys, validityOf, };
