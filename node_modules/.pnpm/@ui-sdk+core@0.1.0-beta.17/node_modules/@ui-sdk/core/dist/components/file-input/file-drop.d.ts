/** Whether a drag carries files from outside the page, rather than text or an element dragged within it. */
declare function carriesFiles(event: DragEvent): boolean;
/** The MIME types of the files a drag carries, which is all a drag reveals before the drop. */
declare function draggedTypes(dataTransfer: DataTransfer | null): string[];
/** The files a paste carries, like a screenshot. Empty for text. */
declare function pastedFiles(event: ClipboardEvent): File[];
type DroppedEntry = {
    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
    file?: (resolve: (file: File) => void, reject: (error: unknown) => void) => void;
    createReader?: () => {
        readEntries: (resolve: (entries: DroppedEntry[]) => void, reject: (error: unknown) => void) => void;
    };
};
/**
 * Reads files from dropped entries, walking into folders, up to `limit`
 * files. A folder's reader returns its entries in batches (100 at a time in
 * Chromium), so it's read until it returns none. Each file remembers its path
 * inside the folder, for `relativePath()`.
 */
declare function readEntries(entries: readonly DroppedEntry[], limit?: number): Promise<File[]>;
/**
 * The files a drop carries. Without folders, that's the files themselves,
 * right away. With folders, a promise of every file inside them. Entries are
 * only readable during the drop event, so call this from its listener.
 */
declare function droppedFiles(dataTransfer: DataTransfer): File[] | Promise<File[]>;
/** Marks a drag or paste event as handled by a drop zone. */
declare function claim(event: Event): void;
/** Whether a drop zone already handled the event. */
declare function isClaimed(event: Event): boolean;
declare function isFileInput(target: EventTarget | null): boolean;
/**
 * While any drop zone is on the page, a file dropped anywhere else does
 * nothing, instead of the browser opening it and leaving the page. Also tells
 * page drags from file drags. Reference-counted: returns a release.
 */
declare function guardFileDrops(): () => void;
/**
 * Tracks whether a drag is over an element without flickering as it crosses
 * the element's children: `dragenter` on a child comes before `dragleave` on
 * the one it left, so the set of entered nodes empties only when the drag
 * leaves for good. Safari reports no `relatedTarget` on drag events, which
 * rules that approach out.
 */
declare function createDragTracker(onChange: (over: boolean) => void): {
    enter(event: DragEvent): void;
    leave(event: DragEvent): void;
    reset(): void;
};
export { carriesFiles, claim, createDragTracker, draggedTypes, type DroppedEntry, droppedFiles, guardFileDrops, isClaimed, isFileInput, pastedFiles, readEntries, };
