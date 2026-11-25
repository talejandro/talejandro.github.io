// src/foundation/kernel/inline-style.ts
function css(declarations) {
  let text = "";
  for (const property in declarations) {
    const value = declarations[property];
    if (value !== void 0) {
      text += `${text ? ";" : ""}${property}:${value}`;
    }
  }
  return text;
}
export {
  css
};
