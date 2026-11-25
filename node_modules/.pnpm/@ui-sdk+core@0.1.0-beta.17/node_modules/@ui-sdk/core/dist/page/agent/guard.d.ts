import type { AgentStep, createAgent } from "./agent.js";
declare const guardedActions: WeakMap<object, (steps: AgentStep[], guard: () => boolean) => ReturnType<ReturnType<typeof createAgent>["act"]>>;
export { guardedActions };
