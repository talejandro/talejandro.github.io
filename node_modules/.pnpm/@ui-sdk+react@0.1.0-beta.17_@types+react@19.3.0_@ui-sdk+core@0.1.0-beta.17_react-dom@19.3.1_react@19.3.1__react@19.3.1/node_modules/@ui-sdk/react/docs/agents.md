<!-- ui-sdk Agents docs, as one file. -->

# Built for Agents

ui-sdk gives agents the building blocks to create components and the tools to use them.

## Agents Build Components

You can ask an agent to build a component for your app, from a toggle button to an emoji picker or a kanban board.

`@ui-sdk/core` gives it **behaviors**: tested building blocks for focus, keyboard navigation, selection, popups, drag and drop, and more. The agent combines them to handle the interactions your component needs.

A **primitive** brings a component's state, actions and parts together. Here's a small one: a mute button.

```ts
import { definePrimitive } from "@ui-sdk/core"

const muteButton = definePrimitive({
  name: "mute-button",
  state: () => ({ muted: false }),
  api: (context) => ({
    toggle: () => context.store.set({ muted: !context.store.get().muted }),
  }),
  slots: (slot) => ({
    root: slot({
      attrs: (state) => ({
        type: "button",
        "aria-pressed": String(state.muted),
      }),
      press: ({ api }) => api.toggle(),
    }),
  }),
})

export { muteButton }
```

