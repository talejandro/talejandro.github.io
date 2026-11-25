import { isDisabled } from "../../foundation/forms/form.js";
import { type OTPInputPattern, type Selection } from "./otp-input-model.js";
import { type ChangeDetails, type ChangeOptions, type CommitDetails } from "../../foundation/kernel/details.js";
import type { PrimitiveContext, PrimitiveOptions } from "../../foundation/kernel/primitive-types.js";
/**
 * Why the code changed.
 * @stable
 */
type OTPInputValueChangeReason = "input-change" | "paste" | "undo" | "redo" | "reset" | "restore" | "imperative";
/**
 * Options for every write method on a controller.
 * @stable
 */
type OTPInputChangeOptions = ChangeOptions<OTPInputValueChangeReason>;
/** The options the one-time code model takes, before the `controller` option. */
type OTPInputOptions = {
    /** The code, for a controlled input. */
    value?: string;
    /**
     * The code it starts with, when uncontrolled. A form reset returns here.
     * @defaultValue ""
     */
    defaultValue?: string;
    /**
     * Runs when the code changes: typing or deleting (`"input-change"`), a
     * paste (`"paste"`), the browser's undo and redo, a form reset, or a
     * controller. Autofill and codes from the keyboard's suggestions are
     * `"input-change"`. `details.cancel()` keeps the code as it was.
     */
    onValueChange?: (value: string, details: ChangeDetails<OTPInputValueChangeReason>) => void;
    /**
     * Runs when a change fills every slot, with the whole code, like to verify
     * it. A controller filling it counts, so does a code that changes while full.
     */
    onValueCommit?: (value: string, details: CommitDetails<OTPInputValueChangeReason>) => void;
    /**
     * How many characters the code has, one slot each.
     * @defaultValue 6
     */
    maxLength?: number;
    /**
     * Which characters it accepts: `"digits"`, `"letters"`, `"alphanumeric"`,
     * or a regular expression each character must match, like `/[A-F0-9]/i`.
     * Anything else typed, pasted or dropped is ignored.
     * @defaultValue "digits"
     */
    pattern?: OTPInputPattern;
    /**
     * The keyboard touch screens show.
     * @defaultValue "numeric" for digits, "text" otherwise
     */
    inputMode?: "numeric" | "text" | "decimal" | "tel" | "none";
    /**
     * Where the invisible input keeps its text and caret. It decides where the
     * browser puts its own popups, like the paste menu on phones.
     * `"start"` and `"end"` follow the reading direction.
     * @defaultValue "start"
     */
    textAlign?: "start" | "center" | "end";
    /**
     * The input's `autocomplete`. `"one-time-code"` lets phones offer a code
     * from a message, and password managers fill it.
     * @defaultValue "one-time-code"
     */
    autoComplete?: string;
    /** Disables it like a native input: it can't be focused, and isn't submitted. */
    disabled?: boolean;
    /** Makes it read-only: focusable and submitted, but the code can't change. */
    readOnly?: boolean;
    /** Requires a code before the form submits. A partial code is too short either way. */
    required?: boolean;
    /** The name it submits the code under. */
    name?: string;
    /** The id of a form to belong to, when it isn't inside that form. */
    form?: string;
    /** Reads and writes the code from anywhere. Create one with `createOTPInputController()`. */
    controller?: unknown;
} & PrimitiveOptions;
type State = {
    value: string;
    initial: string;
    maxLength: number;
    pattern: OTPInputPattern;
    inputMode: NonNullable<OTPInputOptions["inputMode"]> | undefined;
    textAlign: NonNullable<OTPInputOptions["textAlign"]>;
    autoComplete: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    formDisabled: boolean;
    tooShort: boolean;
    focused: boolean;
    selection: Selection;
    pushBadge: boolean;
};
declare function settings(options: OTPInputOptions): {
    maxLength: number;
    pattern: OTPInputPattern;
    inputMode: "none" | "text" | "tel" | "numeric" | "decimal" | undefined;
    textAlign: "center" | "end" | "start";
    autoComplete: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare function cleanCode(value: string, pattern: OTPInputPattern, maxLength: number): string;
declare const badgeSpace = 40;
declare function otpInputApiBody(context: PrimitiveContext<OTPInputOptions, State, "root" | "control" | "slot" | "group" | "separator">): {
    /** The code. */
    getValue: () => string;
    /** Sets the code, as typing it would. Characters that don't fit the pattern are dropped. */
    setValue: (value: string, { reason, event }?: OTPInputChangeOptions) => boolean;
    /** Empties the code. */
    clear: ({ reason, event }?: OTPInputChangeOptions) => boolean;
    /** Moves focus to the input. */
    focus: () => void | undefined;
    internal: {
        bind: (el: HTMLInputElement) => () => void;
    };
};
declare const otpInputApi: (...args: Parameters<typeof otpInputApiBody>) => OTPInputApi;
/**
 * `otpInput`'s api, which its slots and controller call. Adapters expose it as `api`.
 * @stable
 */
interface OTPInputApi extends ReturnType<typeof otpInputApiBody> {
}
export { badgeSpace, cleanCode, isDisabled, type OTPInputApi, type OTPInputChangeOptions, type OTPInputOptions, otpInputApi, type OTPInputValueChangeReason, settings, type State, };
