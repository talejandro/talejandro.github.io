/**
 * Where a page lines up in the viewport.
 * @stable
 */
type CarouselAlign = "start" | "center" | "end";
/**
 * How many slides one page holds, or `"auto"` for as many as fit.
 * @stable
 */
type CarouselSlidesPerPage = number | "auto";
/** A slide's place along the axis, from the start of the scrollable area. */
type CarouselSlideBox = {
    start: number;
    size: number;
};
/** What the layout is measured from. */
type CarouselGeometry = {
    slides: readonly CarouselSlideBox[];
    /** The viewport's size along the axis, less its scroll padding: where pages line up. */
    snapport: number;
    /** The viewport's scroll padding at the start edge. */
    paddingStart: number;
    /** The largest scroll position. */
    maxScroll: number;
};
/** One page: the slides that scroll in together, and where it rests. */
type CarouselPage = {
    /** Indexes of the slides it holds, in order. */
    slides: number[];
    /** The scroll position it rests at. */
    position: number;
    /** The slide the browser snaps to for this page. */
    leader: number;
    /** The leader's scroll margin at the start edge, which lines the page up by `align`. */
    margin: number;
};
/** Groups slides into pages: `count` at a time, or with `"auto"`, as many as fit in the snapport. */
declare function groupSlides(slides: readonly CarouselSlideBox[], snapport: number, count: CarouselSlidesPerPage): number[][];
/**
 * The carousel's pages. Each rests where the browser would snap its leader,
 * clamped to the scroll range, and pages that would rest at the same place
 * merge into one, so five slides three to a view make three pages.
 */
declare function carouselPages(geometry: CarouselGeometry, options: {
    align: CarouselAlign;
    slidesPerPage: CarouselSlidesPerPage;
}): CarouselPage[];
/**
 * A looping carousel's slides, wherever its rotation puts them: their sizes
 * in their own order, the gap between neighbors, and where the slide shown
 * first starts. The track wraps, so the last slide's neighbor is the first.
 */
type CarouselTrack = {
    sizes: number[];
    gap: number;
    start: number;
};
/** Where a looping carousel puts its pages, besides its track. */
type CarouselLoopView = {
    snapport: number;
    paddingStart: number;
    maxScroll: number;
    align: CarouselAlign;
    slidesPerPage: CarouselSlidesPerPage;
};
/**
 * Reads a looping track from slides measured with slide `first` shown first.
 * Returns null unless the slides sit in that rotation with even gaps, as when
 * the content doesn't lay out by CSS `order`; the carousel rewinds instead.
 */
declare function measureTrack(slides: readonly CarouselSlideBox[], first: number): CarouselTrack | null;
/** Where each slide sits when the track shows slide `first` first. */
declare function placeSlides(track: CarouselTrack, first: number): CarouselSlideBox[];
/**
 * Whether a track is long enough to loop seamlessly: the scroll range holds a
 * page's step to either side of the current page. Two slides one to a view
 * don't, and the carousel rewinds instead.
 */
declare function canLoop(track: CarouselTrack, view: CarouselLoopView): boolean;
/**
 * A looping carousel's pages with slide `first` shown first, which leads a
 * page, so no page splits where the track wraps. Positions aren't clamped or
 * merged: a loop has no ends, and pages far from the current one may lie
 * past the scroll range until the track rotates again.
 */
declare function loopPages(track: CarouselTrack, view: CarouselLoopView, first: number): {
    slides: number[];
    position: number;
    leader: number;
    margin: number;
}[];
/**
 * Picks the slide a looping carousel shows first, among the pages' leaders,
 * so the slides showing at scroll position `at` keep the most room on both
 * sides, and with `to`, the page it heads for rests within the scroll range
 * the way it's heading. Returns that slide and how far the scroll position
 * moves to keep the same slides in view, or null when no rotation fits.
 * The current rotation wins ties, and with `lazy`, wins whenever it fits.
 */
declare function loopRotation(track: CarouselTrack, view: CarouselLoopView, at: {
    position: number;
    first: number;
}, to?: {
    page: number;
    heading: 1 | -1;
}, { lazy }?: {
    lazy?: boolean | undefined;
}): {
    first: number;
    delta: number;
} | null;
/** The index of the page resting nearest `position`, or -1 without pages. */
declare function nearestPage(pages: readonly {
    position: number;
}[], position: number): number;
/**
 * Whether a slide counts as in view at `position`: at least half of it shows,
 * or, for a slide larger than the viewport, it fills at least half of it.
 */
declare function isSlideInView(slide: CarouselSlideBox, position: number, viewport: number): boolean;
/** The page after or before `page` (from 1), wrapping with `loop`. Returns `page` at an end. */
declare function stepPage(page: number, by: 1 | -1, count: number, loop: boolean): number;
export { canLoop, type CarouselAlign, type CarouselGeometry, type CarouselLoopView, type CarouselPage, carouselPages, type CarouselSlideBox, type CarouselSlidesPerPage, type CarouselTrack, groupSlides, isSlideInView, loopPages, loopRotation, measureTrack, nearestPage, placeSlides, stepPage, };
