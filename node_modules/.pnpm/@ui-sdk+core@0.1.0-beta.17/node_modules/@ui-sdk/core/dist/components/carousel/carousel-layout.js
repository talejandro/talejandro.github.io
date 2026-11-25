// src/components/carousel/carousel-layout.ts
import { clamp } from "../../foundation/number/steps.js";
var mergeDistance = 1;
function groupSlides(slides, snapport, count) {
  const groups = [];
  if (count !== "auto") {
    const size = Math.max(1, Math.floor(count));
    for (let index = 0; index < slides.length; index += size) {
      groups.push(
        slides.slice(index, index + size).map((_, offset) => index + offset)
      );
    }
    return groups;
  }
  for (let index = 0; index < slides.length; index++) {
    const group = groups[groups.length - 1];
    const first = group && slides[group[0]];
    const end = slides[index].start + slides[index].size;
    if (first && end - first.start <= snapport + 0.5) {
      group.push(index);
    } else {
      groups.push([index]);
    }
  }
  return groups;
}
function alignOffset(align, snapport, size) {
  if (align === "start") {
    return 0;
  }
  return align === "center" ? (snapport - size) / 2 : snapport - size;
}
function carouselPages(geometry, options) {
  const { slides, snapport, paddingStart, maxScroll } = geometry;
  const pages = [];
  for (const group of groupSlides(slides, snapport, options.slidesPerPage)) {
    const first = slides[group[0]];
    const last = slides[group[group.length - 1]];
    const margin = alignOffset(
      options.align,
      snapport,
      last.start + last.size - first.start
    );
    const position = clamp(first.start - margin - paddingStart, 0, maxScroll);
    const previous = pages[pages.length - 1];
    if (previous && Math.abs(position - previous.position) < mergeDistance) {
      previous.slides.push(...group);
      continue;
    }
    pages.push({ slides: [...group], position, leader: group[0], margin });
  }
  return pages;
}
function measureTrack(slides, first) {
  if (slides.length < 2 || !slides[first]) {
    return null;
  }
  const lead = slides[first];
  const next = slides[(first + 1) % slides.length];
  const track = {
    sizes: slides.map((slide) => slide.size),
    gap: next.start - lead.start - lead.size,
    start: lead.start
  };
  const placed = placeSlides(track, first);
  return placed.every(
    (box, index) => Math.abs(box.start - slides[index].start) < 1
  ) ? track : null;
}
function placeSlides(track, first) {
  const count = track.sizes.length;
  const boxes = new Array(count);
  let at = track.start;
  for (let step = 0; step < count; step++) {
    const index = (first + step) % count;
    boxes[index] = { start: at, size: track.sizes[index] };
    at += track.sizes[index] + track.gap;
  }
  return boxes;
}
function loopGroups(track, view) {
  return groupSlides(placeSlides(track, 0), view.snapport, view.slidesPerPage);
}
function loopPage(boxes, group, view) {
  const first = boxes[group[0]];
  const last = boxes[group[group.length - 1]];
  const margin = alignOffset(
    view.align,
    view.snapport,
    last.start + last.size - first.start
  );
  return {
    slides: [...group],
    position: first.start - margin - view.paddingStart,
    leader: group[0],
    margin
  };
}
function canLoop(track, view) {
  const groups = loopGroups(track, view);
  if (groups.length < 2) {
    return false;
  }
  const boxes = placeSlides(track, 0);
  const length = track.sizes.reduce((sum, size) => sum + size + track.gap, 0);
  let step = 0;
  groups.forEach((group, index) => {
    const next = groups[(index + 1) % groups.length];
    step = Math.max(
      step,
      (boxes[next[0]].start - boxes[group[0]].start + length) % length
    );
  });
  return view.maxScroll >= 2 * step - 1;
}
function loopPages(track, view, first) {
  const boxes = placeSlides(track, first);
  return loopGroups(track, view).map((group) => loopPage(boxes, group, view));
}
function loopRotation(track, view, at, to, { lazy = false } = {}) {
  const groups = loopGroups(track, view);
  const now = placeSlides(track, at.first);
  const edge = at.position + view.paddingStart;
  let anchor = at.first;
  now.forEach((box, index) => {
    if (box.start <= edge + 0.5 && box.start > now[anchor].start) {
      anchor = index;
    }
  });
  const leaders = groups.map((group) => group[0]);
  if (leaders.includes(at.first)) {
    leaders.unshift(at.first);
  }
  let best = null;
  for (const first of leaders) {
    const boxes = first === at.first ? now : placeSlides(track, first);
    const delta = boxes[anchor].start - now[anchor].start;
    const position = at.position + delta;
    let room = Math.min(position, view.maxScroll - position);
    if (to) {
      const target = loopPage(boxes, groups[to.page], view).position;
      if ((target - position) * to.heading < -0.5) {
        continue;
      }
      room = Math.min(room, target, view.maxScroll - target);
    }
    if (room < -0.5) {
      continue;
    }
    if (!best || room > best.room + 0.5) {
      best = { first, delta, room };
    }
    if (lazy && first === at.first) {
      break;
    }
  }
  return best && { first: best.first, delta: best.delta };
}
function nearestPage(pages, position) {
  let best = -1;
  for (let index = 0; index < pages.length; index++) {
    if (best === -1 || Math.abs(pages[index].position - position) < Math.abs(pages[best].position - position)) {
      best = index;
    }
  }
  return best;
}
function isSlideInView(slide, position, viewport) {
  const shown = Math.min(slide.start + slide.size, position + viewport) - Math.max(slide.start, position);
  return shown >= Math.min(slide.size, viewport) / 2 - 0.5;
}
function stepPage(page, by, count, loop) {
  const next = page + by;
  if (next >= 1 && next <= count) {
    return next;
  }
  if (!loop || count < 2) {
    return page;
  }
  return next < 1 ? count : 1;
}
export {
  canLoop,
  carouselPages,
  groupSlides,
  isSlideInView,
  loopPages,
  loopRotation,
  measureTrack,
  nearestPage,
  placeSlides,
  stepPage
};
