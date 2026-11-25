declare function imageStatus(img: Pick<HTMLImageElement, "complete" | "naturalWidth">, hasSource: boolean): "error" | "loading" | "loaded";
export { imageStatus };
