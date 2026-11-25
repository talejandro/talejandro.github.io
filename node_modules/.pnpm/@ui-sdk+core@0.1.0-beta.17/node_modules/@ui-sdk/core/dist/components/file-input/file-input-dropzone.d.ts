import type { FileInputDropzoneProps } from "./file-input.js";
import { type FileInputApi, type State } from "./file-input-api.js";
import type { Store } from "../../foundation/kernel/store.js";
/**
 * Binds a drop zone. Its props are read when each event happens, so a new
 * `target` or `pasteTarget` applies without binding again.
 */
declare function bindDropzone(el: HTMLElement, { key, store, api, props, }: {
    key: string;
    store: Store<State>;
    api: FileInputApi;
    props: () => FileInputDropzoneProps;
}): () => void;
export { bindDropzone };
