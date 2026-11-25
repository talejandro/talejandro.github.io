// src/testing/composite.ts
import { accessibleName, describe, roleOf, tabStops } from "./aria.js";
import { stopped } from "./pattern-context.js";
import { isDisabledElement } from "../foundation/forms/form.js";
function currentItem(context, composite) {
  const active = context.doc.activeElement;
  const items = composite.items();
  const descendant = active?.getAttribute("aria-activedescendant");
  if (descendant) {
    return items.find((item) => item.id === descendant);
  }
  if (!active) {
    return void 0;
  }
  return items.find((item) => item === active) ?? items.filter((item) => item.contains(active)).at(-1);
}
function scan(items, start, step) {
  const passed = [];
  for (let index = start; index >= 0 && index < items.length; index += step) {
    passed.push(items[index]);
    if (!isDisabledElement(items[index])) {
      return { passed, reached: true };
    }
  }
  return { passed, reached: false };
}
function stepTargets(items, index, forward, wraps) {
  const step = forward ? 1 : -1;
  const ahead = scan(items, index + step, step);
  if (ahead.reached) {
    return ahead.passed;
  }
  const around = scan(items, forward ? 0 : items.length - 1, step).passed;
  const stays = [items[index], ...ahead.passed];
  if (wraps === true) {
    return [...ahead.passed, ...around];
  }
  if (wraps === false) {
    return stays;
  }
  return [...stays, ...around];
}
function checkTabStop(context, composite, required = true) {
  const { container, noun, source } = composite;
  const stops = tabStops(container);
  if (stops.length > 1) {
    context.problem(
      container,
      `has ${stops.length} tab stops (${stops.map(describe).join(", ")}); a composite has one, and arrows move within it (APG ${source}).`
    );
  } else if (!stops.length && required) {
    context.problem(
      container,
      `has no tab stop; one ${noun} takes Tab, or the ${roleOf(container)} itself with aria-activedescendant (APG ${source}).`
    );
  } else if (stops.length === 1 && container.hasAttribute("aria-activedescendant") && stops[0] !== container) {
    context.problem(
      stops[0],
      `takes Tab, but with aria-activedescendant the ${roleOf(container)} itself is the tab stop (APG ${source}).`
    );
  }
}
async function enter(context, composite) {
  const stop = tabStops(composite.container)[0] ?? composite.items().find((item) => !isDisabledElement(item));
  if (!stop) {
    throw stopped;
  }
  await context.focus(stop);
  return currentItem(context, composite);
}
async function expectMove(context, composite, key, allowed, expected) {
  const from = currentItem(context, composite);
  await context.press(key);
  const to = currentItem(context, composite);
  if (to && allowed.includes(to)) {
    return to;
  }
  const outcome = !to ? `focus went to ${describe(context.doc.activeElement)}, outside the ${composite.noun}s` : to === from ? "focus stayed" : `focus went to ${describe(to)}`;
  context.problem(
    from ?? composite.container,
    `${key} should move focus to ${expected}, ${describe(allowed[0])}, but ${outcome} (APG ${composite.source}).`
  );
  if (!to) {
    throw stopped;
  }
  return to;
}
async function expectStep(context, composite, key, forward, wraps) {
  const items = composite.items();
  const from = currentItem(context, composite);
  const index = from ? items.indexOf(from) : -1;
  const allowed = index < 0 ? scan(items, 0, 1).passed : stepTargets(items, index, forward, wraps);
  const atEnd = index >= 0 && !scan(items, index + (forward ? 1 : -1), forward ? 1 : -1).reached;
  const expected = index < 0 ? `the first ${composite.noun}` : `the ${forward ? "next" : "previous"} ${composite.noun}`;
  return expectMove(
    context,
    composite,
    key,
    allowed,
    atEnd && wraps ? `${expected}, wrapping around` : expected
  );
}
async function checkNavigation(context, composite, moves) {
  const start = currentItem(context, composite);
  const items = composite.items();
  if (items.length < 2) {
    return start;
  }
  const step = async (key, forward) => {
    const to = await expectStep(context, composite, key, forward, moves.wraps);
    moves.onMove?.(key, to);
  };
  const jump = async (key) => {
    const all = composite.items();
    const allowed = key === "Home" ? scan(all, 0, 1).passed : scan(all, all.length - 1, -1).passed;
    const to = await expectMove(
      context,
      composite,
      key,
      allowed,
      `the ${key === "Home" ? "first" : "last"} ${composite.noun}`
    );
    moves.onMove?.(key, to);
  };
  if (moves.homeEnd) {
    await jump("Home");
  }
  for (const key of moves.next) {
    await step(key, true);
  }
  for (const key of moves.previous) {
    await step(key, false);
  }
  if (moves.homeEnd) {
    await jump("End");
  } else {
    for (let guard = items.length; guard > 0; guard--) {
      const all = composite.items();
      const index = all.indexOf(currentItem(context, composite));
      if (!scan(all, index + 1, 1).reached) {
        break;
      }
      await step(moves.next[0], true);
    }
  }
  await step(moves.next[0], true);
  await step(moves.previous[0], false);
  return start;
}
async function returnTo(context, composite, target, arrows) {
  if (!target) {
    return;
  }
  for (let guard = composite.items().length * 2; guard > 0; guard--) {
    const items = composite.items();
    const current = currentItem(context, composite);
    if (!current || current === target || !items.includes(target)) {
      return;
    }
    await context.press(
      items.indexOf(target) > items.indexOf(current) ? arrows.next : arrows.previous
    );
  }
}
var initialOf = (el) => accessibleName(el).charAt(0).toLowerCase();
async function checkTypeahead(context, composite, arrows) {
  const items = composite.items();
  const unique = items.filter(
    (item) => !isDisabledElement(item) && /^[a-z0-9]$/.test(initialOf(item)) && items.filter((other) => initialOf(other) === initialOf(item)).length === 1
  );
  const index = items.indexOf(currentItem(context, composite));
  if (unique.length === 1 && unique[0] === items[index]) {
    await context.press(
      index < items.length - 1 ? arrows.next : arrows.previous
    );
  }
  const from = currentItem(context, composite);
  const target = unique.find((item) => item !== from);
  if (!target) {
    return;
  }
  const letter = initialOf(target);
  await context.press(letter);
  if (currentItem(context, composite) === target) {
    return;
  }
  context.problem(
    from ?? composite.container,
    `typing "${letter}" should move focus to ${describe(target)}, the ${composite.noun} whose name starts with it (APG ${composite.source}: type-ahead).`
  );
}
export {
  checkNavigation,
  checkTabStop,
  checkTypeahead,
  currentItem,
  enter,
  expectStep,
  returnTo
};
