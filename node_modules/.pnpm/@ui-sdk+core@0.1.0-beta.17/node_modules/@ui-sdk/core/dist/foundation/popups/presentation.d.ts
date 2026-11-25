import type { SnapPoint } from "../motion/snap-points.js";
import type { Store } from "../kernel/store.js";
import type { AttachConfig, Popup } from "./popup.js";
import type { Sheet } from "./sheet.js";
import type { createDismissal } from "./dismissal.js";
/** How a popup can present. `"auto"` picks the sheet on small touch screens. */
type PresentationSetting<Default extends string> = "auto" | Default | "sheet";
/** What a popup tells the sheet it presents as, beside its popup config. */
type SheetConfig = AttachConfig & {
    /** Where the sheet can rest. Defaults to its own size. */
    snapPoints?: readonly SnapPoint[];
    /** Whether a swipe can dismiss it. Defaults to true. */
    dismissible?: () => boolean;
    /** A swipe tried to dismiss it while `dismissible` is false. */
    onDismissAttempt?: (event?: Event) => void;
    /** Hears the sheet once it's attached, and undefined once it's gone, for a popup that moves it. */
    onSheet?: (sheet: Sheet | undefined) => void;
    /**
     * For a popup inside a sheet, like a submenu: shows it in place of the
     * popup it's in, which keeps only the way to it. Returns that popup's
     * content and the trigger that stays above this one.
     */
    drillIn?: () => (HTMLElement | undefined)[];
};
/**
 * A popup's presentation, kept in its state as `presentation`. Call `open()`
 * as it opens, from `createPopupLayer`'s `onOpenChange`, and `bind()` from the
 * content's `bind` in place of `popup.bind`.
 */
declare function createPresentation<Default extends string>(store: Store<{
    open: boolean;
    presentation: Default | "sheet";
}>, layer: () => Popup, setting: () => PresentationSetting<Default> | undefined, fallback: Default, dismissal?: Pick<ReturnType<typeof createDismissal>, "sheet">): {
    open: () => void;
    /** How it would present if it opened now. */
    resolve: () => "sheet" | Default;
    bind(el: HTMLElement, config: SheetConfig): () => void;
};
/**
 * The `modal` setting a popup uses: the app's, else modal while it presents
 * as a sheet, like iOS's sheets, else the component's default.
 */
declare const sheetModal: <Setting>(presentation: string, setting: Setting | undefined, fallback: Setting) => true | Setting;
/** Where a list with an input rests as a sheet: at most half the screen, and its full size once someone types. */
declare const sheetSnapPoints: SnapPoint[];
/**
 * A text input that opens a popup that may present as a sheet, like a
 * combobox's, which moves into the sheet's header while it's open. A tap on
 * it that opens a sheet doesn't focus it, so no keyboard opens and focus goes
 * to the sheet. Tapping it inside the sheet grows the sheet (see
 * `sheet-presentation.ts`). Call from the input's `bind`.
 */
declare function bindSheetInput(el: HTMLElement, link: {
    store: Store<{
        open: boolean;
        presentation: string;
    }>;
    presentation: Pick<ReturnType<typeof createPresentation>, "resolve">;
    open: (event: Event) => void;
}): () => void;
export { bindSheetInput, createPresentation, type PresentationSetting, type SheetConfig, sheetModal, sheetSnapPoints, };
