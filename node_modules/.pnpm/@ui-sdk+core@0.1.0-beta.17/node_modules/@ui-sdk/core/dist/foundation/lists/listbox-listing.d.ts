import { type Listbox } from "./listbox-engine.js";
import { type Store } from "../kernel/store.js";
/** Each option's entry, by key, from `Listbox.listing`. */
type Listing = Readonly<Record<string, string>>;
declare const noListing: Listing;
declare function keepListing<State extends {
    listing: Listing;
}>(store: Store<State>, listbox: Listbox, selection?: {
    entry: (key: string, value: unknown) => string;
    inputs: () => readonly unknown[];
}): void;
export { keepListing, type Listing, noListing };
