/**
 * Dims every theme-color meta tag toward black by `dim × alpha`, where `alpha`
 * is how dark the backdrop gets. Pages without one are left alone, since
 * adding one would change their colors. Returns a writer and a restore.
 */
declare function dimThemeColor(doc: Document, alpha: number): {
    write: (dim: number) => void;
    restore: () => void;
};
export { dimThemeColor };
