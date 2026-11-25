import type { TokenInputApi } from "./token-input-api.js";
import type { TokenView } from "./token-input-view.js";
declare function bindTokenEditing(el: HTMLElement, view: TokenView, api: TokenInputApi): () => void;
export { bindTokenEditing };
