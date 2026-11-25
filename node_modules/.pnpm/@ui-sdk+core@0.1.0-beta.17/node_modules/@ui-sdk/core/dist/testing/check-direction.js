// src/testing/check-direction.ts
import { mount } from "./mount.js";
function outcome(view, dir) {
  const focused = document.activeElement;
  const slot = focused?.getAttribute("data-slot") ?? "";
  const key = focused?.getAttribute("data-value") ?? focused?.textContent?.trim() ?? "";
  const mirrored = { left: "right", right: "left" };
  const state = JSON.stringify(
    view.state,
    (name, value) => name === "id" ? void 0 : typeof value !== "string" ? value : dir === "rtl" && (name === "direction" || name === "side") && value in mirrored ? mirrored[value] : value.replace(/^mount-\d+/, "mount")
  );
  return { focus: `${slot} ${key}`, state };
}
async function press(primitive, options, markup, dir, key) {
  const html = document.documentElement;
  const before = html.getAttribute("dir");
  html.setAttribute("dir", dir);
  try {
    const view = mount(primitive, options, markup);
    try {
      await view.keys("Tab");
      const start = outcome(view, dir);
      await view.keys(key);
      return { start, end: outcome(view, dir) };
    } finally {
      view.unmount();
    }
  } finally {
    if (before === null) {
      html.removeAttribute("dir");
    } else {
      html.setAttribute("dir", before);
    }
  }
}
var running = Promise.resolve();
function checkDirection(primitive, options, markup) {
  const check = running.then(
    () => compareDirections(primitive, options, markup)
  );
  running = check.catch(() => {
  });
  return check;
}
async function compareDirections(primitive, options, markup) {
  const problems = [];
  for (const [forward, mirrored] of [
    ["ArrowRight", "ArrowLeft"],
    ["ArrowLeft", "ArrowRight"]
  ]) {
    const ltr = await press(primitive, options, markup, "ltr", forward);
    const rtl = await press(primitive, options, markup, "rtl", mirrored);
    const moved = ltr.end.focus !== ltr.start.focus || ltr.end.state !== ltr.start.state;
    if (forward === "ArrowRight" && !moved) {
      problems.push(
        "ArrowRight changes nothing left to right, so there's no direction to check"
      );
      break;
    }
    if (rtl.end.focus !== ltr.end.focus) {
      problems.push(
        `${mirrored} right to left focuses ${rtl.end.focus || "nothing"}, where ${forward} left to right focuses ${ltr.end.focus || "nothing"}`
      );
    }
    if (rtl.end.state !== ltr.end.state) {
      problems.push(
        `${mirrored} right to left leaves state ${rtl.end.state}, where ${forward} left to right leaves ${ltr.end.state}`
      );
    }
  }
  if (problems.length) {
    throw new Error(
      `checkDirection found ${problems.length} problem${problems.length === 1 ? "" : "s"}:
- ${problems.join("\n- ")}`
    );
  }
}
export {
  checkDirection
};
