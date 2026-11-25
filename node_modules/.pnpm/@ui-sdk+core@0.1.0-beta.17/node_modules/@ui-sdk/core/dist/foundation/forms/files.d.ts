/**
 * What the file checks read: a browser `File`, or any object with its name, type and size.
 * @stable
 */
type FileLike = {
    /** The file name, with its extension. */
    name: string;
    /** The MIME type, like `"image/png"`. Empty when the platform doesn't know it. */
    type: string;
    /** The size in bytes. */
    size: number;
};
/**
 * Why a file was rejected.
 * @stable
 */
type FileRejectionReason = 
/** It matches nothing in `accept`. */
"file-type"
/** It's bigger than `maxSize`. */
 | "file-too-large"
/** It's smaller than `minSize`. */
 | "file-too-small"
/** More files came than `maxFiles` allows, or more than one without `multiple`. */
 | "too-many-files";
/**
 * A file that didn't pass the checks, with every reason it failed.
 * @stable
 */
type FileRejection<F extends FileLike = File> = {
    /** The file that failed. It never joins the value. */
    file: F;
    /**
     * Every reason, in the order they're checked: type, size, your `validate`,
     * then the count. A string from `validate` is its own reason.
     */
    reasons: (FileRejectionReason | (string & {}))[];
};
/**
 * The checks a FileInput runs on every file it receives.
 * @stable
 */
type FileRules<F extends FileLike = File> = {
    /**
     * The files to accept, like the `accept` attribute: MIME types (`"image/png"`),
     * wildcards (`"image/*"`) and extensions (`".pdf"`), in a comma-separated
     * string or an array. Without it, any file.
     */
    accept?: string | readonly string[];
    /** Accepts more than one file at a time. Without it, the first file is accepted and the rest are rejected. */
    multiple?: boolean;
    /** The most files accepted at a time. The first ones that pass the other checks are accepted, and the rest are rejected. */
    maxFiles?: number;
    /** The largest size accepted, in bytes. */
    maxSize?: number;
    /** The smallest size accepted, in bytes. */
    minSize?: number;
    /**
     * A check of your own. Return a reason, like `"duplicate"`, to reject the
     * file, or nothing to accept it. `accepted` holds the files of the same
     * choice, drop or paste accepted before this one.
     */
    validate?: (file: F, batch: {
        accepted: readonly F[];
    }) => string | null | undefined | void;
};
/** The tokens of an `accept` list: lowercase, trimmed, without empty ones. */
declare function parseAccept(accept: string | readonly string[] | undefined): string[];
/**
 * Whether a file matches an `accept` list. Extensions match the name, so a
 * `.csv` that Windows reports as `application/vnd.ms-excel`, or a file the
 * platform has no MIME type for, still matches `".csv"`.
 */
declare function acceptsFile(file: FileLike, tokens: readonly string[]): boolean;
/**
 * Whether a dragged item's MIME type matches, before the drop. Names aren't
 * readable during a drag, so an extension matches through the types it
 * usually arrives with. It's `undefined` when only an extension we don't know
 * could tell, or when the platform reports no type. Callers treat that as accepted.
 */
declare function acceptsType(type: string, tokens: readonly string[]): boolean | undefined;
/**
 * Splits files into the accepted ones and the rejected ones, with every reason
 * each failed. Files keep their order. When there are too many, the first ones
 * that pass the other checks are accepted.
 */
declare function validateFiles<F extends FileLike>(files: readonly F[], rules: FileRules<F>): {
    accepted: F[];
    rejected: FileRejection<F>[];
};
/**
 * Whether dragged items look acceptable, from what a drag exposes: their MIME
 * types and their count. `"reject"` when one has a type `accept` rules out or
 * there are too many; otherwise `"accept"`, since names and sizes are only
 * known after the drop.
 */
declare function dragStatus(types: readonly string[], rules: Pick<FileRules<FileLike>, "accept" | "multiple" | "maxFiles">): "accept" | "reject";
/**
 * A file size for people, in the locale: 1536 bytes reads "1.5 kB".
 * @stable
 */
declare function formatFileSize(bytes: number, locale?: string): string;
declare function setRelativePath(file: object, path: string): void;
/**
 * Where a file sat inside the folder it came from, like `"photos/2026/a.jpg"`,
 * for files from a dropped folder or a `directory` picker. Just the name otherwise.
 * @stable
 */
declare function relativePath(file: FileLike): string;
export { acceptsFile, acceptsType, dragStatus, type FileLike, type FileRejection, type FileRejectionReason, type FileRules, formatFileSize, parseAccept, relativePath, setRelativePath, validateFiles, };
