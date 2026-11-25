/**
 * How urgently a screen reader reads an announcement: `"polite"` waits for a pause, `"assertive"` interrupts.
 * @stable
 */
type AnnouncePriority = "polite" | "assertive";
/**
 * Replaces how text is announced, like in unit tests, which run without a
 * document. Undefined goes back to the live regions.
 */
declare function setAnnouncer(announce: ((text: string, priority: AnnouncePriority) => void) | undefined): void;
/**
 * Creates both live regions ahead of time, so the first announcement isn't
 * missed by screen readers that only notice regions present before a change.
 * @stable
 */
declare function prepareAnnouncements(doc: Document): void;
/**
 * Has screen readers read `text` once they're idle, or at once with
 * `priority: "assertive"`. The same text twice is read twice.
 * @stable
 */
declare function announce(text: string, { priority, doc, }?: {
    priority?: AnnouncePriority;
    doc?: Document;
}): void;
export { announce, type AnnouncePriority, prepareAnnouncements, setAnnouncer };