Pressing the button changes `muted`, and `aria-pressed` follows it. The same primitive can render in React, Vue, Svelte, Solid and Web Components. [Build a Component](./core.md#build-a-component) walks through connecting it to your framework and adding styles.

The [component skill](./agents.md#skills) gives the agent a workflow to follow. Each package includes Markdown docs for the installed version, and the [testing kit](./core.md#testing) helps it check keyboard behavior, focus and ARIA in the finished component.

## Agents Use Your Components

Connect an agent to a UI built with ui-sdk and it can read component state and call component actions directly. For example, it can rename a project by calling the input's `setValue` action.

Create the bridge before the page renders. Import it from the same package as your components; this example uses React:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()
```

Once the page has rendered, `agent.snapshot()` lists its components, their state and their available actions. For a project-name input, it includes:

```json
{
  "ref": "c1",
  "component": "input",
  "label": "Project name",
  "value": "Apollo",
  "actions": ["setValue", "clear"]
}
```

The agent can use that label to change the value:

```ts
await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

The change goes through the input's API and change callback. Your app can provide an `allow` callback to approve or refuse requested actions. Change callbacks receive `source: "agent"` and can cancel a change too.

You can give these tools to your own agent, or register them with a supported browser through [WebMCP](./agents.md#webmcp).

## Benchmark

We gave an agent one task on a project settings screen: rename the project, change its visibility, update two members and the notification settings, then save. We built the same screen with ui-sdk and with other component libraries, in React, Vue and Svelte.

On the other libraries, the agent used browser tools: it reads the page's accessibility tree, then clicks and types. On ui-sdk, it used the agent bridge.

### React

|            | Base UI + browser tools | Ark UI + browser tools | ui-sdk + agent bridge | Delta       |
| ---------- | ----------------------- | ---------------------- | --------------------- | ----------- |
| Tool calls | 17                      | 19                     | **2**          | 88% fewer   |
| Tokens     | 291.1k                  | 330.3k                 | **21.8k**      | 92% fewer   |
| Time       | 56 s                    | 58 s                   | **13 s**       | 77% faster  |
| Cost       | $0.138                  | $0.143                 | **$0.021**     | 85% cheaper |

### Vue

|            | Reka UI + browser tools | ui-sdk + agent bridge | Delta       |
| ---------- | ----------------------- | --------------------- | ----------- |
| Tool calls | 17                      | **2**          | 88% fewer   |
| Tokens     | 247.7k                  | **21.8k**      | 91% fewer   |
| Time       | 54 s                    | **13 s**       | 76% faster  |
| Cost       | $0.117                  | **$0.021**     | 82% cheaper |

### Svelte

|            | Bits UI + browser tools | ui-sdk + agent bridge | Delta       |
| ---------- | ----------------------- | --------------------- | ----------- |
| Tool calls | 17                      | **2**          | 88% fewer   |
| Tokens     | 258.5k                  | **22.0k**      | 91% fewer   |
| Time       | 53 s                    | **13 s**       | 75% faster  |
| Cost       | $0.122                  | **$0.022**     | 82% cheaper |

These are medians from three runs per column. Every agent used Sonnet through Claude Code with the same task and system prompt, plus instructions for its tools. Every run completed the task. Time runs from the agent's start to its last message. Tokens and cost are what Claude Code reported for the run. Delta compares ui-sdk with the best other result in the row.

We also ran the ui-sdk screen with browser tools. It took about as much as the other libraries, so the difference comes from the tools.

### Run It Yourself

The benchmark is in the repo, in [`benchmarks/agent`](https://github.com/vercel-labs/ui/tree/main/benchmarks/agent). It runs its agents with [Claude Code](https://claude.com/claude-code), so install it and sign in first.

```sh
git clone https://github.com/vercel-labs/ui
cd ui
pnpm install
pnpm exec playwright install chromium
pnpm --filter agent-benchmark bench
```

This opens every version of the React screen in its own browser window and starts one agent in each. When they finish, it prints a table with each run's tool calls, text read, time, tokens and cost, and whether the agent saved the right settings.

Pass `--framework vue` or `--framework svelte` for the other frameworks, and `--runs 3` for medians:

```sh
pnpm --filter agent-benchmark bench --framework vue --runs 3
```

The [README](https://github.com/vercel-labs/ui/tree/main/benchmarks/agent#readme) explains the task, what's measured, and how to add another library.

## Where to Start

- **[Build with an Agent](./agents.md#build-with-an-agent):** give it the docs, describe the component, and check its work.
- **[Connect an Agent](./agents.md#get-started):** set up the bridge, read your components, and call their actions.


# Build with an Agent

Give an agent the right context, build a small version, and check how it behaves.

Tell the agent what you're building, which framework you use, and how the component should behave. It can use ui-sdk's components and behaviors to put it together.

## Give It the Docs

Each package includes Markdown docs that match the version you installed. Choose your framework in the page header, then start with:

**React**

```text
This project uses React and ui-sdk. Read
node_modules/@ui-sdk/react/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Vue**

```text
This project uses Vue and ui-sdk. Read
node_modules/@ui-sdk/vue/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Svelte**

```text
This project uses Svelte and ui-sdk. Read
node_modules/@ui-sdk/svelte/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Solid**

```text
This project uses Solid and ui-sdk. Read
node_modules/@ui-sdk/solid/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

**Web Components**

```text
This project uses Web Components and ui-sdk. Read
node_modules/@ui-sdk/web/docs/llms.txt to see what's available.

For a custom component, read the relevant sections of docs/core.md
and docs/rendering.md in the same package.
```

For a page with no build step, like an Artifact, point it at web.md instead. It's the same docs in one file, for a page that loads `web.js` and `web.css`:

```text
This page loads ui-sdk with web.js and web.css. Read
https://ui-sdk.dev/web.md to see what's available.
```

`llms.txt` covers your framework's APIs. `core.md` covers the behaviors, and `rendering.md` explains how to render a primitive in your framework.

The [Core guides](./core.md#build-a-component) walk through the code. [All Behaviors](./core.md#all-behaviors) helps the agent find a building block for each interaction.

## Add the Skill

If your agent supports skills, install `ui-sdk`:

```bash
npx skills@latest add vercel-labs/ui --skill ui-sdk
```

It gives the agent a workflow for choosing behaviors, defining a primitive, rendering it and testing it. The same skill ships with `@ui-sdk/core` in `node_modules/@ui-sdk/core/skills/`, so an agent without skills can read it there. [Skills](./agents.md#skills) shows how to use it. You can also work directly from the docs.

## Describe the Interaction

Give the agent a concrete example of what someone should be able to do. For an emoji picker:

**React**

```text
Build an emoji picker in React using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Vue**

```text
Build an emoji picker in Vue using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Svelte**

```text
Build an emoji picker in Svelte using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Solid**

```text
Build an emoji picker in Solid using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

**Web Components**

```text
Build an emoji picker as a web component using ui-sdk.

Add a search input and a grid of emoji. Down from the search input
should move focus to the first result. Arrow keys move through the
grid, and Enter selects an emoji. Announce the selection to screen readers.

Use our existing styles.
```

Include details that matter to your app, such as whether the picker opens in a popup or whether a parent component owns the selected value. The agent can choose the behaviors from those requirements.

## Start Small

Ask for one working example first:

```text
Start with a small, fixed list of emoji and one example page.
Reuse public ui-sdk components and behaviors where they fit.
```

Try that version, then ask for a specific change:

```text
When a search has no results, show "No emoji found" and keep focus
in the search input. Keep the input in the same position as results change.
```

This gives you something to review as the component takes shape.

## Check the Result

Ask the agent to test the interactions you described:

```text
Test moving from search into the grid, navigating with arrow keys,
and selecting with Enter. Check the empty search state and the
selection announcement too.

Run the project's typecheck and relevant tests. Tell me what passed
and anything you couldn't check.
```

The [testing guide](./core.md#testing) shows how to check a primitive with `@ui-sdk/core/testing`.

Try the example yourself too: Tab into the search input, search for an emoji, press Down, move with the arrows, and select with Enter. Then try a search with no results. These are the same interactions the agent's tests should cover.


# Skills

Help your agent build custom components with @ui-sdk/core.

`ui-sdk` helps your agent build a component ui-sdk doesn't ship, such as a rating, a stepper, or an emoji picker.

## Install the Skill

If your agent supports skills, install it with:

```bash
npx skills@latest add vercel-labs/ui --skill ui-sdk
```

The skill also ships inside `@ui-sdk/core`, at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`. That copy always matches the version you installed. If your agent doesn't support skills, point it there instead.

## Use the Skill

Mention the skill, your framework, and the interaction you want:

```text
Use ui-sdk to build a five-star rating in React.
Arrow keys should move between stars and choose a rating.
Use our existing styles and test the keyboard behavior.
```

The skill guides the agent through reading the installed docs, choosing behaviors, defining a primitive, rendering it in your framework, and testing the result. It supports React, Vue, Svelte, Solid, and Web Components.

[Build with an Agent](./agents.md#build-with-an-agent) shows how to give the agent context, refine the component, and check its work. The [Core guides](./core.md#build-a-component) explain the code it builds.


# Get Started

Let an agent read your components and call their actions.

`createAgent` connects an agent to the ui-sdk components in your app. It can read their state, find the actions they support, and call those actions through the component's API.

In this example, an agent reads a text field labeled "Project name" and changes it from "Apollo" to "Atlas".

For a complete app you can run, follow the [Guide](./agents.md#guide). It takes you from a Vite project to using a Select through the console and ChatGPT.

## Create the Bridge

Create the bridge once. These examples use React:

```ts title="agent.ts"
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

export { agent }
```

The bridge finds the components already on the page when you create it, and registers new ones as they're created, so you can create it at startup or later, when an assistant opens.

Use the agent entry from the same package as your components:

| Framework      | Import From            |
| -------------- | ---------------------- |
| React          | `@ui-sdk/react/agent`  |
| Vue            | `@ui-sdk/vue/agent`    |
| Svelte         | `@ui-sdk/svelte/agent` |
| Solid          | `@ui-sdk/solid/agent`  |
| Web Components | `@ui-sdk/web/agent`    |

## Add a Component

Render a ui-sdk input with an accessible name:

```tsx
import { Input } from "@ui-sdk/react/input"
import "./agent"

function ProjectName() {
  return <Input aria-label="Project name" defaultValue="Apollo" />
}

export { ProjectName }
```

The name helps both people using a screen reader and agents identify the input. A [Field label](./components/field.md) works too.

## Read the Page

After the component renders, call `snapshot`:

```ts
import { agent } from "./agent"

const components = agent.snapshot()
```

For this page, it returns:

```json
[
  {
    "ref": "c1",
    "component": "input",
    "label": "Project name",
    "value": "Apollo",
    "actions": ["setValue", "clear"]
  }
]
```

`ref` identifies this component. `actions` lists what the agent can ask it to do now.

The snapshot includes ui-sdk components. It can also include components that left the page, such as a field in a closed tab, marked with `offPage: true`. A page with more than 100 components lists the first 100 and ends with an entry that says how many more there are; use `query` to find the rest.

## Change a Value

Use `act` to call one of the input's actions:

```ts
const result = await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

The input now reads **Atlas**. Its `onValueChange` callback runs with `details.source === "agent"`, so your app can respond to the change or cancel it. [Permissions](./agents.md#permissions) covers those checks.

You can use the label or the `ref` from the snapshot. A label matches whole words regardless of case and accents, so `"project name"` works too. If a label is ambiguous, the bridge returns an error with the matches. Use a specific `ref` to choose one.

`result.steps` reports what each step changed, and `result.values` contains the current field values. A callback can cancel a change, so check those values when you need to know what took effect.

Put several steps in one call to run them in order. If a step fails, `result.ok` is `false` and `result.error` tells you which step failed and why. Earlier steps stay applied.

## Find List Items

For components with choices, such as a Select or Combobox, `query` with `within` lists the available values. For a Select labeled **Region**:

```ts
const found = await agent.query({ within: "Region", text: "Europe" })
if ("error" in found) {
  throw new Error(found.error)
}
const [region] = found
```

`query` returns `{ error }` when nothing on the page is named **Region**. Otherwise `region.items` holds up to 50 matching choices, each with a `value` and `label`, and `region.more` says how many matched beyond that. Leave out `text` to list the first 50, and pass `from: 50` for the next 50. `query()` opens nothing unless you pass `closed: true`. When a list's items only show while it's open, `items` is empty and `note` says so.

`query` also finds components without listing the page. `agent.query({ text: "Europe" })` returns the components whose label or row text has that word, and lists whose choices match, with those choices under them. `kind` keeps one kind, such as `"select"`.

## Connect the Tools

`agentTools` describes `snapshot`, `act`, and `query` with names, descriptions, and JSON Schemas:

```ts
import { agentTools } from "@ui-sdk/react/agent"
```

Use these definitions when setting up your agent's tools. Route each tool call to the matching method on `agent` and return its result to the model. Your model SDK determines how you register and handle those calls.

What the tools return comes from the page, so it can include text your users wrote, like a name in a table row. Their descriptions tell the model to treat it as data. Before an agent changes something that matters, have a person confirm it with [Permissions](./agents.md#permissions).

When your model runs on your server, [send the calls to the page](./agents.md#run-the-model-on-your-server) and return the results. For a browser that supports WebMCP, [register the tools with the browser](./agents.md#webmcp).

## Your Own Components

A component built with [`definePrimitive`](./core.md#define-a-primitive) joins the bridge too. Its `agent` key lists the API methods an agent can call, like `agent: { actions: ["setValue"] }`. Without one, methods named like changes, such as `setValue` or `toggle`, become its actions, and event handlers such as `keydown` stay internal.

The snapshot reads the primitive's `controlled` state keys. If none are declared, it reads `open`, `value`, and `checked` when present. [The Agent Key](./agents.md#the-agent-key) shows how to add the key and what each part of it does.

## Next Steps

- [Permissions](./agents.md#permissions): approve, refuse, or cancel an agent's changes.
- [Observe Changes](./agents.md#observe-changes): keep the agent up to date with what the person changed.
- [History and Undo](./agents.md#history-and-undo): record changes, undo them, and preview suggestions.
- [Run the Model on Your Server](./agents.md#run-the-model-on-your-server): keep the model on your server and run the tools in the browser.
- [WebMCP](./agents.md#webmcp): make the tools available to a browser agent.
- [Reference](./agents.md#reference): look up options, methods, and return values.


# Guide

Build a Vite app, try the agent bridge in the console, and let ChatGPT use it through WebMCP.

We'll build a Select for choosing a region. First, you'll read and change it from the browser console. Then you'll give ChatGPT the same tools and ask it to choose a region for you.

## Create a Vite App

Start with Vite's React and TypeScript template:

```bash
npm create vite@latest agent-demo -- --template react-ts
cd agent-demo
npm install
npm install @ui-sdk/react @ui-sdk/core
```

You'll need a Node.js version supported by [Vite](https://vite.dev/guide/). If the scaffolder offers to start the app, finish the files below first.

## Add a Select

Replace `src/App.tsx` with:

```tsx title="src/App.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"

const regions = [
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "asia-pacific", label: "Asia Pacific" },
]

function App() {
  return (
    <main>
      <h1>Project Settings</h1>
      <Select defaultValue="europe" items={regions}>
        <SelectLabel className="select-label">Region</SelectLabel>
        <SelectTrigger className="select-trigger">
          <SelectValue />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </SelectTrigger>
        <SelectContent className="select-content">
          {regions.map((region) => (
            <SelectItem
              key={region.value}
              value={region.value}
              className="select-item"
            >
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </main>
  )
}

export { App }
```

`SelectLabel` names the component **Region**. We'll use that name in the console and in our prompts. Passing `items` tells the Select every choice before its list renders, so the trigger shows **Europe** right away and the bridge can read the choices while the popup is closed.

Replace `src/index.css` with a few neutral styles:

```css title="src/index.css"
body {
  margin: 0;
  background: #fff;
  color: #171717;
  font:
    14px/1.5 system-ui,
    sans-serif;
}

main {
  max-width: 320px;
  margin: 80px auto;
  padding: 0 24px;
}

h1 {
  margin: 0 0 24px;
  font-size: 20px;
}

.select-label {
  display: block;
  margin-bottom: 8px;
}

.select-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  font: inherit;
}

.select-content {
  min-width: var(--anchor-width);
  max-height: var(--available-height);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #fff;
}

.select-item {
  padding: 8px;
  border-radius: 4px;
  cursor: default;
}

.select-item[data-highlighted] {
  background: #f5f5f5;
}

.select-trigger:focus-visible,
.select-item:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
}
```

## Initialize the Agent

Create `src/agent.ts`:

```ts title="src/agent.ts"
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

Object.assign(window, { agent })

export { agent }
```

`Object.assign` makes the bridge available as `window.agent` in the console. It doesn't require a TypeScript declaration on `Window`.

Now replace `src/main.tsx`. Import `agent.ts` before rendering the app so the bridge sees the Select as it's created:

```tsx title="src/main.tsx"
import "./agent"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

Start the app on port 5173:

```bash
npm run dev -- --port 5173 --strictPort
```

Open [localhost:5173](http://localhost:5173). **Europe** should be selected. Open the Select and choose another region, or focus it and use the arrow keys to try it yourself.

## Read It from the Console

Open your browser's developer tools and select **Console**. Run:

```js
window.agent.snapshot()
```

You'll see a component with `component: "select"`, `label: "Region"`, its current `value`, and its available `actions`. Its `ref` is an identifier assigned by the bridge; we'll use the label **Region** in this guide.

List its choices:

```js
await window.agent.query({ within: "Region" })
```

This returns the Region Select with its three regions under `items`, each with a `value` and `label`. To filter the list, add some text:

```js
await window.agent.query({ within: "Region", text: "Asia" })
```

## Change the Selection

Run this in the same console:

```js
await window.agent.act({
  steps: [{ ref: "Region", action: "setValue", args: ["north-america"] }],
})
```

The Select should now show **North America**. The result includes `ok`, the changes made by each step, and the current field values.

You can also pass an item's label:

```js
await window.agent.act({
  steps: [{ ref: "Region", action: "setValue", args: ["Asia Pacific"] }],
})
```

Choose **Europe** yourself, then run `window.agent.snapshot()` again. The bridge reads the same selection you see on the page.

## Register the WebMCP Tools

Replace `src/agent.ts` with this version:

```ts title="src/agent.ts"
import { createAgent, registerTools } from "@ui-sdk/react/agent"

const agent = createAgent()

Object.assign(window, { agent })

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})

if (import.meta.hot) {
  import.meta.hot.dispose(unregister)
}

export { agent }
```

`registerTools` publishes `snapshot`, `query`, and `act` through WebMCP when the browser supports it. Its `allow` asks you before the browser's agent presses a button. The cleanup removes the old registration when Vite replaces the module during development.

Reload the page after saving. `window.agent` is for the console exercise; WebMCP calls the bridge directly.

## Open the App in ChatGPT

Keep Vite running. In the **ChatGPT desktop app** on the same computer:

1. Start a Work conversation with a model that supports site tools.
2. Open the built-in browser and visit `http://localhost:5173`.
3. Select **Site tools** in the address bar, then **Available site tools**. Look for `snapshot`, `query`, and `act`.

ChatGPT discovers tools from the page open in that browser. Model and workspace availability are listed in [ChatGPT's site tools guide](https://learn.chatgpt.com/docs/webmcp).

Start with a prompt that only reads the page:

```text
Find the WebMCP tools available on this page. Use snapshot to tell me
which component is on the page and which region is selected.
```

Then ask it to read the choices:

```text
Use the page's query tool to list the choices for Region.
```

Finally, ask it to change the selection:

```text
Use the page's act tool to change Region to North America. Tell me
the selected value returned by the tool.
```

Review any access prompt from ChatGPT, then watch the Select update. In **Site tools**, use **Recently used** to check the calls it made.

You can also give it the whole task at once:

```text
Find this page's WebMCP tools, check the available regions, and select
Asia Pacific. Use the tool result to confirm the selected value.
```

## If the Tools Don't Appear

Check that you're viewing the Vite app in ChatGPT's built-in browser and that **Enable site tools** is on under **Settings → Browser → Permissions**. Open the app as the page itself; ChatGPT doesn't discover tools inside an iframe. See the [current requirements](https://learn.chatgpt.com/docs/webmcp) for supported models and workspaces.

In a browser's console, you can check whether the registration API exists:

```js
typeof document.modelContext?.registerTool
```

It should return `"function"` in a browser that supports registration. If it returns `"undefined"`, the console examples still work, but that browser won't receive WebMCP tools from `registerTools`.

## Keep Going

[Permissions](./agents.md#permissions) shows how to limit the actions an agent can run. [Observe Changes](./agents.md#observe-changes) keeps it informed when you change the UI. Use the [Reference](./agents.md#reference) to look up the bridge's options and results.


# The Agent Key

Let an agent use the components you build with definePrimitive, wherever they're rendered.

A component you build with [`definePrimitive`](./core.md#define-a-primitive) shows up in the agent's snapshot next to every Select and Dialog on the page. Add an `agent` key to say which of its methods an agent can call.

You write the key once, in the component. Anyone who renders the component gets it: an app that installs your rating from npm [creates the bridge](./agents.md#create-the-bridge), renders `<Rating>`, and its agent can rate, with no tool or schema to write.

ui-sdk's components use the same key. A Checkbox has `agent: { actions: ["setChecked"] }`. You'll find a few more [at the end of this page](#in-ui-sdks-components).

## Try It

This rating has `agent: { actions: ["rate"] }`. Press **Read the page** to see what an agent sees, then **Ask for 4 stars** to send the step an agent would send.

## Add the Agent Key

Here's the rating's primitive. Its API has one method, `rate`:

```ts title="rating.ts"
const rating = definePrimitive({
  name: "rating",
  options: { defaultValue: "number" },
  state: (options: { defaultValue?: number }) => ({
    value: options.defaultValue ?? 0,
  }),
  api: (context) => {
    const change = createChange(context)
    return {
      rate: (value: number, event?: Event) =>
        change("value", value, { reason: "item-press", event }),
    }
  },
  slots: (slot) => ({
    root: slot({ attrs: () => ({ role: "group" }) }),
  }),
  agent: { actions: ["rate"] },
})
```

`actions` lists the API methods an agent can call. Put `agent` after `api`.

Then give the rating a name where you render it:

```tsx
<Rating aria-label="Your rating">
```

The name is the rating's `label` in the snapshot, and a step can use it as its `ref`. A rating is a `group`, and a group doesn't take its name from the text inside it, so it needs `aria-label`, or `aria-labelledby` pointing at a visible label. A screen reader announces the same name.

With the key and the name, the snapshot lists `rate`:

```json
[
  {
    "ref": "c1",
    "component": "rating",
    "actions": ["rate"],
    "label": "Your rating",
    "value": 0
  }
]
```

And an agent can call it with the arguments the method takes:

```ts
await agent.act({ steps: [{ ref: "Your rating", action: "rate", args: [4] }] })
```

The step returns `ok: true` and what it changed: the rating's `value` is now `4`.

The change goes through `createChange`, so the app's `onValueChange` sees `details.source === "agent"` and can cancel it, like any other change. [Permissions](./agents.md#permissions) covers that.

## Choose What an Agent Calls

Only the methods in `actions` are offered. The rest of your API, like a `keydown` handler or a roving focus helper, stays private to your component, and a step that names one is refused:

```txt
rating c1 takes no keydown now. It takes: rate.
```

If `actions` names a method your API doesn't have, development builds warn, so a typo shows up right away.

## Without the Key

Without an `agent` key, the bridge guesses from method names: `set` followed by a capital letter, like `setValue`, and verbs like `open`, `toggle` or `clear`.

A popover built on `createPopup` gets `setOpen` from it:

```ts
api: (context) => createPopup(context, { preset: popoverPreset }),
```

It has no `agent` key, and an agent can open it:

```json
{
  "ref": "c1",
  "component": "share",
  "actions": ["setOpen", "press"],
  "label": "Share",
  "open": false
}
```

The bridge can't guess `rate`. Without the key, the rating would show `"actions": []`, and a step that asks for `rate` would get:

```txt
rating c1 takes no rate now. It takes: nothing.
```

Listing your actions makes the component say exactly what it does, whatever its methods are called.

## Arguments

A step's `args` become the method's arguments. This board has two actions. `moveCard` takes a card and a column, and `addCard` takes a title:

```ts title="board.ts"
const columns = ["todo", "doing", "done"]

const board = definePrimitive({
  name: "board",
  state: () => ({
    value: { "Fix login": "todo", "Write docs": "doing" } as Record<
      string,
      string
    >,
  }),
  api: (context) => {
    const change = createChange(context)
    const cards = () => context.store.get().value
    return {
      moveCard: (card: string, column: string) => {
        if (!columns.includes(column)) {
          throw new Error(
            `No column "${column}". Columns: ${columns.join(", ")}.`
          )
        }
        return change(
          "value",
          { ...cards(), [card]: column },
          { reason: "drag" }
        )
      },
      addCard: (card: string) =>
        change("value", { ...cards(), [card]: "todo" }, { reason: "input" }),
    }
  },
  slots: (slot) => ({
    root: slot({ attrs: () => ({ role: "group" }) }),
  }),
  agent: { actions: ["moveCard", "addCard"] },
})
```

An agent can move one card and add another in the same call:

```ts
await agent.act({
  steps: [
    { ref: "Sprint board", action: "moveCard", args: ["Fix login", "done"] },
    { ref: "Sprint board", action: "addCard", args: ["Write tests"] },
  ],
})
```

The bridge doesn't check the arguments of your own methods, so check them yourself, the way `moveCard` checks the column. When a method throws, the step fails with your message, and the steps after it don't run:

```txt
No column "shipped". Columns: todo, doing, done.
```

An action can also return a promise. The bridge doesn't wait for it to resolve, so the step's result is `"pending"`. If the promise rejects before the step ends, the step fails with its message.

## Lists

When your component's value is always one of its items, like a size picker, add `closed: true`:

```ts
agent: { actions: ["setValue"], closed: true },
```

The agent can name an item by its label or its value. If it names something that isn't there, the step is refused with the real items, so it can try again:

```txt
No item "XL" in Size (c1). Its items: Small, Medium, Large.
```

The bridge reads the items from your state's `items`. If they live somewhere else, return them from `items`:

```ts
agent: { actions: ["setValue"], items: (api) => api.allItems() },
```

`items` reads your API, which is why `agent` goes after `api`. Placed before it, TypeScript reports that `allItems` doesn't exist.

The snapshot lists the items with the component: the ones on the page, or the ones in your data when there are 10 or fewer. For a longer list the snapshot gives `more`, the number of items, and `query({ within })` returns them. With an `items` function that works for any action, not only `setValue`, so a stepper's `goTo` shows its steps.

## Content Behind Items

Tabs and accordions hide other components behind their closed items. Add `reveals: true` and a step that can't find its component on the page looks [behind those items](./agents.md#behind-a-closed-tab-or-section), opening each with `setValue`, or `open` when the component holds a list of open items. A component with `setPage` and a `pageCount` in its state is looked through page by page, and one with only `setOpen` is opened while it's closed:

```ts
agent: { actions: ["setValue"], closed: true, reveals: true },
```

For a setup flow on its Account step, a step on `"Card number"` selects the Billing step and fills the field there. A step that names a field no step has gets what the other steps hold:

```txt
No component "Coupon" on the page. Its labels: Setup, Email. Behind what is closed: Billing: Card number, Postal code. Team: Invite.
```

## Show It When It Matters

`shown` decides whether an agent sees the component right now. A field wrapper, for example, only needs to show while it has errors, since its input already carries the label:

```ts
agent: { shown: (state) => state.errors.length > 0 },
```

## Secret Values

For a value an agent should never read, like a PIN, add `secret: true`. The agent can still fill it in, and the snapshot shows `"[redacted]"` instead of the value:

```ts
agent: { actions: ["setValue", "clear"], secret: true },
```

To hide one particular field instead, the app can mark it with `data-agent-secret`. See [Permissions](./agents.md#permissions).

## In ui-sdk's Components

These are the `agent` keys of a few ui-sdk components, as they're written in `@ui-sdk/core`:

| Component    | `agent`                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Checkbox     | `{ actions: ["setChecked"] }`                                                                              |
| Number Input | `{ actions: ["setValue", "increment", "decrement"] }`                                                      |
| Select       | `{ actions: ["setOpen", "setValue", "clear", "setQuery"], closed: true }`                                  |
| Tabs         | `{ actions: ["setValue"], closed: true, reveals: true }`                                                   |
| Accordion    | `{ actions: ["setValue", "open", "close", "toggle", "openAll", "closeAll"], closed: true, reveals: true }` |
| OTP Input    | `{ actions: ["setValue", "clear"], secret: true }`                                                         |
| Field        | `{ shown: (state) => !!state.errors.length }`                                                              |

## API Reference

| Key       | Type                 | Description                                                                                                          |
| --------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `actions` | `string[]`           | The API methods an agent can call. Without it, methods named like changes, such as `setValue`.                       |
| `closed`  | `boolean`            | The value is always one of the items, so a step that names another item is refused.                                  |
| `items`   | `(api) => unknown`   | The items as data, when they aren't the state's `items`.                                                             |
| `reveals` | `boolean`            | Closed items, pages or a closed panel hide other components. A step that can't find its component looks behind them. |
| `shown`   | `(state) => boolean` | Whether an agent sees the component right now.                                                                       |
| `secret`  | `boolean`            | A filled value reads `"[redacted]"` in the snapshot, in step results and in `observe`.                               |

The `agent` key is experimental.


# Permissions

Choose what an agent can change, what it can see, and when to ask the person.

Use `allow` to choose which actions an agent can run. Use a component's change callback to reject a value before it's applied. These checks also apply when the agent uses [WebMCP](./agents.md#webmcp).

The examples below use the **Region** Select from the [Guide](./agents.md#guide).

## Choose the Actions

Without an `allow` callback, the bridge accepts supported actions. Add one to the `createAgent` call in `src/agent.ts` to let the agent change only Region:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent({
  allow: ({ component, label, action }) =>
    component === "select" && label === "Region" && action === "setValue",
})
```

Return `true` to let an action run or `false` to refuse it. On a refusal, `act` returns `ok: false` and stops. Any earlier steps stay applied.

The callback also receives `ref` and `args`. If the agent asks for an item by label, the bridge resolves it to a value first. For example, `"North America"` becomes `"north-america"`. A list whose items show only while it's open has to open to resolve a label, so the callback is asked first with the label, before it opens, and then with the value.

The callback runs before the step changes anything. A `press` that opens a closed menu or dialog to find its button asks before it opens, and closes it again when the answer is no.

## Ask First

To ask the person before changing Region, return their answer from `allow`:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent({
  allow: ({ component, label, action, args }) => {
    if (component !== "select" || label !== "Region" || action !== "setValue") {
      return false
    }

    return window.confirm(`Change Region to ${args[0]}?`)
  },
})
```

Try changing Region through the console or ChatGPT again. **OK** allows the change; **Cancel** refuses it.

For your own confirmation UI, return a `Promise<boolean>` that resolves with the person's answer. The bridge waits before running the action. Later `act` and `query` calls on the same bridge wait too. If nobody answers within 5 minutes, the step fails and the `signal` passed to `allow` aborts, so you can close your prompt. Set `timeout` on `createAgent` to change the wait.

## Mark What Needs a Person

Some controls should always wait for the person. Add `data-agent-confirm` with a sentence that says what the control does:

```tsx
<Button
  data-agent-confirm="Charges $20 to your card for 1,000 credits"
  onClick={buyCredits}
>
  Buy credits
</Button>
```

The snapshot lists the button with `confirm: "Charges $20 to your card for 1,000 credits"`, so the agent knows before it tries. Without an `allow` callback, pressing it fails with:

```text
Needs a person: "Charges $20 to your card for 1,000 credits". Ask them to press "Buy credits" themselves.
```

With `allow`, the step waits for your callback, and `step.confirm` carries the sentence. A step that touches several marks, like replacing one marked option with another, carries every sentence, joined by semicolons. Show it to the person and return their answer:

```ts
const agent = createAgent({
  allow: (step, { signal }) =>
    step.confirm ? showConfirm(step.confirm, { signal }) : true,
})
```

If the person says no, the step fails with `The person said no to "…"`.

An `allow` that returns `true` without reading `step.confirm` answers yes for the person. Check it in every `allow` you write, including the one you pass to [`registerTools`](./agents.md#webmcp).

Put the mark on a tab, on an accordion section's trigger or on a collapsible to keep it closed until the person agrees. A step that looks for its component [behind what is closed](./agents.md#behind-a-closed-tab-or-section) leaves a marked one closed. A step that names it opens it, and asks the person first.

The mark covers its element and everything inside it, for any action. Put it on a form or section to cover every control in it, or on a dialog's content to cover the buttons inside, wherever the dialog renders.

A mark on one option of a Select or Combobox counts even while the list is closed, since the agent opens it for a moment to look. A list that renders only some of its options, like a virtualized one, or one filtered by text in its field, shows the agent only those. Mark something that stays on the page instead, like its trigger or a wrapper around it, and every choice in it waits for the person.

## Keep Parts of the Page from the Agent

Two more marks change what the agent sees:

| Attribute           | What the Agent Gets                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `data-agent-hidden` | Nothing. Components inside are left out of `snapshot` and `query`, and a step that names one is told to ask the person. |
| `data-agent-secret` | The component, with its value shown as `"[redacted]"` once it's filled. The agent can still type into it.               |

```tsx
<section data-agent-hidden>
  <RecoveryCodes />
</section>

<Field data-agent-secret>
  <FieldLabel>Tax ID</FieldLabel>
  <Input />
</Field>
```

Changes inside `data-agent-hidden` still reach [Observe](./agents.md#observe-changes), so your own logs see them, while `agent.subscribe` stays quiet. The mark covers names too: a heading inside it names no component or section for the agent, and a label that holds a marked span is read without it. A secret value stays out of `snapshot`, `act` results and change events, and the field's error text reads `"[redacted]"` too. A `set` on a secret field is never compared with the value it holds, so a step can't test a guess at it. A secret File Input lists its files without their names. Password, card and one-time-code fields are treated as secret without a mark. A hidden input is left out without one.

The agent reaches what a person can reach. A component hidden with CSS, the `hidden` attribute, a closed `<details>` or `aria-hidden="true"` is left out without a mark. A component in an `inert` region, like the page behind a modal dialog, is listed as disabled until the region is usable again.

In development, a misspelled mark such as `data-agent-confim` logs a warning with the name it meant.

## Cancel a Value Change

An agent's changes reach the same callbacks as a person's changes. Check `details.source` to tell them apart, and call `details.cancel()` to keep the current value.

For example, add this prop to the Select in `src/App.tsx` to refuse an agent's request to choose Asia Pacific:

```tsx
onValueChange={(value, details) => {
  if (details.source === "agent" && value === "asia-pacific") {
    details.cancel()
  }
}}
```

You can still choose Asia Pacific yourself. To apply the rule to every change, remove the `details.source === "agent"` check.

Canceling a value change fails that step, and `act` stops there. The error says the value is still what it was.

Put value checks in these change callbacks. Actions such as `setValue` call the component's API directly, so checks in keyboard or pointer handlers won't run.

## What `allow` Covers

`allow` checks actions. Components and their actions remain visible in `snapshot()`, and the agent can still read choices with `query()`. Use `data-agent-hidden` to keep a region out of view.

Finding a component can open a tab or a section first. Each one is checked as an action of its own, such as `setValue` on the tabs or `open` on the accordion, before the requested action is.

The [Reference](./agents.md#reference) lists the fields passed to `allow` and the results returned by `act`.


# Observe Changes

Keep an agent informed when someone changes the UI.

`agent.subscribe` reports changes to ui-sdk components. Collect them between turns so the agent knows what changed since it last read the page.

Reuse the bridge from the [Guide](./agents.md#guide). The examples below go in a module that runs when your app starts.

## Collect Changes

This subscription collects changes made outside the bridge. That includes a person's interactions and changes made by your application:

```ts
import type { ObservedChange } from "@ui-sdk/react/observe"
import { agent } from "./agent"

const changes: ObservedChange[] = []

const stop = agent.subscribe((change) => {
  if (change.source !== "agent") {
    changes.push(change)
  }
})
```

Before the agent's next turn, take the queued changes:

```ts
const recentChanges = changes.splice(0)
```

Include `recentChanges` in the context you send to your model. `splice(0)` returns the collected changes and empties the queue. Leave out the source check above if you want to collect the agent's changes too.

A change a Button's handler makes after an `await` reports `"programmatic"`, even when the agent pressed the button, unless the handler passes the press's source on with `withSource`. [Observe](./core.md#keep-the-source-after-an-await) shows how.

## Read a Change

Choosing **North America** in the Guide's Select produces a change that includes:

```json
{
  "label": "Region",
  "key": "value",
  "previous": "europe",
  "value": "north-america",
  "reason": "item-press",
  "source": "mouse"
}
```

This describes clicking the option while Europe was selected. Its `ref` identifies the component in a snapshot and can be used in an `act` step. The [Reference](./agents.md#subscribelistener) lists all the fields.

Changes canceled with `details.cancel()` aren't reported. For a controlled component, the notification reports the requested change before the owner passes the value back. It isn't confirmation that the owner accepted it.

Password, card and one-time-code fields report `"[redacted]"` for both `value` and `previous`.

## When Changes Arrive

A slider drag reports one change when it finishes, with `previous` set to the value before the drag. State that doesn't commit, such as a text field's input, reports each change. Changes made by the agent or application arrive immediately.

The subscription gives you one stream of changes. It doesn't emit a separate commit notification. For intermediate steps or a subscription limited to part of the page, use [Observe](./core.md#observe).

## Stop Listening

When you no longer need the subscription, call the function it returned:

```ts
stop()
```

To record changes you can step back through, see [History and Undo](./agents.md#history-and-undo).


# History and Undo

Record component values, step through changes and try suggestions you can revert.

`createHistory` records changes to component values. `stageChanges` applies a set of values and gives you a way to restore the previous ones. Both use the agent bridge to change the controls.

For undo inside one component, like a drawing or a board, record its value with [`createUndoStack`](./core.md#undo) instead.

These helpers are experimental. The examples reuse the bridge from the [Guide](./agents.md#guide), including its permission policy. Import the helpers from your framework's `history` entry or `@ui-sdk/core/history`.

## Start Recording

Start recording before the changes you want to keep:

```ts
import { createHistory } from "@ui-sdk/react/history"
import { agent } from "./agent"

const history = createHistory(agent)
```

By default, the history records `value`, `checked` and `pressed` changes across the page, from people, agents, and your app. Use `within` to limit it to one element, such as the Guide's `<main>`:

```ts
const history = createHistory(agent, {
  within: () => document.querySelector("main"),
  keys: ["value", "checked"],
})
```

`within` accepts an element or a function that returns one. `keys` replaces the list of state keys to record. Restoring a key uses its `set<Key>` action, such as `setValue` or `setChecked`, so choose keys the component can set through the bridge.

Keep password, card and one-time-code fields outside the recorded panel. Their values are redacted, so the history can't restore the originals: their entries carry `redacted: true`, and seeking or undoing leaves those fields as they are and reports them among the changes it couldn't put back.

## Read the History

`history.entries()` returns entries from oldest to newest. Each has an `id`, component `ref`, `label`, state `key`, `value`, `previous`, `source` and `reason`.

Use `describeEntry` when you want a short sentence for each entry:

```ts
import { describeEntry } from "@ui-sdk/react/history"

const labels = history.entries().map(describeEntry)
```

For example: "Agent set Project name to Atlas". `history.position()` tells you how far you are through the entries. It starts at `0`; the end is `history.entries().length`.

`history.subscribe(listener)` calls a listener when the entries or position change. Read them inside the listener to update your history UI. It returns a function that unsubscribes.

## Step Back and Forward

Pass an entry count to `seek`. These calls return to the start of the recorded history, then apply it again:

```ts
await history.seek(0)
await history.seek(history.entries().length)
```

`seek` clamps the position to the available history. If someone makes a new recorded change after seeking back, the history drops the entries after that position, like undo in an editor.

The history restores recorded component values. It doesn't undo a network request, recreate a removed component or reverse an action such as saving a form. Restoration goes through `agent.act`, one control at a time, so current permissions, disabled state and change callbacks still apply, and a control that's refused or has left the page doesn't stop the others.

`seek` resolves with the changes it couldn't put back, each as `{ ref, key, value }`, and with an empty array when everything went back. If nothing went back, the position stays where it was.

The history doesn't record its own restoring, but it records every other change made meanwhile. When someone changes a control the history hasn't restored yet, their change stays, and the control is in the result.

## Undo the Agent's Changes

Use `undoSource` to remove the effect of one source from the applied history:

```ts
await history.undoSource("agent")
```

It restores each affected key to its latest value from the other sources, or to its starting value if there isn't one. For example, if a person changes the project name after the agent does, that person's value stays.

The entries it put back remain in the history with `reverted: true`, and seeking through the history continues to skip them. Like `seek`, `undoSource` resolves with the changes it couldn't put back, and their entries stay applied. The same method accepts other source names, such as `"keyboard"` or `"programmatic"`.

A Button whose handler awaits needs one more step. A change the handler makes after the `await` happens once the press is over, so it's recorded as `"programmatic"` and `undoSource("agent")` leaves it. Wrap it in `withSource` with the source the handler receives:

```tsx
import { Button } from "@ui-sdk/react/button"
import { withSource } from "@ui-sdk/react/observe"

function SaveButton() {
  return (
    <Button
      onClick={async (event, { source }) => {
        await save()
        withSource(source, () => status.setValue("Saved"))
      }}
    >
      Save
    </Button>
  )
}
```

Here `status` is an Input's controller. When the agent presses Save, the new status is recorded as the agent's. See [Observe](./core.md#keep-the-source-after-an-await) for how sources work.

## Keep Interactions Together

A drag that commits arrives as one entry. The history also combines consecutive changes with the same component, key, source and reason, except for `item-press` and `imperative` changes.

To record every intermediate step instead, turn coalescing off:

```ts
const history = createHistory(agent, { coalesce: false })
```

Call `history.clear()` to forget every entry and keep the controls as they are. Call `history.destroy()` when you're done to stop recording and remove its listeners.

## Try a Suggestion

`stageChanges` puts suggested values on the real controls. Try a different region in the Guide's Select:

```ts
import { stageChanges } from "@ui-sdk/react/history"

const staged = await stageChanges(agent, [
  { ref: "Region", value: "north-america" },
])
```

Each change is `{ ref, key?, value }`. `key` defaults to `"value"`; use `"checked"` for a checkbox. The component must be mounted, expose that key in its snapshot, and advertise the matching `set<Key>` action.

Staging accepts a ref or an exact label. It uses the first component with a matching label, so use a ref from `snapshot()` when labels repeat.

Missing components, unavailable setters and refused actions are skipped, and the remaining suggestions are still attempted. `staged.applied` lists successful calls as `{ ref, key, before, value }`. As with `act`, a successful call doesn't prove a controlled owner accepted the value or that a change callback didn't cancel it; read the component state when you need to confirm.

If the person rejects the suggestion, restore the captured values:

```ts
await staged.revert()
```

`revert` runs once, in reverse order, through the same action policy and callbacks. It attempts to restore the captured values even if the person has edited those controls since the preview, and resolves with the entries of `staged.applied` it couldn't put back. A filled password, card or one-time-code field's `before` reads `"[redacted]"`, so `revert` leaves that field as staged and includes it in the result. If the person accepts the suggestion, leave the values in place.

To point at a suggested control, use `elementOf(ref)` from [Observe](./core.md#observe) with one of the refs in `staged.applied`.


# Run the Model on Your Server

Keep the model and its keys on your server while the agent works with the page.

The bridge you created in [Get Started](./agents.md#get-started) reads and changes the components on the page, so it runs in the browser. The model can still run on your server, next to your API keys, usage limits, and other tools. Each time the model calls `snapshot`, `act`, or `query`, the call goes to the page, the bridge runs it, and the result goes back to the model.

This page uses the [AI SDK](https://ai-sdk.dev), where a tool without `execute` on the server is run by the browser. The examples use React.

## Declare the Tools on the Server

Pass `agentTools` to `streamText` as tools without `execute`:

```ts title="app/api/chat/route.ts"
import { convertToModelMessages, jsonSchema, streamText, tool } from "ai"
import { agentTools } from "@ui-sdk/react/agent"

const tools = Object.fromEntries(
  agentTools.map(({ name, description, inputSchema }) => [
    name,
    tool({ description, inputSchema: jsonSchema(inputSchema) }),
  ])
)

async function POST(request: Request) {
  const { messages } = await request.json()
  const result = streamText({
    model: "anthropic/claude-sonnet-5.5",
    messages: await convertToModelMessages(messages),
    tools,
  })
  return result.toUIMessageStreamResponse()
}

export { POST }
```

The model sees the same names, descriptions, and input schemas as any other agent. When it calls one, the response streams the call to the browser instead of running it on the server.

## Run the Calls in the Browser

In the chat component, run each call on `agent` and add its result. The form sends what the person types, and each message shows its text:

```tsx title="chat.tsx"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { agent } from "./agent"

function Chat() {
  const [input, setInput] = useState("")
  const { messages, sendMessage, addToolOutput } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      const tool = toolCall.toolName as "snapshot" | "act" | "query"
      const output = await agent[tool](toolCall.input as never)
      addToolOutput({ tool, toolCallId: toolCall.toolCallId, output })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        sendMessage({ text: input })
        setInput("")
      }}
    >
      {messages.map((message) => (
        <p key={message.id}>
          {message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("")}
        </p>
      ))}
      <input value={input} onChange={(event) => setInput(event.target.value)} />
    </form>
  )
}

export { Chat }
```

`sendAutomaticallyWhen` sends the results back once every call in the message has one, and the model continues from there. Ask it to set a field and it calls `act`, the field changes on the page, and the model gets the steps it ran and every field's value.

The results are plain objects, so they travel as JSON without changes. A step that fails comes back in the result with `ok: false` and the reason, so the model can try again.

## Refs Between Calls

A ref from `snapshot` stays with its component while it's on the page, including across re-renders. If the component is gone, the step fails and lists what's on the page now. Take a new snapshot after you reorder or rename components, since two components with the same kind, label, and row text can trade refs when they come back.

## Stopping a Turn

A step that needs a person waits for your [`allow`](./agents.md#ask-first) callback, and later calls wait behind it. When the person stops the chat, pass a `signal` to `act` so that wait ends too. Here's `chat.tsx` again with one `AbortController` per turn and a **Stop** button:

```tsx title="chat.tsx" {1,8-9,13-18,27,40-48}
import { useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { agent } from "./agent"

function Chat() {
  const [input, setInput] = useState("")
  const turn = useRef(new AbortController())
  const { messages, sendMessage, addToolOutput, stop } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      const tool = toolCall.toolName as "snapshot" | "act" | "query"
      const output =
        tool === "act"
          ? await agent.act(toolCall.input as never, {
              signal: turn.current.signal,
            })
          : await agent[tool](toolCall.input as never)
      addToolOutput({ tool, toolCallId: toolCall.toolCallId, output })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        turn.current = new AbortController()
        sendMessage({ text: input })
        setInput("")
      }}
    >
      {messages.map((message) => (
        <p key={message.id}>
          {message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("")}
        </p>
      ))}
      <input value={input} onChange={(event) => setInput(event.target.value)} />
      <button
        type="button"
        onClick={() => {
          turn.current.abort()
          stop()
        }}
      >
        Stop
      </button>
    </form>
  )
}

export { Chat }
```

**Stop** aborts the turn's signal and stops the chat. The step that was waiting fails as cancelled, the steps after it don't run, and the `signal` passed to `allow` aborts so you can close your prompt. The result still goes back with the next message, so the model knows what didn't happen.

Without a signal, the step fails once `timeout` passes, 5 minutes by default.

## Next Steps

- [Permissions](./agents.md#permissions): approve, refuse, or ask the person before a change.
- [Observe Changes](./agents.md#observe-changes): tell the model what the person changed between turns.
- [Reference](./agents.md#reference): look up what each tool returns.


# WebMCP

Let the agent built into a browser read and use your components.

`registerTools` exposes `snapshot`, `act`, and `query` through the browser's `document.modelContext` API. It uses the bridge you created in [Get Started](./agents.md#get-started), so you register the tools once for your app.

For a complete example with ChatGPT prompts, follow the [Guide](./agents.md#guide).

## Register the Tools

Import `registerTools` from the same package as your bridge:

```ts
import { registerTools } from "@ui-sdk/react/agent"
import { agent } from "./agent"

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})
```

The browser's agent can now read components and call their actions. You didn't write that agent, so `registerTools` asks for an `allow` of its own. It runs for every step the browser's agent asks for, after your bridge's [permissions](./agents.md#permissions), and works the same way: return `false` to refuse a step. Here it asks you before every press. Your change callbacks still apply.

A step on a control you marked with [`data-agent-confirm`](./agents.md#mark-what-needs-a-person) arrives with `step.confirm`, and this `allow` answers for the person. To let every other step run and leave those to the person, pass `allow: (step) => !step.confirm`.

Registration requires a browser that provides `document.modelContext.registerTool`. In a browser without it, `registerTools` does nothing.

## Remove the Tools

Call the returned function when your integration is no longer needed:

```ts
unregister()
```

This removes the browser tools. You can still call methods on `agent` directly.

## Tool Annotations

`snapshot` has `readOnlyHint: true`. `query` doesn't, since a query with `closed: true` opens tabs and sections to read them, and your `allow` decides each one. All three tools have `untrustedContentHint: true` because their results include page content, such as labels and text people entered.

`act` has `consequentialHint: true` because a step can press any button, including one whose action can't be undone. A browser can use it to ask the person before it runs `act`.

These are hints for the tool consumer. `snapshot` and `query` never open a component. Use [Permissions](./agents.md#permissions) to decide which requested actions your app accepts.


# Reference

The bridge's methods, tool definitions, and the data they return.

Import these APIs from your framework's agent entry, such as `@ui-sdk/react/agent`. Vue, Svelte, Solid, and Web Components use `@ui-sdk/vue/agent`, `@ui-sdk/svelte/agent`, `@ui-sdk/solid/agent`, and `@ui-sdk/web/agent`.

Start with [Get Started](./agents.md#get-started) for the basic calls, or follow the [Guide](./agents.md#guide) to try them in a Vite app and ChatGPT.

## createAgent(options?)

Creates a bridge with `snapshot`, `act`, `query`, and `subscribe`:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()
```

Create it once, in the browser, at startup or later. It finds the components already on the page and registers new ones as they're created; importing the entry alone doesn't start registration. Use the same package as your components so they share one copy of the core.

| Option    | Type                                                                                   | What It Does                                                                                                       |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `allow`   | `(step: AgentAction, context: { signal: AbortSignal }) => boolean \| Promise<boolean>` | Decides whether a resolved action may run. Returning `false` refuses it.                                           |
| `timeout` | `number`                                                                               | How long a step waits for `allow`, in milliseconds. 5 minutes by default. Then the step fails and `signal` aborts. |

`AgentAction` has `ref`, `component`, optional `label`, `action`, `args`, and `confirm`, the text of a `data-agent-confirm` mark on the target. The arguments may already be resolved, such as an item's label becoming its value. Without `allow`, a step with `confirm` fails with "Needs a person". See [Permissions](./agents.md#mark-what-needs-a-person).

Finding a target or its choices may open UI before the final action is checked. See [Permissions](./agents.md#permissions) for the scope of `allow` and change cancellation.

The bridge has no `destroy` method. Stop subscriptions with their returned cleanup functions, and remove WebMCP tools with the cleanup from `registerTools`.

## snapshot()

Returns an `AgentComponent[]` synchronously. Call it after the components have mounted:

```ts
const components = agent.snapshot()
```

Each entry describes one registered component with bound elements, or a remembered component that left the page. Components inside `data-agent-hidden` are left out. Past 100 entries, the snapshot keeps open popups, fills up to 100, and ends with `{ ref: "more", component: "more", more, use: "query", actions: [] }`, where `more` is how many it left out.

| Field                                                                          | What It Contains                                                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `ref`                                                                          | The component's identifier, such as `"c1"`. Use it in `act` and `query`.                                                      |
| `component`                                                                    | Its kind, such as `"input"`, `"select"`, or a custom primitive's name.                                                        |
| `label`                                                                        | Its accessible name, when available.                                                                                          |
| `row`                                                                          | Nearby row text that helps identify it, such as the person beside a menu.                                                     |
| `section`                                                                      | The labelled regions it sits in, such as `"Notifications > Email"`, when another shares its name or it is off the page.       |
| State keys                                                                     | Its exposed state, commonly `value`, `checked`, or `open`. See [Custom Primitives](#custom-primitives).                       |
| `min`, `max`, `step`, `placeholder`, `query`, `multiple`, `required`, `errors` | Additional state when present and meaningful.                                                                                 |
| `items`                                                                        | Included choices as `{ value, label }[]`. Use `query()` when the snapshot doesn't include the choices you need.               |
| `more`                                                                         | How many choices it has, when there are more than 10 in its data and `items` is left out. `query()` with `within` lists them. |
| `text`                                                                         | Text from its title, description, and error parts.                                                                            |
| `buttons`                                                                      | Button text inside an open component.                                                                                         |
| `pending`, `error`                                                             | Whether a component action is still running, or its error as text.                                                            |
| `disabled`                                                                     | `true` when the bridge considers the component unavailable. Its `actions` are then empty.                                     |
| `offPage`                                                                      | `true` for a remembered component that left the page. Its `actions` are empty.                                                |
| `confirm`                                                                      | The text of a `data-agent-confirm` mark. A step on it needs the person.                                                       |
| `source`                                                                       | Where the app writes it, such as `"components/header.tsx:24"`. Development builds only; see below.                            |
| `actions`                                                                      | Action names available to request, such as `setValue`, `setChecked`, or `press`.                                              |

A password, card, or one-time-code field's value, or one inside `data-agent-secret`, shows as `"[redacted]"` once it's filled, here, in `act`'s values and changes, and in `subscribe`. Password Input and OTP Input stay redacted while their text is shown.

In development, `source` comes from a `data-review-loc="file:line"` attribute on the component's element or the nearest element around it, or from Svelte's own element locations. Add the attribute at build time to let an agent go from a component to the code that renders it. Production builds leave `source` out.

Remembered entries keep their last exposed state. The bridge retains up to 50 of them; password, card, one-time-code, and `data-agent-secret` fields aren't kept after they leave. An off-page entry can't be acted on until its component is available again.

## act(\{ steps \})

Runs actions in order and returns a promise of the result:

```ts
const result = await agent.act({
  steps: [
    { ref: "Project name", action: "setValue", args: ["Atlas"] },
    { ref: "Save", action: "press" },
  ],
})
```

Pass `{ signal }` as a second argument to stop it early. When the signal aborts, a step waiting on `allow` fails as cancelled, and the steps after it don't run.

### Steps

Each step is an `AgentStep`:

| Field    | Type        | What It Does                                                        |
| -------- | ----------- | ------------------------------------------------------------------- |
| `ref`    | `string`    | Identifies a component by its ref, label, nearby row text, or kind. |
| `action` | `string`    | Names an action, usually taken from a snapshot entry’s `actions`.   |
| `args`   | `unknown[]` | Supplies the action's arguments. Defaults to an empty array.        |

A step can reach a component revealed by an earlier step, and one that sits on another tab or in a closed section. See [Behind a Closed Tab or Section](#behind-a-closed-tab-or-section).

The bridge checks the shape of the whole call before the first step runs. A call that isn't `{ steps }`, a step with a key other than `ref`, `action`, and `args`, `args` that isn't a list, or a `set` or `expect` step without its value fails with what to send, and no step runs:

```ts
const result = await agent.act({
  steps: [{ ref: "Project name", action: "setValue", value: "Atlas" }],
})
// result.error.message:
// steps[0] has "value", which a step doesn't take: a step is
// { "ref": "…", "action": "…", "args": […] }. A value goes in "args",
// like "args": ["Atlas"]. No step ran.
```

For choices, an argument can be the item's value or its label. Labels match regardless of case and accents, like component names; values match exactly. Ambiguous item labels are refused. When a list's items show only while it's open, `setValue` with a label asks `allow` with the label before it opens the list to read them, then again with the item's value. Numeric `setValue` actions also accept text that starts with a number, such as `"90 days"`. Text with grouped digits, such as `"1,499.5"`, is refused. A number outside the component's `min` and `max` is refused too, and nothing changes: `setValue on Seats (c7) takes a number from 1 to 20, not 25.` A number the component moves, like a slider's to its nearest step, fails the step with the value it holds now. A number sent to a text field, or to a list whose values are text, is stored as text. A component that holds a list, such as a multiple Select, takes one value or label as a list of one.

A `set` action's first argument is checked against the kind of the option it sets in the primitive's schema, like `setChecked` against `checked`. A `"boolean"` option takes only `true` or `false`, a `"number"` option takes a number or text that is one, like `"3"`, and an option read by an attribute parser takes what that parser reads, so a resizable group takes `"30,70"` as its layout but a checkbox refuses `"yes"`. A value the kind doesn't take fails the step, with the type it expects, and changes nothing.

`press` without arguments clicks the component's own button. A `click` is a `press`, and so is `setValue` with a button's text on a component that only has buttons, such as a row's menu. `press` with a button's text finds and clicks that button inside the component, opening a closed menu or dialog if needed. `allow` decides the press before anything opens; if the button it finds carries a `data-agent-confirm` mark, `allow` is asked again with `confirm`, and a refusal closes what the press opened. The text matches a button's whole text, or whole words in it. Failing those, it matches a button of two or more words when the text holds them in order and starts with the same word, so `"Mark as paid"` presses **Mark paid**. When two buttons match the same way, the step fails. It waits up to 15 seconds for a ui-sdk Button's action, and any other action waits the same way for its component's work. An action error fails the step; an action still running after that limit is reported as pending in the step's result.

`expect` checks a component and changes nothing. Its argument is the value, the checked state, or the row text the component must have now. A value also matches by its item's label:

```ts
const result = await agent.act({
  steps: [
    { ref: "Jane Doe", action: "press", args: ["Make admin"] },
    { ref: "Jane Doe", action: "expect", args: ["Admin"] },
    { ref: "Save", action: "press" },
  ],
})
```

When the check doesn't hold, the step fails with what the component has, such as `Actions for Jane Doe (c8) is "Jane Doe Member", not "Admin".`, and the steps after it don't run. A private field can't be checked.

Other actions call the component's API directly. They don't simulate pointer or keyboard input. Text inputs can still emit an `input` event, and the bridge triggers blur validation on a containing Field. A method returning a promise is reported as `"pending"`; the bridge doesn't wait for arbitrary API promises to resolve. A promise that rejects before the step ends fails the step with its message.

### How a Step Finds Its Component

Every component in a snapshot has a ref, such as `c3`, that stays the same while it's on the page. A step can use that ref, or name the component in the words of the task:

```ts
const step = { ref: "Region", action: "setValue", args: ["North America"] }
```

The bridge tries these in order and uses the first that fits:

1. A ref, such as `"c3"`.
2. A label, or whole words in a label or row text, such as `"Region"`. `"Name"` finds "Display name", not "Username".
3. An item the component offers, such as an accordion's "Email" section.
4. The component's kind, such as `"slider"`.

Names match regardless of case and accents, so `"Region"` finds "Région" and `"strasse"` finds "Straße".

When a name fits more than one component, the step fails and lists each one's ref, label and row text, such as `"Jane Doe" names 2 components: c1 Admin (Jane Doe), c4 Jane Doe. Use a ref.`, then a hint for whoever builds the page. Retry the step with one of those refs. That holds even when one label matches exactly, since labels and rows are page text anyone can write, like a person's display name. On your own page, two labels that share their words, like a "Technician" filter and a "Technician" field, each name their component once one has a word the other lacks. If exactly one of them takes the step's action, like a Textarea and the Trigger Menu on the same field for `setValue`, the step uses that one. Otherwise, if exactly one of them is an open popup, the step uses that one.

A returning component can reuse a remembered ref when its kind, label, row text, and section match. The bridge remembers refs for the last 500 that left. Identical components receive remembered refs in the order they return. Read a fresh snapshot after reordering or renaming components instead of assuming each ref still names the same control.

Each entry in the result's `steps` names the ref it acted on, so you can see which component changed.

### Behind a Closed Tab or Section

A step doesn't need its component on the page. When nothing on the page fits the name, the bridge looks behind closed accordion sections and closed collapsibles, then behind the other tabs and the other pages of a pagination, and in the sections each of those brings with it. Each one opens in turn and goes back, the way find in page looks through a document. When exactly one place has the component, that place opens again and the step runs there:

```ts
const result = await agent.act({
  steps: [
    { ref: "Project name", action: "setValue", args: ["Atlas"] },
    { ref: "Weekly digest", action: "setChecked", args: [false] },
  ],
})
```

Here **Weekly digest** is in the Email section of the Notifications tab. The step selects the tab, opens the section, and turns the switch off. Its `changes` include the tab and the section it opened.

When two places hold the name, the step fails and lists them, such as `"Deploy failures" is in 2 closed sections: Notifications > Email, Notifications > Slack. Put the one you mean first, like "Email > Deploy failures".` Write the place before the name, with `>` between them:

```ts
const step = {
  ref: "Email > Deploy failures",
  action: "setChecked",
  args: [true],
}
```

The place can be a tab, a section, or any labelled region around the component, such as a `fieldset` with a legend. It can also be a component around it, by label or kind, so `"dialog > Status"` means the **Status** field in the open dialog. Every word of the place has to be in those regions' names, so `"Email notifications > Deploy failures"` finds the one under Email on the Notifications tab, and `"Slack notifications > Weekly digest"` fails and says where **Weekly digest** is. Look-alikes that are on the page together carry a `section` in the snapshot, and the same name picks between them.

A step that names a tab or a section and gives no arguments means that item: `{ ref: "Email", action: "open" }` opens the Email section, and `{ ref: "Members", action: "press" }` selects the Members tab.

When a step names a component, an item or a button that isn't there, its error also lists what the closed tabs and sections hold, such as `Behind what is closed: Members: Invite only. Notifications > Email: Deploy failures, Weekly digest.` One wrong name is enough to correct every later one in the same call. A page of a pagination is listed as `page 2`.

When an open modal covers the rest of the page, nothing under it is looked through. The error names the modal and its buttons instead, such as `Edit order (c9) is open over the rest of the page, with the buttons Cancel, Apply`, so the next call can finish it first.

A panel that loads what it holds after it opens, like a code-split tab, is still empty when the bridge looks. The error then lists the closed tabs and sections the component may be behind, so the agent can select that tab in one call and work there in the next.

Each tab or section the bridge opens to look is an action of its own: `allow` is asked first, the component's change callback runs, and a no leaves it closed. A step opens 24 places at most. Disabled tabs and sections stay closed, and so does one inside `data-agent-confirm`: a step that names it opens it, and that step [needs the person](./agents.md#mark-what-needs-a-person). Selecting another tab can unmount what a person typed in the one they were on, so keep that state above the panels when agents work on the page.

### Result

| Field      | What It Contains                                                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ok`       | Whether every step ran without a bridge error.                                                                                                                                                                                                                                                                                 |
| `error`    | When a step fails: `{ step, message }`. The step index starts at zero.                                                                                                                                                                                                                                                         |
| `steps`    | Completed steps as `{ step, ref, result?, changes?, gone? }`.                                                                                                                                                                                                                                                                  |
| `open`     | Components acted on that remain open, when any do.                                                                                                                                                                                                                                                                             |
| `appeared` | Components that appeared during the call and remain on the page.                                                                                                                                                                                                                                                               |
| `values`   | A record of exposed `value` and `checked` fields, keyed by ref and label, such as `"c1 Project name"`. Includes remembered fields; currently open components are omitted. On a page with more than 100 fields, it keeps the ones the steps acted on or changed, then others up to 100, and `more` says how many were left out. |

Each change is `{ component, label?, key, value }`. `gone` lists components that left the page, using their refs with labels when available.

A failed step stops the call. Earlier steps stay applied; there is no rollback. The error's message says so, and how many steps are left to send again. A call or a step with the wrong shape fails before any step runs, as [Steps](#steps) describes. A `set` action fails when its value stays as it was and isn't what the step asked for, such as a change a callback canceled: `setValue on Region (c3) didn't take: it is still "europe".` A parent that takes the value after work of its own, like a request, has about a second to do it. So a step that saves can go last in the same call, and it runs only when every change before it took. A secret field's value is compared with nothing a step sends, so a `set` on it passes whether or not the value took. A step on something an open modal covers fails too, and names what is open.

`act` and `query` calls on the same bridge are queued in the order they're called.

## query(\{ text?, within?, kind?, closed?, from? \})

Finds components and their choices without listing the page, and returns a promise:

```ts
const found = await agent.query({ within: "Region", text: "Europe" })
if ("error" in found) {
  throw new Error(found.error)
}
const [region] = found
```

| Input    | What It Does                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`   | Matches a component's label or row text by whole words, regardless of case and accents. A list whose choices match comes back with only those choices. |
| `within` | Names one list by its ref or label, and returns it with its choices, matching `text` when given.                                                       |
| `kind`   | Keeps one kind of component, such as `"select"`.                                                                                                       |
| `from`   | With `within`, skips that many choices, to read a list past its first 50.                                                                              |
| `closed` | With `true`, also reads the other tabs and the closed sections. Alone, it lists the whole page.                                                        |

Pass at least one. Returns an `AgentComponent[]` of up to 100 entries, ending with a `more` entry like the snapshot's when there were more. A list's `items` hold up to 50 matching choices as `{ value, label }`, with `more` set to how many matched beyond that. To read those, call it again with `from`: `query({ within: "Region", from: 50 })` returns the next 50. A choice matches `text` by a case- and accent-insensitive substring of its label or value. An unknown or ambiguous `within`, a `from` without `within`, or a call with no input, returns `{ error: string }`. Components that left the page are included with `offPage: true`.

With `within`, the bridge reads item data or rendered parts, and never opens the component. If neither supplies choices, `items` is empty and `note` says that `act`'s `setValue` takes an item's label and opens the list to find it. Tree data includes closed branches. Without `closed`, a query opens nothing, and doesn't search inside closed tabs or accordion sections.

With `closed: true`, the bridge opens each closed section and each other tab in turn, reads what it holds, and goes back, the same way a step looks [behind a closed tab or section](#behind-a-closed-tab-or-section). `allow` is asked before each one opens. Tabs and pages are selected and then put back, so state a panel holds on its own goes the way it does when a person switches tabs. What it reads comes back with `offPage: true` and its `section`:

```ts
const page = await agent.query({ closed: true })
```

One call reads a whole settings page this way, so an agent whose task depends on what is there now, like "turn off whatever is on", can read once and then send every step in one `act`.

## subscribe(listener)

Calls the listener when a component reports a settled change and returns an unsubscribe function:

```ts
const unsubscribe = agent.subscribe((change) => {
  console.log(change.label, change.key, change.value)
})
```

The listener receives an `ObservedChange`:

| Fields                     | What They Identify                                                      |
| -------------------------- | ----------------------------------------------------------------------- |
| `ref`, `id`, `component`   | The bridge ref, primitive instance id, and component kind.              |
| `label`, `row`             | Optional accessible name and nearby row text.                           |
| `key`, `value`, `previous` | The state key, requested value, and previous value.                     |
| `reason`, `source`         | Why the change happened and which input caused it, including `"agent"`. |

Both people's and agents' changes are reported. A committed interaction, such as a slider drag, arrives once at the end. A controlled component's parent may not accept the requested value. Sensitive field values are reported as `"[redacted]"`.

Call `unsubscribe()` when you're done. See [Observe Changes](./agents.md#observe-changes) for keeping an agent up to date, or [History and Undo](./agents.md#history-and-undo) for recording and reverting changes.

## agentTools

The definitions of the three tools: `act`, `query`, and `snapshot`. `act` comes first, since a model can plan a whole task from its words and send it in one call.

```ts
import { agentTools } from "@ui-sdk/react/agent"
```

The bridge carries the same list as `agent.tools`, so an agent that finds the bridge on the page, such as `window.agent`, can read how to call it.

Each definition is `{ name, description, inputSchema }`. Adapt it to your model SDK's tool format, route calls to the matching bridge method in the page, and return the result to the model. These definitions don't create a model connection or run a tool loop for you.

## registerTools(agent, \{ allow \})

Registers the three tools with `document.modelContext.registerTool` when the browser provides it:

```ts
import { registerTools } from "@ui-sdk/react/agent"

const unregister = registerTools(agent, {
  allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
})
```

`allow` is required. It decides each step the browser's agent asks for, after the bridge's own `allow`, and works the same way: return `false` to refuse the step, or `true` to let it run. A step with `confirm` is one you marked for a person, and `true` answers for them. It returns a cleanup function. In a browser without WebMCP, registration does nothing. See [WebMCP](./agents.md#webmcp) for registration, cleanup, and tool annotations.

## Custom Primitives

A primitive created with `definePrimitive` can join the bridge without a separate tool definition. Give it an accessible name, and list what an agent can do in its `agent` key:

```ts
const sizePicker = definePrimitive({
  name: "size-picker",
  // state, api and slots
  agent: { actions: ["setValue", "clear"], closed: true },
})
```

| Key       | Description                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `actions` | The api methods an agent can call. Development builds warn about a name the api doesn't have.                          |
| `closed`  | Its value is always one of its items, so the bridge refuses text that names none of them.                              |
| `items`   | A function from the api to its items, when they aren't in the state's `items`.                                         |
| `reveals` | Its closed items, pages or closed panel hide other components. A step that can't find its component looks behind them. |
| `shown`   | A function from the state that says whether the agent sees it now, like a field only while it has errors.              |
| `secret`  | Its value reads `"[redacted]"` once it's filled, like a password's.                                                    |

[The Agent Key](./agents.md#the-agent-key) walks through each key with examples.

Without `actions`, the bridge picks methods by name: `set` followed by a capital letter, such as `setValue`, and these verbs alone or followed by a capital letter:

`open`, `close`, `toggle`, `select`, `clear`, `next`, `previous`, `first`, `last`, `play`, `pause`, `show`, `hide`, `expand`, `collapse`, `increment`, `decrement`, `reset`, `submit`, `add`, `remove`, `insert`.

Methods such as `keydown`, `focus`, and `moveBy` aren't picked. Some aliases, such as `open` when `setOpen` is an action, are left out of `actions` but remain callable.

An action receives the supplied `args` as its method arguments. Only a `set` action's first argument whose option has a `"boolean"` or `"number"` kind or an attribute parser is checked; the rest, and every argument of an action with no option of its name, like `rate`, arrive unchecked, so check them in the method. Make optional details usable without a DOM event, and route user-facing changes through `createChange` so callbacks can report their source and cancel them.

The snapshot exposes the state keys named in `controlled`. Without that declaration, it includes `open`, `value`, and `checked` when present, along with the status fields listed above. Declare custom keys such as `muted` in `controlled` when they belong in the snapshot. This is separate from whether a parent is currently controlling the value.
