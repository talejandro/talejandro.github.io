// src/foundation/lists/listbox-listing.ts
import "./listbox-engine.js";
import { deriveState } from "../kernel/derive.js";
import { sameValue } from "../kernel/store.js";
var noListing = {};
function keepListing(store, listbox, selection) {
  let last;
  deriveState(
    { store },
    ["listing"],
    (state) => {
      const inputs = [
        ...listbox.listingInputs(),
        ...selection?.inputs() ?? []
      ];
      if (!last || !sameValue(inputs, last.inputs)) {
        const next = listbox.listing(selection?.entry);
        last = {
          inputs,
          listing: sameEntries(state.listing, next) ? state.listing : next
        };
      }
      return { listing: last.listing };
    },
    { live: false }
  );
}
function sameEntries(a, b) {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (typeof a[key] !== "string") {
      return false;
    }
  }
  return true;
}
export {
  keepListing,
  noListing
};
