import type { EditorChange, TextEditorAdapter } from "../../foundation/text/text-editor.js";
import type { TriggerArgument, TriggerMenuDataItem, TriggerMenuOpenChangeReason, TriggerMenuQueryChangeReason } from "./trigger-menu.js";
import { type TriggerMatch, type TriggerRule } from "./trigger-match.js";
/** One level of a match. */
type TriggerLevel = {
    rule: number;
    match: TriggerMatch;
    queryStart: number;
    item?: TriggerMenuDataItem<unknown>;
    starts: number[];
    values: Record<string, string>;
    continued?: boolean;
};
declare const argumentOf: (level: TriggerLevel | null) => TriggerArgument | undefined;
declare function createTriggerLevels({ editor, rules, isWriting, apply, close, }: {
    editor: () => TextEditorAdapter | undefined;
    rules: () => readonly TriggerRule[];
    isWriting: () => boolean;
    apply: (level: TriggerLevel, query: string, reason: TriggerMenuQueryChangeReason, open: TriggerMenuOpenChangeReason, event?: Event) => void;
    close: (reason: TriggerMenuOpenChangeReason, event?: Event) => void;
}): {
    current: () => TriggerLevel | null;
    caret: () => number | null;
    textFrom: (start: number) => string | null;
    matchAtCaret: () => {
        rule: number;
        match: {
            trigger: string;
            start: number;
            end: number;
            query: string;
        };
    } | null;
    enter: (level: TriggerLevel, query: string, reason: TriggerMenuQueryChangeReason, open: TriggerMenuOpenChangeReason, event?: Event) => void;
    end: (reason: TriggerMenuOpenChangeReason, event?: Event, { dismiss }?: {
        dismiss?: boolean | undefined;
    }) => void;
    reopen: (reason: TriggerMenuOpenChangeReason, event?: Event) => boolean;
    onEditorChange(change: EditorChange): void;
};
type TriggerLevels = ReturnType<typeof createTriggerLevels>;
export { argumentOf, createTriggerLevels, type TriggerLevel, type TriggerLevels, };
