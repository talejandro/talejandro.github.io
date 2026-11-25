/**
 * How well `text` matches `query`, from 0 (no match) to 1 (the same text), ignoring case and accents.
 * @stable
 */
declare function fuzzyScore(text: string, query: string): number;
/**
 * A filter that keeps items with the query's letters in order, scored by
 * `fuzzyScore` over the label and keywords. Keywords count a little less than
 * the label, so a label match wins a tie.
 */
declare function fuzzyFilter(item: {
    label: string;
    keywords?: string[];
}, query: string): number;
export { fuzzyFilter, fuzzyScore };
