import { type FileLike, type FileRejection } from "../../foundation/forms/files.js";
import { isDisabled } from "../../foundation/forms/form.js";
import type { FileInputDropzoneProps, FileInputChangeOptions, FileInputOptions, FileInputValueChangeReason } from "./file-input.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
type DragStatus = "accept" | "reject";
type State = {
    value: readonly File[];
    initial: readonly File[];
    disabled: boolean;
    formDisabled: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    accept: string | undefined;
    multiple: boolean;
    directory: boolean;
    capture: true | "user" | "environment" | undefined;
    associated: boolean;
    drags: Readonly<Record<string, DragStatus>>;
    activeItem: string | null;
};
declare function settings(options: FileInputOptions): {
    disabled: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    accept: string | undefined;
    multiple: boolean;
    directory: boolean;
    capture: true | "user" | "environment" | undefined;
};
/** A key for a file that stays the same while the file lives, for lists keyed by file. */
declare function fileKey(file: object): string;
/**
 * What a file input announces after a change, like "2 files accepted. 1 file
 * rejected." or "photo.png removed." Null when there's nothing to say.
 */
declare function describeChange(details: {
    reason: string;
    added: readonly FileLike[];
    removed: readonly FileLike[];
    rejected: readonly FileRejection<FileLike>[];
}): string | null;
declare function fileInputApiBody(context: PrimitiveContext<FileInputOptions, State, "root" | "input" | "trigger" | "dropzone" | "item">): {
    getValue: () => readonly File[];
    setValue: (files: readonly File[], { reason, event }?: FileInputChangeOptions) => boolean;
    addFiles(files: readonly File[] | FileList, { reason, event }?: FileInputChangeOptions): boolean;
    removeFile: (file: File, { reason, event }?: FileInputChangeOptions) => boolean;
    clear: ({ reason, event }?: FileInputChangeOptions) => boolean;
    open(): boolean;
    focus: () => void | undefined;
    isDragging: () => boolean;
    internal: {
        keyOf: (value: unknown) => string;
        receive: (files: readonly File[], reason: FileInputValueChangeReason, event?: Event) => boolean;
        removeItem: (file: File, event?: MouseEvent | KeyboardEvent) => void;
        itemKeydown: (event: KeyboardEvent, el: HTMLElement, file: File) => void;
        setActiveItem(key: string): void;
        setDrag(key: string, status: DragStatus | null): void;
        rules: () => {
            accept: string | readonly string[] | undefined;
            multiple: boolean;
            maxFiles: number | undefined;
            maxSize: number | undefined;
            minSize: number | undefined;
            validate: ((file: File, batch: {
                accepted: readonly File[];
            }) => string | null | undefined | void) | undefined;
        };
        dropzoneProps(key: string): FileInputDropzoneProps;
        reset(): void;
        setFormDisabled(formDisabled: boolean): void;
        bindInput(el: HTMLInputElement): () => void;
        bindRoot(el: HTMLElement): () => void;
    };
};
declare const fileInputApi: (...args: Parameters<typeof fileInputApiBody>) => FileInputApi;
/**
 * `fileInput`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface FileInputApi extends ReturnType<typeof fileInputApiBody> {
}
export { describeChange, type DragStatus, type FileInputApi, fileInputApi, fileKey, isDisabled, settings, type State, };
