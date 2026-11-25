<!-- ui-sdk Core docs, as one file. -->

# Introduction

Give your agents the behaviors to build headless and accessible components, with keyboard, focus and screen reader support built in.

This section covers building your own components with `@ui-sdk/core`.

- To set up ui-sdk in your project, see Get Started.
- To browse the components library, see [Components](./README.md).

## What it is

`@ui-sdk/core` is a TypeScript library of UI behaviors, the layers that make up a component library. It provides building blocks for keyboard navigation, focus, selection, popups, drag and drop, and the ARIA attributes those interactions need.

You combine those pieces to build your own components.

## Let Me Show You

Here's an icon picker. This component is not available in `@ui-sdk/react`. An agent built this component by combining behaviors from `@ui-sdk/core`.

It has everything you expect: a popover that opens beside its button, arrow key navigation between icons, fuzzy search with ranked matches, and screen reader announcements.

Click Pick an Icon to open the picker, then click an icon or type to search. The best match is highlighted, so Enter picks it. Press Down to enter the results and use the arrow keys to move.

The icon picker is built from five pieces of `@ui-sdk/core`, which work together to provide the behavior:

- **A popover.** [`createPopup`](./core.md#a-popup-of-your-own) with the popover preset opens the picker beside its button, moves focus to the search field, and closes on Escape or a click outside. Picking an icon closes it and puts focus back on the button.
- **One Tab stop.** [`createRovingFocus`](./core.md#roving-focus) lets Tab enter the grid once. The arrow keys move between icons, and the next Tab leaves it. You don't have to tab through every button.
- **Arrows that follow the layout.** [`spatialMove`](./core.md#spatial-focus) chooses the nearest icon in the direction you press. Down still goes down when the grid fits fewer columns on a small screen.
- **Search results.** [`fuzzyScore`](./core.md#rank-what-someone-searches-for) ranks each icon's name and keywords against what you type. "idea" finds the lightbulb, and "launch" finds the rocket.
- **Announcements.** [`announce`](./core.md#announcements) tells screen readers how many icons match what you type.

The picker adds the connections between them, like moving focus from the search field into the grid when you press Down.

## How It Fits Together

The picker keeps state, like whether it's open, the search query and the focused icon. It has parts, like the button that opens it, the search field, the grid and each icon. A **primitive** puts that state, those parts and their behaviors together in one definition.

You write the primitive once. Framework adapters render its parts in React, Vue, Svelte, Solid and Web Components. The behavior stays in `@ui-sdk/core`, and each adapter connects it to your framework.

The parts are unstyled. They expose attributes and CSS variables for styling. You can style them how you want.

## Why It Exists

Component libraries cover familiar patterns, like menus, dialogs and tabs. Your product may need a kanban board, a timeline you can scrub, or a picker made for one task.

You can build the interface, but the interactions take work. Focus needs somewhere to go when an item disappears. A drag needs a keyboard alternative. Closing a popup needs to return you to where you were.

Agents face the same problems when they generate interfaces. `@ui-sdk/core` gives you and your agents tested behaviors to build on, so each new component can reuse that work.

You still choose how the pieces fit and give the component its names, roles and instructions. The [testing kit](./core.md#testing) in `@ui-sdk/core` helps you check the result, including keyboard behavior, ARIA relationships and server-rendered attributes.

## Build Your First Component

Start with [Build a Component](./core.md#build-a-component). You'll build a toggle with one piece of state and one button, render it in your framework, and add styles.

Then the Core guides take each step further: [Define a Primitive](./core.md#define-a-primitive), [Render a Primitive](./core.md#render-a-primitive) and [Style a Component](./core.md#style-a-component). [Compose Behaviors](./core.md#compose-behaviors) brings several behaviors together in a star rating, and [Handle Changes](./core.md#handle-changes) lets the app control and respond to state.

From there:

- [Behaviors](./core.md#all-behaviors) helps you find the pieces for what you're building.
- [Reference](./core.md#reference) lists the functions and types when you need the details.


# Build a Component

Build a toggle button, then render the same primitive in your framework.

Let's start with a toggle button. Press **Mute** to turn it on. Press it again to turn it off.

Click Mute, or focus it and press Enter or Space. Its pressed state changes with each press.

We'll define its behavior, connect it to your framework, and add styles.

## Install

Start by installing `@ui-sdk/core`.

```
npm add @ui-sdk/core
```

## Define a Primitive

A **primitive** describes a component's behavior: its state, the functions that change it, and the parts that use it. It doesn't render anything on its own.

Ours is the mute button's. It has one piece of state, `muted`, which is `true` when mute is on, and one part.

```ts title="lib/mute-button.ts"
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

- `state` starts `muted` at `false`.
- `api` defines `toggle`, which switches `muted` between `true` and `false`.
- `slots` describes the component's parts. Our only **slot** is `root`, which becomes the button when we render it.
- `attrs` turns state into HTML attributes. When `muted` is `true`, the root gets `aria-pressed="true"`.
- `press` calls `toggle` when the root is activated.

That's the whole behavior. [Define a Primitive](./core.md#define-a-primitive) goes through each field in more detail. Now let's put it on the page.

## Render It

An **adapter** connects the primitive to your framework. Choose your framework in the page header, then install its package.

**React**

```bash
npm add @ui-sdk/react
```

**Vue**

```bash
npm add @ui-sdk/vue
```

**Svelte**

```bash
npm add @ui-sdk/svelte
```

**Solid**

```bash
npm add @ui-sdk/solid
```

**Web Components**

```bash
npm add @ui-sdk/web
```

First, create the component from the `muteButton` primitive.

**React**

```ts title="components/ui/mute-button.tsx"
"use client"

import { createParts } from "@ui-sdk/react/primitive"
import { muteButton } from "@/lib/mute-button"

const { Root: MuteButton } = createParts(muteButton, { root: "button" })

export { MuteButton }
```

`{ root: "button" }` says the root part of `MuteButton` renders a `<button>`. Then import it wherever you want to use it:

```tsx title="pages/index.tsx"
import { MuteButton } from "@/components/ui/mute-button"

function Example() {
  return <MuteButton>Mute</MuteButton>
}
```

**Vue**

```ts title="components/ui/mute-button.ts"
import { createParts } from "@ui-sdk/vue/primitive"
import { muteButton } from "@/lib/mute-button"

const { Root: MuteButton } = createParts(muteButton, { root: "button" })

export { MuteButton }
```

`{ root: "button" }` says the root part of `MuteButton` renders a `<button>`. Then import it wherever you want to use it:

```vue title="pages/index.vue"
<script setup lang="ts">
import { MuteButton } from "@/components/ui/mute-button"
</script>

<template>
  <MuteButton>Mute</MuteButton>
</template>
```

**Svelte**

```ts title="components/ui/mute-button.ts"
import { createParts } from "@ui-sdk/svelte/primitive"
import { muteButton } from "@/lib/mute-button"

const { Root: MuteButton } = createParts(muteButton, { root: "button" })

export { MuteButton }
```

`{ root: "button" }` says the root part of `MuteButton` renders a `<button>`. Then import it wherever you want to use it:

```svelte title="pages/index.svelte"
<script lang="ts">
  import { MuteButton } from "@/components/ui/mute-button"
</script>

<MuteButton>Mute</MuteButton>
```

**Solid**

```ts title="components/ui/mute-button.ts"
import { createParts } from "@ui-sdk/solid/primitive"
import { muteButton } from "@/lib/mute-button"

const { Root: MuteButton } = createParts(muteButton, { root: "button" })

export { MuteButton }
```

`{ root: "button" }` says the root part of `MuteButton` renders a `<button>`. Then import it wherever you want to use it:

```tsx title="pages/index.tsx"
import { MuteButton } from "@/components/ui/mute-button"

function Example() {
  return <MuteButton>Mute</MuteButton>
}

export { Example }
```

**Web Components**

For web components, register a custom element:

```ts title="components/ui/mute-button.ts"
import { createParts, wrappedButton } from "@ui-sdk/web"
import { muteButton } from "@/lib/mute-button"

createParts(muteButton, {
  root: { tag: "mute-button", target: wrappedButton },
})
```

This registers a `<mute-button>` element for the root part, and `wrappedButton` puts the root's behavior and attributes on the `<button>` inside it. Import `@/components/ui/mute-button` from your app's browser entry point, then use it in your HTML:

```html title="pages/index.html"
<mute-button>
  <button>Mute</button>
</mute-button>
```

Because we use a native `<button>`, clicks, Enter and Space all reach the primitive's `press` handler. Screen readers get its pressed state from `aria-pressed`.

The behavior stays in `mute-button.ts`. Changing frameworks changes how you render it, but the behavior stays the same. [Render a Primitive](./core.md#render-a-primitive) covers options, state in your content and server rendering.

## Style the Component

Parts render without styles. Here's a complete look for the button, with hover, focus and pressed states:

```css
[data-slot="mute-button"] {
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  background: white;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;

  &:hover {
    background: #f5f5f5;
  }

  &:focus-visible {
    outline: 2px solid #a3a3a3;
    outline-offset: 2px;
  }

  &[aria-pressed="true"] {
    background: #171717;
    color: white;
  }
}
```

The pressed look comes from `aria-pressed`. While `muted` is `true`, the root part renders `aria-pressed="true"`, from the `attrs` you wrote when you defined the primitive. In the CSS tab, the `&[aria-pressed="true"]` rule selects it. In the Tailwind tab, the `aria-pressed:` classes do the same.

`data-slot` identifies the part, and these attributes are the same in every framework, so this CSS works for all five versions. [Style a Component](./core.md#style-a-component) covers more state attributes, CSS variables and parts that come and go.

## Next

You've defined a primitive, rendered it and styled it. The Core guides take each step further:

- [Define a Primitive](./core.md#define-a-primitive): Give your primitive options, expose state to its parts, and work with elements.
- [Render a Primitive](./core.md#render-a-primitive): Turn a primitive's slots into parts in your framework, pass options, and read state.
- [Style a Component](./core.md#style-a-component): Style each part from its data-slot and the attributes its state sets, with CSS or Tailwind.
- [Compose Behaviors](./core.md#compose-behaviors): Build a star rating with shared state and keyboard navigation.
- [Handle Changes](./core.md#handle-changes): Report changes, let the app accept or cancel them, and choose how state updates reach the page.

Or start from what's already built:

- [Components](./README.md): Use ready-made components like Select, Dialog and Tabs in your framework.
- [All Behaviors](./core.md#all-behaviors): Focus, selection, popups and the other pieces your components are made of.


# Define a Primitive

Give your primitive options, expose state to its parts, and work with elements.

`definePrimitive` brings a component's options, state, methods, and parts together. Use its slots to expose attributes and state, handle events, and work with mounted elements.

In [Build a Component](./core.md#build-a-component), you defined a mute button. This page goes through each field of a definition, using a copy button. Each demo's Code tab has the full example.

Here's the copy button this page builds, as one definition. Each section below covers one of its fields in more detail.

```ts title="copy-button.ts"
import { definePrimitive } from "@ui-sdk/core"

type CopyButtonOptions = { text?: string; onCopy?: (text: string) => void }

const copyButton = definePrimitive({
  name: "copy-button",
  options: { text: "string", onCopy: "callback" },
  state: (options: CopyButtonOptions) => ({ copied: false }),
  api: (context) => ({
    async copy() {
      const { text = "", onCopy } = context.options()
      await navigator.clipboard.writeText(text)
      context.store.set({ copied: true })
      onCopy?.(text)
    },
  }),
  slots: (slot) => ({
    root: slot<{}, { copied: boolean }>({
      state: (state) => ({ copied: state.copied }),
      attrs: () => ({ type: "button" }),
      press: ({ api }) => api.copy(),
    }),
  }),
})

export { copyButton }
```

## Options

Let's give a copy button some text to copy. Describe the options as a type, list each one's kind in `options`, and type `state`'s parameter with it:

```ts
type CopyButtonOptions = { text?: string; onCopy?: (text: string) => void }
```

```ts
options: { text: "string", onCopy: "callback" },
state: (options: CopyButtonOptions) => ({ copied: false }),
```

Typing `state`'s options is what types `context.options()` in `api`, so the type is written once. The kinds tell adapters how to handle each value. For example, web components read `text` from an attribute and turn `onCopy` into an event. TypeScript checks that every option has a kind. If your primitive has no options, leave `options` out.

Read the current values with `context.options()`. Here, `copy` reads the text when the button is pressed:

```ts
api: (context) => {
  return {
    async copy() {
      const { text = "", onCopy } = context.options()
      await navigator.clipboard.writeText(text)
      context.store.set({ copied: true })
      onCopy?.(text)
    },
  }
},
```

`api` runs once per instance, so reading options inside the method avoids holding on to an old value.

### When an Option Changes

Use `context.onOptions` when a change needs some extra work. For the copy button, new text should clear the previous "Copied" state. Add this inside `api`, before returning its methods:

```ts
let text = context.options().text

context.onOptions((options) => {
  if (options.text === text) return
  text = options.text
  context.store.set({ copied: false })
})
```

To keep a controlled value in sync instead, use `sync`, as shown in [Handle Changes](./core.md#control-the-state).

### Option Kinds

The same kinds work in a slot's `props` schema, which gives each part values of its own, like a star's `value` in [Compose Behaviors](./core.md#add-a-star).

| Kind                                | Use it for                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `"string"`, `"number"`, `"boolean"` | Values that can be read from attributes.                                                         |
| `"list"`                            | A string or a list of strings. An attribute uses commas between values.                          |
| `"value"`                           | Other values, such as objects, elements or functions. Set these as properties on web components. |
| `"callback"`                        | A callback that reports something. Vue treats it as an emit; web components fire an event.       |
| `"action"`                          | A function whose return value matters, such as a Promise. Vue keeps it as a function prop.       |
| `"id"`                              | A string the adapter generates when it's omitted.                                                |
| `"key"`                             | A list item's value, of any type. The part is keyed by it, and the parts inside see the key.     |

For a part nested inside another part, `{ kind: "string", from: "item" }` inherits the same prop from the enclosing `item` when it's omitted. Use `from: "group.id"` to inherit a different prop, and add `required: true` when the part only makes sense inside its parent, so using it anywhere else throws. A function `(attribute) => value` can parse a web component attribute when none of the built-in kinds fit.

## What a Part Shows

Attributes are enough for styling. To let the component's content read state too, add `state` to its slot:

```ts
root: slot<{}, { copied: boolean }>({
  state: (state) => ({ copied: state.copied }),
  attrs: () => ({ type: "button" }),
  press: ({ api }) => api.copy(),
}),
```

The first type argument describes the part's props; the second describes what its `state` returns. In React, the copy button's children can now read `copied`:

```tsx
<CopyButton text="npm add @ui-sdk/core">
  {({ copied }) => (copied ? "Copied" : "Copy")}
</CopyButton>
```

Try it. This version also resets after a short timeout.

Press Copy. The button reads Copied while the command is copied, then goes back to Copy.

## Parts That Come and Go

Use `present` when a part should only appear in some states. This panel is present while `open` is `true`:

```ts
panel: slot({
  present: (state) => state.open,
  attrs: (_state, part) => ({ id: `${part.id}-panel` }),
}),
```

The trigger points to the panel with `aria-controls`:

```ts
trigger: slot({
  attrs: (state, part) => ({
    type: "button",
    "aria-expanded": String(state.open),
    "aria-controls": `${part.id}-panel`,
  }),
  press: ({ api }) => api.toggle(),
}),
```

`part.id` is the instance's unique id. Both parts use it to build the same panel id. If an id includes an item value, use `idPart(value)` from `@ui-sdk/core` to escape spaces and percent signs.

An id the author writes on a part's element wins over the one its slot makes, in every framework and on web components. The parts that render after it point at the author's id from their first render, on a server too, and once the element binds, every part does: `aria-controls`, `aria-labelledby`, `aria-describedby`, `aria-activedescendant`, `for` and the other references to the made id point at it, so build references from `part.id` and the core keeps them right.

Leave `present` out for parts that are always there. Framework adapters remove absent parts; web components keep the markup and bind or unbind its behavior as presence changes.

## Events

Use `press` for button activation. For other DOM events, use `on`. Here's a search field that clears on Escape:

```ts
input: slot({
  attrs: (state) => ({ type: "search", value: state.query }),
  on: {
    input: (event, { api }) => api.search((event.target as HTMLInputElement).value),
    keydown: (event, { api }) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      api.search("")
    },
  },
}),
```

Each handler receives the event and the part's context: `el`, `id`, `key`, `props`, `store` and `api`. A handler passed by the component's user runs first. It can call `event.preventDefault()` to skip the primitive's handler.

## Roles, Focus and Keys

Declare each part's role on its slot, not in `attrs`. Core writes it, and a role that takes focus, activates or moves with keys makes the slot say how. Here's an option:

```ts
item: slot({
  role: "option",
  focus: "roving",
  press: ({ api, key }) => api.choose(key),
  attrs: (state, part) => ({
    "aria-selected": String(state.value === part.key),
  }),
}),
```

Leave one out and TypeScript names it: an option without `focus` fails with "Property 'focus' is missing". The role decides what's required:

- **`focus`** for roles that take focus, like `option`, `tab` or `menuitem`: `"roving"`, `"tab-stop"`, `"active-descendant"` or `"native"`. Development builds check the bound element can take focus that way, like a `"native"` part that renders a `<div>`.
- **`press`** for roles that activate, like `button`, `option` or `tab`.
- **`keys`** for roles whose pattern moves with keys, like `listbox`, `menu` or `slider`: the keys its `on.keydown` handles, or a function of state when they depend on it.

```ts
list: slot({
  role: "listbox",
  keys: (state) => [...(state.orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"]), "Home", "End", "typeahead"],
  on: { keydown: (event, { api }) => api.navigate(event) },
}),
```

Listing keys without an `on.keydown` to handle them fails to compile too, on any slot. When another element meets a need, say which with `{ none: "why" }`, like `keys: { none: "The combobox's input handles them." }`. A role that changes with state is a function, with every role it can pick in `roles`:

```ts
root: slot({
  role: (state) => (state.decorative ? "none" : "separator"),
  roles: ["none", "separator"],
}),
```

The role decides the part's ARIA too. Its `attrs` returns the states the role can't work without, like `aria-checked` on a checkbox or `aria-selected` on an option, and nothing the role doesn't take: `aria-orientation` on a group fails with "aria-orientation isn't allowed on a group".

```ts
box: slot({
  role: "checkbox",
  focus: "native",
  press: ({ api }) => api.toggle(),
  attrs: (state) => ({ "aria-checked": String(state.checked) }),
}),
```

A state that `live` keeps current is `undefined` in `attrs`, so `attrs` still names it. Development builds warn about anything the types can't see, like a spread slot or JavaScript, and about a required state that renders without a value. Set `globalThis.__UI_SDK_STRICT__ = true` in your test setup to turn every warning into an error.

## Working with the Element

Use `bind` for work that needs an element, such as measuring it or attaching an observer. It runs in the browser once the part is bound. Return a cleanup function:

```ts
root: slot({
  attrs: () => ({ rows: "1" }),
  bind: (el) => {
    const fit = () => {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
    fit()
    el.addEventListener("input", fit)
    return () => el.removeEventListener("input", fit)
  },
}),
```

This textarea measures its content after each input and adjusts its height.

Keep `attrs` and slot `state` pure: they also run on the server. Read from state and the part's props; do DOM work in `bind`. Slot `state` can return new objects and arrays on every call, since parts compare them by value, but other values, like a `Date` or a `Map`, should stay the same object until they change.

`bind` also receives the part as its second argument. Its `props` stay current, and `part.store.subscribe` lets you follow state changes. Use `connect` for work that must stay active while an element remains in the page, even when it isn't present, as with a hidden custom element.

### Cleaning up the Instance

Work shared by all parts belongs in `api`. Use `context.onDestroy` to clean it up when the instance is destroyed. For example, the copy button clears its reset timer:

```ts
let timer: ReturnType<typeof setTimeout> | undefined

context.onDestroy(() => clearTimeout(timer))
```

Clear the previous timer before starting another one, too.

## Reading Parts in the Api

Sometimes a method needs to find a part. `elements(context, slot)` returns the bound parts in page order, with their elements, keys and props:

```ts
import { elements } from "@ui-sdk/core"

api: (context) => ({
  next() {
    const fields = elements<{ value: string }>(context, "field")
    const empty = fields.find((field) => (field.el as HTMLInputElement).value === "")
    empty?.el.focus()
  },
}),
```

Try leaving a field empty. The button finds it from the current page order, so there's no separate index to keep up to date.

For one part, use `context.element(slot, key)`. To read its latest props, use `context.props(slot, key)`, naming them the same way: `context.props<{ title: string }>("window", key)`. The `key` is the part's `id` prop, or its `value`, as with the stars in [Compose Behaviors](./core.md#add-a-star).

## What Agents Can Do

The `agent` key tells [the agent bridge](./agents.md#custom-primitives) which api methods an agent can call, and a little about the component, like whether its value must be one of its items:

```ts
agent: { actions: ["setValue", "clear"], closed: true },
```

Put it after `api`, so its `items` function can read the api's types. Without it, the bridge picks methods named like changes, such as `setValue` or `toggle`. [The Agent Key](./agents.md#the-agent-key) shows a rating an agent can use, and every part of the key.

## Naming

A primitive's `name` prefixes each part's `data-slot`, like `tabs-list` for the tabs' `list` slot. The `root` slot gets the name alone, so `name: "copy-button"` gives its root `data-slot="copy-button"`.

Warnings and devtools use this name too. Set `label` when they should show a different name; it doesn't change `data-slot`.

For state attributes, `openAttrs(open)` returns `data-open` or `data-closed`. `checkedAttrs(checked)` returns `data-checked`, `data-unchecked` or `data-indeterminate`. Both are helpers from `@ui-sdk/core`.

## API Reference

### definePrimitive

- `name` (`string`): Prefixes `data-slot`, and names the component in warnings and the devtools. Kebab case. Example: [Naming](#naming).
- `state` (`(options: Options) => State`): The starting state, from the first options. Read `default<Key>` here. Example: [Define a Primitive](./core.md#define-a-primitive).
- `live?` (`(keyof State)[]`): State keys that change often and never affect rendering, like a highlighted item. Example: [Live State](./core.md#live-state).
- `asleep?` (`((options: object) => boolean)`): Whether an instance with these options starts asleep: its parts render and run `asleep`, while its api and each part's `bind` wait for the first event a part handles or the first read of `instance.api`. Like a closed tooltip, which costs little until its trigger is hovered or focused.
- `sync?` (`(options: Options) => Partial<State>`): Maps controlled options onto state. Runs whenever options change. Example: [State a User Controls](./core.md#state-a-user-controls).
- `controlled?` (`(keyof State)[]`): State keys a user can control with `<key>`, `default<Key>` and `on<Key>Change`. Development builds warn when one starts with both `<key>` and `default<Key>`, or was controlled and becomes undefined. Defaults to whichever of `open`, `value` and `checked` the state has. Example: [State a User Controls](./core.md#state-a-user-controls).
- `commits?` (`(keyof State)[]`): State keys an interaction changes in steps and then commits, through `createCommit`, like a slider's `value` while it's dragged. `observe` reports each of them once per commit rather than per step. Example: [Commits](./core.md#commits).
- `api` (`(context: PrimitiveContext) => Api`): Runs once per instance and returns its api, which slots, adapters and a controller call. Example: [Define a Primitive](./core.md#define-a-primitive).
- `slots` (`(slot: SlotFactory) => Record<string, SlotDefinition>`): The parts, built with `slot`. `slot<Props, State>({ ... })` types a slot's props and the state its render functions get. Example: [Define a Primitive](./core.md#define-a-primitive).
- `label?` (`string`): What warnings, `debug` and the devtools call it, when that isn't `name`, which prefixes `data-slot`. Like a checkbox group's parts in `checkbox`. Example: [Naming](#naming).
- `agent?` (`object: actions, closed, items, reveals, shown, secret`): What `@ui-sdk/core/agent` offers an agent. Without it, the agent takes the api's methods that change something by their names, like `setValue`. Example: [What Agents Can Do](#what-agents-can-do).
- `options?` (`PropSchema<Options>`): Each option, with its kind, for renderers to read. A primitive without options leaves it out. Example: [Options](#options).

### Slots

- `present?` (`((state: State, context: { id: string; key: string; props: Props; api: Api; }) => boolean)`): Whether the slot's element should exist. Adapters that cannot unmount markup, like custom elements, bind and unbind on it. Defaults to always. Keyed parts, like one panel among many, decide from their own props. May read live state: adapters check presence on every change. Example: [Parts That Come and Go](#parts-that-come-and-go).
- `attrs?` (`((state: State, context: { id: string; key: string; props: Props; api: Api; }) => Attrs)`): Pure. Runs on the server and on every render. Never reads live state. Example: [Define a Primitive](./core.md#define-a-primitive).
- `state?` (`((state: State, context: { id: string; key: string; props: Props; api: Api; }) => Public)`): What `render` functions and state-based class names see, like { highlighted, disabled }. May read live state: adapters only re-render a part for live changes when its render function actually read them. Example: [What a Part Shows](#what-a-part-shows).
- `live?` (`Live<State, Api, Props>`): Attributes written straight to the element on every change, built by `live()`. Example: [Live State](./core.md#live-state).
- `direct?` (`{ names: readonly string[]; attach: (part: Part, el: HTMLElement) => () => void; }`): Attributes of `attrs` core keeps current on a framework's element, built by `direct()`. Example: [Live State](./core.md#live-state).
- `selects?` (`Selects<State, Api, Props>`): Narrows which changes reach the slot's parts, built by `selects()`. Example: [Live State](./core.md#live-state).
- `press?` (`(context: { el, id, key, props, store, api }, event?: Event) => void`): Activation: a click, which keys and screen readers send too. `{ none: "why" }` for a role that activates when another handler does it, like the author's own click. Example: [Define a Primitive](./core.md#define-a-primitive).
- `on?` (`Partial<Record<keyof HTMLElementEventMap, (event: Event, context: { el, id, key, props, store, api }) => void>>`): DOM events. Adapters attach these so user handlers run first and can call preventDefault() to skip them. Example: [Events](#events).
- `bind?` (`((el: HTMLElement, part: Part<State, Api, Props>) => (() => void) | void)`): Client only, web only. Focus, positioning, observers. Gets the part, whose `props` are its newest render's. Return a cleanup. Follow state with `part.store.subscribe`, or write attributes that change often with `direct`. Example: [Working with the Element](#working-with-the-element).
- `asleep?` (`((el: HTMLElement, part: Part<State, Api, Props>) => (() => void) | void)`): Client only, web only. Like `bind`, but runs at once while the instance is asleep, for what a part can't wait for, like naming its trigger. Its `part.api` is undefined until the instance wakes.
- `connect?` (`((el: HTMLElement) => () => void)`): Client only. Runs while the element is in the page, present or not, for adapters that keep parts that aren't present, like custom elements. A popup's content registers here, so shortcuts inside a closed one don't run. Example: [Working with the Element](#working-with-the-element).
- `props?` (`PropSchema<Props>`): Each prop the slot's parts take, with its kind, like `{ value: "string" }`. Example: [Add a Star](./core.md#add-a-star).

### Roles

- `role?` (`Role | ((state, context) => Role | undefined)`): The part's WAI-ARIA role, which core writes. A role that takes focus, activates or moves with keys makes the slot say how, with `focus`, `press` and `keys`. A function picks the role from state, with every role it can pick in `roles`. Never put `role` in `attrs`. Example: [Roles, Focus and Keys](#roles-focus-and-keys).
- `roles?` (`array`): Every role a `role` function can pick. Development builds check what each one needs. Example: [Roles, Focus and Keys](#roles-focus-and-keys).
- `focus?` (`Unneeded | ((state: State, context: { id: string; key: string; props: Props; api: Api; }) => Focus | Unneeded) | Focus`): How the part gets focus, for a role that takes it, like an option or a tab. `{ none: "why" }` when another element takes it instead. Example: [Roles, Focus and Keys](#roles-focus-and-keys).
- `keys?` (`HandledKey[] | ((state) => HandledKey[]) | { none: string }`): The keys the part's `on.keydown` handles, for a role whose pattern moves with keys, or a function of state when they depend on it, like the arrows of an orientation. `{ none: "why" }` when another element handles them, like a combobox's input for its listbox. Example: [Roles, Focus and Keys](#roles-focus-and-keys).

## Next

The copy button has everything it needs. Next, [Render a Primitive](./core.md#render-a-primitive) puts it on the page in your framework.


# Render a Primitive

Turn a primitive's slots into parts in your framework, pass options, and read state.

[Define a Primitive](./core.md#define-a-primitive) gave the copy button its options, state and slots. Now let's put it on the page. Choose your framework in the page header, and the code below follows it.

## Install the Adapter

An **adapter** connects a primitive to your framework. Install the one for yours:

**React**

```bash
npm add @ui-sdk/react
```

**Vue**

```bash
npm add @ui-sdk/vue
```

**Svelte**

```bash
npm add @ui-sdk/svelte
```

**Solid**

```bash
npm add @ui-sdk/solid
```

**Web Components**

```bash
npm add @ui-sdk/web
```

## Create the Parts

`createParts` turns each slot into a **part**. Pass it the primitive and the element each part renders:

**React**

```ts title="copy-button-parts.ts"
"use client"

import { createParts } from "@ui-sdk/react/primitive"
import { copyButton } from "./copy-button"

const { Root: CopyButton } = createParts(copyButton, { root: "button" })

export { CopyButton }
```

**Vue**

```ts title="copy-button-parts.ts"
import { createParts } from "@ui-sdk/vue/primitive"
import { copyButton } from "./copy-button"

const { Root: CopyButton } = createParts(copyButton, { root: "button" })

export { CopyButton }
```

**Svelte**

```ts title="copy-button-parts.ts"
import { createParts } from "@ui-sdk/svelte/primitive"
import { copyButton } from "./copy-button"

const { Root: CopyButton } = createParts(copyButton, { root: "button" })

export { CopyButton }
```

**Solid**

```ts title="copy-button-parts.ts"
import { createParts } from "@ui-sdk/solid/primitive"
import { copyButton } from "./copy-button"

const { Root: CopyButton } = createParts(copyButton, { root: "button" })

export { CopyButton }
```

**Web Components**

```ts title="copy-button-parts.ts"
import { createParts, wrappedButton } from "@ui-sdk/web"
import { copyButton } from "./copy-button"

createParts(copyButton, {
  root: { tag: "copy-button", target: wrappedButton },
})
```

`createParts` registers a custom element for each slot you map. `wrappedButton` puts the root's behavior and attributes on a native button inside the element. Import this file from your app's browser entry point.

`Root` creates the primitive's instance and shares it with the parts inside. Every other slot you map becomes a part named in Pascal case, so a `star` slot becomes `Star`.

## Pass Options

The primitive's options become the part's props, next to the element's own:

**React**

```tsx
<CopyButton text="npm add @ui-sdk/core" onCopy={(text) => console.log(text)}>
  Copy
</CopyButton>
```

**Vue**

```vue
<CopyButton
  text="npm add @ui-sdk/core"
  @copy="(text) => console.log(text)"
>Copy</CopyButton>
```

A callback option becomes an event, so `onCopy` is `@copy`.

**Svelte**

```svelte
<CopyButton text="npm add @ui-sdk/core" onCopy={(text) => console.log(text)}
  >Copy</CopyButton
>
```

**Solid**

```tsx
<CopyButton text="npm add @ui-sdk/core" onCopy={(text) => console.log(text)}>
  Copy
</CopyButton>
```

**Web Components**

```html
<copy-button text="npm add @ui-sdk/core">
  <button>Copy</button>
</copy-button>
```

A `"string"` option reads from its attribute, and a callback option fires as an event on the element.

## Read the State

The root's slot returns `copied` from its `state`, so the button's content can follow it:

**React**

```tsx
<CopyButton text="npm add @ui-sdk/core">
  {({ copied }) => (copied ? "Copied" : "Copy")}
</CopyButton>
```

**Vue**

```vue
<CopyButton v-slot="{ state }" text="npm add @ui-sdk/core">
  {{ state.copied ? "Copied" : "Copy" }}
</CopyButton>
```

**Svelte**

```svelte
<CopyButton text="npm add @ui-sdk/core">
  {#snippet children(state)}{state.copied ? "Copied" : "Copy"}{/snippet}
</CopyButton>
```

**Solid**

```tsx
<CopyButton text="npm add @ui-sdk/core">
  {(state) => (state.copied ? "Copied" : "Copy")}
</CopyButton>
```

**Web Components**

On web components, the content is your own HTML. Show state through the attributes the part sets, as [Style a Component](./core.md#style-a-component) shows.

## Write Your Own Part

`createParts` is enough when each slot maps to one element. When a part needs logic of its own, such as rendering a list from data, write it yourself and connect it to the same primitive. [Custom Parts](./custom-parts.md) shows how in your framework.

## Render on the Server

Parts render their attributes into the server's HTML, so the page shows the right state before your framework hydrates it. On web components, you send the markup and the element connects its behavior once its module loads. [Server Rendering](./server-rendering.md) covers the setup for your framework.

## Next

The button works, but it has no styles yet. Next, [Style a Component](./core.md#style-a-component) styles it from the attributes it renders.


# Style a Component

Style each part from its data-slot and the attributes its state sets, with CSS or Tailwind.

[Render a Primitive](./core.md#render-a-primitive) put the copy button on the page. Parts render without styles, so let's give it some. Everything on this page works the same in every framework.

## Find the Part

Every part has a `data-slot` attribute: the primitive's `name`, then the slot's, like `tabs-list`. The root part gets the name alone, so the copy button's root is `copy-button`:

```css
[data-slot="copy-button"] {
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
}
```

Use `data-slot` rather than generated ids, which can change.

## Style Its State

Give a part an attribute for each state you want to style. Here, the root's `attrs` adds `data-copied` while the text is copied:

```ts
root: slot<{}, { copied: boolean }>({
  state: (state) => ({ copied: state.copied }),
  attrs: (state) => ({ type: "button", "data-copied": state.copied ? "" : undefined }),
  press: ({ api }) => api.copy(),
}),
```

An empty string adds the attribute, and `undefined` leaves it off. Your CSS can now follow it:

```css
[data-slot="copy-button"][data-copied] {
  background: #171717;
  color: white;
}
```

With Tailwind, use the attribute as a variant:

**React**

```tsx
<CopyButton className="data-copied:bg-neutral-900 data-copied:text-white">
  Copy
</CopyButton>
```

**Vue**

```vue
<CopyButton
  class="data-copied:bg-neutral-900 data-copied:text-white"
>Copy</CopyButton>
```

**Svelte**

```svelte
<CopyButton class="data-copied:bg-neutral-900 data-copied:text-white"
  >Copy</CopyButton
>
```

**Solid**

```tsx
<CopyButton class="data-copied:bg-neutral-900 data-copied:text-white">
  Copy
</CopyButton>
```

**Web Components**

```html
<copy-button text="npm add @ui-sdk/core">
  <button class="data-copied:bg-neutral-900 data-copied:text-white">
    Copy
  </button>
</copy-button>
```

ARIA attributes work as style hooks too, like the mute button's `aria-pressed` in [Build a Component](./core.md#style-the-component). For open and checked states, `openAttrs` and `checkedAttrs` return the usual attribute names, as [Naming](./core.md#naming) shows.

## Pass Values as CSS Variables

For a value rather than an on and off state, such as a percentage, set a CSS variable. `css` from `@ui-sdk/core` turns declarations into a `style` attribute and skips any that are `undefined`:

```ts
indicator: slot({
  attrs: (state) => ({ style: css({ "--volume": `${state.value}%` }) }),
}),
```

```css
[data-slot="volume-indicator"] {
  width: var(--volume);
}
```

The style is part of the server's HTML too, so the indicator has its width before the page hydrates.

## Parts That Come and Go

A part with `present` leaves the page as soon as its state hides it. To animate it in and out, keep it present until its transition finishes, with the helpers in [Transitions and Gestures](./core.md#entering-and-leaving). They add `data-starting-style` for the first frame and `data-ending-style` while the part leaves:

```css
[data-slot="disclosure-panel"] {
  transition: opacity 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
  }
}
```

## In Your Framework

[Styling and Animation](./styling-and-animation.md) covers class names, CSS Modules and the small cascade layer ui-sdk adds, in your framework.

## Next

You've defined, rendered and styled a primitive with one behavior of its own. Next, [Compose Behaviors](./core.md#compose-behaviors) builds a star rating from several behaviors, with one tab stop and arrow keys.


# Compose Behaviors

Build a star rating with shared state and keyboard navigation.

So far, each primitive has had one behavior of its own. Now let's combine behaviors from `@ui-sdk/core` to build a five-star rating: `createChange` reports each new rating, and `createRovingFocus` manages the group's Tab stop and arrow keys. We'll add one at a time.

## Start with Shared State

The rating's `value` is a number: `0` means no rating yet. `defaultValue` sets the starting rating.

Create `rating.ts`. For now, it has a root to hold the stars and a `rate` function to choose a value:

```ts title="rating.ts"
import { createChange, definePrimitive, type ChangeDetails } from "@ui-sdk/core"

type RatingOptions = {
  value?: number
  defaultValue?: number
  onValueChange?: (
    value: number,
    details: ChangeDetails<"item-press" | "list-navigation">
  ) => void
}

const rating = definePrimitive({
  name: "rating",
  options: {
    value: "number",
    defaultValue: "number",
    onValueChange: "callback",
  },
  controlled: ["value"],
  state: (options: RatingOptions) => ({
    value: options.value ?? options.defaultValue ?? 0,
  }),
  sync: (options) =>
    options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context)

    return {
      rate: (value: number, event?: Event) =>
        change("value", value, { reason: "item-press", event }),
    }
  },
  slots: (slot) => ({
    root: slot({
      attrs: () => ({ role: "radiogroup" }),
    }),
  }),
})

export { rating, type RatingOptions }
```

- `createChange(context)` returns `change`. `rate` calls it with the new value and a reason. It calls `onValueChange` first, then updates `value` unless the callback cancels or the app controls it.
- `controlled` and `sync` let a parent own `value`. `sync` copies a new `value` option into state.

[Handle Changes](./core.md#handle-changes) covers the change pattern in depth.

Before we add stars, let's try changing the value. These buttons call `rate(3)` and `rate(0)`:

Press Set to 3, then Reset to return to 0.

## Add a Star

Add a `star` part. Pressing it sets the rating to that star's value.

Add `star` beside `root` in `slots`:

```ts
star: slot<{ value: string }>({
  props: { value: "string" },
  attrs: (state, part) => ({
    type: "button",
    role: "radio",
    "aria-checked": String(Number(part.key) === state.value),
    "data-filled": Number(part.key) <= state.value ? "" : undefined,
  }),
  press: ({ api, key }, event) => api.rate(Number(key), event),
}),
```

- `props` gives each star a `value`, such as `"3"`. That becomes its key. We use `Number(key)` to pass it to `rate` as a number. [Option Kinds](./core.md#option-kinds) lists the kinds a prop can take.
- `aria-checked` marks the selected star. The root and stars form a radio group: one choice from several.
- `data-filled` marks every star up to the selection, so choosing three can fill the first three stars.

Press the star. The rating becomes 1 and the star fills in.

## Put Five Stars in the Group

Now render five stars using the same part. They share one rating, and each gets its own value and accessible name.

**React**

```tsx
"use client"

import { createParts } from "@ui-sdk/react/primitive"
import { rating } from "./rating"

const { Root: Rating, Star: RatingStar } = createParts(rating, {
  root: "div",
  star: "button",
})

function Example() {
  return (
    <Rating aria-label="Rating">
      {Array.from({ length: 5 }, (_, index) => (
        <RatingStar
          key={index}
          value={String(index + 1)}
          aria-label={`${index + 1} ${index === 0 ? "star" : "stars"}`}
        >
          ★
        </RatingStar>
      ))}
    </Rating>
  )
}

export { Example }
```

**Vue**

```vue
<script setup lang="ts">
import { createParts } from "@ui-sdk/vue/primitive"
import { rating } from "./rating"

const { Root: Rating, Star: RatingStar } = createParts(rating, {
  root: "div",
  star: "button",
})
</script>

<template>
  <Rating aria-label="Rating">
    <RatingStar
      v-for="star in 5"
      :key="star"
      :value="String(star)"
      :aria-label="`${star} ${star === 1 ? 'star' : 'stars'}`"
    >
      ★
    </RatingStar>
  </Rating>
</template>
```

**Svelte**

```svelte
<script lang="ts">
  import { createParts } from "@ui-sdk/svelte/primitive"
  import { rating } from "./rating"

  const { Root: Rating, Star: RatingStar } = createParts(rating, {
    root: "div",
    star: "button",
  })
</script>

<Rating aria-label="Rating">
  {#each Array.from({ length: 5 }, (_, index) => index + 1) as star (star)}
    <RatingStar
      value={String(star)}
      aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
    >
      ★
    </RatingStar>
  {/each}
</Rating>
```

**Solid**

```tsx
import { createParts } from "@ui-sdk/solid/primitive"
import { rating } from "./rating"

const { Root: Rating, Star: RatingStar } = createParts(rating, {
  root: "div",
  star: "button",
})

function Example() {
  return (
    <Rating aria-label="Rating">
      {Array.from({ length: 5 }, (_, index) => (
        <RatingStar
          value={String(index + 1)}
          aria-label={`${index + 1} ${index === 0 ? "star" : "stars"}`}
        >
          ★
        </RatingStar>
      ))}
    </Rating>
  )
}

export { Example }
```

**Web Components**

Register the parts from your app's browser entry point:

```ts
import { createParts, wrappedButton } from "@ui-sdk/web"
import { rating } from "./rating"

createParts(rating, {
  root: "my-rating",
  star: { tag: "my-rating-star", target: wrappedButton },
})
```

Then add the stars to your HTML. Each star's behavior connects to the native button inside it:

```html
<my-rating aria-label="Rating">
  <my-rating-star value="1"
    ><button aria-label="1 star">★</button></my-rating-star
  >
  <my-rating-star value="2"
    ><button aria-label="2 stars">★</button></my-rating-star
  >
  <my-rating-star value="3"
    ><button aria-label="3 stars">★</button></my-rating-star
  >
  <my-rating-star value="4"
    ><button aria-label="4 stars">★</button></my-rating-star
  >
  <my-rating-star value="5"
    ><button aria-label="5 stars">★</button></my-rating-star
  >
</my-rating>
```

Use `data-filled` to color the stars, the way [Style a Component](./core.md#style-its-state) styled the copy button from `data-copied`:

```css
[data-slot="rating"] {
  display: flex;
  gap: 0.25rem;
}

[data-slot="rating-star"][data-filled],
[data-slot="rating-star"]:hover {
  color: #b45309;
}
```

Hover to preview a rating, then click to choose it. Try Tab: each star still has its own Tab stop.

## Give the Group One Tab Stop

Let's make Tab enter the group once, on the selected star. If nothing is selected, it enters on the first star.

`createRovingFocus` from `@ui-sdk/core` manages this. Add it to the import, then add `focused` to the state:

```ts
state: (options: RatingOptions) => ({
  value: options.value ?? options.defaultValue ?? 0,
  focused: null as string | null,
}),
```

`value` is the rating. `focused` is the key of the star with the tab stop.

Update `api` to create and return the behavior alongside `rate`:

```ts {3-9,12}
api: (context) => {
  const change = createChange(context)
  const roving = createRovingFocus(context, {
    slot: "star",
    key: "focused",
    remember: false,
    preferred: (star) => Number(star.key) === context.store.get().value,
    claims: (state, star) => (state.value ? Number(star.key) === state.value : star.key === "1"),
  })

  return {
    roving,
    rate: (value: number, event?: Event) => change("value", value, { reason: "item-press", event }),
  }
},
```

- `slot` names the parts to track; `key` names the state field to update.
- `preferred` chooses the selected star. `remember: false` returns to that selection when focus comes back.
- `claims` chooses the tab stop before elements mount, including on the server. It picks the selected star, or the first if there isn't a selection.

Now connect the star slot to the behavior. Add `tabindex` to `attrs` and `bind` beside `press`:

```ts {7,11}
star: slot<{ value: string }>({
  props: { value: "string" },
  attrs: (state, part) => ({
    type: "button",
    role: "radio",
    "aria-checked": String(Number(part.key) === state.value),
    tabindex: part.api.roving.tabIndex(state, part),
    "data-filled": Number(part.key) <= state.value ? "" : undefined,
  }),
  press: ({ api, key }, event) => api.rate(Number(key), event),
  bind: (el, part) => part.api.roving.bind(el, part),
}),
```

`bind` registers each button and cleans up when it unmounts. `tabIndex` gives one star `0` and the others `-1`.

Choose a star. Tab leaves the group; Shift+Tab returns to your selection.

## Move with the Arrow Keys

`createRovingFocus` handles the arrow keys, Home and End, and right-to-left layouts. By default it uses Up and Down, like a vertical list.

For this rating, we want all four arrows, and the last star should wrap around to the first. Add `orientation` and `loop` to the `createRovingFocus` options:

```ts
orientation: () => "both",
loop: () => true,
```

Down and Right move to the next star, and Up and Left move to the previous one. Left and Right swap in right-to-left layouts. Home and End go to the first and last star.

The behavior moves focus; the rating decides what to select. Add `keydown` beside `rate` in the object returned from `api`:

```ts
keydown(event: KeyboardEvent, el: HTMLElement) {
  const moved = roving.keydown(event, el)
  if (moved) {
    change("value", Number(moved.key), { reason: "list-navigation", event })
  }
},
```

Both clicks and arrow keys use `createChange`. The `onValueChange` callback receives the new value and a reason: `item-press` or `list-navigation`.

Finally, connect the star's key events. Add `on` beside its `press` and `bind` fields:

```ts
on: {
  keydown: (event, { el, api }) => {
    if (el) {
      api.keydown(event, el)
    }
  },
},
```

Use the arrows to change the rating. Home and End jump to the first and last star.

## Check the Behavior

We can test the shared primitive directly. Here's a small Vitest test that chooses three stars and checks the value:

```ts
// rating.test.ts
import { expect, test } from "vitest"
import { rating } from "./rating"

test("choosing a star changes the rating", () => {
  const instance = rating({ id: "rating" })
  instance.api.rate(3)
  expect(instance.get().value).toBe(3)
})
```

For focus and keyboard checks, render the component and run `checkPattern(root, "radio-group")` from `@ui-sdk/core/testing`. [Testing](./core.md#testing) shows how.

## Complete Primitive

Here's everything we added, in one file:

**Show rating.ts**

```ts
// rating.ts
import {
  createChange,
  createRovingFocus,
  definePrimitive,
  type ChangeDetails,
} from "@ui-sdk/core"

type RatingOptions = {
  value?: number
  defaultValue?: number
  onValueChange?: (
    value: number,
    details: ChangeDetails<"item-press" | "list-navigation">
  ) => void
}

const rating = definePrimitive({
  name: "rating",
  options: {
    value: "number",
    defaultValue: "number",
    onValueChange: "callback",
  },
  controlled: ["value"],
  state: (options: RatingOptions) => ({
    value: options.value ?? options.defaultValue ?? 0,
    focused: null as string | null,
  }),
  sync: (options) =>
    options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context)
    const roving = createRovingFocus(context, {
      slot: "star",
      key: "focused",
      remember: false,
      preferred: (star) => Number(star.key) === context.store.get().value,
      claims: (state, star) =>
        state.value ? Number(star.key) === state.value : star.key === "1",
      orientation: () => "both",
      loop: () => true,
    })

    return {
      roving,
      rate: (value: number, event?: Event) =>
        change("value", value, { reason: "item-press", event }),
      keydown(event: KeyboardEvent, el: HTMLElement) {
        const moved = roving.keydown(event, el)
        if (moved) {
          change("value", Number(moved.key), {
            reason: "list-navigation",
            event,
          })
        }
      },
    }
  },
  slots: (slot) => ({
    root: slot({
      attrs: () => ({ role: "radiogroup" }),
    }),
    star: slot<{ value: string }>({
      props: { value: "string" },
      attrs: (state, part) => ({
        type: "button",
        role: "radio",
        "aria-checked": String(Number(part.key) === state.value),
        tabindex: part.api.roving.tabIndex(state, part),
        "data-filled": Number(part.key) <= state.value ? "" : undefined,
      }),
      press: ({ api, key }, event) => api.rate(Number(key), event),
      on: {
        keydown: (event, { el, api }) => {
          if (el) {
            api.keydown(event, el)
          }
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
})

export { rating, type RatingOptions }
```

## Keep Building

Next, [Handle Changes](./core.md#handle-changes) goes further into the change pattern the rating uses: callbacks, controlled state, commits and undo.

- [Customize a Behavior](./core.md#customize-a-behavior) adds keys to this rating and changes its rules.
- [Focus](./core.md#focus-and-keys) covers grids and other ways to move through a group.
- [Testing](./core.md#testing) checks the component's keyboard behavior and accessibility.


# Handle Changes

Report changes, let the app accept or cancel them, and choose how state updates reach the page.

[Compose Behaviors](./core.md#compose-behaviors) used `createChange` to report each new rating. This page goes further: callbacks that accept or cancel a change, state a parent controls, commits, frequent updates and undo. These helpers are exported from `@ui-sdk/core`.

## Control the State

The mute button from [Build a Component](./core.md#build-a-component) manages its own state. Let's control it from a parent component and use that state to change its icon and label.

We'll use `createChange`. Update `lib/mute-button.ts` with the highlighted changes:

```ts title="lib/mute-button.ts" {1,5-19,22-23}
import { createChange, definePrimitive } from "@ui-sdk/core"

const muteButton = definePrimitive({
  name: "mute-button",
  options: { muted: "boolean", onMutedChange: "callback" },
  controlled: ["muted"],
  state: (options: {
    muted?: boolean
    onMutedChange?: (muted: boolean) => void
  }) => ({
    muted: options.muted ?? false,
  }),
  sync: (options) =>
    options.muted === undefined ? {} : { muted: options.muted },
  api: (context) => {
    const change = createChange(context)

    return {
      toggle: (event?: Event) => {
        change("muted", !context.store.get().muted, { reason: "press", event })
      },
    }
  },
  slots: (slot) => ({
    root: slot({
      attrs: () => ({ type: "button" }),
      press: ({ api }, event) => api.toggle(event),
    }),
  }),
})

export { muteButton }
```

- `options` adds the value and callback. `controlled` marks `muted` as a state value that can be controlled.
- `state` sets the initial value. `sync` keeps it up to date when a new `muted` value comes in.
- `createChange` calls `onMutedChange` with the next value and waits for it to come back through `muted`. If you leave out `muted`, it updates the button's own state.

The label now describes the next action, so this version doesn't need `aria-pressed`.

### Connect the State

Now use `muted` for the button, its icon and its label:

**React**

```tsx title="pages/index.tsx"
"use client"

import * as React from "react"
import { Volume2Icon, VolumeXIcon } from "lucide-react"
import { MuteButton } from "@/components/ui/mute-button"

function Example() {
  const [muted, setMuted] = React.useState(false)

  return (
    <MuteButton muted={muted} onMutedChange={setMuted}>
      {muted ? (
        <VolumeXIcon aria-hidden="true" />
      ) : (
        <Volume2Icon aria-hidden="true" />
      )}
      {muted ? "Unmute" : "Mute"}
    </MuteButton>
  )
}

export { Example }
```

**Vue**

```vue title="pages/index.vue"
<script setup lang="ts">
import { ref } from "vue"
import { MuteButton } from "@/components/ui/mute-button"

const muted = ref(false)
</script>

<template>
  <MuteButton v-model:muted="muted">
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m11 5-6 4H2v6h3l6 4z" />
      <path
        :d="
          muted ? 'm16 9 6 6m0-6-6 6' : 'M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12'
        "
      />
    </svg>
    {{ muted ? "Unmute" : "Mute" }}
  </MuteButton>
</template>
```

`v-model:muted` passes the value and listens for updates.

**Svelte**

```svelte title="pages/index.svelte"
<script lang="ts">
  import { MuteButton } from "@/components/ui/mute-button"

  let muted = $state(false)
</script>

<MuteButton bind:muted>
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m11 5-6 4H2v6h3l6 4z" />
    <path
      d={muted ? "m16 9 6 6m0-6-6 6" : "M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"}
    />
  </svg>
  {muted ? "Unmute" : "Mute"}
</MuteButton>
```

`bind:muted` keeps the button and the parent component's state in sync.

**Solid**

```tsx title="pages/index.tsx"
import { createSignal } from "solid-js"
import { MuteButton } from "@/components/ui/mute-button"

function Example() {
  const [muted, setMuted] = createSignal(false)

  return (
    <MuteButton muted={muted()} onMutedChange={setMuted}>
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m11 5-6 4H2v6h3l6 4z" />
        <path
          d={
            muted()
              ? "m16 9 6 6m0-6-6 6"
              : "M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"
          }
        />
      </svg>
      {muted() ? "Unmute" : "Mute"}
    </MuteButton>
  )
}

export { Example }
```

**Web Components**

Pass the initial value through the `muted` attribute:

```html title="pages/index.html"
<mute-button muted="false">
  <button>
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m11 5-6 4H2v6h3l6 4z" />
      <path data-volume d="M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" />
    </svg>
    <span data-label>Mute</span>
  </button>
</mute-button>
```

Then listen for `mutedchange` from your browser entry point, after the button's markup is on the page:

```ts title="main.ts"
import "@/components/ui/mute-button"

let muted = false
const button = document.querySelector("mute-button")
const icon = button?.querySelector("[data-volume]")
const label = button?.querySelector("[data-label]")

if (button && icon && label) {
  button.addEventListener("mutedchange", (event) => {
    muted = (event as CustomEvent<{ value: boolean }>).detail.value
    button.setAttribute("muted", String(muted))
    icon.setAttribute(
      "d",
      muted ? "m16 9 6 6m0-6-6 6" : "M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"
    )
    label.textContent = muted ? "Unmute" : "Mute"
  })
}
```

The adapter reads `muted="false"` as the boolean `false`. Each event updates the value, icon and label together.

Click to switch between Mute and Unmute. The parent component controls the value, icon and label.

Pressing **Mute** updates `muted` in the parent component. The button receives the new value, and the icon and label update with it.

## Changes

This button needs two presses to confirm. The first arms it; a timer disarms it if you don't press again.

Create `change` once in `api`, then call it from a method when an interaction happens:

```ts
api: (context) => {
  const change = createChange(context)
  return {
    arm: (event?: Event) => change("armed", true, { reason: "press", event }),
  }
},
```

Calling `arm` asks for `armed: true`. It calls `onArmedChange` first, then writes the value if the callback allows it and the app isn't controlling `armed`.

The return value tells you whether the request was accepted. It's `false` if the value was already the same or the callback canceled it. For controlled state, `true` means the request was accepted; the app still needs to pass the value back.

Use `context.store.set` for internal bookkeeping that needs no callback, such as the item with the tab stop:

```ts
context.store.set({ pending: true })
```

## What a Change Reports

Try a click, a keyboard press, and the timeout. The callback can tell them apart. Turn on **Lock** to refuse changes.

A callback gets the requested value and a `details` object. For example, the app can refuse to arm the button:

```ts
onArmedChange: (armed, details) => {
  if (armed && locked) {
    details.cancel()
  }
},
```

- `reason` says what happened, such as `"press"` or `"timeout"`.
- `event` is the DOM event behind it, when there is one.
- `source` says how it happened: `"mouse"`, `"touch"`, `"pen"`, `"keyboard"`, `"virtual"`, `"programmatic"` or `"agent"`.
- `cancel()` refuses the request; `canceled` records that decision.

A virtual click has no pointer or keyboard press behind it and may come from assistive technology. Agent calls through `@ui-sdk/core/agent` report `"agent"`. Use the source for things like analytics and focus choices, without changing which actions are available.

Call `details.cancel()` to refuse an uncontrolled change. Calling `event.preventDefault()` alone doesn't cancel it. With controlled state, the app decides by passing a new value or keeping the old one.

## Reasons

A reason describes the interaction, rather than just saying that something changed. Here, the app lets the Close button work but can refuse Escape.

Declare the reasons your callback can receive:

```ts
type NoticeOptions = {
  onOpenChange?: (
    open: boolean,
    details: ChangeDetails<"close-press" | "escape-key">
  ) => void
}
```

Use a shared reason when one fits. `ReasonVocabulary` lists them, and checking `details.reason` narrows `details.event`: `"escape-key"`, for example, gives you a `KeyboardEvent`. Development builds also warn when an event doesn't match its reason.

Custom reasons work too. A reason outside the vocabulary, such as `"validation"`, has `Event` as its event type.

`isDismissal` groups reasons such as Escape, a press outside and a swipe. Use it when the same rule applies to several ways of closing:

```ts
onOpenChange: (open, details) => {
  if (!open && isDismissal(details.reason) && hasUnsavedChanges) {
    details.cancel()
  }
},
```

## State a User Controls

The checkbox and the panel's trigger below share one value held by the app.

[Control the State](#control-the-state) shows how to connect the value, callback and `sync`. A few details matter when you make this reusable:

- Read `defaultOpen` when creating the state. Changing that option later doesn't reset the panel.
- Return only controlled values from `sync`. `{}` leaves state alone; `{ open: undefined }` overwrites it.
- Keep each key controlled or uncontrolled for the instance's lifetime. Development builds warn about switching, or passing both `open` and `defaultOpen`.
- Those checks cover `open`, `value` and `checked` by default. Use `controlled: ["expanded"]` to enable them for another key.

## Events That Aren't State

Sometimes a callback asks for an action, such as deleting a file. There's no state key named `delete` to update.

Use `dispatch` to call an option with the same details a change receives:

```ts
remove(file: string, event?: Event) {
  const canceled = dispatch(context, "onDelete", file, { reason: "delete-press", event })
  if (canceled) {
    return
  }
  context.store.set({ files: context.store.get().files.filter((name) => name !== file) })
},
```

`dispatch` returns `true` when the callback canceled the action. In this example, the app uses it to protect the readme.

## Commits

Drag the volume slider. The value changes throughout the drag, but **Saved** changes when you let go. Each arrow-key step saves immediately.

Use `createChange` for the ongoing value and `createCommit` for the end of the interaction. Both are created inside `api`:

```ts
const change = createChange(context)
const commit = createCommit(context)
```

While dragging, report each value:

```ts
change("value", value, { reason: "track-press", event })
```

On release, report the final value:

```ts
commit("value", context.store.get().value, { reason: "track-press", event })
```

Declare `onValueCommit` in the options schema and type it with `CommitDetails`. Add `commits: ["value"]` to the primitive definition so `observe` reports one committed change per interaction. A commit reports the value; it doesn't write it and can't be canceled.

The demo positions its thumb with `css`, which turns declarations into a `style` attribute and skips `undefined` values:

```ts
style: css({ left: `${state.value}%` }),
```

## Live State

Hover over the seats, then choose one. Hover changes often; the selected seat is a separate value.

List frequently updated keys in the primitive's `live` field:

```ts
live: ["hovered"],
```

Then use a slot's `live` field to write attributes directly to its element:

```ts
live: live((state, part) => ({
  "data-hovered": state.hovered === part.key ? "" : undefined,
})),
```

This updates the hover attribute without rendering the seat again. A render function that explicitly reads a live key still subscribes to it, so a label can show the hovered seat.

`selects` answers a different question: which parts need to hear about a state change? For the selected seat, each part only compares the value with its own key:

```ts
selects: selects({ selected: ({ key }) => [key] }),
```

When selection moves, the old and new seats hear about it. Array values are matched by membership; plain objects by entry. Only list keys read in these ways. A range comparison, such as filling every star up to a rating, needs updates for more than the old and new values.

## Attributes Kept Current

Typing in this filter updates each item's `hidden` attribute without rendering the items again.

Use `direct` when the attribute already belongs in `attrs`:

```ts
item: slot<{ value: string }>({
  props: { value: "string" },
  direct: direct(["hidden"]),
  attrs: (state, part) => ({
    hidden: part.key.toLowerCase().includes(state.query.toLowerCase()) ? undefined : "",
  }),
}),
```

Keeping `hidden` in `attrs` also puts it in server-rendered HTML. Use `live` for attributes driven by live state, and `direct` to keep selected attributes from `attrs` current between renders.

## Controllers

A controller lets code outside a component call its API. These buttons start and stop a countdown through one handle.

Give the handle the methods it should expose:

```ts
function createCountdownController() {
  return createController<{
    start: (seconds: number) => void
    stop: () => void
    left: () => number
  }>()
}
```

The primitive takes a `controller` option with schema kind `"value"`, and the handle drives whatever its `api` returns:

```ts
return {
  start,
  stop,
  left: () => context.store.get().left,
}
```

Create the handle once and pass it to the component's `controller` option. `controller.start(30)` forwards to the attached instance's `start` method. Before the component attaches it, a method does nothing and returns `undefined`. The handle detaches when the instance is destroyed.

The methods choose their own change reasons. For example, the countdown's `start` method calls `change("left", seconds, { reason: "imperative" })`; each timer tick uses `"timeout"`.

## Undo

Paint a few pixels, then undo and redo. The buttons and keyboard shortcuts share one undo stack.

`createUndoStack` stores snapshots of any value. Record the result after each edit:

```ts
const stack = createUndoStack(pixels)
stack.record(nextPixels)

const previous = stack.undo()
if (previous !== undefined) {
  show(previous)
}
```

`undo()` and `redo()` return the value to show, or `undefined` when there's no step left. They don't update your component's state themselves. `canUndo()` and `canRedo()` tell you when to disable the buttons. Recording a new edit after undoing replaces the redo branch.

For keyboard shortcuts, `matchesShortcut(event, "mod+z")` recognizes Command on Apple platforms and Control elsewhere. Use `"mod+shift+z"` for redo.

To record every change on a page, including an agent's, and step back through them, see [History and Undo](./agents.md#history-and-undo).

### Undo for Typing

Typing usually feels better when a run of edits takes one undo step. Try typing, pausing, and typing again. **Fix** replaces “teh” in every step; **Clear** starts over.

```ts
const stack = createUndoStack("", { limit: 10, groupDelay: 800 })

stack.record(text, { group: "typing" })
stack.seal()
stack.map((text) => text.replaceAll("teh", "the"))
stack.reset("")
```

Edits in the same `group` join a step while the gaps stay below `groupDelay`. Call `seal()` when that run should end, such as when the caret moves. `limit` caps the undo steps, `map` rewrites every snapshot, and `reset` starts the stack over from a new value.

## How People Are Working

Tab to the save button, then try clicking it. The hint follows how focus arrived.

`sourceOf(event)` identifies a mouse, touch, pen, keyboard, virtual or programmatic event. Without an event, `sourceOf()` reports the last keyboard or pointer input. `isFocusFromKeyboard()` checks whether focus just arrived from the keyboard:

```ts
save: slot({
  press: ({ api }, event) => api.save(sourceOf(event)),
  on: { focus: (_event, { store }) => store.set({ hint: isFocusFromKeyboard() }) },
}),
```

`createChange` starts input tracking when the primitive is created, so its first change can identify the input behind it.

## Changes from Elsewhere

An image load or a timer doesn't need a pointer or key event. Shared reasons such as `"image-load"` and `"timeout"` already resolve to a programmatic source. To supply your own source resolver, pass it as the second argument:

```ts
const change = createChange(context, () => "programmatic")
```

A controlled drag has one more timing concern: its draft may need to stay visible until the app returns the committed value. `settleDraft(store, value, before, clear)` handles that handoff. Pass a getter as `value`, the value from before the commit as `before`, and a cleanup that checks it's still clearing the same draft. [Drag and Drop](./core.md#drag-and-drop) shows it in a reordering example.

## API Reference

### What a Change Reports

- `reason` (`string`): Why it changed, like `"escape-key"`. Example: [What a Change Reports](#what-a-change-reports).
- `event?` (`Event`): The DOM event behind it, typed by `reason`. Undefined for controllers and cascades. Example: [What a Change Reports](#what-a-change-reports).
- `source` (`ChangeSource`): How the user caused it: `"mouse"`, `"touch"`, `"pen"`, `"keyboard"`, `"virtual"` (a click with no pointer or key behind it, which may be assistive technology), `"agent"` (an AI agent's call through `@ui-sdk/core/agent`) or `"programmatic"`. For analytics and focus choices, never for behavior. Example: [What a Change Reports](#what-a-change-reports).
- `cancel` (`() => void`): Stops the change. A controlled component ignores it, since the next value comes from you. Example: [What a Change Reports](#what-a-change-reports).
- `canceled` (`boolean`): Whether `cancel()` was called. Example: [What a Change Reports](#what-a-change-reports).

### What a Commit Reports

- `reason` (`string`): What changed the value, like `"drag"` or `"step-key"`. Example: [Commits](#commits).
- `event?` (`Event`): The DOM event that ended the interaction, or the one behind the last change when the end was another kind, like a blur after a wheel. Undefined for controllers. Example: [Commits](#commits).
- `source` (`ChangeSource`): How the user caused it, like `"mouse"` or `"keyboard"`. Example: [Commits](#commits).

### Undo

- `limit?` (`number`): How many entries are kept. Example: [Undo for Typing](#undo-for-typing).
- `groupDelay?` (`number`): Milliseconds of pause after which typing starts a new entry. Example: [Undo for Typing](#undo-for-typing).

- `record` (`(state: unknown, { group, time }?: { group?: string; time?: number; }) => void`): Records the state after an edit. Edits of the same `group`, like "insert" or "delete", join the last entry while they come within `groupDelay` of each other. Without a group, the edit is its own entry. Example: [Undo](#undo).
- `seal` (`() => void`): Ends the open group, so the next edit starts an entry, like after a caret jump. Example: [Undo for Typing](#undo-for-typing).
- `undo` (`() => unknown`): Steps back, and returns the state to show, or `undefined` at the first entry. Example: [Undo](#undo).
- `redo` (`() => unknown`): Steps forward again, and returns the state to show, or `undefined` at the last entry. Example: [Undo](#undo).
- `canUndo` (`() => boolean`): Whether there's an entry to step back to. Example: [Undo](#undo).
- `canRedo` (`() => boolean`): Whether there's an entry to step forward to. Example: [Undo](#undo).
- `map` (`(update: (state: unknown) => unknown) => void`): Rewrites every entry, like a token's status changing everywhere without an entry of its own. Example: [Undo for Typing](#undo-for-typing).
- `reset` (`(state: unknown) => void`): Starts over from `state`, like after a controlled value from outside. Example: [Undo for Typing](#undo-for-typing).

## Next

Next, [Customize a Behavior](./core.md#customize-a-behavior) changes the keys and rules of a behavior you imported. That's the last Core guide. [Reference](./core.md#reference) lists every export by the job it does, and [Behaviors](./core.md#all-behaviors) has the building blocks for focus, selection, popups and more.


# Customize a Behavior

Change a rule, add or remove a key, refuse a change, and build your own behavior on top of one.

[Compose Behaviors](./core.md#compose-behaviors) built a rating from `createChange` and `createRovingFocus`. Each behavior came with rules of its own: roving focus decides which keys move focus, where each one goes, and which star Tab lands on. When your component needs something different, keep the behavior and change it in one of these places:

| You Want To                               | Where                                                |
| ----------------------------------------- | ---------------------------------------------------- |
| Change one of its rules                   | [An option](#change-a-rule)                          |
| Add a key, or take one away               | [Your `api`, around the call](#add-a-key)            |
| Choose what happens after it runs         | [What the call returns](#choose-what-a-move-does)    |
| Reuse your version in other components    | [A function around the behavior](#extend-a-behavior) |
| Change a behavior other than roving focus | [The same places, by behavior](#other-behaviors)     |
| Stop a change from outside                | [The change callback](#refuse-a-change)              |
| Take a key from outside the component     | [Your own event handler](#handle-an-event-first)     |

We'll keep working on [that rating](./core.md#complete-primitive). Each step changes a few lines of `rating.ts` or the code that renders it.

## Change a Rule

Each rule a behavior follows is an option. The rating wraps from the last star to the first because it passes `loop`. To stop at either end, change that option in `createRovingFocus`:

```ts
loop: () => false,
```

Most options are functions, so a rule can depend on state or on the component's own options. They run each time the behavior needs an answer.

Start here for any behavior: its options are listed with its guide, and [All Behaviors](./core.md#all-behaviors) links to each one. For roving focus, [Focus and Keys](./core.md#roving-focus) covers `orientation`, `loop`, `disabled`, `focusable`, `preferred` and `remember`.

One option goes further. `move` replaces every built-in key, which fits a layout the built-in keys don't describe, such as a [keypad](./core.md#any-layout). To add one key and keep the rest, wrap the call.

## Add a Key

Roving focus doesn't listen for keys by itself. The star's `keydown` handler calls `api.keydown`, and that calls `roving.keydown`. The call is yours, so you can handle a key before the behavior sees it.

Let's make the number keys jump to a star. Update `keydown` in the object returned from `api`:

```ts {2-14}
keydown(event: KeyboardEvent, el: HTMLElement) {
  const modified = event.ctrlKey || event.metaKey || event.altKey
  const star = modified
    ? undefined
    : roving.items().find((item) => item.key === event.key)
  if (star) {
    event.preventDefault()
    roving.focus(star.key)
    change("value", Number(star.key), {
      reason: "list-navigation",
      event,
    })
    return
  }

  const moved = roving.keydown(event, el)
  if (moved) {
    change("value", Number(moved.key), {
      reason: "list-navigation",
      event,
    })
  }
},
```

- `roving.items()` returns the stars that can take focus. Each star's key is its value, so pressing 4 finds the fourth star.
- `roving.focus(key)` moves focus to that star. The tab stop follows the new rating, as it did before.
- Every other key still reaches `roving.keydown`, so the arrows, Home and End work as before.

Focus a star and press 4. The arrows, Home and End still work.

## Take a Key Away

To drop a key, return before the call. Add this at the top of `keydown`, and Home and End no longer change the rating:

```ts
if (event.key === "Home" || event.key === "End") {
  return
}
```

The behavior never sees the key, so the browser handles it as usual.

## Choose What a Move Does

`roving.keydown` moves focus and tells you where it went. It returns `key`, the item it moved to, `from`, the item it left, and `shift`, whether Shift was held. For a key that isn't its own, it returns `undefined`.

What a move means is up to the component. The rating selects the star it lands on:

```ts
const moved = roving.keydown(event, el)
if (moved) {
  change("value", Number(moved.key), { reason: "list-navigation", event })
}
```

A row of buttons can ignore the result, so focus moves and nothing else changes. A file list uses `shift` to extend a selection, as [Ranges and Select All](./core.md#ranges-and-select-all) shows.

## Extend a Behavior

The number keys now live inside the rating. To use them in other components, move them into a function that wraps the behavior and returns it with your `keydown` in place of the original:

```ts title="number-keys.ts"
import {
  createRovingFocus,
  type PrimitiveContext,
  type RovingFocusOptions,
} from "@ui-sdk/core"

function createNumberKeys<State extends object>(
  context: PrimitiveContext<any, State, any>,
  options: RovingFocusOptions<State>
) {
  const roving = createRovingFocus(context, options)

  return {
    ...roving,
    keydown(event: KeyboardEvent, el: HTMLElement) {
      const modified = event.ctrlKey || event.metaKey || event.altKey
      const items = roving.items()
      const from = items.find((item) => item.el === el)
      const to = modified
        ? undefined
        : items.find((item) => item.key === event.key)
      if (from && to) {
        event.preventDefault()
        roving.focus(to.key)
        return { key: to.key, from: from.key, shift: event.shiftKey }
      }

      return roving.keydown(event, el)
    },
  }
}

export { createNumberKeys }
```

- It takes the same `context` and options as `createRovingFocus`, so each component still passes its own rules.
- `...roving` keeps `bind`, `tabIndex`, `items` and the rest.
- Its `keydown` returns the same result as the original, so a component treats a number key like any other move.

In `rating.ts`, call `createNumberKeys` in place of `createRovingFocus` and leave its options as they are. `keydown` goes back to what it was in Compose Behaviors:

```ts
keydown(event: KeyboardEvent, el: HTMLElement) {
  const moved = roving.keydown(event, el)
  if (moved) {
    change("value", Number(moved.key), { reason: "list-navigation", event })
  }
},
```

Any group whose keys are numbers can use it now. A row of page buttons passes its own slot and `orientation`, and gets the number keys with them.

Your `keydown` runs wherever your component calls it. You can replace `focus` or `tabIndex` the same way. Inside, the behavior keeps using its own methods: when focus lands on an item, it calls the original `remember`. To change what it does by itself, use its options.

## Other Behaviors

The other behaviors change in the same places. Their rules are options too. Where roving focus returns each move from `keydown`, a behavior that changes a value hands you the value to write, through `set`.

A selection writes each new value through `set`, so a limit goes there. This one allows three toppings:

```ts
const selection = createSelection(context, {
  key: "value",
  set: (value, details) => value.length <= 3 && change("value", value, details),
  order: () => roving.items().map((item) => item.key),
  multiple: () => true,
})
```

`set` returns whether the value went through. Returning `false` leaves the selection as it was.

Here's where to look in the behaviors you'll use most. Each name links to its guide:

| Behavior                                                                 | Rules You Can Change                                   | What It Hands You                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`createRovingFocus`](./core.md#roving-focus)                    | `orientation`, `loop`, `disabled`, `focusable`, `move` | Each move, returned from `keydown`                                     |
| [`createGridFocus`](./core.md#grids)                             | `disabled`, `pageSize`                                 | Each move, in `onMove`                                                 |
| [`createSelection`](./core.md#selecting-items)               | `multiple`, `selectable`                               | Each selection, in `set`                                               |
| [`createListbox`](./core.md#options-you-search)                  | `filter`, `loop`                                       | Each highlight, in `onHighlight`                                       |
| [`createReorder`](./core.md#reordering)                  | `orientation`, `group`, `disabled`                     | Each order, in `set`, and each announcement, in `message`              |
| [`createTransfer`](./core.md#moving-between-lists)       | `accepts`, `order`, `disabled`                         | Each move between lists, in `set`, and each announcement, in `message` |
| [`createMove`](./core.md#moving-in-two-dimensions) | `bounds`, `step`, `disabled`                           | Each position, in `set`, and each announcement, in `message`           |
| [`createResize`](./core.md#resizing-boxes)         | `min`, `max`, `aspect`, `bounds`                       | Each size, in `set`, and each announcement, in `message`               |
| [`createPopup`](./core.md#pick-its-behavior)                    | A preset, and `role`                                   | Each open and close, in `onOpenChange`                                 |

A `message` can reword one announcement and keep the others, since each default is exported: `reorderMessage`, `transferMessage`, `moveMessage` and `resizeMessage`. [What's Read Out](./core.md#whats-read-out) shows one.

## Refuse a Change

The next two steps need no changes to `rating.ts`. They're for whoever renders the rating.

Every change the rating makes goes through `change`, which calls `onValueChange` before it writes the value. The callback can refuse. Here a review form keeps the value as it is while it saves:

**React**

```tsx
<Rating
  aria-label="Rating"
  onValueChange={(value, details) => {
    if (saving) {
      details.cancel()
    }
  }}
>
  {children}
</Rating>
```

**Vue**

```vue
<Rating
  aria-label="Rating"
  @value-change="(value, details) => saving && details.cancel()"
>
  <slot />
</Rating>
```

**Svelte**

```svelte
<Rating
  aria-label="Rating"
  onValueChange={(value, details) => {
    if (saving) {
      details.cancel()
    }
  }}
>
  {@render children()}
</Rating>
```

**Solid**

```tsx
<Rating
  aria-label="Rating"
  onValueChange={(value, details) => {
    if (saving()) {
      details.cancel()
    }
  }}
>
  {props.children}
</Rating>
```

**Web Components**

```ts
const rating = document.querySelector<HTMLElement>("my-rating")!

rating.addEventListener("valuechange", (event) => {
  if (saving) {
    event.preventDefault()
  }
})
```

It refuses a press, an arrow key and a number key alike, since they all ask through `change`. To refuse only some of them, check `details.reason`: the rating reports `item-press` and `list-navigation`. [What a Change Reports](./core.md#what-a-change-reports) lists everything a callback gets.

Focus still follows the keys while a change is refused. Only the value stays.

`cancel()` refuses a change the rating would write itself. If you pass `value`, you decide instead: keep the old value and the rating stays where it is.

## Handle an Event First

An event handler you pass to a part runs before the part's own. Call `event.preventDefault()` and the part skips its handler for that event.

Say the rating sits in a table row, where Up and Down move between rows. Take those two keys and leave the others to the rating:

**React**

```tsx
<RatingStar
  value="3"
  onKeyDown={(event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      moveRow(event.key)
    }
  }}
/>
```

**Vue**

```vue
<script setup lang="ts">
function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault()
    moveRow(event.key)
  }
}
</script>

<template>
  <RatingStar value="3" @keydown="onKeydown" />
</template>
```

**Svelte**

```svelte
<RatingStar
  value="3"
  onkeydown={(event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      moveRow(event.key)
    }
  }}
/>
```

**Solid**

```tsx
<RatingStar
  value="3"
  onKeyDown={(event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      moveRow(event.key)
    }
  }}
/>
```

**Web Components**

```ts
const rating = document.querySelector<HTMLElement>("my-rating")!

rating.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      moveRow(event.key)
    }
  },
  { capture: true }
)
```

Listen in the capture phase, on the rating or anything around it. The star's own listener is on its button, so a plain listener added to that button later runs after it.

Left, Right, Home, End and the number keys still belong to the rating. `preventDefault()` also stops what the browser would do with the key, such as scrolling the page.

Both work the same way on the ready-made components, since they're built from the same pieces. [Tabs](./components/tabs.md) takes `onValueChange` with `details.cancel()`, and a key handler on its list runs before the arrow keys do. With web components, listen in the capture phase there too.

## Replace One Behavior

Behaviors don't know about each other. The rating's `createChange` and `createRovingFocus` meet only in your `api`. So when a component needs focus rules of its own, you can write that one piece yourself and keep the rest: changes, callbacks and controlled state stay as they are.

## Keep Building

- [Focus and Keys](./core.md#focus-and-keys) has every roving focus option, with a demo for each.
- [Handle Changes](./core.md#handle-changes) goes further into callbacks, reasons and controlled state.
- [Testing](./core.md#testing) checks that the keyboard still matches the pattern after you change it.


# Reference

Find the pieces you need to build your component.

Find the Core helpers for managing state, adding interactions, and working with the browser. Each section has a small example and links to the relevant guide.

ui-sdk hasn't reached 1.0 yet, so any of these can still change between releases. The ones marked experimental are the likeliest to.

## State and Parts

`definePrimitive` puts a component's state, methods and parts together. Inside its `api`, use `createChange` to report a change:

```ts
import { createChange } from "@ui-sdk/core"

const change = createChange(context)

return {
  mute: () => change("muted", true, { reason: "press" }),
}
```

Calling `mute` reports the new value through `onMutedChange`. The same helper handles both controlled and uncontrolled state, as the [controlled mute button](./core.md#control-the-state) shows.

- [Define a Primitive](./core.md#define-a-primitive) covers options, slots, events and cleanup.
- [Handle Changes](./core.md#handle-changes) covers callbacks, controlled state and undo.

## Add an Interaction

Say you're building a row of buttons. `createRovingFocus` gives the row one Tab stop and moves between buttons with the Left and Right arrow keys. Inside the primitive's `api`:

```ts
import { createRovingFocus } from "@ui-sdk/core"

const roving = createRovingFocus(context, {
  slot: "item",
  key: "focused",
  orientation: () => "horizontal",
  loop: () => true,
})
```

This chooses how focus moves. [Focus and Keys](./core.md#roving-focus) shows how to connect it to the buttons. [Compose Behaviors](./core.md#compose-behaviors) uses it to build the star rating.

For other interactions, start here:

| I want to…                                  | Guide                                                    |
| ------------------------------------------- | -------------------------------------------------------- |
| Choose one or more items                    | [Selection](./core.md#selection)                       |
| Reorder items or move them between lists    | [Drag and Drop](./core.md#drag-and-drop)               |
| Move, resize or swipe an element            | [Dragging and Resizing](./core.md#dragging-and-resizing) |
| Render a long list or edit an item in place | [Lists](./core.md#lists)                               |
| Navigate and expand nested items            | [Trees](./core.md#trees)                               |
| Animate a change in layout                  | [Transitions and Gestures](./core.md#transitions-and-gestures)           |
| Position and dismiss a popup                | [Popups and Layers](./core.md#popups-and-layers)                  |
| Pan, zoom or connect items on a canvas      | [Canvas](./core.md#canvas)                             |
| Work with calendar dates                    | [Dates](./core.md#dates)                                          |

## Use a Helper on Its Own

Some helpers work without a primitive. For example, after a copy succeeds, you can announce it to a screen reader:

```ts
import { announce } from "@ui-sdk/core"

announce("Copied")
```

[Platform](./core.md#platform) covers announcements, page direction and keyboard shortcuts. [Text](./core.md#text) covers searching, matching and language.

To check what you've built, [Testing](./core.md#testing) shows how to test state, keyboard behavior and accessibility.


# Text

Find items by typing, rank search results, highlight matches, bring back earlier messages and format text in the right language.

Use `createTypeahead` to find items as someone types, `fuzzyScore` to rank search results, `matchRanges` or `matchSegments` to highlight matches, and `createInputHistory` to bring back earlier messages with the arrow keys.

`pageLocale` and `userLocale` read the page's or user's language for matching and formatting.

## Find an Item by Typing

Start with a few labels. `createTypeahead()` remembers the keys you type and returns the index of the matching item:

```ts
import { createTypeahead } from "@ui-sdk/core"

const fruits = ["Apple", "Pear", "Plum"]
const typeahead = createTypeahead()

typeahead("p", fruits, 0) // 1 (Pear).
typeahead("l", fruits, 1) // 2 (Plum).
```

The third argument is the current index. Pressing “p” searches after Apple; pressing “l” soon after continues the query as “pl”. A search with no match returns `-1`.

Try it below. Type “p” repeatedly to cycle through the matching fruit, or type “pl” quickly to find Plum.

In a keydown handler, use `isTypeaheadKey(event)` from `@ui-sdk/core` to check whether a key types a character. It leaves arrows and shortcuts such as Ctrl+C out of the search. [Focus and Keys](./core.md#typeahead) shows how to connect the result to roving focus.

## What an Item Is Called

An item's label may include a shortcut hint. `labelOf(el)` reads the name and skips text marked `aria-hidden`:

```html
<button id="copy-command">Copy <kbd aria-hidden="true">⌘C</kbd></button>
```

```ts
import { labelOf } from "@ui-sdk/core"

const button = document.getElementById("copy-command")!
labelOf(button) // "Copy".
```

Use those labels when you call your typeahead search. If an item has no visible text, `labelOf` uses its `aria-label` instead. An icon button with `aria-label="Delete"` can be found by typing “d”.

Try “c” for Copy or Cut, and “d” for Delete:

## Names with Spaces

By default, keys typed within 500 milliseconds of each other form one query. Pass a longer timeout if people need more time:

```ts
const typeahead = createTypeahead(1500)
```

While a query is active, Space continues it, so “new y” can find New York. `typeahead.active()` tells you whether a query is in progress. Use that to decide whether Space should continue searching or activate the current item.

`typeahead.reset()` clears the query immediately. For example, call it when your component handles Escape:

```ts
if (event.key === "Escape") {
  typeahead.reset()
}
```

Try “new y” below. Enter picks the city; Space picks it when no search is active. Escape clears the search, and the checkbox gives you more time between keys.

## Rank What Someone Searches For

A search field often needs to filter and sort a whole list. `fuzzyScore(text, query)` returns a score from `0` to `1`. Keep results above zero, then put the best matches first:

```ts
import { fuzzyScore } from "@ui-sdk/core/text-match"

const commands = ["Open settings", "Settings", "Git push"]
const query = "set"

const ranked = commands
  .map((command) => ({ command, score: fuzzyScore(command, query) }))
  .filter(({ score }) => score > 0)
  .sort((a, b) => b.score - a.score)

ranked.map(({ command }) => command) // ["Settings", "Open settings"].
```

An exact match scores highest, followed by a match at the start of the label. Letters can also match in order, so “gp” finds “Git push”. An empty query gives every item a score of `1`.

Try “gp”, “set” or “resu” below:

Matching follows the user's language. Case and accents are ignored when that language treats them as equivalent, so someone typing “resume” can find “Résumé”.

## Highlight What Matched

Once you have a result, show which part matched. `matchRanges` finds the ranges; `matchSegments` splits the original text into pieces you can render:

```ts
import { matchRanges, matchSegments } from "@ui-sdk/core/text-match"

const ranges = matchRanges("Settings", "set", "startsWith")
// [{ start: 0, end: 3 }].

matchSegments("Settings", ranges)
// [{ text: "Set", match: true }, { text: "tings", match: false }].
```

Render each matching segment inside a `<mark>` element. The original text stays intact, including its case and accents.

Choose the matching mode your search uses:

| Mode           | What it highlights                                                                         |
| -------------- | ------------------------------------------------------------------------------------------ |
| `"contains"`   | The first occurrence of the query.                                                         |
| `"startsWith"` | The query at the start of the label, ignoring leading whitespace.                          |
| `"fuzzy"`      | The whole query when it appears, preferring a word start; otherwise, its letters in order. |

No match gives you an empty range array. The exported types are `MatchRange`, with `start` and `end` like `slice` takes, and `MatchSegment`, with `text` and `match`.

Change the mode below to see the difference:

## The Page's Language

Use the page's language when you format something for the reader. `pageLocale()` reads the document's `lang`, with the browser's preferred language as a fallback:

```ts
import { pageLocale } from "@ui-sdk/core"

const price = new Intl.NumberFormat(pageLocale(), {
  style: "currency",
  currency: "EUR",
})

price.format(12.5)
```

For a section with its own `lang`, pass an element from that section to `pageLocale(el)`. It reads the nearest `lang` attribute. Inside a primitive, `bind` is a good place to read it because the element is in the page.

`userLocale()` reads the browser's preferred language directly. The search helpers use this language when comparing what someone typed. If no locale is available, the helpers return `undefined`, and `Intl` uses its runtime's default.

Pick a language below to see prices and sorting change. In Swedish, Å and Ö sort after Z.

The same locale works with `Intl.DateTimeFormat`, `Intl.ListFormat` and `Intl.Collator`. [Dates](./core.md#dates) covers calendar dates.

## Tags from Elsewhere

A server or an older system might give you `en_US`, while `Intl` expects `en-US`. `toLocale` normalizes these tags:

```ts
import { toLocale } from "@ui-sdk/core"

toLocale("en_US") // "en-US".
toLocale("de_DE.UTF-8") // "de-DE".
toLocale("??") // undefined.
```

It returns `undefined` for an invalid tag, so you can pass the result to `Intl` and let it use the default locale.

Try a few tags below:

## Properly Handle Input Method Editors

Chinese, Japanese, Korean, Vietnamese and many other languages are typed through an input method editor, or IME. It turns keystrokes into text in steps: typing "nihon" in Japanese shows にほん, then Space offers 日本, and Enter confirms it. Until then, the text is still being composed, and a field that acts on every keystroke acts on fragments.

### Search as Someone Types

Every step of a composition fires an `input` event, so a search on each one runs for にh and にほn before the word is done. Skip the events `isComposing(event)` marks, and search once the input method commits, on `compositionend`:

```ts
import { isComposing } from "@ui-sdk/core"

field.addEventListener("input", (event) => {
  if (!isComposing(event)) search(field.value)
})
field.addEventListener("compositionend", () => search(field.value))
```

Chrome and Firefox end the composition after its last `input` event, so `compositionend` is what brings the committed text. On Android, Gboard composes English words too, so results there change a word at a time.

Type with a Japanese or Chinese input method: the search waits for the text you confirm. Turn off the waiting to see a search for every step of the composition.

### Enter to Send

Enter often confirms what an input method suggests, so a field that sends on Enter would send half-written text. Check `isComposing(event)` before acting on the key:

```ts
textarea.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey || isComposing(event)) return
  event.preventDefault()
  send()
})
```

`isComposing` takes React's events too, so the same lines go in `onChange` and `onKeyDown`. It reads the event's `isComposing`, and counts key code 229 as composing, because Safari on macOS ends the composition before that last Enter arrives and reports it as not composing. No state to keep: every event says for itself whether the input method has it. Core's own components already handle both.

## Bring Back Earlier Messages

Use `createInputHistory` to step through what someone sent before, the way a terminal or a chat box does. ArrowUp brings back the previous entry, ArrowDown the next one, and ArrowDown past the newest brings back what they were typing.

Create it in `api` with three functions: one returns the earlier entries, oldest first, and the other two read and write the field's value:

```ts
import { createInputHistory } from "@ui-sdk/core"

const history = createInputHistory({
  entries: () => options().history,
  read: () => store.get().value,
  write: (value) => store.set({ value }),
})
```

Then hand it the field's key presses. `keydown` returns `true` when it brought back an entry, so your own keys, like Enter to send, come after it:

```ts
root: slot({
  on: {
    keydown: (event, { api }) => {
      if (api.history.keydown(event)) return
      if (event.key === "Enter" && !event.shiftKey && !isComposing(event)) {
        event.preventDefault()
        api.send()
      }
    },
  },
}),
```

Press ArrowUp to bring back an earlier message, and ArrowDown to return to what you were typing. Send a message with Enter, and it's the first one ArrowUp brings back.

In a textarea, the arrow keys move between lines first. An entry comes back only when the caret is on the first line for ArrowUp, or the last line for ArrowDown, counting the lines a long message wraps onto. The caret goes to the end of the entry it brings back.

Edits to an entry you brought back stay while you move through the others. When `entries` changes, like after a send, it starts again from the newest. Call `history.reset()` to do the same yourself.

Entries that are objects made from your messages, like `messages.map((m) => ({ id: m.id, text: m.text }))`, are new every time. Pass `getEntryKey`, like `(entry) => entry.id`, and entries are matched by key instead: the one you brought back keeps its place when the list is made again, or when a new message arrives while you're stepping through.

It leaves the arrow keys alone while a modifier is held, while an input method is composing, while text is selected in a textarea, and on a read-only field. It also leaves them to a popup, like a suggestion menu, while the field's `aria-expanded` is `"true"` or the field has `data-open`, which a Trigger Menu sets on its textarea. On an input, it works for the `text`, `search`, `url` and `tel` types, so a number field keeps its steps.

### Report It as a Change

When your component reports value changes with `createChange`, write through it with the reason `"history-key"`. `onValueChange` then hears each entry that comes back, and can cancel it. A canceled change keeps the value as it was and leaves the key to the browser:

```ts
write: (value, event) =>
  change("value", value, { reason: "history-key", event }),
```

### Values That Aren't Text

Entries can be any value, like a list of text and tokens. For an editor that isn't an input or a textarea, pass `atEdge(direction, event)` too: return `true` when the caret is on the first line for `"up"`, or the last line for `"down"`.

## API Reference

| For                                                                    | Helpers                                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Finding an item as someone types](#find-an-item-by-typing)            | `createTypeahead`, `isTypeaheadKey`; the search has `active()` and `reset()`. |
| [Reading an item's label](#what-an-item-is-called)                     | `labelOf`                                                                     |
| [Ranking search results](#rank-what-someone-searches-for)              | `fuzzyScore`                                                                  |
| [Highlighting matches](#highlight-what-matched)                        | `matchRanges`, `matchSegments`, `MatchRange`, `MatchSegment`                  |
| [Choosing a language](#the-pages-language)                             | `pageLocale`, `userLocale`, [`toLocale`](#tags-from-elsewhere)                |
| [Handling input method editors](#properly-handle-input-method-editors) | `isComposing`                                                                 |
| [Bringing back earlier messages](#bring-back-earlier-messages)         | `createInputHistory`; the history has `keydown()` and `reset()`.              |

The ranking and highlighting helpers come from `@ui-sdk/core/text-match`. The other helpers come from `@ui-sdk/core`.


# Numbers

Step, scale, format and read numbers in someone's language, with one keyboard map for numeric controls.

`@ui-sdk/core/number` provides steps and bounds, scales, formatting, parsing and the keyboard map numeric controls share.

The helpers are plain functions that run without a DOM. Slider, Number Input, Progress and Meter use the same helpers, so a control of your own steps, formats and reads numbers the way they do.

## Bounds and Steps

### Snap to a Step

`scrubTo` puts a value on the step grid within the bounds, and `stepValue` moves a number of steps from it. Both round away floating point noise, so `0.1 + 0.2` steps land on `0.3`:

```ts
import { clamp, roundTo, scrubTo, stepValue } from "@ui-sdk/core/number"

const range = { min: 0, max: 10, step: 0.25 }

scrubTo(3.3, range).value // 3.25
stepValue(3.3, 1, range) // 3.5, off the grid moves onto it first
stepValue(9.9, 1, range) // 10
clamp(14, 0, 10) // 10
roundTo(0.1 + 0.2, 2) // 0.3
```

The grid starts at `min` when it's finite, like a native range input, so `{ min: 1, max: 10, step: 2 }` steps through 1, 3, 5, 7 and 9. `maxOnGrid` returns that highest value, and `decimalsOf` counts a number's decimals. Give the range `snap` points and `scrubTo` lands on those too, as [scrubbing](#snap-while-scrubbing) shows. A step of 0 has no grid, so values stay exactly as they are, within the bounds.

### Loops

`wrap` keeps a value in a loop, for hues, angles, clock faces and carousels that go round:

```ts
import { wrap } from "@ui-sdk/core/number"

wrap(370, 0, 360) // 10
wrap(-15, 0, 360) // 345
wrap(slide + 1, 0, slides.length) // the next slide, back to the first after the last
```

## Keys

### One Keyboard Map

`stepFromKey` reads a key into a move, as the APG's slider and spinbutton patterns describe: Up and Right step up, Down and Left step down, Shift takes the large step and Alt the small one, Page Up and Down take the large step, and Home and End go to the bounds. `stepBy` applies the move:

```ts
import { stepBy, stepFromKey } from "@ui-sdk/core/number"

const range = { min: 0, max: 20, step: 0.5, largeStep: 5, smallStep: 0.1 }

function onKeyDown(event: KeyboardEvent) {
  const move = stepFromKey(event, { arrows: "vertical" })
  if (!move) return
  event.preventDefault()
  value = stepBy(value, move, range)
}
```

Focus the quantity and press the arrows, with Shift or Alt for bigger and smaller steps, then Home and End. Type a weight and press Enter: it snaps to the step.

Right to left flips Left and Right on a horizontal control, as `{ dir: "rtl" }`; a vertical one keeps them. `{ arrows: "vertical" }` leaves Left and Right to a text caret, as a number field does. Without `largeStep`, a large step is ten steps; without `smallStep`, a small step is one. While an input method composes, like a Japanese one typing full-width digits, `stepFromKey` returns null, so an arrow that picks a candidate doesn't also step.

A move is `{ direction, size }` or `{ bound }`, so a control can treat a bound its own way, like a slider's thumb that stops at its neighbor.

## Positions and Scales

### Value to Position

`fractionOf` gives where a value sits between bounds, from 0 to 1, and `valueAt` gives the value at a position. Together they place a thumb, fill a bar and turn a press into a value:

```ts
import { fractionOf, scrubTo, valueAt } from "@ui-sdk/core/number"

fractionOf(30, { min: 0, max: 120 }) // 0.25
const pressed = valueAt((event.clientX - box.left) / box.width, range)
scrubTo(pressed, range).value
```

Values outside the bounds sit at an end, and bounds that are the same give 0.

### Log and Custom Scales

On a log scale, each tenfold takes the same distance, as frequency, volume and zoom controls need. Pass `"log"`, with a positive `min`, or a `to` and `from` pair that maps values into an even space and back:

```ts
fractionOf(200, { min: 20, max: 20000 }, "log") // 0.33: 20 to 200 is a third of the way
valueAt(0.5, { min: 20, max: 20000 }, "log") // 632, halfway by ratio

const area = { to: Math.sqrt, from: (position: number) => position * position }
fractionOf(25, { min: 0, max: 100 }, area) // 0.5: a size that feels even by area, like a brush
```

Drag the slider to turn the needle from 1° to 180°, then switch between Linear and Log. On the log scale, small angles get most of the slider: 45° sits 73% along, and halfway turns it only 13°.

To step a scaled control evenly, step its position and read the value back, like `valueAt(stepBy(fraction, move, { min: 0, max: 1, step: 0.01 }), range, "log")`.

## Scrubbing

### Snap While Scrubbing

Give a range `snap` points and a `threshold`, and a scrub lands on a point when it comes that close, like a timeline's chapters or an editor's keyframes. `scrubTo` reads a pointer or a slider, and `stepBy` takes the same points for keys: a step stops at the first point it reaches ahead, and leaves the point it's on freely:

```ts
import { scrubTo, stepBy, stepFromKey } from "@ui-sdk/core/number"

const range = {
  min: 0,
  max: 60,
  step: 0.1,
  snap: { points: [0, 9.5, 24, 38.5, 52], threshold: 1.5 },
}

scrubTo(23, range) // { value: 24, point: 24 }
scrubTo(23, range, { snap: false }) // { value: 23, point: undefined }

function onKeyDown(event: KeyboardEvent) {
  const move = stepFromKey(event)
  if (!move) return
  event.preventDefault()
  time = stepBy(time, move, range, { snap: !event.metaKey })
}
```

`{ snap: false }` ignores the points, like while Cmd is held or for a typed number, and still lands on the step grid. A slider's `input` event doesn't say which keys are down, so read them from its pointer events:

```tsx
<input
  type="range"
  onPointerDown={(event) => (free = event.metaKey)}
  onPointerMove={(event) => (free = event.metaKey)}
  onChange={(event) =>
    setTime(scrubTo(Number(event.target.value), range, { snap: !free }).value)
  }
/>
```

Drag the slider: the playhead snaps to each section as it comes within 1.5 seconds, and arrow keys stop at each one. Hold Command or Ctrl to scrub and step freely.

`point` says which snap point a value is pulled to, so a release can commit `point ?? value`. With `{ ease: true }`, a value near a point moves toward it instead of jumping: not at all at the threshold, faster as it closes in, and onto the point at the end. Show `value` while dragging, and land on `point`:

```ts
scrubTo(23.25, range, { ease: true }) // { value: 23.625, point: 24 }
scrubTo(22.5, range, { ease: true }) // { value: 22.5, point: 24 }, at the threshold
```

Pass a curve over closeness, from 0 at the threshold to 1 on the point, like `{ ease: (t) => t * t }`, to change how the pull builds. [Collapse Past a Threshold](./core.md#collapse-past-a-threshold) eases a sidebar into collapsing.

A control that leaves Up and Down to the page, like a timeline in a list of tracks, passes `{ arrows: "horizontal" }` to `stepFromKey`.

## Formatting

### Numbers in Any Language

`formatNumber` shows a value through `Intl.NumberFormat` in a locale: currencies, percents, units and compact counts, with the locale's own digits and separators. Pass a function for text of your own. Null and values that aren't finite show as empty text:

```ts
import { formatNumber } from "@ui-sdk/core/number"

formatNumber(1234.5, "de-DE", { style: "currency", currency: "EUR" }) // "1.234,50 €"
formatNumber(1234.5, "ja-JP", { style: "currency", currency: "JPY" }) // "￥1,235"
formatNumber(1234.5, "zh-CN", { style: "currency", currency: "CNY" }) // "¥1,234.50"
formatNumber(0.256, "en-US", { style: "percent", maximumFractionDigits: 1 }) // "25.6%"
formatNumber(1234567, "en-US", { notation: "compact" }) // "1.2M"
formatNumber(3, "en-US", (value) => `${value} of 5 stars`) // "3 of 5 stars"
```

Use the same text for a control's `aria-valuetext`, so screen readers hear what's shown. `numberFormatter` returns the `Intl.NumberFormat` itself, built once per locale and options.

### Ranges and Parts

`formatNumberRange` writes what both ends share once, and `formatNumberToParts` returns each digit group and symbol, to style them apart or roll digits like an odometer:

```ts
import { formatNumberRange, formatNumberToParts } from "@ui-sdk/core/number"

formatNumberRange(5, 10, "en-US", { style: "currency", currency: "USD" }) // "$5.00 – $10.00"
formatNumberToParts(1234.5, "en-US", { style: "currency", currency: "USD" })
// [{ type: "currency", value: "$" }, { type: "integer", value: "1" }, { type: "group", value: "," }, …]
```

Pick a locale and a style. The large number is built from its parts, with the fraction and currency dimmed, and the range shares what both ends have.

## Typing a Number

### Read What People Type

`parseNumber` reads a number typed in a locale's format: its digits, group and decimal separators, minus signs, and currency, percent and unit text. It returns null for text that isn't a number, and percent formats divide by 100. `isPartialNumber` says whether text could still become one, so a field can wait on a lone `"-"` instead of rejecting it:

```ts
import { isPartialNumber, parseNumber } from "@ui-sdk/core/number"

parseNumber("1.234,5", "de-DE") // 1234.5
parseNumber("٣٫٥", "ar-EG") // 3.5
parseNumber("50 %", "fr-FR", { style: "percent" }) // 0.5
parseNumber("-", "de-DE") // null
isPartialNumber("-", "de-DE") // true
```

Type an amount the way the locale writes it, or switch the locale. A number that's on its way waits; text that can't become one is marked.

## API Reference

All of these functions come from `@ui-sdk/core/number`.

| You Want To                               | Use                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Keep a value on a step grid within bounds | [`scrubTo`, `stepValue`, `clamp`, `roundTo`, `decimalsOf`, `maxOnGrid`](#snap-to-a-step)                  |
| Keep a value in a loop                    | [`wrap`](#loops)                                                                                          |
| Turn keys into steps                      | [`stepFromKey`, `stepBy`](#one-keyboard-map)                                                              |
| Map values to positions and back          | [`fractionOf`, `valueAt`](#value-to-position)                                                             |
| Snap a scrub to points                    | [`scrubTo`, `stepBy`](#snap-while-scrubbing)                                                              |
| Show numbers in someone's language        | [`formatNumber`, `formatNumberRange`, `formatNumberToParts`, `numberFormatter`](#numbers-in-any-language) |
| Read typed numbers                        | [`parseNumber`, `isPartialNumber`](#read-what-people-type)                                                |


# Dates

Work with calendar dates, build month grids, and read and format dates in someone's language.

`@ui-sdk/core/date` provides date arithmetic, month grids, localized labels, and parsing for calendars and date fields.

The helpers work with date strings such as `"2026-10-16"` and run without a DOM. Calendar and Date Picker use the same helpers.

## Dates as Strings

### Real Dates

Build a date with `isoDate`, and read its fields with `dateParts`. Months run from 1 to 12. Both functions return `undefined` when the date doesn't exist:

```ts
import { dateParts, isISODate, isoDate } from "@ui-sdk/core/date"

isoDate(2026, 10, 16) // "2026-10-16"
isoDate(2026, 2, 30) // undefined
dateParts("2026-10-16") // { year: 2026, month: 10, day: 16 }
isISODate("2026-02-30") // false
```

Change February 30 to February 28 to get a valid date. Pick another date below to read its year, month, and day, or press Today.

These strings use `YYYY-MM-DD`, the same format as `<input type="date">`. Valid dates sort in date order, so comparisons such as `start < end` work directly.

To bring in an existing value, use `toISODate`. It accepts an ISO string, a `Date`, or an object with `year`, `month`, and `day`, including a `Temporal.PlainDate`:

```ts
import { toISODate } from "@ui-sdk/core/date"

toISODate({ year: 2026, month: 10, day: 16 }) // "2026-10-16"
toISODate(new Date()) // Today's date in the runtime's local time zone.
```

A `Date` represents an instant, so this conversion uses its local year, month, and day. The resulting string has no time zone.

## Arithmetic

### Whole Days

For a three-night stay, add three days to check-in:

```ts
import { addDays, daysBetween } from "@ui-sdk/core/date"

addDays("2026-12-24", 3) // "2026-12-27"
daysBetween("2026-12-24", "2026-12-27") // 3
```

Negative numbers move backward. The arithmetic uses whole days, so crossing a daylight saving change doesn't add or lose a day.

Use `clampDate` to keep a date inside a booking season. `weekday` returns 0 for Sunday through 6 for Saturday:

```ts
import { clampDate, weekday } from "@ui-sdk/core/date"

clampDate("2026-10-20", "2026-11-01", "2027-01-31") // "2026-11-01"
weekday("2026-12-24") // 4: Thursday.
```

Change the check-in date or number of nights. Try a check-in before November 1 to see it move into the booking season.

### Weeks and Months

Moving by months keeps the day when possible. January 31 becomes February 28 because February has no 31st:

```ts
import { addMonths, addYears } from "@ui-sdk/core/date"

addMonths("2026-01-31", 1) // "2026-02-28"
addYears("2028-02-29", 1) // "2029-02-28"
```

For boundaries, use `startOfWeek` and `endOfWeek`, or `startOfMonth` and `endOfMonth`. The week helpers take the first weekday, with 0 for Sunday:

```ts
import {
  daysInMonth,
  endOfMonth,
  isSameMonth,
  startOfWeek,
} from "@ui-sdk/core/date"

startOfWeek("2026-10-16", 1) // "2026-10-12": Monday.
endOfMonth("2026-02-10") // "2026-02-28"
daysInMonth(2028, 2) // 29
isSameMonth("2026-09-28", "2026-10-04") // false
```

Press + Month from January 31, then change which day starts the week. Reset and add two years to try the same move in a leap year.

## Month Grids

### A Month to Pick From

`monthGrid` returns rows of seven ISO dates. Days from the neighboring months fill the edges. Choose the first weekday with `weekStartsOn`:

```ts
import { firstDayOfWeek, monthGrid } from "@ui-sdk/core/date"

const weeks = monthGrid("2026-10-01", {
  weekStartsOn: firstDayOfWeek("de-DE"),
})
// The first week runs from "2026-09-28" to "2026-10-04".
```

Render one row per week and one button per date. This example adds [roving focus](./core.md#roving-focus), using each date as a key. Its custom `move` adds one day for a horizontal arrow or seven for a vertical arrow. When focus reaches another month, the example renders that month.

Tab into the month and use the arrow keys to move by days and weeks. Move beyond the month to turn the page, or change the locale to see a different first weekday.

### Weeks That Fit the Month

A grid has six weeks by default, which keeps adjacent calendars the same height. Pass `fixedWeeks: false` to return only the weeks the month needs:

```ts
monthGrid("2026-02-01").length // 6
monthGrid("2026-02-01", { fixedWeeks: false }).length // 4
```

Clear Six weeks each. February, March, and August 2026 need four, five, and six rows when weeks start on Sunday.

## Names and Labels

### Names in Any Language

Pass a locale to format a date for the person reading it. Without one, these functions use the runtime's locale:

```ts
import { formatDate, formatDateRange } from "@ui-sdk/core/date"

formatDate("2026-10-16", "de-DE") // "Freitag, 16. Oktober 2026"
formatDate("2026-10-16", "en-US", { month: "long", year: "numeric" }) // "October 2026"
formatDateRange("2026-10-16", "2026-10-20", "en-US") // "Oct 16 – 20, 2026"
```

`formatDate` takes `Intl.DateTimeFormat` options. Its default includes the weekday, day, month, and year, which makes a useful accessible label for a day button.

For a calendar's headings, get month and weekday names separately. Keep the weekday names in the same order as the grid:

```ts
import { firstDayOfWeek, monthNames, weekdayNames } from "@ui-sdk/core/date"

const firstDay = firstDayOfWeek("de-DE") // 1: Monday.
const weekdays = weekdayNames("de-DE", "short", firstDay)
const months = monthNames("de-DE")
```

You can get the page's locale with [`pageLocale`](./core.md#the-pages-language). `firstDayOfWeek` also respects an explicit week preference, such as `"en-US-u-fw-mon"` for Monday.

Change the locale to compare the date label, range, weekday order, and month names. Choose Persian to see localized labels on the same Gregorian dates.

For a label with separate styles, `formatDateToParts` returns each formatted piece and its type:

```ts
import { formatDateToParts } from "@ui-sdk/core/date"

const parts = formatDateToParts("2026-10-16", "en-US", {
  month: "long",
  day: "numeric",
})
// [{ type: "month", value: "October" }, { type: "literal", value: " " }, { type: "day", value: "16" }]
```

These helpers use `Intl` and reuse its formatters. They keep month and day labels aligned with the Gregorian grid. A locale that uses different months, such as Persian, uses Gregorian labels; calendars that share those months, such as Thai Buddhist, can keep their own years. `dateFormatter(locale, options)` exposes the cached formatter when you need it directly.

### Today

`todayDate()` returns today's date where the code runs. Pass a time zone when the date belongs to a particular place:

```ts
import { todayDate } from "@ui-sdk/core/date"

todayDate()
todayDate("Asia/Tokyo")
```

Compare today's date in each city with Here, the browser's local date. Cities can show different dates near midnight.

For server rendering, pass the same time zone on the server and client, or wait until the component mounts to mark today.

## Typing a Date

### Read What People Type

`parseDate` reads the locale's date order and returns an ISO date. It returns `undefined` for incomplete or invalid input:

```ts
import { parseDate } from "@ui-sdk/core/date"

parseDate("10/16/2026", "en-US") // "2026-10-16"
parseDate("16.10.2026", "de-DE") // "2026-10-16"
parseDate("16 oct 2026", "fr") // "2026-10-16"
parseDate("Feb 30", "en-US") // undefined
```

Dots, slashes, and spaces work as separators. The parser also accepts ISO dates, month names, locale digits, and digits without separators, such as `"16102026"` in German.

When the year is missing, the parser uses the reference date's year. That defaults to the current year. Pass `referenceDate` when the result should stay predictable:

```ts
parseDate("October 16", "en-US", { referenceDate: "2026-01-01" }) // "2026-10-16"
parseDate("16.10.70", "de-DE", { referenceDate: "2026-01-01" }) // "1970-10-16"
parseDate("16.10.70", "de-DE", { referenceDate: "2060-01-01" }) // "2070-10-16"
```

Two-digit years fall in the 100-year window ending 20 years after the reference year.

Type a date, then change the locale to try another order. Enter 16.10.70 in German and change the reference year from 2026 to 2060 to see which century is used.

Use `datePattern` for the input's placeholder and a hint showing the order:

```ts
import { datePattern } from "@ui-sdk/core/date"

const pattern = datePattern("de-DE")
pattern.fields // ["day", "month", "year"]
pattern.placeholder // "TT.MM.JJJJ"
pattern.separator // "."
// pattern.example is December 31 in the current year, written in this locale.
```

## API Reference

All of these functions come from `@ui-sdk/core/date`.

| You Want To                                  | Use                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Validate or convert a date                   | [`isoDate`, `isISODate`, `dateParts`, `toISODate`](#real-dates)                                                                            |
| Move a date or measure a stay                | [`addDays`, `daysBetween`, `weekday`, `clampDate`](#whole-days)                                                                            |
| Move between months or find their boundaries | [`addMonths`, `addYears`, `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `daysInMonth`, `isSameMonth`](#weeks-and-months)       |
| Build rows for a calendar                    | [`monthGrid`](#month-grids)                                                                                                                |
| Label dates and calendar headings            | [`formatDate`, `formatDateRange`, `formatDateToParts`, `monthNames`, `weekdayNames`, `firstDayOfWeek`, `dateFormatter`](#names-and-labels) |
| Find today in a time zone                    | [`todayDate`](#today)                                                                                                                      |
| Read typed dates or show their format        | [`parseDate`, `datePattern`](#typing-a-date)                                                                                               |


# Colors

Read, convert and write CSS colors, fit them to what a screen can show, and check their contrast.

`@ui-sdk/core/color` reads CSS colors, converts them between color spaces, writes them back as CSS, fits them to a screen's gamut and compares two colors.

The helpers are plain functions on plain data, and they run without a DOM. A color input, a swatch list or a theme editor of your own reads and writes colors with them.

## Colors as Data

### Read a CSS Color

`parseColor` reads any CSS color into its space, three channels and an alpha. It returns null for text that isn't a color:

```ts
import { parseColor } from "@ui-sdk/core/color"

parseColor("#ff0000") // { space: "srgb", coords: [1, 0, 0], alpha: 1 }
parseColor("oklch(0.7 0.15 250 / 50%)") // { space: "oklch", coords: [0.7, 0.15, 250], alpha: 0.5 }
parseColor("rebeccapurple") // { space: "srgb", coords: [0.4, 0.2, 0.6], alpha: 1 }
parseColor("not a color") // null
```

It reads hex, named colors, `transparent`, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, and `color()` in the `srgb`, `srgb-linear`, `display-p3` and `xyz` spaces, with the older comma syntax like `rgba(255, 0, 0, 0.5)` too. A color keeps the space it was written in, and its channels use the ranges CSS gives them: 0 to 1 for sRGB and Display P3, 0 to 100 for percentages like HSL's saturation, and degrees for hues. Values past a range that CSS clamps, like `rgb(300 0 0)`, are clamped the same way.

### Missing Channels

A channel written as `none` is missing, and reads as null. A grey has no hue, so converting one to a space with a hue leaves the hue missing too:

```ts
import { convertColor, parseColor } from "@ui-sdk/core/color"

parseColor("oklch(0.7 0.1 none)")!.coords // [0.7, 0.1, null]
convertColor(parseColor("white")!, "oklch").coords // [1, 0, null]
```

A missing channel counts as 0 when the color converts. Keep the last hue yourself while someone drags to grey and back, so it doesn't jump to red.

## Converting

### Between Spaces

`convertColor` returns the same color in another space:

```ts
import { convertColor, parseColor } from "@ui-sdk/core/color"

const red = parseColor("red")!

convertColor(red, "hsl").coords // [0, 100, 50]
convertColor(red, "oklch").coords // [0.628, 0.258, 29.234], rounded
convertColor(red, "srgb") === red // true, it's already sRGB
```

The spaces are CSS's: `"srgb"`, `"srgb-linear"`, `"display-p3"`, `"hsl"`, `"hwb"`, `"lab"`, `"lch"`, `"oklab"`, `"oklch"`, `"xyz-d65"` and `"xyz-d50"`, plus `"hsv"`, the space most pickers draw their square in. OKLCH's lightness, chroma and hue change the way people see them change, so stepping its lightness keeps the hue, and two colors with the same lightness look equally light.

## Writing CSS

### Formats

`formatColor` writes a color as CSS, in its own space or in the format you pass:

```ts
import { formatColor, parseColor } from "@ui-sdk/core/color"

const red = parseColor("red")!

formatColor(red) // "rgb(255 0 0)"
formatColor(red, "hex") // "#ff0000"
formatColor(red, "oklch") // "oklch(0.628 0.2577 29.23)"
formatColor(red, "display-p3") // "color(display-p3 0.9175 0.2003 0.1386)"
formatColor(red, "oklch", { precision: 3 }) // "oklch(0.63 0.26 29)"
```

`"srgb"` writes `rgb()`, and the spaces with no function of their own write `color()`. An alpha below 1 goes after a slash, or into a fourth byte in hex. HSV has no CSS syntax, so an HSV color writes `hsl()`.

`precision` sets the significant digits per channel, 5 by default, counted against each channel's range: `rgb()` gets two decimals and OKLCH's lightness four. Hex, `rgb()`, `hsl()` and `hwb()` only hold sRGB colors, so a wider color is clipped to fit. Map it with [`toGamut`](#fit-a-screen) first to keep it closer.

Type any CSS color, like #7654cd or lab(60 40 -60), and each format updates. The line below says which screens can show it. Try oklch(0.7 0.35 150) to go past P3.

## Gamut

### Fit a Screen

A gamut is the range of colors a screen can show. Every screen shows sRGB, and most phones and laptops show the wider P3. `isInGamut` says whether a color fits, and `toGamut` returns the closest color that does, in the color's own space:

```ts
import { formatColor, isInGamut, parseColor, toGamut } from "@ui-sdk/core/color"

const green = parseColor("oklch(0.7 0.25 150)")!

isInGamut(green) // false
isInGamut(green, "p3") // true
formatColor(toGamut(green)) // "oklch(0.7091 0.2103 147.07)"
formatColor(toGamut(green), "hex") // "#00c248"
toGamut(green, "p3") === green // true, it already fits
```

`toGamut` maps the way CSS Color 4 and browsers do: it lowers the chroma in OKLCH, keeping the lightness and hue, until clipping what's left is too small to see. That keeps a vivid green green, where clipping each channel can shift its hue.

## Mixing

### Mix Two Colors

`mixColor` mixes two colors the way CSS `color-mix()` does. Pass how much of the second color you want, from 0 to 1:

```ts
import { formatColor, mixColor, parseColor } from "@ui-sdk/core/color"

const blue = parseColor("#2563eb")!
const yellow = parseColor("#facc15")!

formatColor(mixColor(blue, yellow), "hex") // "#90a3ad", halfway in Oklab
formatColor(mixColor(blue, yellow, 0.25, { space: "srgb" })) // "rgb(90.25 125.25 181.5)"
```

Colors mix in Oklab by default, where the steps between two colors look even. Set `space` to mix in another one, and the result is in that space. Translucent colors mix by their alpha, as `color-mix()` does, so a transparent color doesn't darken the other.

Pick two colors to see the steps between them. Choose sRGB and the middle turns darker, or OKLCH and it stays vivid, passing through green.

### Hues

In a space with a hue, like OKLCH or HSL, the hue takes the shorter way around the color wheel. Set `hue` to `"longer"`, `"increasing"` or `"decreasing"` to go another way:

```ts
const red = parseColor("oklch(0.63 0.26 29)")!
const violet = parseColor("oklch(0.55 0.25 300)")!

mixColor(red, violet, 0.5, { space: "oklch" }).coords[2] // 344.5, through pink
mixColor(red, violet, 0.5, { space: "oklch", hue: "longer" }).coords[2] // 164.5, through green
```

## Comparing

### Contrast

`contrastRatio` gives the WCAG 2 contrast ratio between two colors, from 1 to 21. Text needs 4.5 against its background, or 3 when it's large:

```ts
import { contrastRatio, parseColor } from "@ui-sdk/core/color"

contrastRatio(parseColor("#767676")!, parseColor("white")!) // 4.54
```

The order doesn't matter, and alpha doesn't count, so blend a translucent color over its background first.

Pick a text color and a background. The ratio says whether the text passes WCAG's 4.5 for text or 3 for large text. Darken the gray until it passes for all text.

### Distance

`colorDistance` measures how different two colors look, as the distance between them in Oklab. About 0.02 is the smallest difference most people notice:

```ts
import { colorDistance, parseColor } from "@ui-sdk/core/color"

colorDistance(parseColor("red")!, parseColor("#fe0000")!) // 0.002, too small to see
```

Use it to tell whether a swatch already holds a color, or to find the nearest one in a palette.


# Images

Cut a region out of an image into a new file, turned, flipped, scaled or round.

`@ui-sdk/core/image` cuts a region out of an image and returns it as a new image file. Use it after someone picks a crop, like an avatar from a photo, and submit or upload the file it returns.

## Crop an Image

`cropImage` takes an image, the region to keep and options for the file it writes. The region is in the image's own pixels, whatever size the image shows at on the page:

```ts
import { cropImage } from "@ui-sdk/core/image"

const file = await cropImage(photo, { x: 120, y: 40, width: 600, height: 600 })

file.name // "photo.png", from the photo's name
file.type // "image/png"
```

The image can be a file from an `<input type="file">`, a URL, an `<img>`, a `<canvas>` or an `ImageBitmap`. A URL from another origin needs CORS, or the browser won't let the page read its pixels. The promise resolves with a `File`, so `FormData` and `fetch` take it as it is.

## Turn and Flip

Set `rotation` to turn the image a quarter turn clockwise at a time, and `flipX` or `flipY` to mirror it. The region's `x` and `y` count from the top left of the image as it shows after it's turned and flipped:

```ts
const file = await cropImage(photo, {
  x: 0,
  y: 0,
  width: 300,
  height: 400,
  rotation: 90,
  flipX: true,
})
```

So a 400 by 300 photo turned by 90 is 300 wide and 400 tall, and the region above keeps all of it.

Turn or flip the image, then press Crop. The top-left square of the turned image becomes a 96 pixel file. Check Circle for round corners.

## The File

| Option    | What it sets                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------ |
| `type`    | `"image/png"` by default, or `"image/jpeg"` or `"image/webp"`                                    |
| `quality` | From 0 to 1, for JPEG and WebP                                                                   |
| `width`   | The width in pixels. Left out, it follows `height` at the region's ratio, or the region's width  |
| `height`  | The height in pixels. Left out, it follows `width` at the region's ratio, or the region's height |
| `shape`   | `"circle"` keeps the ellipse inside the region and leaves the corners transparent                |
| `name`    | The file's name, instead of the source's name with the new extension                             |

Pass `width` alone to scale the crop, like a 256 pixel avatar from a much larger photo:

```ts
const avatar = await cropImage(photo, crop, {
  type: "image/webp",
  quality: 0.9,
  width: 256,
  shape: "circle",
})
```

A browser that can't write the type you ask for writes PNG instead, and the file's `type` and name say which it wrote. JPEG has no transparency, so a circle's corners turn black there. Use PNG or WebP for round crops.


# Storage

Keep a value between visits, follow changes, and read cookies on the server.

Use the storage helpers to save a value and read it back later. They support localStorage, sessionStorage, and cookies, and let you listen for changes.

For a user preference, such as a theme or sidebar state, pass a storage to [`createPreference`](./core.md#remember-the-choice).

## Choose a Storage

Choose by how long the value should last and whether the server needs to read it:

| Storage                | Lasts                         | Shared With             | Server Reads It |
| ---------------------- | ----------------------------- | ----------------------- | --------------- |
| `createLocalStorage`   | Until removed                 | Other tabs on the site  | No              |
| `createSessionStorage` | While the tab is open         | This tab                | No              |
| `createCookieStorage`  | One year, or `maxAge` seconds | Requests and other tabs | Yes             |

A note you want to keep between visits can use localStorage. A temporary draft can use sessionStorage. A preference that changes server-rendered content can use a cookie.

## Keep a Value

These helpers store strings under a name, which becomes the localStorage or sessionStorage key, or the cookie's name:

```ts
import { createLocalStorage } from "@ui-sdk/core"

const note = createLocalStorage("note")

note.set("Buy milk")
note.get()
note.remove()
note.get()
```

The first `get()` returns `"Buy milk"`. After `remove()`, it returns `null`.

Type a note and reload. Switch storage types, or open another tab, to see which values carry over.

## When Storage Is Unavailable

A browser can block storage or run out of space. If a read fails, `get()` returns `null`. For localStorage and sessionStorage, `set` and `remove` return `true` when the write succeeds, or `false` when it fails.

Use `available()` for an initial check. A later write can still fail, so check its return value too:

```ts
if (!note.available()) {
  console.log("Saving is unavailable here.")
}

if (!note.set("Buy milk")) {
  console.log("The note wasn't saved.")
}
```

A full storage may still let you read or remove an existing value.

For cookies, `true` means no error was reported. It doesn't confirm that the cookie was saved or removed.

On the server, localStorage and sessionStorage are unavailable. To read a saved value there, [use a cookie](#read-a-cookie-on-the-server).

## Follow Changes

Read the starting value with `get`, then subscribe to changes. `subscribe` doesn't call your listener with the initial value:

```ts
function logNote(value: string | null) {
  console.log(value ?? "")
}

logNote(note.get())
const stop = note.subscribe(logNote)
```

Writes through a storage with the same kind and ID notify listeners on the page, including writes through `note` itself. LocalStorage also follows changes in other tabs. Cookies follow other tabs in browsers that support `cookieStore`.

Call the returned function when you no longer need the subscription, such as when the component unmounts:

```ts
stop()
```

## Read a Cookie on the Server

Pass the request's `Cookie` header to read a saved value during server rendering:

```ts
import { createCookieStorage } from "@ui-sdk/core"

function readDensity(request: Request) {
  const density = createCookieStorage("density", {
    cookie: request.headers.get("cookie"),
  })

  return density.get()
}
```

Create the storage inside your request handler, as above, so each visitor's cookie stays separate. In the browser, it reads `document.cookie`.

On the server, `available()` returns `true` when you supply a `Cookie` header, but `set` and `remove` return `false`. The helper reads the request's cookies; it doesn't set response headers. Its `readsOnServer` flag lets helpers such as `createPreference` use the saved value in their initial state.

By default, cookies last one year, use path `/` and `SameSite=Lax`, and use `Secure` on HTTPS pages. You can change these with `maxAge`, `path`, `domain`, `sameSite`, and `secure`.

## Show a Value Before Hydration

The server can't read localStorage or sessionStorage. For styles that depend on a saved value, `script` generates JavaScript that puts it on a `data-*` attribute before hydration:

```ts
import { createLocalStorage } from "@ui-sdk/core"

const densityStorage = createLocalStorage("density")
const script = densityStorage.script({
  attribute: "data-density",
  values: ["comfortable", "compact"],
})
```

Render the element with its default attribute, such as `data-density="comfortable"`. Render `script` as inline JavaScript immediately after that element. It reads the saved value and updates the preceding element's attribute while the page loads.

Only values listed in `values` are written. Missing or invalid saved values leave the attribute as the server rendered it. Attribute names must start with `data-`.

The script updates the attribute. Read the storage when the component mounts and subscribe to keep its state current. When you [render the script in your framework](./server-rendering.md#render-the-storage-script-yourself), account for the attribute changing before hydration.

Scripts with the same storage kind and ID share one initial read. A cookie storage's `script` returns `undefined`, because the server can render the cookie's value itself.

For user preferences, [apply them with `Preferences`](./core.md#apply-preferences) to render one script and keep their attributes up to date.

## API Reference

- `id` (`string`): The ID the value is kept under: the localStorage or sessionStorage key, or the cookie's name. Example: [Keep a Value](#keep-a-value).
- `kind` (`Kind`): Where the value is kept: `"local"`, `"session"` or `"cookie"`. Example: [Choose a Storage](#choose-a-storage).
- `readsOnServer` (`boolean`): Whether the server reads the value too, so it renders right from the first render. True for cookies. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `script` (`(options: StorageScriptOptions) => string`): The inline script a component renders right after its root, which puts the saved value on the root before hydration, so CSS shows it on the first paint. Undefined for a cookie, since the server renders its value. Example: [Show a Value Before Hydration](#show-a-value-before-hydration).
- `available` (`() => boolean`): Whether storage appears available. A later write can still fail. On the server, a cookie with a request header is available for reading only. Example: [When Storage Is Unavailable](#when-storage-is-unavailable).
- `get` (`() => string | null`): The value kept under the ID, or null when nothing is, or the storage is unavailable. Example: [Keep a Value](#keep-a-value).
- `set` (`(value: string) => boolean`): Saves a value under the ID. Returns false when writing is unavailable or the browser reports a write failure. For cookies, true means the assignment didn't throw; it doesn't confirm the cookie was saved. Example: [Keep a Value](#keep-a-value).
- `remove` (`() => boolean`): Removes the value. Returns false when writing is unavailable or the browser reports a write failure. For cookies, true means the assignment didn't throw; it doesn't confirm the cookie was removed. Example: [Keep a Value](#keep-a-value).
- `subscribe` (`(listener: (value: string | null) => void) => () => void`): Hears the value change, through another storage with the same ID on the page or in another tab. Returns the function that stops it. Example: [Follow Changes](#follow-changes).

- `cookie?` (`string | null`): The request's `Cookie` header, so the server reads the same value the browser will. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `maxAge?` (`number`): How long the cookie lasts, in seconds. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `path?` (`string`): The paths that send the cookie. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `domain?` (`string`): The domain that sends the cookie. Defaults to the page's host. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `sameSite?` (`"lax" | "none" | "strict"`): Whether other sites' requests send the cookie. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).
- `secure?` (`boolean`): Whether only HTTPS requests send the cookie. Defaults to true on HTTPS pages. Example: [Read a Cookie on the Server](#read-a-cookie-on-the-server).

- `attribute` (``data-${string}``): The attribute that shows the value, which has to start with `data-`, like `"data-color-scheme"`. Example: [Show a Value Before Hydration](#show-a-value-before-hydration).
- `values` (`readonly string[]`): The values it may show. Anything else saved under the ID leaves the root as the server rendered it. Example: [Show a Value Before Hydration](#show-a-value-before-hydration).


# Platform

Announce a change, follow the page's direction, and adapt keyboard shortcuts to the user's platform.

Use `announce` to send messages to screen readers, `isRTL` to read text direction, and the shortcut helpers to match and label keyboard shortcuts for the user's platform.

These helpers are available from `@ui-sdk/core`. You can use them inside a primitive or on their own.

## Announcements

Say you've built a copy button. Once the copy succeeds, use `announce` to let a screen reader know:

```ts
import { announce } from "@ui-sdk/core"

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
  announce("Copied")
}
```

`announce` writes to a shared live region. By default, it asks the screen reader to wait for a pause before reading the message. Try it with a screen reader:

This is useful for results that aren't otherwise announced, like a list finishing a sort or a file being copied. Call it after the action succeeds, in an event handler or `bind`. Keep `attrs` and `state` free of side effects.

## Urgent Announcements

For something that needs attention now, use `priority: "assertive"`:

```ts
announce("Enter an email address", { priority: "assertive" })
```

This asks the screen reader to interrupt its current message. Use it sparingly; most updates can wait.

Some screen readers need the live region to exist before its text changes. If a component will announce soon after it appears, prepare the regions in its root's `bind`:

```ts
import { prepareAnnouncements } from "@ui-sdk/core"

root: slot({
  bind: (el) => prepareAnnouncements(el.ownerDocument),
}),
```

`announce` uses the current document by default. For an element inside a frame, pass its document too: `announce("Copied", { doc: el.ownerDocument })`.

## Direction

In a left-to-right pager, Right goes forward. In a right-to-left pager, Left does. Use `isRTL` to read an element's computed direction:

```ts
import { isRTL } from "@ui-sdk/core"

function isForwardKey(event: KeyboardEvent, el: HTMLElement) {
  const forward = isRTL(el) ? "ArrowLeft" : "ArrowRight"
  return event.key === forward
}
```

Call this from your key handler so it follows changes to the page's direction. Focus the pager below and try the arrow keys, then turn on **Right to left**:

[Roving Focus](./core.md#roving-focus) already handles this for Left and Right. For language rather than direction, see [The Page's Language](./core.md#the-pages-language). To follow the light or dark scheme people choose or their browser prefers, see [Preferences](./core.md#preferences).

## Shortcuts

Use `mod` for Command on Apple platforms and Control elsewhere. Inside a `keydown` handler, match the shortcut before calling your action:

```ts
import { matchesShortcut } from "@ui-sdk/core"

if (matchesShortcut(event, "mod+b")) {
  event.preventDefault()
  toggleBold()
}
```

Here, `toggleBold` is your own function. `matchesShortcut` only checks the keys; the handler prevents the browser's default action and runs yours.

The same shortcut string gives you both a visible label and an `aria-keyshortcuts` value:

```ts
import { ariaKeyshortcuts, formatShortcut } from "@ui-sdk/core"

formatShortcut("mod+b") // Displays “⌘B” on Apple platforms, “Ctrl+B” elsewhere.
ariaKeyshortcuts("mod+b") // "Meta+B" or "Control+B".
```

These labels depend on the user's platform. In a primitive, set them in `bind` so the server and initial client render stay consistent:

```ts
keys: slot({
  bind: (el) => {
    el.textContent = formatShortcut("mod+b")
  },
}),
```

Try the shortcut while typing in the note:

`formatShortcut` keeps the label in left-to-right order, even on a right-to-left page, by wrapping it in two invisible characters. For tests, import `setPlatform` from `@ui-sdk/core/testing` and call `setPlatform("apple")` or `setPlatform("other")`.

## Layers and Positioning

Building a popup? [Placing a Popup](./core.md#placing-a-popup) introduces `position`. [Layers of Your Own](./core.md#layers-of-your-own) covers `bindLayer`, the top layer, and keeping an element usable over a modal.

## API Reference

| Helper                             | Use it to…                                               |
| ---------------------------------- | -------------------------------------------------------- |
| `announce(text, options?)`         | Announce a result, with optional `priority` and `doc`.   |
| `prepareAnnouncements(doc)`        | Create the live regions before the first announcement.   |
| `isRTL(el)`                        | Read an element's text direction.                        |
| `matchesShortcut(event, shortcut)` | Check whether a key press matches a shortcut.            |
| `formatShortcut(shortcut)`         | Show the shortcut using the platform's symbols or names. |
| `ariaKeyshortcuts(shortcut)`       | Generate the value for `aria-keyshortcuts`.              |


# Mobile

Lay out around the on-screen keyboard and the safe areas of a phone, and tell a finger from a mouse.

On a phone, the page lays out for a screen people don't fully see: the on-screen keyboard covers its bottom, iOS pans the page to keep a field in view, and a notch or home indicator takes its edges. `bindViewport` measures all of it, and `bindAvoidKeyboard` keeps a bar above the keyboard. `createPointerKind` tells whether people use a finger or a mouse.

These helpers are available from `@ui-sdk/core`. You can use them inside a primitive or on their own.

## The Viewport

### Follow the Viewport

`bindViewport` follows the viewport on an element, often the root, and reports each change:

```ts
import { bindViewport } from "@ui-sdk/core"

const stop = bindViewport(document.documentElement, {
  onChange: (viewport) =>
    console.log(viewport.keyboard, viewport.safeArea.bottom),
})
```

`onChange` runs once at the start and again whenever something changes. `viewport.keyboard` is the keyboard's height while a field has focus, and `width`, `height`, `offsetTop` and `offsetLeft` describe the part of the page on screen, the visual viewport. Call the cleanup to stop.

The keyboard is measured on screen, against how much of it the page had before the field took focus. That holds while iOS zooms into a field and when the browser shrinks the whole page for the keyboard, where the page alone can't tell. `viewport.keyboardInset` is how much of the page's bottom the keyboard covers, for placing things: less while iOS pans the page, and 0 when the browser resizes the page for the keyboard instead.

Open this page on a phone and tap the field: the console logs the keyboard's height and how far iOS pans the page. Pinch to zoom to see the scale change.

For CSS, the element gets these variables, and `data-keyboard` while the keyboard is open:

| Variable                   | What it holds                                                      |
| -------------------------- | ------------------------------------------------------------------ |
| `--keyboard-inset`         | How much of the page's bottom the keyboard covers, `keyboardInset` |
| `--visual-viewport-width`  | The width of the part of the page on screen                        |
| `--visual-viewport-height` | Its height, which shrinks above the keyboard                       |
| `--visual-viewport-top`    | How far the page is panned down, like to show a field              |

iOS zooms into a field whose text is smaller than 16 pixels when it takes focus. Give fields at least `font-size: 16px` to keep the page at its size.

### Safe Areas

`viewport.safeArea` holds the insets around a notch, rounded corners or a home indicator, as numbers for script. In CSS, use `env(safe-area-inset-bottom)` directly. Both are 0 unless the page draws under them with `viewport-fit=cover`:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

The keyboard covers the home indicator, but iOS still reports its inset while the keyboard is open. Drop bottom padding then:

```css
.composer {
  padding-bottom: env(safe-area-inset-bottom);
}
.composer[data-keyboard] {
  padding-bottom: 0;
}
```

## The On-Screen Keyboard

### Keep a Bar Above the Keyboard

When a field takes focus, the browser scrolls that field into view above the keyboard, and nothing else. A status pill under a note, the buttons beside a field, or a toolbar fixed to the bottom of the screen stays where the keyboard covers it. `bindAvoidKeyboard` lifts such an element by as much of it as the keyboard covers:

```ts
import { bindAvoidKeyboard } from "@ui-sdk/core"

const stop = bindAvoidKeyboard(pill)
```

While the keyboard is open, a bar fixed to the bottom moves up to just above it. An element higher up moves only as far as the keyboard overlaps it, and one below the screen stays where it is. Where the browser resizes the page for the keyboard, like Android with `interactive-widget=resizes-content`, nothing is covered and nothing moves.

Open this page on a phone and tap the list: the browser keeps the text you're typing in view, and the pill under it rises above the keyboard instead of hiding behind it. Scroll with the keyboard open, and it stays above the keyboard until its card scrolls clear.

The element's bottom edge meets the keyboard, so for room between them, bind a wrapper with bottom padding, as the example does. The element's `translate` is the helper's, and the cleanup puts back your own. It gets `data-keyboard` while the keyboard is open, to drop safe-area padding or add a shadow. Scrolling moves it once a frame; leave `translate` without a transition, so it doesn't trail behind. The lift doesn't change layout, so give content behind the bar room with `var(--keyboard-inset)` from `bindViewport` if it should stay visible.

## The Right Keyboard

A phone picks its keyboard from the field: `inputmode` chooses the keys, like a number pad for a code, and `enterkeyhint` chooses the Return key, like "next" or "send", which iOS 26 draws as a glyph. [`inputHints`](./core.md#input-hints) in Focus and Keys fills them in for a kind of field, along with autofill and corrections.

## Touch and Mouse

### Pointer Kind

`createPointerKind` reports whether the main pointer is a finger or a mouse and whether it can hover, from the `pointer` and `hover` media features, plus `anyPointer` and `anyHover` for every pointer attached, like a trackpad on a tablet. Read it like a preference, with `usePreference` in each framework:

**React**

```tsx
import { createPointerKind } from "@ui-sdk/core"
import { usePreference } from "@ui-sdk/react/preferences"

const pointerKind = createPointerKind()

const { hover } = usePreference(pointerKind)
// "hover" with a mouse, "none" on a phone, "unknown" on the server
```

**Vue**

```ts
import { createPointerKind } from "@ui-sdk/core"
import { usePreference } from "@ui-sdk/vue/preferences"

const pointerKind = createPointerKind()

const pointer = usePreference(pointerKind)
// pointer.value.hover: "hover" with a mouse, "none" on a phone, "unknown" on the server
```

**Svelte**

```ts
import { createPointerKind } from "@ui-sdk/core"
import { usePreference } from "@ui-sdk/svelte/preferences"

const pointerKind = createPointerKind()

const pointer = usePreference(pointerKind)
// pointer.current.hover: "hover" with a mouse, "none" on a phone, "unknown" on the server
```

**Solid**

```tsx
import { createPointerKind } from "@ui-sdk/core"
import { usePreference } from "@ui-sdk/solid/preferences"

const pointerKind = createPointerKind()

const pointer = usePreference(pointerKind)
// pointer().hover: "hover" with a mouse, "none" on a phone, "unknown" on the server
```

**Web Components**

```ts
import { createPointerKind } from "@ui-sdk/core"

const pointerKind = createPointerKind()

const { hover } = pointerKind.get()
// "hover" with a mouse, "none" on a phone, "unknown" on the server
```

It's for behavior and content, like opening on tap where nothing can hover. Style with the media queries themselves, `@media (hover: hover)` or Tailwind's `pointer-coarse:`, which are right from the first paint.

With a mouse, the details open on hover. On a phone, they open on tap, and the button says so.

### Render on the Server

The server can't know the device, so every field is `"unknown"` in the server render and in the browser's first render, which hydrates against it. Right after hydration, the state catches up, and content that depends on it changes, like the button above gaining "(tap for details)". Styles written with the media queries don't wait: they're right from the first paint.

To render the right content from the start, create the pointer kind for each request with a guess for `initial`. Chromium browsers send a `Sec-CH-UA-Mobile` header, which `pointerKindOf` turns into one:

```ts
import { createPointerKind, pointerKindOf } from "@ui-sdk/core"

// On the server, for each request.
const initial = pointerKindOf(request.headers.get("Sec-CH-UA-Mobile"))

// On the server and in the browser, from the same `initial`.
const pointerKind = createPointerKind({ initial })
```

Send `initial` to the browser with the rest of the page's data, so its first render shows what the server's did and hydration matches. [Create one for each request](./server-rendering.md#read-a-cookie-on-the-server), not in a module, so visitors don't share a guess.

Safari and Firefox don't send the header, so `pointerKindOf` returns nothing there and the fields stay `"unknown"` until hydration. Content that changes should read sensibly while `"unknown"`, like the demo's plain "Shipping". If a cache stores the page, send `Vary: Sec-CH-UA-Mobile`, so phones and computers get their own copies.

## API Reference

| Helper                           | Use it to…                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `bindViewport(el, { onChange })` | Follow the keyboard, the visual viewport and the safe areas, in CSS and in script. |
| `bindAvoidKeyboard(el)`          | Keep an element above the on-screen keyboard.                                      |
| `createPointerKind({ initial })` | Tell a finger from a mouse, and whether anything can hover.                        |
| `pointerKindOf(header)`          | Guess the pointer on the server from `Sec-CH-UA-Mobile`.                           |


# All Behaviors

Focus, selection, popups and the other pieces your components are made of.

Browse the helpers by topic. Each name links to its guide and examples.

Import helpers from `@ui-sdk/core` unless a different entrypoint is shown.

## Focus and Keys

| Helper                                                               | What It Does                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`createRovingFocus`](./core.md#roving-focus)                          | Gives a group one Tab stop and moves focus with the arrow keys.          |
| [`createGridFocus`](./core.md#grids)                                   | Moves focus by row and column, including cells that aren't rendered yet. |
| [`byCell`](./core.md#one-tab-stop-in-a-grid)                           | Updates only the cell focus leaves and the cell it lands on.             |
| [`spatialMove`](./core.md#spatial-focus)                               | Chooses the next item from its position on screen.                       |
| [`nearestInDirection`](./core.md#choose-a-target-without-moving-focus) | Finds the nearest item in a direction without moving focus.              |
| [`createTypeahead`](./core.md#typeahead)                               | Finds an item as someone types its name.                                 |
| [`createFocusRecovery`](./core.md#focus-recovery)                      | Restores focus when the focused item is removed.                         |
| [`keepFocus`](./core.md#focus-that-follows-a-move)                     | Preserves focus through a change that moves an element.                  |
| [`inputHints`](./core.md#input-hints)                                  | Picks the on-screen keyboard and autofill for a kind of field.           |

## Text

| Helper                                                        | What It Does                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`createInputHistory`](./core.md#bring-back-earlier-messages)   | Brings back earlier entries with ArrowUp and ArrowDown, like a terminal.   |
| [`isTypeaheadKey`](./core.md#find-an-item-by-typing)            | Checks whether a key can be used for typeahead.                            |
| [`labelOf`](./core.md#what-an-item-is-called)                   | Reads an element's label for matching typed text.                          |
| [`isComposing`](./core.md#properly-handle-input-method-editors) | Checks whether an input event is part of text that's still being composed. |
| [`pageLocale`](./core.md#the-pages-language)                    | Reads the language of the page, or of one section of it.                   |
| [`userLocale`](./core.md#the-pages-language)                    | Reads the browser's preferred language.                                    |
| [`toLocale`](./core.md#tags-from-elsewhere)                     | Turns a tag like `en_US` into one that `Intl` accepts.                     |

### Search Matching

Import these helpers from `@ui-sdk/core/text-match`.

| Helper                                                 | What It Does                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| [`fuzzyScore`](./core.md#rank-what-someone-searches-for) | Scores how well a piece of text matches what someone typed.   |
| [`matchRanges`](./core.md#highlight-what-matched)        | Finds where the typed text appears in a piece of text.        |
| [`matchSegments`](./core.md#highlight-what-matched)      | Splits text into matched and unmatched pieces you can render. |

## Selection

| Helper                                                | What It Does                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [`createSelection`](./core.md#selecting-items)      | Tracks selected items, including multiple selections and ranges. |
| [`createLasso`](./core.md#rectangle-selection)      | Selects items touched by a rectangle drawn with the pointer.     |
| [`createCellRange`](./core.md#ranges-of-cells)      | Selects a rectangular range of grid cells.                       |
| [`byCellRange`](./core.md#select-a-block)           | Updates only the cells that join or leave a range.               |
| [`cellRangeMessage`](./core.md#selecting-from-code) | Provides the default announcements for a range of cells.         |
| [`cellsToText`](./core.md#copy-and-paste)           | Converts cell values to text for copying.                        |
| [`textToCells`](./core.md#copy-and-paste)           | Parses pasted text into rows of cell values.                     |

## Drag and Drop

| Helper                                                              | What It Does                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`bindDrag`](./core.md#pointer-drags)                         | Tracks a pointer drag with capture, thresholds, and cancellation.  |
| [`dragThreshold`](./core.md#follow-a-pointer)                 | Sets the standard drag threshold to 3 pixels.                      |
| [`createReorder`](./core.md#reordering)                       | Reorders a list or grid with the pointer or keyboard.              |
| [`createTreeReorder`](./core.md#reordering-a-tree)            | Reorders and nests tree items with their descendants.              |
| [`createTransfer`](./core.md#moving-between-lists)            | Moves items within or between lists.                               |
| [`bindDragPreview`](./core.md#dragging-a-copy)                | Shows a copy of the dragged element above the page.                |
| [`createAutoScroll`](./core.md#scrolling-while-dragging)      | Scrolls a container when a drag approaches its edge.               |
| [`settleDraft`](./core.md#keeping-focus-and-the-draft)        | Keeps a draft visible while a controlled value catches up.         |
| [`reorderMessage`](./core.md#whats-read-out)                  | Provides the default announcements for reordering a list.          |
| [`subtreeEnd`](./core.md#limits-and-moving-from-code)         | Finds the first row index after a subtree.                         |
| [`treeReorderMessage`](./core.md#limits-and-moving-from-code) | Provides the default announcements for reordering a tree.          |
| [`transferMessage`](./core.md#a-board-with-rules)             | Provides the default announcements for moving items between lists. |

## Dragging and Resizing

| Helper                                                               | What It Does                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`createMove`](./core.md#moving-in-two-dimensions)       | Moves freely positioned objects with the pointer or keyboard.       |
| [`createResize`](./core.md#resizing-boxes)               | Resizes boxes from their edges and corners.                         |
| [`createSwipeActions`](./core.md#swiping-rows-aside)     | Reveals actions behind a row and supports full-swipe actions.       |
| [`bindHold`](./core.md#pressing-and-holding)             | Runs an action once a press is held, and can repeat it while held.  |
| [`bindRepeat`](./core.md#repeat-while-held)              | Steps once when a button is pressed, and keeps stepping while held. |
| [`createArea`](./core.md#two-dimensional-values)         | Picks a value along two axes, such as a point on a pad.             |
| [`createSpans`](./core.md#ranges-on-tracks)              | Draws, moves, and resizes ranges on tracks.                         |
| [`stackSpans`](./core.md#days-that-run-down)             | Places overlapping ranges in separate lanes.                        |
| [`createPreview`](./core.md#previews)                    | Tracks a value being tried before it is chosen.                     |
| [`moveMessage`](./core.md#several-at-once)               | Provides the default announcements for changes in position.         |
| [`resizeMessage`](./core.md#several-boxes-and-from-code) | Provides the default announcements for resizing boxes.              |
| [`isSpanFree`](./core.md#changing-ranges-from-code)      | Checks whether a proposed range overlaps another on its track.      |
| [`spansMessage`](./core.md#changing-ranges-from-code)    | Provides the default announcements for changes to ranges.           |

## Lists

| Helper                                                       | What It Does                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [`createListbox`](./core.md#options-you-search)                | Highlights options with the arrow keys, and filters them as someone types.   |
| [`createVirtualizer`](./core.md#long-lists)                    | Calculates which rows to render and where to place them.                     |
| [`createStickToBottom`](./core.md#logs-that-follow-their-end)  | Follows new content while preserving the reader's place when they scroll up. |
| [`bindScrollPicker`](./core.md#wheels-you-scroll-to-pick-from) | Picks the option at the center of a scrolling list, like a wheel.            |
| [`createInlineEdit`](./core.md#editing-in-place)               | Manages editing, committing, and canceling a value in place.                 |

## Trees

| Helper                                              | What It Does                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| [`createTreeCollection`](./core.md#a-trees-shape)     | Looks up parents, children, levels, and visible nodes.               |
| [`treeDataNodes`](./core.md#tree-data-and-file-paths) | Converts nested items into nodes for a tree collection.              |
| [`treeFromPaths`](./core.md#tree-data-and-file-paths) | Builds nested tree data from file paths.                             |
| [`visibleTreeRows`](./core.md#flat-rows)              | Flattens open branches into rows with parent, level, and index data. |
| [`treeCheckedStates`](./core.md#check-a-branch)       | Calculates checked, unchecked, and mixed states across a tree.       |
| [`toggleTreeChecked`](./core.md#check-a-branch)       | Returns the next checked value when a node is toggled.               |

## Transitions and Gestures

| Helper                                                         | What It Does                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`bindPanel`](./core.md#panels-and-presence)                    | Coordinates panel height, transitions, and focus when opening or closing.          |
| [`hiddenAttrs`](./core.md#find-in-page-and-opening-at-once)     | Sets visibility attributes for hidden or searchable content.                       |
| [`bindFindable`](./core.md#find-in-page-on-its-own)             | Reveals hidden content when the browser finds a match.                             |
| [`supportsHiddenUntilFound`](./core.md#find-in-page-on-its-own) | Checks whether the browser can search hidden content.                              |
| [`animateIn`](./core.md#entering-and-leaving)                   | Applies the starting state for a CSS entrance animation.                           |
| [`animateOut`](./core.md#entering-and-leaving)                  | Applies the exit state and calls your completion callback after animations finish. |

### Gesture Calculations

Import these helpers from `@ui-sdk/core/gesture`.

| Helper                                                 | What It Does                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`createVelocityTracker`](./core.md#throws-and-springs) | Measures velocity from recent pointer positions.                         |
| [`projectDistance`](./core.md#throws-and-springs)       | Estimates how far a moving value will travel as it slows down.           |
| [`solveSpring`](./core.md#throws-and-springs)           | Calculates a spring's position and velocity over time.                   |
| [`rubberBand`](./core.md#past-an-edge)                  | Adds resistance as a value moves past an edge.                           |
| [`sectorOf`](./core.md#which-way-a-stroke-points)       | Converts a stroke's direction into a sector, such as a radial menu item. |

## Popups and Layers

| Helper                                                               | What It Does                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`createPopup`](./core.md#make-your-own)                              | Manages opening, closing, positioning, and focus using a popup preset. |
| [`popupState`](./core.md#a-popup-of-your-own)                         | Creates the initial open, mounted, and payload state.                  |
| [`popupTrigger`](./core.md#a-popup-of-your-own)                       | Builds a trigger slot that opens and closes the popup.                 |
| [`popupContent`](./core.md#a-popup-of-your-own)                       | Builds a content slot with presence, placement, and focus handling.    |
| [`popupClose`](./core.md#a-popup-of-your-own)                         | Builds a slot that closes the popup.                                   |
| [`popupTitle`](./core.md#one-popup-many-triggers)                     | Connects a visible title to the popup's accessible name.               |
| [`popupDescription`](./core.md#one-popup-many-triggers)               | Connects descriptive text to the popup.                                |
| [`popupArrow`](./core.md#one-popup-many-triggers)                     | Builds an arrow slot that follows the popup's placement.               |
| [`popupBackdrop`](./core.md#every-part-and-parts-of-your-own)         | Builds a backdrop slot behind a modal popup.                           |
| [`popupViewport`](./core.md#every-part-and-parts-of-your-own)         | Builds a full-screen container slot for a popup sheet.                 |
| [`popupSlots`](./core.md#every-part-and-parts-of-your-own)            | Builds the standard popup parts together.                              |
| [`position`](./core.md#placing-a-popup)                               | Places an element beside an anchor and updates its placement.          |
| [`bindLayer`](./core.md#layers-of-your-own)                           | Registers a floating element for Escape and outside-press dismissal.   |
| [`bindPersistentLayer`](./core.md#modal-layers-and-what-stays-usable) | Keeps an element usable across layers, including modal popups.         |
| [`isDismissal`](./core.md#modal-layers-and-what-stays-usable)         | Identifies a dismissal reason, such as Escape or an outside press.     |
| [`supportsTopLayer`](./core.md#types-and-the-top-layer)               | Checks whether the browser supports the top layer used by popups.      |

[Popup presets](./core.md#pick-its-behavior) choose the interaction for a popover, dialog, tooltip, or hover card. [Popup controllers](./core.md#open-from-code) open existing popup components from code and wait for a result. Import each from its component entrypoint, such as `@ui-sdk/core/popover`.

## Preferences

| Helper                                                             | What It Does                                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`createPreference`](./core.md#create-a-preference)            | Holds a choice from a list, notifies subscribers, and can save it between visits.  |
| [`createColorScheme`](./core.md#choose-a-color-scheme)         | Builds on a preference to choose light, dark, or the browser's scheme.             |
| [`colorSchemeOf`](./core.md#browser-preferences-on-the-server) | Reads the color scheme a browser sends with a request.                             |
| [`preferencesScript`](./core.md#server-rendering)              | Puts saved preferences on their attributes before the first paint.                 |
| [`createPointerKind`](./core.md#pointer-kind)                      | Reports whether the main pointer is a finger or a mouse, and whether it can hover. |
| [`pointerKindOf`](./core.md#render-on-the-server)                  | Guesses the pointer kind from a request's headers.                                 |

### Storage

| Helper                                                          | What It Does                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`createLocalStorage`](./core.md#keep-a-value)                 | Keeps a value in localStorage, for every tab, until it's removed. |
| [`createSessionStorage`](./core.md#keep-a-value)               | Keeps a value in sessionStorage, for the tab, while it's open.    |
| [`createCookieStorage`](./core.md#read-a-cookie-on-the-server) | Keeps a value in a cookie, which the server reads too.            |

## Canvas

| Helper                                               | What It Does                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| [`createViewport`](./core.md#panning-and-zooming)     | Pans and zooms a canvas and converts between screen and canvas coordinates. |
| [`createConnect`](./core.md#connections)              | Tracks connections between ports with the pointer or keyboard.              |
| [`connectMessage`](./core.md#snapping-words-and-code) | Provides the default announcements for connection steps.                    |

## Platform

| Helper                                                     | What It Does                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| [`announce`](./core.md#announcements)                    | Reads a message out to screen readers.                              |
| [`prepareAnnouncements`](./core.md#urgent-announcements) | Adds the regions screen readers listen to before the first message. |
| [`isRTL`](./core.md#direction)                           | Checks whether an element's text runs right to left.                |
| [`matchesShortcut`](./core.md#shortcuts)                 | Checks whether a key press matches a shortcut, such as `mod+b`.     |
| [`formatShortcut`](./core.md#shortcuts)                  | Writes a shortcut the way the user's platform shows it.             |
| [`ariaKeyshortcuts`](./core.md#shortcuts)                | Writes a shortcut as an `aria-keyshortcuts` value.                  |

### Mobile

| Helper                                                         | What It Does                                          |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| [`bindViewport`](./core.md#follow-the-viewport)                | Follows the visible viewport and reports each change. |
| [`bindAvoidKeyboard`](./core.md#keep-a-bar-above-the-keyboard) | Lifts an element above the on-screen keyboard.        |

## Changes and History

| Helper                                                                   | What It Does                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [`createChange`](./core.md#changes)                       | Asks to change a state value, calling its callback first.                         |
| [`createCommit`](./core.md#commits)                       | Reports the final value when an interaction ends.                                 |
| [`dispatch`](./core.md#events-that-arent-state)           | Calls an action's callback, such as `onDelete`, and tells you if it was canceled. |
| [`createUndoStack`](./core.md#undo)                       | Keeps snapshots of a value you record, so you can undo and redo.                  |
| [`createController`](./core.md#controllers)               | Lets code outside a component call its methods.                                   |
| [`sourceOf`](./core.md#how-people-are-working)            | Tells whether an event came from a mouse, touch, pen, keyboard, or code.          |
| [`isFocusFromKeyboard`](./core.md#how-people-are-working) | Checks whether focus just arrived from the keyboard.                              |

### Watching Changes

Import these helpers from `@ui-sdk/core/observe`.

| Helper                                                    | What It Does                                             |
| --------------------------------------------------------- | -------------------------------------------------------- |
| [`observe`](./core.md#listen-for-changes)                | Calls you with every change to the components on a page. |
| [`elementOf`](./core.md#find-the-element)                | Finds the element of the component a change came from.   |
| [`withSource`](./core.md#keep-the-source-after-an-await) | Keeps a change's source across an `await`.               |

## Building Blocks

| Helper                                                              | What It Does                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`definePrimitive`](./core.md#defineprimitive)   | Defines a component's options, state, and parts once for every framework. |
| [`idPart`](./core.md#parts-that-come-and-go)     | Escapes an item value so it can be part of an id.                         |
| [`elements`](./core.md#reading-parts-in-the-api) | Returns a component's bound parts in page order.                          |
| [`openAttrs`](./core.md#naming)                  | Returns the usual attributes for an open or closed part.                  |
| [`checkedAttrs`](./core.md#naming)               | Returns the usual attributes for a checked, unchecked, or mixed part.     |
| [`css`](./core.md#pass-values-as-css-variables)   | Turns style declarations into a `style` attribute and skips empty values. |
| [`live`](./core.md#live-state)                       | Writes attributes for state that changes often, without rendering again.  |
| [`selects`](./core.md#live-state)                    | Tells each part which state changes it needs to hear about.               |
| [`direct`](./core.md#attributes-kept-current)        | Keeps chosen attributes current between renders.                          |

## Agents

Import these helpers from `@ui-sdk/core/agent`.

| Helper                                                                      | What It Does                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`createAgent`](./agents.md#createagentoptions) | Lets an agent read the components on a page and use them.          |
| [`agentTools`](./agents.md#agenttools)          | Describes the `snapshot`, `act`, and `query` tools for your model. |
| [`registerTools`](./agents.md#register-the-tools)  | Offers the same tools to an agent built into the browser.          |

### History

Import these helpers from `@ui-sdk/core/history`.

| Helper                                                                             | What It Does                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`createHistory`](./agents.md#start-recording)  | Records every change to the page's components and who made it, so you can step back or undo one source. |
| [`describeEntry`](./agents.md#read-the-history) | Writes a short sentence for a history entry.                                                            |
| [`stageChanges`](./agents.md#try-a-suggestion)  | Tries a set of values on the real controls and lets you put the old ones back.                          |

## Values and Testing

[Number](./core.md#numbers), [Date](./core.md#dates), [Color](./core.md#colors), and [Image](./core.md#images) cover formatting, parsing, and math for each kind of value. Each has its own entrypoint, such as `@ui-sdk/core/number`. [Testing](./core.md#testing) covers the checks for a component of your own.


# Focus and Keys

Move through lists and grids, find items by typing, keep focus when the page changes, and give fields the right keyboard.

Use `createRovingFocus` for a group with one tab stop and arrow-key navigation, and `createGridFocus` for rows and columns. The other helpers find items by typing, choose nearby targets, restore focus when items move or disappear, and give a field the right keyboard with `inputHints`.

Import them from `@ui-sdk/core`. [Compose Behaviors](./core.md#give-the-group-one-tab-stop) shows how to connect roving focus to a part. Your component decides what a focused item does; [Selection](./core.md#selection) covers choosing items and ranges.

## Roving Focus

### One Tab Stop

The rating used `orientation: () => "both"` for all four arrows. A row of buttons only needs Left and Right:

```ts
const roving = createRovingFocus(context, {
  slot: "item",
  key: "focused",
  orientation: () => "horizontal",
})
```

This handles Left, Right, Home and End. Leave out `orientation` for a vertical list that uses Up and Down. Left and Right follow the page's text direction.

Tab into the toolbar. Use Left, Right, Home or End to move between buttons; Tab leaves the group.

By default, the last focused item keeps the tab stop. To return to the selected item instead, use `remember: false`, `preferred` and `claims`, as we did in the [rating guide](./core.md#give-the-group-one-tab-stop).

### Disabled Items and Wrapping

An unavailable action can still be useful to find. Pass `disabled` to prefer enabled items when choosing the tab stop, while letting the arrows reach every action:

```ts
const roving = createRovingFocus(context, {
  slot: "item",
  key: "focused",
  disabled: (item) => !!item.props.disabled,
  loop: () => true,
})
```

`loop` wraps from the last item to the first, and back.

Tab to Cut, then press Up to reach the disabled Redo action. Keep pressing Up or Down to wrap around.

The item still needs `aria-disabled` and a press handler that ignores it. A native `disabled` button can't receive focus. If every item is disabled, the group can still give one of them the tab stop.

### Items That Can't Take Focus

Use `focusable` when an item should be skipped altogether. These nested folders stay rendered while their branch is closed:

```ts
focusable: (item) => !item.props.nested || context.store.get().open,
```

Use the arrows to reach Labels. Press Enter to open it, then Down to reach Work.

The group checks `focusable` again when state changes. If it depends on something outside that state, call `roving.check()` after it changes.

### Items That Come and Go

`roving.focus(key)` moves focus to an item. You can also call it just before that item renders:

```ts
function add(tag: string) {
  context.options().onAdd?.(tag)
  roving.focus(tag)
}
```

Type a tag and press Enter. The new tag receives focus, and the console logs the count.

`roving.items()` returns the focusable items in document order, with each item's `key`, `props` and `el`. This demo uses `onItemsChange` to update the count after items join or leave.

This works when the new item renders as part of the current update. For data loaded later, call `focus(key)` when the item is ready. If the user moves focus elsewhere in the meantime, it stays there.

### Move the Tab Stop Without Moving Focus

A shortcut can use a toolbar action while focus stays in an editor. Call `remember` from that shortcut's handler so the next visit to the toolbar lands on the action:

```ts
api.roving.remember("Underline")
```

In Notes, press Control or Command with U, then Shift+Tab. Focus returns to Underline.

`remember(key)` changes the tab stop without moving focus. Groups with `remember: false` ignore it.

### Any Layout

`move` decides where each key goes. A keypad can use it to move three items at a time for Up and Down:

```ts
move: (event, { from, items, rtl }) => {
  if (event.ctrlKey || event.metaKey) {
    return
  }

  const index = items.findIndex((item) => item.key === from.key)
  const by = {
    ArrowDown: 3,
    ArrowUp: -3,
    ArrowRight: rtl ? -1 : 1,
    ArrowLeft: rtl ? 1 : -1,
  }[event.key]

  return by === undefined ? undefined : items[index + by]?.key
},
```

Focus a number. Use Up and Down to move a row, or Left and Right to move one item.

`move` receives the focused item, the focusable items in document order, and the text direction. Return a key to move there, or `undefined` to leave the key press alone. It replaces the built-in arrow, Home, End and wrapping rules, so include any of those your component needs.

Like `focus(key)`, it can return the key of an item about to render. A calendar can use this to move from the last day of one month into the next.

### Around a Ring

For actions arranged around a circle, Left and Right can follow their order around the ring. Use the built-in horizontal keys with wrapping:

```ts
const roving = createRovingFocus(context, {
  slot: "action",
  key: "focused",
  orientation: () => "horizontal",
  loop: () => true,
})
```

Render the actions in their order around the circle. Their positions don't change which action comes next.

Focus an action, then keep pressing Left or Right to cycle around the ring. Home and End jump to the first and last actions.

## Spatial Focus

### Follow the Layout

On a board, the next item in the document may not be the one to the right. Use `spatialMove()` to choose a nearby item in the arrow's direction:

```ts
const roving = createRovingFocus(context, {
  slot: "note",
  key: "focused",
  move: spatialMove(),
})
```

Focus a note, then use the arrow keys to move to a nearby note in that direction.

`spatialMove` measures the elements and favors items directly ahead. Left always means left on screen, even in right-to-left text. Home and End use document order. Alt, Control and Command combinations are left for other shortcuts.

### Supply Your Own Positions

If your app already knows where items are, pass a `rect` function. This is useful for a zoomed canvas or a layout calculated from angles:

```ts
move: spatialMove({
  rect: (el, key) => {
    const { x, y } = place(key)
    return { left: x, right: x, top: y, bottom: y }
  },
}),
```

Use the same units for every item, with larger `y` values farther down.

### Choose a Target Without Moving Focus

`nearestInDirection` uses the same position-based search on plain boxes. It returns a key, so you can decide what to do with the result:

```ts
const next = nearestInDirection(
  { left: 0, right: 10, top: 0, bottom: 10 },
  [{ key: "next", rect: { left: 20, right: 30, top: 0, bottom: 10 } }],
  [1, 0]
)
// next is "next".
```

The direction is `[x, y]`: `[1, 0]` means right and `[0, -1]` means up. If nothing lies that way, the result is `undefined`.

Focus the map and use the arrow keys to choose a city. Focus stays on the map.

## Typeahead

[Text](./core.md#find-an-item-by-typing) covers finding an item from typed characters. To move focus to that match, combine it with `roving.items()` and `roving.focus()`:

```ts
const typeahead = createTypeahead()

function keydown(event: KeyboardEvent, el: HTMLElement) {
  if (
    event.defaultPrevented ||
    roving.keydown(event, el) ||
    !isTypeaheadKey(event)
  ) {
    return
  }
  if (event.key === " " && typeahead.active()) {
    event.preventDefault()
  }

  const items = roving.items()
  const index = typeahead(
    event.key,
    items.map((item) => labelOf(item.el)),
    items.findIndex((item) => item.el === el)
  )
  if (index !== -1) {
    roving.focus(items[index].key)
  }
}
```

Create `typeahead` once in `api`, then connect this handler to the item's `keydown`.

Focus Apple and press P repeatedly to cycle through matches. Pause, then type PL quickly to reach Plum.

## Focus Recovery

When a focused row is removed, the browser can leave focus on the page. `createFocusRecovery` lets you choose where it should go:

```ts
const recovery = createFocusRecovery<{ value: string; index: number }>({
  fallback: (lost) => {
    const items = roving.items()
    return (items[lost.props.index] ?? items.at(-1))?.el
  },
})
```

This picks the row that takes the old one's place, or the last row if we removed the end. Return `recovery` from `api`, then bind it alongside roving focus:

```ts
bind: (el, part) => {
  const unbindFocus = part.api.roving.bind(el, part)
  const unbindRecovery = part.api.recovery.bind(el, part)
  return () => {
    unbindFocus()
    unbindRecovery()
  }
},
```

Focus a task and press Delete, or click Done. Focus moves to a remaining task.

`fallback` receives the removed part's key, last props and element. Returning nothing leaves focus where it is. Recovery runs when the part unbinds and waits for the render to finish; it won't take focus back from something else, such as a dialog.

## Focus That Follows a Move

Sometimes an item moves to another list and renders as a new element. Call `keepFocus` after changing state, with a function that finds the new element:

```ts
move(task: string) {
  const { done } = context.store.get()
  context.store.set({ done: [...done, task] })
  keepFocus(() => context.element("task", task))
},
```

Focus a task and press Enter. Focus follows it between lists. Turn off Keep focus on the task to compare.

`keepFocus` retries after the update so the new element has time to render. If the user moves focus elsewhere in the meantime, it leaves that focus alone.

## Grids

### One Tab Stop in a Grid

For cells addressed by row and column, use `createGridFocus`. Import the `GridCell` type from `@ui-sdk/core`, start the active cell at `null`, then create the behavior in `api`:

```ts
state: () => ({ active: null as GridCell | null }),
api: (context) => ({
  grid: createGridFocus(context, {
    key: "active",
    rows: () => 3,
    cols: () => 6,
  }),
}),
```

Each cell has a zero-based `row` and `col`. Connect its tab stop, keys and element to the behavior:

```ts
seat: slot<{ id: string; row: number; col: number }>({
  props: { id: "string", row: "number", col: "number" },
  selects: selects({ active: byCell }),
  attrs: (state, { props, api }) => ({
    role: "gridcell",
    tabindex: api.grid.tabIndex(state, props),
  }),
  on: {
    keydown: (event, { api }) => api.grid.keydown(event),
    pointerdown: (event, { api, props }) => api.grid.focus(props, { reason: "item-press", event }),
  },
  bind: (el, { api, props }) => api.grid.bind(el, props),
}),
```

Render the cells inside rows with `role="row"`, inside a root with `role="grid"`. Give each cell a stable `id`, such as `"1:2"`, so the primitive can tell them apart.

`selects({ active: byCell })` lets a move reach only the cell it leaves and the cell it lands on, so a grid with thousands of cells stays fast.

Focus a seat and use the arrows to move. Home and End reach the row's ends; with Control, or Command on a Mac, they reach the grid's corners.

Left and Right follow the text direction. Call `grid.focus({ row, col })` to move to a cell from another interaction, such as a click.

### Cells That Can't Take Focus

Pass `disabled` to skip unavailable cells:

```ts
disabled: (cell) => context.options().taken.includes(`${cell.row}:${cell.col}`),
```

Unlike roving focus's `disabled` option, this skips the cell during navigation. Before the grid is entered, Tab lands on the first cell that isn't disabled, row by row.

Use the arrows to move past taken seats. Press Tab to leave the grid; the active seat stays marked.

Use `grid.isActive(state, cell)` to keep the active cell marked when focus leaves:

```ts
"data-active": api.grid.isActive(state, props) ? "" : undefined,
```

### Selecting a Range

`onMove` tells you where focus moved, where it came from, and whether Shift was held. Use that to keep the start of a selection:

```ts
onMove: (cell, { from, shift }) => {
  const anchor = context.store.get().anchor ?? from
  context.store.set({ anchor: shift && anchor ? anchor : cell })
},
```

Click a cell, then hold Shift and use the arrows or click another cell to extend the range. Move without Shift to start again.

For Shift-click, pass `shift: event.shiftKey` to `grid.focus`. The callback also receives the `event` and a `reason`: `"list-navigation"` for keys, `"item-press"` for a press or `"imperative"`, the names a listbox reports. [Selection](./core.md#ranges-of-cells) covers turning the anchor and active cell into a range.

### Rows That Aren't Rendered

A large grid may render only the visible rows. Add `reveal` to bring a target row into view before focus moves there:

```ts
reveal: ({ row }) => {
  const { first } = context.store.get()
  if (row < first) {
    context.store.set({ first: row })
  } else if (row >= first + 6) {
    context.store.set({ first: row - 5 })
  }
},
pageSize: () => 6,
```

This timetable shows six rows at a time.

Focus a cell and press Down past the last visible row, or Page Down, to bring the next rows into view.

`pageSize` sets how far Page Up and Page Down move. With a [virtualized list](./core.md#long-lists), `reveal` can call `virtualizer.scrollToIndex(row)` instead. Focus lands when the cell binds.

## Input Hints

A few attributes tell the browser what a field holds: `inputmode` picks a phone's keys, like an `@` for an email address or a number pad for a code, and `enterkeyhint` picks its Return key. `autocomplete` says what to autofill, and `autocapitalize`, `autocorrect` and `spellcheck` say whether to change what people type. `inputHints` fills them in for a kind of field:

```tsx
import { inputHints } from "@ui-sdk/core"

const hints = inputHints("email", { enter: "next" })
// { inputMode: "email", enterKeyHint: "next", autoComplete: "email", autoCapitalize: "none", autoCorrect: "off", spellCheck: "false" }
```

Spread them on an `<input>` or `<textarea>`. They're spelled as React spells them, and HTML reads attribute names in any case, so the same object works in Vue, Svelte, Solid and `setAttribute`. `enter` sets the Return key, like `"next"` while more fields follow and `"done"` on the last one. iPhone's number pads, for `"tel"`, `"numeric"`, `"decimal"` and `"one-time-code"`, have no Return key, so there `enter` only shows on other phones.

| Kind                                    | Keys and Return key                          | Autofill and corrections                              |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `"email"`, `"url"`                      | Keys for an address                          | Autofills the address, no capitals or corrections     |
| `"tel"`, `"one-time-code"`              | A number pad                                 | Autofills the number, or the code from a text message |
| `"numeric"`, `"decimal"`                | Digits, with a decimal point for `"decimal"` | No autofill                                           |
| `"search"`                              | A search Return key                          | No autofill, capitals or spelling marks               |
| `"name"`, `"username"`, `"postal-code"` | The usual keys                               | Autofills them, capitalizing names and postal codes   |
| `"current-password"`, `"new-password"`  | The usual keys                               | Offers the saved password, or suggests a new one      |
| `"message"`                             | A send Return key                            | Capitals, corrections and spelling marks on           |

Tap each field on a phone: the keys change, and so does the Return key, which iOS 26 draws as a glyph, like › for next and → for search.

They're only hints: a field keeps its own `type` and validation, so a `type="email"` field still checks the address. Attributes after the spread replace the hints.

## API Reference

### Roving Focus Options

- `slot` (`string`): The slot whose parts are the group's items. Each joins in the slot's `bind` with `roving.bind(el, part)`. Example: [One Tab Stop](#one-tab-stop).
- `key` (`keyof State & string`): The state key that holds the key of the item with the tab stop. Start it at `null`, and set it back to `null` to forget the item focused last. Example: [One Tab Stop](#one-tab-stop).
- `orientation?` (`(() => RovingOrientation | "both")`): Which arrows move focus when there's no `move`: Up and Down, Left and Right, or `"both"` for all four, like a rating. Defaults to `"vertical"`. Example: [One Tab Stop](#one-tab-stop).
- `loop?` (`(() => boolean)`): Whether moving past either end wraps around. Defaults to `false`. Example: [Disabled Items and Wrapping](#disabled-items-and-wrapping).
- `remember?` (`boolean`): Whether the item focused last keeps the stop, like a toolbar, rather than the preferred one, like tabs. Defaults to `true`. Example: [One Tab Stop](#one-tab-stop).
- `disabled?` (`((item: RovingFocusItem<Props>) => boolean)`): Whether an item can't be activated. Enabled items take the stop first; disabled ones can still take focus. Example: [Disabled Items and Wrapping](#disabled-items-and-wrapping).
- `focusable?` (`((item: RovingFocusItem<Props>) => boolean)`): Whether an item can take focus now. An item that can't stays in the group and is skipped, like a tree item under a collapsed branch. Defaults to every item. Example: [Items That Can't Take Focus](#items-that-cant-take-focus).
- `preferred?` (`((item: RovingFocusItem<Props>) => boolean)`): Whether an item takes the stop before focus has been in the group: the selected tab, the checked radio. Example: [One Tab Stop](#one-tab-stop).
- `claims?` (`((state: State, item: RovingFocusItem<Props>) => boolean)`): Whether an item rendering before any item binds, like on the server, may hold the stop. The first such item does, so server markup has exactly one stop. Defaults to enabled and focusable items. Pass it when the stop should start on a selected item, like `(state, item) => state.value === null || item.key === state.value`. Example: [One Tab Stop](#one-tab-stop).
- `move?` (`((event: KeyboardEvent, context: RovingFocusMoveContext<Props>) => string | undefined)`): The key focus moves to for a key press, or `undefined` to leave the press alone. Replaces the default, which moves along `orientation` with the arrows, Home and End. Use it for any other shape: a tree's visible order, or a grid's rows. Shift is never swallowed, so a list can extend a range. The key may be one that isn't rendered or focusable yet, like the first day of next month in a calendar: the stop moves to it at once, and focus follows when its item can take it, as long as focus is still where the press left it. Example: [Any Layout](#any-layout).
- `onItemsChange?` (`(() => void)`): Runs once after items join or leave, however many did, once the stop has moved to where the rules put it. Example: [Items That Come and Go](#items-that-come-and-go).

### Grid Focus Options

- `key` (`keyof State & string`): The state key that holds the active `GridCell`, or `null` before the grid is entered. Example: [One Tab Stop in a Grid](#one-tab-stop-in-a-grid).
- `rows` (`() => number`): How many rows the grid has, header rows included when they hold cells. Example: [One Tab Stop in a Grid](#one-tab-stop-in-a-grid).
- `cols` (`() => number`): How many columns. Example: [One Tab Stop in a Grid](#one-tab-stop-in-a-grid).
- `pageSize?` (`(() => number)`): How many rows Page Up and Page Down move, usually how many show. Example: [Rows That Aren't Rendered](#rows-that-arent-rendered).
- `disabled?` (`((cell: GridCell) => boolean)`): Cells that can't take focus, skipped by the arrows and by the tab stop before the grid is entered. Example: [Cells That Can't Take Focus](#cells-that-cant-take-focus).
- `reveal?` (`((cell: GridCell) => void)`): Shows a cell that may not be rendered, like `virtualizer.scrollToIndex(cell.row)`, before focus moves to it. Example: [Rows That Aren't Rendered](#rows-that-arent-rendered).
- `onMove?` (`((cell: GridCell, details: { from: GridCell | null; reason: GridFocusReason; event?: Event; shift: boolean; }) => void)`): Runs after the active cell moves, with the cell it left. Example: [Selecting a Range](#selecting-a-range).


# Selection

Choose items, extend a selection, or select a rectangle of shapes or cells.

`createSelection` chooses item keys and extends ranges, `createLasso` selects items with a drawn rectangle, and `createCellRange` selects a block of grid cells.

Import them from `@ui-sdk/core`. Pair them with [Focus and Keys](./core.md#focus-and-keys) to move between items and choose them.

## Selecting Items

### Choose One

Keep the selected keys in a `string[]`, even when only one item can be chosen. In `api`, add `createSelection` alongside the existing roving focus behavior:

```ts
const change = createChange(context)
const selection = createSelection(context, {
  key: "value",
  set: (value, details) => change("value", value, details),
  order: () => roving.items().map((item) => item.key),
})
```

Start `value` at `[]` and return `selection` from `api`. The `set` callback uses the same [change pattern](./core.md#changes) as the guides.

The behavior gives you methods to call from your event handlers. For example, a pointer press can choose one item:

```ts
pointerdown: (event, { api, key }) => api.selection.choose(key, { reason: "item-press", event }),
```

`choose` selects that item. `toggle` also lets the user clear it. Add this branch to your existing key handler for Space:

```ts
if (event.key === " ") {
  event.preventDefault()
  selection.toggle(key, { reason: "item-press", event })
}
```

This plan picker uses both. `selection.isSelected(key)` lets its Enter handler check whether a plan is chosen before continuing.

Click a plan, or use the arrows and Space to choose one. Space on the chosen plan clears it; Enter continues with it, and the console logs each step.

For a listbox, give the root `role="listbox"`, each item `role="option"`, and set its `aria-selected` from `state.value.includes(key)`. Keep the focus wiring from [Focus and Keys](./core.md#roving-focus).

### Choose Many

Add `multiple` to the selection options:

```ts
multiple: () => true,
```

Now `toggle` adds or removes one item while keeping the others. Use it for both pointer presses and Space, as in this topping picker. A listbox that allows this also needs `aria-multiselectable="true"` on its root.

Click toppings to add or remove them. With the keyboard, use Left and Right, then Space.

### Ranges and Select All

`extend` selects from an anchor to another item. The anchor is the last item chosen or toggled without Shift. These three calls give a file list its usual pointer interactions:

```ts
press(event: PointerEvent, key: string) {
  const details = { reason: "item-press" as const, event }
  if (event.shiftKey) {
    selection.extend(key, { ...details, from: context.store.get().focused })
  } else if (event.metaKey || event.ctrlKey) {
    selection.toggle(key, details)
  } else {
    selection.choose(key, details)
  }
},
```

For Shift with the arrows, use the result of the existing focus handler:

```ts
const moved = roving.keydown(event, el)
if (moved?.shift) {
  selection.extend(moved.key, {
    from: moved.from,
    reason: "list-navigation",
    event,
  })
}
```

`from` supplies the starting point when there isn't an anchor yet. `selection.anchor()` returns the current anchor's key.

When arrow keys move focus without selecting, like in a table with a checkbox column, move the anchor along with focus so the next Shift range starts there. `setAnchor` leaves the selection as it is, and `null` clears the anchor:

```ts
const moved = roving.keydown(event, el)
if (moved && !moved.shift) {
  selection.setAnchor(moved.key)
}
```

A range keeps what was selected when the anchor was set, then adds the items between the anchor and the target. Pass `additive: false` to select only the range. Supplying a different selection from outside starts the next range over.

Click a file, then Shift-click another for a range. Control or Command-click toggles one file. Turn on Ranges replace the selection to compare.

In multiple mode, `toggleAll` selects every available key in `order`, or clears them if they're already selected. Call it from your Control or Command+A handler after preventing the browser's default action:

```ts
selection.toggleAll({ reason: "list-navigation", event })
```

`order` determines what ranges and select-all can reach. For a virtualized list, pass the full list of keys, including items that aren't rendered.

### Items That Can't Be Selected

Use `selectable` to skip keys that shouldn't be chosen, toggled, or added to a range:

```ts
selectable: (key) => !context.options().owners.includes(key),
```

In this member list, owners start selected. The demo uses `toggle` and `toggleAll`, which leave those owners alone.

Focus a member and press Control or Command+A twice. Hollis Grant stays selected while the other members are selected, then cleared.

This doesn't pin an item in the selection: `choose` and a range with `additive: false` can replace the whole value. If some keys must always stay selected, enforce that in your `set` callback.

## Rectangle Selection

### Draw a Rectangle

`createLasso` selects items touched by a rectangle. Start with `selected: string[]` and `lasso: LassoDraft | null` in state, with `lasso` set to `null`. Add `lasso` to the primitive's `live` fields, as covered in [Live State](./core.md#live-state).

Create the behavior in `api` and return it as `lasso`:

```ts
const lasso = createLasso(context, {
  slot: "shape",
  draft: "lasso",
  selected: () => context.store.get().selected,
  set: (keys, details) => change("selected", keys, details),
})
```

Give the surface `position: relative`, `touch-action: none` and `user-select: none` so drawing doesn't scroll the page or select text. Start when the pointer lands on its empty space:

```ts
pointerdown: (event, { el, api }) => {
  if (el && event.target === el) {
    api.lasso.pointerdown(event, el)
  }
},
```

Keep the rectangle part rendered. Its `style` hides it when there's no drag:

```ts
lasso: slot({
  attrs: () => ({ "aria-hidden": "true" }),
  live: live((state, { api }) => ({ style: api.lasso.style(state) })),
}),
```

Drag from empty space to select shapes; the console logs the selection. Hold Shift to add to it; press Escape before releasing to cancel the rectangle.

`lasso.touches(state, key)` tells you which items belong to the preview selection. With Shift, that includes items selected before the drag. Use it for a `data-lassoed` highlight.

The selection changes once, when the pointer is released, with the reason `"lasso"`. Escape cancels the drag and keeps the previous selection.

### Items It Skips

Add `selectable` to exclude items from the rectangle's hits, and `message` to customize the screen reader announcement:

```ts
selectable: (key) => !context.options().locked.includes(key),
message: (count) => `${count} ${count === 1 ? "photo" : "photos"} selected`,
```

The announcement runs after the selection request is accepted.

Drag from empty space across the photos. City and Lake stay unselected; a screen reader announces the selected count when you release.

## Ranges of Cells

### Select a Block

[Focus and Keys](./core.md#grids) shows how to navigate a grid. Add `createCellRange` when you also need to drag across cells, select whole rows or columns, or copy a block.

Keep a `range: CellRange | null` field in state, starting at `null`. Pass the existing grid behavior and its row and column counts:

```ts
const range = createCellRange(context, {
  key: "range",
  grid,
  rows: () => 4,
  cols: () => 5,
})
```

Return `range` from `api`, then update the existing cell slot:

```ts
selects: selects({ active: byCell, range: byCellRange }),
attrs: (state, { props, api }) => ({
  role: "gridcell",
  tabindex: api.grid.tabIndex(state, props),
  ...api.range.cellAttrs(state, props),
}),
on: {
  keydown: (event, { api }) => api.range.keydown(event),
  pointerdown: (event, { api, props }) => api.range.pointerdown(event, props),
},
bind: (el, { api, props }) => api.range.bind(el, props),
```

`range.bind` also binds grid focus, and `range.keydown` forwards ordinary navigation to the grid. You don't need to call both behaviors for the same event. `byCellRange` lets a range change reach only the cells that join or leave it and the cells along the sides that move.

Drag across cells, or click one and hold Shift with the arrows. The total follows the selected range.

Focus stays on the active cell as the range grows. A move without Shift clears the range. The behavior also handles these shortcuts:

| Keys          | Action                   |
| ------------- | ------------------------ |
| Shift+Space   | Select the range's rows. |
| Control+Space | Select its columns.      |
| Control+A     | Select every cell.       |
| Escape        | Clear the range.         |

`cellAttrs` marks the explicit range with `aria-selected`, `data-selected`, and `data-range-edge`. The last one lists the sides of the range a cell sits on, such as `"top left"`, so you can draw an outline with `[data-range-edge~="top"]`.

### Selecting from Code

The same range can be changed from buttons or other controls. Row and column indexes start at zero:

```ts
range.selectColumns(1)
range.selectRows(0, 1)
range.select({ anchor: { row: 1, col: 1 }, end: { row: 2, col: 2 } })
range.selectAll()
range.select(null)
```

These calls change the range without moving focus. `select(null)` clears it.

Use the buttons to select a column, rows, a block or the whole grid. The summary names the range and counts values over 10.

`range.bounds(state)` gives the inclusive `top`, `left`, `bottom` and `right` indexes. With no explicit range, it falls back to the active cell, or returns `null` if there isn't one. `range.contains(state, cell)` uses the same rule when you need to total or count cells.

By default, range changes write to state directly. To report them through `createChange`, add `set`. You can also customize what screen readers hear after keyboard selection:

```ts
set: (value, details) => change("range", value, details),
message: ({ top, left, bottom, right }) =>
  `Rows ${top + 1} to ${bottom + 1}, columns ${left + 1} to ${right + 1} selected`,
```

For rows that aren't rendered yet, `reveal` works as it does in [grid focus](./core.md#rows-that-arent-rendered).

### Copy and Paste

`range.text(state, read)` reads the selected cells as tab-separated text. Call it from the grid's `copy` handler:

```ts
copy(event: ClipboardEvent) {
  const state = context.store.get()
  const text = range.text(state, ({ row, col }) => state.cells[row][col])
  event.preventDefault()
  event.clipboardData?.setData("text/plain", text)
},
```

In the `paste` handler, `textToCells` turns clipboard text into rows:

```ts
const rows = textToCells(event.clipboardData?.getData("text/plain") ?? "")
```

Your handler prevents the default paste and writes those values into state, starting at the selection's top-left cell. Stop at the grid's edges. The demo's Code tab shows the full handler.

Select cells and copy with Control or Command+C. Click a destination cell and paste with Control or Command+V.

`cellsToText(rows)` works in the other direction. Use it to copy an entire sheet, even when only part of it is selected.

## API Reference

### Item Selection Options

- `key` (`Key`): The state key that holds the selected keys, a `string[]`. Example: [Choose One](#choose-one).
- `set` (`(value: string[], details: Why<Reason>) => boolean`): Asks for a new selection and returns whether it went through. Pass the primitive's change, so `on<Key>Change`, `cancel()` and controlled values work: `set: (value, details) => change("value", value, details)`. Example: [Choose One](#choose-one).
- `order` (`() => readonly string[]`): Every key in list order, for ranges and select all, like the visible items' keys. Example: [Choose One](#choose-one).
- `multiple?` (`(() => boolean)`): Whether more than one item can be selected. Defaults to `false`. Example: [Choose Many](#choose-many).
- `selectable?` (`((key: string) => boolean)`): Whether a key can be chosen, toggled, or added to a range. Replacing the selection can still remove it. Defaults to every item. Example: [Items That Can't Be Selected](#items-that-cant-be-selected).

### Rectangle Selection Options

- `slot` (`string`): The slot whose parts the rectangle selects. Example: [Draw a Rectangle](#draw-a-rectangle).
- `draft` (`keyof State & string`): The state key that holds the `LassoDraft` while one is drawn. Start it at `null`, and list it in `live`. Example: [Draw a Rectangle](#draw-a-rectangle).
- `selected` (`() => string[]`): The selection now, which Shift adds to. Example: [Draw a Rectangle](#draw-a-rectangle).
- `set` (`(keys: string[], details: { reason: "lasso"; event?: Event; }) => boolean`): Asks for a new selection. Pass the primitive's change. Example: [Draw a Rectangle](#draw-a-rectangle).
- `selectable?` (`((key: string) => boolean)`): Whether an item can be selected. Defaults to every item. Example: [Items It Skips](#items-it-skips).
- `message?` (`((count: number) => string)`): What screen readers hear when the rectangle lifts. Defaults to English. Example: [Items It Skips](#items-it-skips).

### Cell Range Options

- `key` (`keyof State & string`): The state key that holds the `CellRange`, or `null` when only the active cell is selected. Example: [Select a Block](#select-a-block).
- `grid` (`object`): The grid's focus, which keeps the active cell. Example: [Select a Block](#select-a-block).
- `rows` (`() => number`): How many rows the range can reach. Example: [Select a Block](#select-a-block).
- `cols` (`() => number`): How many columns. Example: [Select a Block](#select-a-block).
- `reveal?` (`((cell: GridCell) => void)`): Shows a cell the range grows to that may not be rendered, like `createGridFocus`'s `reveal`. Example: [Rows That Aren't Rendered](./core.md#rows-that-arent-rendered).
- `set?` (`((range: CellRange | null, details: { reason: CellRangeReason; event?: Event; }) => boolean)`): Asks for a new range and returns whether it went through. Defaults to writing the state; pass the primitive's change to report it. Example: [Selecting from Code](#selecting-from-code).
- `message?` (`((bounds: CellBounds) => string)`): What screen readers hear after the range changes from the keyboard. Defaults to English. Example: [Selecting from Code](#selecting-from-code).


# Drag and Drop

Sort a list, nest a tree, or move items between lists with a pointer or keyboard.

`createReorder` sorts lists and grids, `createTreeReorder` moves rows and subtrees, and `createTransfer` moves items between lists. They keep a draft during a move and commit it through your [change](./core.md#changes) on drop. Use `bindDrag` to track a pointer for a custom drag.

Import these helpers from `@ui-sdk/core`. [Compose Behaviors](./core.md#compose-behaviors) shows how to connect a behavior to a primitive. For freely positioned items, see [Dragging and Resizing](./core.md#dragging-and-resizing).

## Pointer Drags

### Follow a Pointer

`bindDrag` follows the pointer that pressed an element. Call it from a pointer handler, and keep its cleanup so destroying the primitive also stops the drag:

```ts
let stop: (() => void) | undefined
context.onDestroy(() => stop?.())

return {
  pointerdown(event: PointerEvent, el: HTMLElement) {
    if (event.button !== 0) {
      return
    }
    stop?.()
    stop = bindDrag(el, event, {
      threshold: dragThreshold,
      cancelOnEscape: true,
      onMove: ({ x }) => resizeTo(x),
      onEnd: (_event, canceled) => (canceled ? restore() : commit()),
    })
  },
}
```

Here `resizeTo`, `restore`, and `commit` are your splitter's own methods. `bindDrag` only tracks the pointer; you decide what each position means and add the keyboard controls.

Drag the divider, or focus it and use Left and Right. Press Escape during a drag to restore the width.

`onMove` runs at most once a frame. `onEnd` receives a cancellation flag if the browser takes over the pointer or Escape cancels it. The returned cleanup stops tracking without calling `onEnd`.

`dragThreshold` waits for a few pixels of movement before `onMove` starts. A press can still end below that threshold, so don't assume every `onEnd` follows a move. Give a draggable surface `touch-action: none` when dragging should take precedence over scrolling.

### Collapse Past a Threshold

A sidebar resizes between its minimum and maximum widths, and can collapse, but never rests in between. Below the minimum, let `scrubTo` decide: give it two snap points, collapsed and the minimum, each reaching halfway, and ease toward them:

```ts
import { scrubTo } from "@ui-sdk/core/number"

const collapse = { min: 0, max: minWidth, step: 1, snap: { points: [0, minWidth], threshold: minWidth / 2 } }

const widthAt = (pointer: number) =>
  pointer >= minWidth ? { value: Math.min(maxWidth, pointer), point: undefined } : scrubTo(pointer, collapse, { ease: true })

onMove: ({ x }) => {
  const { value, point } = widthAt(x - root.getBoundingClientRect().left)
  store.set({ draft: value, landing: point ?? null })
},
onEnd: () => commit(store.get().landing ?? store.get().draft),
```

While the pointer moves below the minimum, the sidebar follows it, picking up speed toward whichever point is closer, so it closes in on collapsing without a sudden jump. `point` says where it will land, so the demo can say so before release; dragging the other way opens it the same way.

Drag the divider below the sidebar's minimum: it eases toward collapsing or back to the minimum, and says which it will do when you let go. Focus the divider for Left, Right and Enter.

### Dragging Without Limits

For a scrubber, pointer lock lets the user keep dragging past the edge of the screen. Read the distance moved instead of the pointer's position:

```ts
bindDrag(el, event, {
  threshold: dragThreshold,
  lock: true,
  onStart: () => !context.options().locked,
  onMove: ({ movementX, event }) => {
    change("value", context.store.get().value + movementX / 2, {
      reason: "drag",
      event,
    })
  },
  onEnd: () => {},
})
```

`onStart` runs when the movement reaches the threshold. Returning `false` stops tracking without calling `onEnd`. If the browser can't lock the pointer, tracking continues with pointer capture.

Drag the Opacity label left or right. When pointer lock is available, the cursor hides so you can keep going. Check Locked to prevent a drag.

The sample passed to `onMove` is reused. Read `x`, `y`, `movementX`, `movementY`, `locked`, and `event` during the callback instead of saving the object for later.

## Reordering

### Sort a List

Keep the committed order in a `string[]` and start a separate `ReorderDraft | null` field at `null`. In `api`, connect them to `createReorder`:

```ts
const change = createChange(context)
const reorder = createReorder(context, {
  slot: "item",
  key: "value",
  draft: "moving",
  set: (value, details) => change("value", value, details),
})
```

Return `reorder` from `api`. Render items from `reorder.order(state)`, which reads the draft during a move and the committed value otherwise. Keep each item's key stable when the order changes.

The item slot runs the reorder handler before its existing roving focus handler. That lets arrows move focus until someone picks up an item:

```ts
on: {
  keydown: (event, { el, api, key }) =>
    api.reorder.keydown(event, key) || api.roving.keydown(event, el!),
  pointerdown: (event, { api, key }) => api.reorder.pointerdown(event, key),
},
bind: (el, part) => {
  const cleanups = [part.api.roving.bind(el, part), part.api.reorder.bind(el, part)]
  return () => cleanups.forEach((cleanup) => cleanup())
},
```

Drag a season to rank it. With the keyboard, focus one, press Space or Enter, move it with the arrows, then press Space or Enter to drop it. Escape cancels.

Home and End move a picked-up item to either end. Tab cancels the move and continues through the page. Changes report `drag` or `move-key`, and screen readers hear the pickup, moves, and drop.

This demo uses a `listbox` of `option`s, `aria-roledescription` for the sortable list and items, and `aria-selected` for the picked-up item. Give each item an `aria-describedby` pointing to keyboard instructions. For items with nested controls, use a list with a separate drag handle button and put the handlers on that handle.

While dragging, core writes `--drag-x` and `--drag-y` onto the bound item. Use them to keep it under the pointer, with a `data-grabbed` attribute derived from `state.moving?.key === key`:

```css
[data-slot="sortable-list-item"] {
  touch-action: none;
  user-select: none;
}
[data-slot="sortable-list-item"][data-grabbed] {
  transform: translate(var(--drag-x, 0), var(--drag-y, 0));
  position: relative;
  z-index: 1;
}
```

### Grids

The default orientation is vertical. Add `orientation: () => "grid"` for items that wrap into rows:

```ts
orientation: () => "grid",
```

Drag a photo to a new position, or pick it up with Space. Left and Right move one place; Up and Down move between rows. Space drops it.

For a single horizontal row, use `"horizontal"`, give its roving focus the same orientation, and set `aria-orientation="horizontal"` on the listbox.

### Several at Once

A `group` callback lets a selection move together. Add it to the reorder options:

```ts
group: (key) => {
  const { selected } = context.store.get()
  return selected.includes(key) ? selected : [key]
},
```

The group is captured when the drag starts, keeps the list's order, and leaves disabled items behind. `reorder.moving(state, key)` identifies every item in the group; `reorder.dragging(state, key)` also requires a pointer drag.

Check a few tasks, then drag one of the checked tasks. You can also focus a checked task and use Space and the arrows to move the group.

A pointer event already handled with `preventDefault()` doesn't start a reorder. That lets a checkbox handle its press without also picking up the item.

### A Copy While Dragging

For a scrolling list, a translated item may be clipped. Add `preview: true` to drag a copy above the page:

```ts
preview: true,
createAutoScroll: { edge: 40, speed: 12 },
```

Drag a track and hold it near the playlist's top or bottom edge to scroll. Its placeholder shows where it will drop.

The original stays in the proposed order. With a group, the copy also gets `data-drag-count` and `--drag-count` for a count badge. Auto-scrolling is enabled with the preview; use `createAutoScroll: false` to turn it off.

### Moving from Code

Use `move` for an immediate change, such as a menu's Move to Top action:

```ts
reorder.move("Serve", 0)
```

For controls that work one step at a time, use `grab(key)`, `moveTo(index)`, and `drop()` or `cancel()`. `moveTo` counts positions among the items left after removing the moving group.

Use Top to move a recipe step immediately. The toolbar picks up the focused step, moves it, and either drops it or cancels.

Immediate moves report `imperative`; pickup and drop controls follow the same draft as the keyboard.

### What's Read Out

Use `label` when an item's visible text contains more than its name. A custom `message` can replace just one announcement and keep the defaults for the rest:

```ts
disabled: (item) => item.key === context.options().pinned,
label: (key) => titles[key],
message: (message) =>
  message.type === "move" ? `${message.label}, track ${message.position}.` : reorderMessage(message),
```

Pick up an unpinned track with Space and move it with the arrows. A screen reader announces track numbers. The pinned track can't be picked up, but other tracks can move past it.

`disabled` prevents pickup; it doesn't reserve an item's position. Announcements are assertive, and several changes in one turn may be announced together as the latest message.

## Reordering a Tree

### Sort and Nest

A tree uses a flat array of `{ key, depth }` rows in reading order. Moving a parent moves its whole subtree. Start `moving` at `null` with the type `TreeReorderDraft | null`:

```ts
const tree = createTreeReorder(context, {
  key: "rows",
  draft: "moving",
  set: (value, details) => change("rows", value, details),
  indent: () => 20,
  preview: true,
})
```

Render `tree.rows(state)`, indent by `depth`, and bind each rendered row with `tree.bind(el, key)`. Keep the roving focus binding too. As with a sortable list, call `tree.keydown(event, key)` before the focus handler and `tree.pointerdown(event, key)` on a press.

Drag an outline row up or down, and sideways to change its depth. With the keyboard, pick it up with Space, use Up and Down to place it, and Left and Right to change its level.

`indent` is the horizontal distance for one level, 24 pixels by default. Closed subtrees can remain in the data while their rows are unmounted; pointer targeting skips those hidden rows.

A move won't change a neighboring row's parent. Depth is limited by the rows around the insertion point. The `set` details include `key`, `parent` (`null` at the root), and the zero-based `index` among that parent's children, which is useful when your application stores a nested tree.

### Limits and Moving from Code

Add a maximum depth and a pickup rule:

```ts
maxDepth: () => 1,
disabled: (key) => key === "Inbox",
```

Depth starts at zero, so this allows two levels. The limit includes the moving row's descendants.

Use a folder's arrow buttons to indent or outdent it with its contents. The tree allows two levels, and Inbox can't be picked up.

`tree.move(key, before, depth)` moves a subtree before another row, or to the end when `before` is `null`. It uses the nearest depth that fits. `subtreeEnd(rows, index)` returns the first index after a subtree, which helps calculate where to insert it.

For a staged move, use `grab`, `place`, then `drop` or `cancel`. `moving(state, key)` includes descendants; `dragging` also checks that the move came from a pointer. Customize `label` and `message` as for a list, with `treeReorderMessage` as the default wording.

## Moving Between Lists

### Two Lists

Store the lists together as a `Record<string, string[]>`, with item keys unique across all lists. Add a `TransferDraft | null` field for the move:

```ts
const transfer = createTransfer(context, {
  key: "lists",
  draft: "moving",
  set: (value, details) => change("lists", value, details),
})
```

Render from `transfer.lists(state)`. Bind list elements with `bindList(el, key)` and item elements with `bindItem(el, key)`, returning their cleanups from the slots. Keep the existing focus binding, and run `transfer.keydown(event, key)` before its key handler. A press calls `transfer.pointerdown(event, key)`.

Drag an item between packing lists. With the keyboard, pick it up with Space, use Left and Right to change lists and Up and Down to place it, then Space to drop it.

Transfer uses a dragged copy and auto-scrolls near edges. `moving(state, key)` identifies the picked-up item, while `dragging(state, key)` identifies a pointer drag. The `set` details include the item's `key`, its `from` and `to` lists, and its new `index`.

### A Board with Rules

Use `accepts` to reject a destination, and `order` to choose how the keyboard travels between lists:

```ts
order: () => ["todo", "doing", "done"],
accepts: (key, list) =>
  list !== "doing" || context.store.get().lists.doing.filter((card) => card !== key).length < 2,
disabled: (key) => key === "Billing",
listLabel: (list) => columns[list],
```

Move cards between columns. Doing holds at most two cards, Billing can't be picked up, and the check on a card moves it straight to Done.

`transfer.move("Search", "done", 0)` makes an immediate move. For a staged move, use `grab`, `moveTo(list, index)`, then `drop` or `cancel`.

`label` names items, `listLabel` names destinations, and `message` customizes announcements with `transferMessage` as the default. Set `createAutoScroll: false` for a board that doesn't need edge scrolling.

## Dragging a Copy

For your own drag, `bindDragPreview` creates a copy of an element that follows the pointer. The original stays in place:

```ts
const preview = bindDragPreview(el, { x: event.clientX, y: event.clientY })
```

In the drag's `onMove`, call `preview.move(x, y)`. In `onEnd` and any early cleanup, call `preview.remove()`. You can style the copy through `preview.el`, for example by toggling a `data-over` attribute over a valid target.

Drag a tag onto the note and release it when the copy is highlighted. You can also focus a tag and press Enter to add it.

The copy preserves the element's appearance when created; it doesn't render future framework updates. It has `data-drag-preview`, stripped IDs, and is hidden from assistive technology and pointer targeting. It uses the top layer when available, with a fixed-position fallback.

## Scrolling While Dragging

A custom drag can use `createAutoScroll` to scroll near the pointer. Create it for the drag, call `update(x, y)` on each move, and call `stop()` on every exit:

```ts
const scroll = createAutoScroll({
  edge: 48,
  speed: 16,
  ignore: () => preview.el,
  onScroll: findChapter,
})
```

Drag the bookmark near the chapter list's top or bottom edge. Keep holding it there to scroll, then release it over a chapter.

`edge` is the distance in pixels where scrolling begins; `speed` is the maximum pixels per frame. The helper finds the nearest scroller under the pointer, with vertical page scrolling as a fallback. `ignore` skips an element such as the dragged copy. `onScroll` lets you find the target again after the content moves under a stationary pointer.

## Keeping Focus and the Draft

The sorting behaviors already preserve focus and keep a committed draft visible while a controlled value catches up. If you're building your own drag, use [`keepFocus`](./core.md#focus-that-follows-a-move) after moving a focused element and [`settleDraft`](./core.md#changes-from-elsewhere) when handing a draft to its owner.

## API Reference

The option tables link back to the examples that introduce them.

- `onMove` (`(sample: PointerSample) => void`): At most once per frame, with the latest position and the movement since the last call. Example: [Follow a Pointer](#follow-a-pointer).
- `onEnd` (`(event: PointerEvent, canceled: boolean) => void`): The pointer lifted, or the browser took it over, like for a scroll. A move still pending runs first, so the last position is never lost. Example: [Follow a Pointer](#follow-a-pointer).
- `threshold?` (`number`): How far, in CSS pixels, the pointer moves along either axis before moves are reported, so a press that barely moves stays a click. Defaults to 0. Example: [Follow a Pointer](#follow-a-pointer).
- `onStart?` (`((event: PointerEvent) => boolean | void)`): Runs once, on the first move past `threshold`, before its `onMove`. Return `false` to stop following the pointer, like when a drag can't start. Example: [Dragging Without Limits](#dragging-without-limits).
- `lock?` (`boolean`): Locks the pointer once it has moved past `dragThreshold`, so it can travel without limit, like a scrub, while a plain click never hides the cursor. Falls back to capture where the browser refuses, as Safari does. Example: [Dragging Without Limits](#dragging-without-limits).
- `cancelOnEscape?` (`boolean`): Ends the gesture as canceled when Escape is pressed once it has started, and keeps that press from reaching anything else, like a popup around it. `onEnd` gets the last pointer event. Defaults to `false`. Example: [Follow a Pointer](#follow-a-pointer).

- `slot` (`string`): The slot whose parts are the items. Each joins in the slot's `bind` with `reorder.bind(el, part)`. Example: [Sort a List](#sort-a-list).
- `key` (`keyof State & string`): The state key that holds the order, a `string[]` of item keys. Example: [Sort a List](#sort-a-list).
- `draft` (`keyof State & string`): The state key that holds the `ReorderDraft` while an item moves. Start it at `null`. Example: [Sort a List](#sort-a-list).
- `set` (`(value: string[], details: { reason: ReorderReason; event?: Event; }) => boolean`): Asks for a new order and returns whether it went through. Pass the primitive's change, so `on<Key>Change`, `cancel()` and controlled values work: `set: (value, details) => change("value", value, details)`. Example: [Sort a List](#sort-a-list).
- `orientation?` (`(() => ReorderOrientation)`): Whether the items run top to bottom, along a line, or wrap in rows like a grid of photos, which picks the arrows and how a drag finds its place. Defaults to `"vertical"`. Example: [Grids](#grids).
- `group?` (`((key: string) => string[])`): The keys that move with the one picked up, like the selection when it holds it. Defaults to that one key. Example: [Several at Once](#several-at-once).
- `preview?` (`boolean`): Drags a copy of the item above the page while the item itself shows where it would drop, so a list that scrolls neither clips it nor grows under it. A drag near a scroller's edge scrolls it. Defaults to `false`. Example: [A Copy While Dragging](#a-copy-while-dragging).
- `createAutoScroll?` (`false | Omit<AutoScrollOptions, "ignore" | "onScroll">`): How a drag with `preview` near a scroller's edge scrolls it, or `false` not to. Example: [A Copy While Dragging](#a-copy-while-dragging).
- `disabled?` (`((item: { key: string; props: Props; }) => boolean)`): Whether an item can't be picked up. It still moves aside for others. Example: [What's Read Out](#whats-read-out).
- `label?` (`((key: string) => string | undefined)`): The name screen readers hear for an item. Return `undefined` for the default, its text. Example: [What's Read Out](#whats-read-out).
- `message?` (`((message: ReorderMessage) => string)`): The text screen readers hear for each step. Defaults to English. Example: [What's Read Out](#whats-read-out).

- `key` (`keyof State & string`): The state key that holds the rows, a `TreeReorderRow[]` in reading order. Example: [Sort and Nest](#sort-and-nest).
- `draft` (`keyof State & string`): The state key that holds the `TreeReorderDraft` while an item moves. Start it at `null`. Example: [Sort and Nest](#sort-and-nest).
- `set` (`(value: TreeReorderRow[], details: { reason: TreeReorderReason; event?: Event; key: string; } & TreePlace) => boolean`): Asks for the new rows and returns whether they went through. Pass the primitive's change: `set: (value, details) => change("rows", value, details)`. `details` says which item moved and where to. Example: [Sort and Nest](#sort-and-nest).
- `indent?` (`(() => number)`): How far a drag goes sideways for each level, in CSS pixels. Defaults to 24. Example: [Sort and Nest](#sort-and-nest).
- `maxDepth?` (`(() => number)`): The deepest an item and the rows under it can go, from 0. Defaults to no limit. Example: [Limits and Moving from Code](#limits-and-moving-from-code).
- `disabled?` (`((key: string) => boolean)`): Whether an item can't be picked up. It still moves aside for others. Example: [Limits and Moving from Code](#limits-and-moving-from-code).
- `label?` (`((key: string) => string | undefined)`): The name screen readers hear for an item. Defaults to its text. Example: [Limits and Moving from Code](#limits-and-moving-from-code).
- `message?` (`((message: TreeReorderMessage) => string)`): The text screen readers hear for each step. Defaults to English. Example: [Limits and Moving from Code](#limits-and-moving-from-code).
- `preview?` (`boolean`): Drags a copy of the row above the page while the rows show where it would drop. Defaults to `false`. Example: [Sort and Nest](#sort-and-nest).
- `createAutoScroll?` (`false | Omit<AutoScrollOptions, "ignore" | "onScroll">`): How a drag with `preview` near a scroller's edge scrolls it, or `false` not to. Example: [Sort and Nest](#sort-and-nest).

- `key` (`keyof State & string`): The state key that holds every list, a `TransferLists`. Example: [Two Lists](#two-lists).
- `draft` (`keyof State & string`): The state key that holds the `TransferDraft` while an item moves. Start it at `null`. Example: [Two Lists](#two-lists).
- `set` (`(value: TransferLists, details: { reason: TransferReason; event?: Event; key: string; from: string; to: string; index: number; }) => boolean`): Asks for the new lists and returns whether they went through. Pass the primitive's change: `set: (value, details) => change("lists", value, details)`. `details` says what moved, from where to where. Example: [Two Lists](#two-lists).
- `order?` (`(() => string[])`): The lists in the order Left and Right go through them. Defaults to the order of the value's keys. Example: [A Board with Rules](#a-board-with-rules).
- `accepts?` (`((key: string, list: string) => boolean)`): Whether a list takes an item, like a column at its limit. Lists that don't are skipped. Example: [A Board with Rules](#a-board-with-rules).
- `disabled?` (`((key: string) => boolean)`): Whether an item can't be picked up. Example: [A Board with Rules](#a-board-with-rules).
- `label?` (`((key: string) => string | undefined)`): The name screen readers hear for an item. Defaults to its text. Example: [A Board with Rules](#a-board-with-rules).
- `listLabel?` (`((list: string) => string | undefined)`): The name screen readers hear for a list. Defaults to its key. Example: [A Board with Rules](#a-board-with-rules).
- `message?` (`((message: TransferMessage) => string)`): The text screen readers hear for each step. Defaults to English. Example: [A Board with Rules](#a-board-with-rules).
- `createAutoScroll?` (`false | Omit<AutoScrollOptions, "ignore" | "onScroll">`): How a drag near a scroller's edge scrolls it, or `false` not to. Example: [A Board with Rules](#a-board-with-rules).

- `edge?` (`number`): How far in from an edge scrolling starts, in pixels. Example: [Scrolling While Dragging](#scrolling-while-dragging).
- `speed?` (`number`): The fastest it scrolls, in pixels per frame, with the pointer at the edge. Example: [Scrolling While Dragging](#scrolling-while-dragging).
- `onScroll?` (`(() => void)`): Runs after each frame that scrolled, so a drag can find its target again under a pointer that didn't move. Example: [Scrolling While Dragging](#scrolling-while-dragging).
- `ignore?` (`(() => Element | null | undefined)`): The element being dragged, which sits under the pointer, so the scrollers under it are found instead of its own. Example: [Scrolling While Dragging](#scrolling-while-dragging).


# Dragging and Resizing

Move and resize objects, reveal swipe actions, press and hold, pick points, draw ranges, and preview choices.

`createMove` moves objects, `createResize` changes their bounds, `createSwipeActions` reveals actions behind a row, `bindHold` responds to a press that's held, and `bindRepeat` keeps stepping while a button is held. `createArea` picks two-dimensional values, `createSpans` edits ranges on tracks, and `createPreview` lets people try a value before choosing it.

Import these helpers from `@ui-sdk/core`. When a helper asks for a `set` callback, connect it to your [change](./core.md#changes). For sorting items into an order, see [Drag and Drop](./core.md#drag-and-drop).

## Moving in Two Dimensions

### Place Anything

Keep positions in a `Record<string, MovePoint>` and start a `MoveDraft | null` field at `null`. In `api`, connect them to `createMove`:

```ts
const change = createChange(context)
const move = createMove(context, {
  key: "positions",
  draft: "moving",
  set: (value, details) => change("positions", value, details),
  step: () => 4,
  bounds: () => ({ minX: 0, minY: 0, maxX: 264, maxY: 144 }),
})
```

Return `move` from `api`. The positioned slot uses the committed coordinates for its base position. Add `moving` to the primitive's `live` fields and let a live slot binding write the drag offset:

```ts
attrs: (state, { key }) => ({
  style: css({
    position: "absolute",
    left: `${state.positions[key].x}px`,
    top: `${state.positions[key].y}px`,
    "touch-action": "none",
  }),
}),
live: live((state, { api, key }) => ({
  "data-dragging": api.move.dragging(state, key) ? "" : undefined,
  style: api.move.style(state, key),
})),
on: {
  keydown: (event, { api, key }) => api.move.keydown(event, key),
  pointerdown: (event, { el, api, key }) => api.move.pointerdown(event, key, el!),
},
```

Render that slot as a focusable element with an accessible name, inside a positioned container. The live binding updates `translate`, `--move-x`, and `--move-y` without a framework render for each pointer move.

Drag a sticker, or focus it and press Alt with an arrow to move it 4 pixels. Add Shift to move ten times as far. Escape during a drag puts it back.

`step` is the grid a dropped position lands on, and how far Alt with an arrow moves it; Shift moves `largeStep`, ten steps by default. `bounds` limits committed coordinates; the drag preview can go outside them before release. A drop reports `drag`, a keyboard nudge reports `move-key`, and screen readers hear the new position.

### Several at Once

Add `group` to move a selection together:

```ts
group: (key) => {
  const { selected } = context.store.get()
  return selected.includes(key) ? selected : [key]
},
step: () => 20,
disabled: (key) => key === "ship",
label: (key) => titles[key],
```

`step` sets the grid and the distance for Alt with an arrow, 1 by default. `disabled` blocks pointer and keyboard moves and removes that item from a moving group.

Click a note to select it, or Shift-click to add one. Drag a selected note to move the group. Alt with an arrow nudges it 20 pixels; the pinned note stays put.

Select on pointerdown before calling `move.pointerdown`. Keep the selection when the pressed note is already in it. The demo combines this with [spatial focus](./core.md#spatial-focus), so plain arrows move between notes.

`label` supplies the name for announcements. `message` can customize the sentence using the moved `keys`, the first item's `label`, and its new `at` point. `moveMessage` supplies the default wording.

### Zoom and Moving from Code

On a zoomed canvas, tell the behavior how many screen pixels represent one unit:

```ts
scale: () => context.store.get().zoom,
```

The pointer distance is divided by that scale. Programmatic moves still use the canvas's own units:

```ts
move.moveTo("circle", { x: 100, y: 60 })
move.moveBy(["circle"], 10, 0)
```

Change the zoom, then drag a shape. Use the buttons to move the circle without dragging.

Both methods report `imperative` and apply `bounds`. They don't apply the drag grid or filter disabled keys, so check those application rules before calling them if needed.

## Resizing Boxes

### Handles on a Box

A box has `{ x, y, width, height }`. Keep boxes in state, start a `ResizeDraft | null` field at `null`, and add `createResize` in `api`:

```ts
const resize = createResize(context, {
  boxes: (state) => state.boxes,
  draft: "draft",
  set: (value, details) => change("boxes", value, details),
  min: () => ({ width: 60, height: 40 }),
  bounds: () => ({ left: 0, top: 0, right: 320, bottom: 200 }),
  step: () => 4,
})
```

The box slot reads its committed size with `boxStyle`. List `draft` in the primitive's `live` fields, then apply `resize.style` through a live binding:

```ts
box: slot({
  attrs: (state, { api }) => ({ style: api.resize.boxStyle(state, "frame") }),
  live: live((state, { api }) => ({ style: api.resize.style(state, "frame") })),
  on: {
    pointerdown: (event, { el, api }) => api.resize.pointerdown(event, "frame", "move", el!),
  },
}),
```

Position the box absolutely and give each handle its own ID. Handles use compass names: `n`, `e`, `s`, `w`, `ne`, `nw`, `se`, and `sw`. Use `move` for the box itself.

Render handles as buttons with names such as "Resize bottom right". Their slots call `resize.handleAttrs(handle)` for the cursor and touch behavior, `resize.pointerdown(event, key, handle, el)` for dragging, and `resize.keydown(event, key, handle)` for arrows.

Drag a handle to resize the frame, or drag the frame to move it. Focus a handle and use the arrows; add Shift for larger steps. Escape cancels a drag.

`handleAttrs` doesn't supply a label or make an element focusable. The button does that. Arrow keys move an edge by `step`, the grid a dropped box lands on, or by `largeStep` with Shift, ten steps by default; an edge handle responds along its own axis. Changes report `drag` or `resize-key`.

### Keeping a Shape

Set an aspect ratio and size limits in the resize options:

```ts
aspect: () => (context.store.get().locked ? 16 / 9 : undefined),
min: () => ({ width: 96, height: 54 }),
max: () => ({ width: 256, height: 144 }),
largeStep: () => 16,
```

Resize the video frame while 16:9 is checked. Uncheck it to resize freely, or hold Shift while dragging a corner to preserve the frame's starting ratio.

`aspect` is width divided by height. A corner follows the edge that moved further; an edge handle adjusts the other dimension around its center. `min` and `max` bound the size, while `bounds` describes the surrounding area. Here `largeStep` makes Shift with an arrow move 16 pixels, while plain arrows keep moving 1.

### Several Boxes, and from Code

The same behavior can manage several boxes. Add `scale` for a zoomed desktop and `disabled` for boxes the user shouldn't move or resize:

```ts
scale: () => 0.75,
disabled: (key) => key === "notes",
label: (key) => titles[key],
```

Move or resize Mail on the scaled desktop. Notes is locked. Maximize sets Mail's box, and Grow enlarges it from the bottom-right corner.

There are two ways to change a box from code:

```ts
resize.resizeTo("mail", { x: 0, y: 0, width: 400, height: 240 })
resize.resizeBy("mail", "se", 40, 40)
```

`resizeBy` applies the handle's size limits and disabled rule. `resizeTo` writes the supplied box directly, so validate its dimensions and permissions yourself. Both report `imperative`.

To render a live size label, leave the draft out of `live` and read `resize.box(state, key)`. It returns the draft box during the drag and the committed box otherwise. `dragging(state, key)` returns the active handle. `label` and `message` customize announcements, with `resizeMessage` as the default.

## Swiping Rows Aside

### Actions Behind a Row

`createSwipeActions` keeps one row open at a time. Start `open` as `SwipeOpen | null` and `swiping` as `SwipeDraft | null`, both `null`:

```ts
const swipe = createSwipeActions(context, {
  key: "open",
  draft: "swiping",
})
```

Each row has moving content above actions on its `start` or `end` side. Bind the row with `bindRow(el, key)` and each action group with `bindActions(el, rowKey, side)`. Return those cleanups from the slots.

Put `swiping` in `live`. The content slot combines a transform with live attributes:

```ts
attrs: () => ({ style: css({ transform: "translateX(var(--swipe-x, 0px))" }) }),
live: live((state, { api, key }) => api.swipe.contentAttrs(state, key)),
```

Call `swipe.pointerdown(event, key, el)` and `swipe.keydown(event, key)` from the row. Give it `position: relative`, `overflow: hidden`, and `touch-action: pan-y`. The actions slot uses `swipe.actionsAttrs(state, rowKey, side)` to make hidden actions inert.

Swipe a message left to reveal Delete. From the keyboard, focus a row and press Left to reach its action, then Escape to close it.

A swipe waits for horizontal movement so vertical scrolling still works. Releasing past half the actions' width keeps them open; a flick can open or close them sooner. Action widths come from your layout.

`start` actions appear when swiping toward the end of the row, left to right in English. The direction reverses in right-to-left layouts. `contentAttrs` supplies `--swipe-x`, `data-swipe`, and `data-swiping`, so you can disable transitions while the pointer moves.

### Full Swipes

Add `onFullSwipe` to perform an action when the user swipes far enough. The callback performs the work; the helper doesn't click an action button for you:

```ts
onFullSwipe: (key, side) => {
  context.options().onAction?.(key, side)
  return true
},
fullSwipe: () => 0.5,
disabled: (key) => key === context.options().pinned,
```

Return whether the action was accepted. `fullSwipe` is a fraction of the row's width, 0.6 by default. The content gets `data-full` while release would trigger it.

Swipe right to mark a message read or left to archive it. Past half the row, release to perform the action. The pinned message stays closed; Peek and Close control the actions from code.

`swipe.show(key, "end", { focus: true })` opens a row and focuses its first action. `swipe.close({ focus: true })` closes it and returns focus to the row. Omit `focus` to leave focus where it is. `swipe.open()` reads the open row.

### Drag to Dismiss

A toast or card that's dragged far enough is dismissed on release. Give `scrubTo` a single snap point at 0: within the threshold its result has that `point`, so the toast snaps back, and past it, there's no point to return to. Ask on every move, so the toast can show what letting go will do:

```ts
import { scrubTo } from "@ui-sdk/core/number"

const keeps = { min: -width, max: width, step: 1, snap: { points: [0], threshold: width * 0.3 } }

onMove: ({ x }) => {
  moved = x - startX
  setOffset(moved)
  setDismissing(scrubTo(moved, keeps).point === undefined)
},
onEnd: () => (scrubTo(moved, keeps).point === undefined ? dismiss(Math.sign(moved)) : setOffset(0)),
```

Style `data-dismissing` so the change is clear before release, like iOS: here the layer behind the toast turns red and says "Release to dismiss". Dragging back under the threshold takes it back. Keep a Dismiss button in each toast for the keyboard.

Drag a toast sideways: past a third of its width, the layer behind turns red, and letting go dismisses it. Drag back, or press Escape, to keep it.

## Pressing and Holding

### Hold to Confirm

`bindHold` runs `onHold` once a press lasts past `delay`, 500 milliseconds by default. Give it a button and keep its cleanup:

```ts
import { bindHold } from "@ui-sdk/core"

const unbind = bindHold(button, {
  delay: 1500,
  onHold: () => deleteProject(),
})
```

It works with a mouse, a finger, a pen, and Space or Enter while the button has focus. While pressed, the button has `data-holding`, and `data-held` once it's held. `--hold-delay` holds the delay, so CSS can fill the button over exactly that time:

```css
[data-holding] .fill {
  transform: scaleX(1);
  transition: transform var(--hold-delay) linear;
}
```

Press and hold Delete Project until it fills. Let go early and nothing is deleted. From the keyboard, focus it and hold Space.

`onEnd` runs once the press ends, with `held` and `canceled`. A press is canceled when the pointer moves more than `tolerance` pixels before it's held, 10 by default, when a finger starts to scroll, when Escape is pressed, or when focus leaves the button or the window. A canceled press doesn't click, and Escape doesn't reach a dialog or popup around the button. Say that the button needs holding in its label or description, as the hint does here.

### Repeat While Held

`bindRepeat` steps once when a button is pressed, then keeps stepping while it's held, like a stepper's buttons, a scroll arrow or a remote's volume button. Give it what one step does:

```ts
import { bindRepeat } from "@ui-sdk/core"

const unbind = bindRepeat(button, {
  repeat: 80,
  onStep: () => zoomBy(5),
})
```

After `delay`, 400 milliseconds by default, `onStep` runs again every `repeat` milliseconds, 60 by default, until the press ends. Return `false` from `onStep` to stop repeating, like at a bound. `count` says which step of the press it is, starting at 1, and `onEnd` gets the total once the press ends.

You don't need a click handler. A mouse or a key steps as it goes down, and the click that follows doesn't step again. A finger or a pen steps when it lifts, or once it's held, so a scroll that starts on the button never steps. A click with no press behind it, like a screen reader's, steps once.

Press Zoom In once to add 5%. Hold it and the zoom keeps climbing until you let go or it reaches 400%. Slide off the button while holding and it waits until you come back.

While held, the repeats wait whenever the pointer is off the button, and go on when it comes back, like a scroll bar's arrows. A short press of Space or Enter steps once; held, they repeat at the same pace as a pointer, however fast the keyboard repeats the key. Pass `keys: []` to leave keys to the browser, and each click it sends steps once. Releasing, a cancel from the browser, Escape, or focus leaving the button or the window ends the press.

`bindRepeat` is built on `bindHold`, so the button has `data-holding` while pressed and `data-held` once it repeats. `bindHold` takes `repeat` too, for an action that waits until the press is held before its first run.

`onPress` runs as a press starts, with `input` set to `mouse`, `touch`, `pen` or `keyboard`. Return `false` to ignore it, like a context menu area that opens on a long press only for touch, since a mouse has right-click. Pass `disabled` to refuse presses and stop a hold from repeating. While a finger or pen presses, the browser's own long-press menu and iOS's callout stay closed. The cleanup stops a press under way without calling `onEnd`.

## Two-Dimensional Values

### A Point on a Pad

`createArea` maps a surface to two values. Read the point from state and write each change back:

```ts
const area = createArea(context, {
  value: (state) => ({ x: state.mix.warmth, y: state.mix.energy }),
  set: (value, details) =>
    change("mix", { warmth: value.x, energy: value.y }, details),
  x: () => ({ min: 0, max: 100, step: 1, label: "Warmth" }),
  y: () => ({ min: 0, max: 100, step: 1, label: "Energy" }),
})
```

The surface starts pointer tracking; the thumb supplies keyboard controls and slider attributes:

```ts
pad: slot({
  on: { pointerdown: (event, { el, api }) => api.area.pointerdown(event, el!) },
}),
thumb: slot({
  attrs: (state, { api }) => ({ ...api.area.thumbAttrs(state), style: api.area.thumbStyle(state) }),
  on: { keydown: (event, { api }) => api.area.keydown(event) },
}),
```

Make the surface positioned with `touch-action: none`. The thumb's position is relative to it. Unlike a move draft, this picker calls `set` throughout the gesture, with the reasons a slider reports: `track-press` for the press, `drag` as it moves and `step-key` for keys.

Click or drag on the pad to change warmth and energy. Focus the thumb and use the arrows, with Shift for larger steps.

Each axis defaults to 0–1 in steps of 0.01. The y axis runs bottom to top, and x follows the text direction. Arrows move one step, Shift moves ten, Page Up and Page Down move y by a tenth of its range, and Home and End go to x's ends.

`thumbAttrs` exposes one slider with value text describing both axes. `thumbStyle` sets its percentage position and the `--area-x` and `--area-y` fractions.

### What's Read Out, and When It Settles

Use `valueText` for a readable description and `onCommit` for work that should wait until a gesture ends:

```ts
valueText: ({ x, y }) => `${x}% saturation, ${y}% brightness`,
onCommit: (value) => context.options().onColorCommit?.(value),
disabled: () => context.store.get().locked,
```

Drag to adjust saturation and brightness. The swatch follows immediately; the saved value is logged on release or after a keyboard change. Lock disables the picker, and Reset sets its value from code.

`onCommit` runs at the end of pointer tracking or after a successful keyboard change. `disabled` prevents user input and removes the thumb from the tab order.

`area.set({ x: 60, y: 80 })` snaps and clamps a programmatic value with reason `imperative`. It still works when disabled and doesn't call `onCommit`. `area.fractions(state)` gives each value's position within its axis, useful for a gradient or swatch.

## Ranges on Tracks

### Bookings on a Timeline

A `Span` has an `id`, a `track`, and `start` and `end` values in your units. For room bookings, those units can be minutes from midnight. Keep bookings in an array and a `SpansDraft<Booking> | null` field at `null`:

```ts
type Booking = Span & { title: string }
type RoomsState = { bookings: Booking[]; draft: SpansDraft<Booking> | null }

let booked = 0
const spans = createSpans<RoomsState, Booking>(context, {
  key: "bookings",
  draft: "draft",
  set: (value, details) => change("bookings", value, details),
  axis: "x",
  min: () => 9 * 60,
  max: () => 17 * 60,
  step: () => 30,
  overlap: false,
  create: (span) => ({ ...span, id: `booking-${++booked}`, title: "New" }),
})
```

Render `spans.spans(state)` so the draft appears during a drag. A drop commits the array once, with the affected `id` and `action` in its details.

Bind tracks with `bindTrack(el, key)` and bookings with `bindSpan(el, id)`. Track presses call `trackPointerdown(event, key)`; booking presses call `spanPointerdown(event, id)`. Add `data-span-edge="start"` or `"end"` to resize handles inside a booking.

Drag on an empty stretch to book a room. Drag a booking to move it, or its end to resize it. Values snap to half hours, and bookings can't overlap.

Use `spanStyle(booking)` to position a booking, and `spanAttrs(state, id)` for `data-span-id` and drawing, dragging, or resizing states. Supply its focusability and accessible name yourself; `label(booking)` supplies the name used in announcements. Give tracks and draggable spans `touch-action: none`.

Call `keydown(event, id)` on the booking. Arrows along the track move it; Shift with those arrows moves its end. Arrows across tracks change rooms, and Delete or Backspace removes it. Each key commits immediately.

`create` supplies a new booking's ID and data. Without it, empty tracks don't create bookings. `overlap: false` rejects proposed ranges that overlap another on the same track.

### Days That Run Down

Tracks run vertically by default. Add duration limits, a click duration, and an explicit track order for a calendar:

```ts
minSize: () => 60,
maxSize: () => 180,
size: () => 60,
tracks: () => ["Mon", "Tue", "Wed"],
createAutoScroll: { edge: 32 },
```

Drag down a day to draw an event, or click for an hour. Move or resize events between one and three hours. Hold a drag near the top or bottom to scroll.

`minSize` and `maxSize` bound duration; `size` determines what a click creates. `tracks` controls keyboard travel across days. Auto-scroll accepts the [same options as other drags](./core.md#scrolling-while-dragging).

When overlap is allowed, give each event a lane so they can share the day's width:

```ts
const lanes = stackSpans(plans.filter((other) => other.track === plan.track))
const style = spans.spanStyle(plan, lanes.get(plan.id))
```

`spansOn(state, track)` reads one track's ranges. `valueAt(track, x, y)` converts a pointer position to a value within that track's range, snapped to `step`. `action(state, id)` reports the active pointer action.

### Changing Ranges from Code

Use `update` and `remove` for form fields or action buttons:

```ts
spans.update("standup", { start: booking.start + 30, end: booking.end + 30 })
spans.update("standup", { end: booking.end + 30 })
spans.remove("standup")
```

`update` applies range and overlap rules. These methods report `imperative`; they don't check `disabled`, which applies to pointer and keyboard input. `isSpanFree(bookings, proposed)` checks whether a proposed booking overlaps another on its track.

Move, lengthen, or delete Standup with the buttons. Book noon checks whether the room is free. The board meeting is locked, and leaving the window during a drag cancels it.

`spans.cancel()` ends a drag without committing it. If you cancel when the window loses focus, remove that listener when the primitive is destroyed:

```ts
window.addEventListener("blur", spans.cancel)
context.onDestroy(() => window.removeEventListener("blur", spans.cancel))
```

`message` customizes announcements with `spansMessage` as the default. Set `createAutoScroll: false` when your tracks don't need edge scrolling.

## Previews

### Press and Slide

A preview lets someone try a value before choosing it. Keep a `string | null` preview beside the chosen value, and render `preview ?? value`:

```ts
const preview = createPreview(context, {
  key: "preview",
  slot: "font",
  value: () => context.store.get().value,
  choose: (key, details) => change("value", key, details),
})
```

The preview writes directly to its state field. Add `set` if it needs to go through a change callback too.

Keep the existing roving focus binding for the font slot, and add these handlers:

```ts
on: {
  pointerdown: (event, { el, api, key }) => api.preview.pointerdown(event, key, el!.parentElement!),
  keydown: (event, { el, api, key }) => {
    if (api.preview.keydown(event, key)) {
      return
    }
    const moved = api.roving.keydown(event, el!)
    if (moved) {
      api.preview.show(moved.key, { reason: "list-navigation", event })
    }
  },
},
```

Press a font and slide over the others to preview them. Release over one to choose it, or outside to cancel. With the keyboard, arrows preview and Enter or Space chooses.

Pass the common parent surface to `pointerdown` to track the gesture across the options. `show(key)` previews one, `choose(key)` commits it, and `clear()` returns to the chosen value. Enter and Space choose; Escape clears.

Clear the preview when focus leaves the group, unless a pointer is still scrubbing:

```ts
focusout: (event, { el, api }) => {
  if (api.preview.dragging() || el?.contains(event.relatedTarget as Node)) {
    return
  }
  api.preview.clear({ reason: "focus-out", event })
},
```

Pressing and sliding can also try out an order. Measure each tab when the press starts, and make the left edge of every slot the dragged tab could take a snap point. `scrubTo` pulls the tab into a slot as it comes close, the nearest slot shows the order it would make, and letting go keeps it:

```ts
const slots = lefts([...others, key], widths)

onMove: ({ x, event }) => {
  const { value: left } = scrubTo(start + x, { min: 0, max: slots.at(-1), step: 1, snap: { points: slots, threshold: 12 } }, {
    snap: !event.metaKey,
  })
  preview(insert(others, key, nearest(slots, left)), left)
},
```

For the keyboard, `stepFromKey` and `stepBy` move the focused tab one place, or to either end with Home and End, the same way they step a slider.

Drag a tab along the bar: it snaps into each place as it nears it, and the others make room. Hold Command or Ctrl to place it freely, or press Escape to cancel. With the keyboard, Option or Alt with an arrow moves the focused tab.

### Hovering, and What's Read Out

For a hover preview, use `show` and `clear` on enter and leave, then `choose` on click:

```ts
pointerenter: (event, { api, key }) => api.preview.show(key, { reason: "item-hover", event }),
pointerleave: (event, { api }) => api.preview.clear({ reason: "item-hover", event }),
click: (event, { api, key }) => api.preview.choose(key, { event }),
```

Hover over a theme to try it and click to keep it. Arrows preview too; Enter chooses and Escape clears. Contrast is disabled.

`disabled(key)` prevents previewing or choosing an option. `label(key)` and `message(label)` customize announcements for previews with reason `list-navigation`; pointer previews don't announce every pass over an option.

## API Reference

The option tables link back to the examples that introduce them.

- `key` (`keyof State & string`): The state key that holds every item's position, a `Record<string, MovePoint>`. Example: [Place Anything](#place-anything).
- `draft` (`keyof State & string`): The state key that holds the `MoveDraft` while a pointer drags. Start it at `null`, and list it in `live`. Example: [Place Anything](#place-anything).
- `set` (`(value: Record<string, MovePoint>, details: { reason: MoveReason; event?: Event; }) => boolean`): Asks for new positions and returns whether they went through. Pass the primitive's change: `set: (value, details) => change("positions", value, details)`. Example: [Place Anything](#place-anything).
- `group?` (`((key: string) => string[])`): The keys that move together with the one pressed, like the selection when it holds it. Defaults to that one key. Example: [Several at Once](#several-at-once).
- `step?` (`(() => number)`): The grid a dropped position lands on, and how far Alt with an arrow nudges. Defaults to 1. Example: [Several at Once](#several-at-once).
- `largeStep?` (`(() => number)`): How far Alt with Shift and an arrow nudges. Defaults to ten steps. Example: [Place Anything](#place-anything).
- `scale?` (`(() => number)`): How many screen pixels one unit of position takes, like a canvas's zoom, so a drag follows the pointer when the items are scaled. Defaults to 1. Example: [Zoom and Moving from Code](#zoom-and-moving-from-code).
- `bounds?` (`((key: string) => { minX: number; minY: number; maxX: number; maxY: number; } | undefined)`): Keeps positions inside a box, like the board's size minus a card's. Example: [Place Anything](#place-anything).
- `disabled?` (`((key: string) => boolean)`): Whether an item can't be moved. Example: [Several at Once](#several-at-once).
- `label?` (`((key: string) => string | undefined)`): The name screen readers hear for an item. Example: [Several at Once](#several-at-once).
- `message?` (`((message: MoveMessage) => string)`): The text screen readers hear after a move. Defaults to English. Example: [Several at Once](#several-at-once).

- `boxes` (`(state: State) => Record<string, ResizeBox>`): Every box in state, by key, like `(state) => state.boxes` or `(state) => ({ crop: state.crop })`. Example: [Handles on a Box](#handles-on-a-box).
- `draft` (`keyof State & string`): The state key that holds the `ResizeDraft` while a pointer drags. Start it at `null`, and list it in `live`. Example: [Handles on a Box](#handles-on-a-box).
- `set` (`(value: Record<string, ResizeBox>, details: { reason: ResizeReason; event?: Event; }) => boolean`): Asks for new boxes and returns whether they went through. Pass the primitive's change: `set: (value, details) => change("boxes", value, details)`, or `change("crop", value.crop, details)` for a primitive with one box. Example: [Handles on a Box](#handles-on-a-box).
- `min?` (`((key: string) => { width: number; height: number; })`): The smallest a box gets. Defaults to 1 by 1. Example: [Handles on a Box](#handles-on-a-box).
- `max?` (`((key: string) => { width: number; height: number; } | undefined)`): The largest a box gets. Example: [Keeping a Shape](#keeping-a-shape).
- `bounds?` (`((key: string) => { left: number; top: number; right: number; bottom: number; } | undefined)`): Keeps a box inside an area, like the image a crop sits on. Example: [Handles on a Box](#handles-on-a-box).
- `aspect?` (`((key: string) => number | undefined)`): Keeps width over height at this ratio, like `16 / 9`. Without one, Shift on a corner keeps the ratio the box had when the drag started. Example: [Keeping a Shape](#keeping-a-shape).
- `step?` (`(() => number)`): The grid a dropped box lands on, and how far an arrow moves an edge. Defaults to 1. Example: [Handles on a Box](#handles-on-a-box).
- `largeStep?` (`(() => number)`): How far Shift with an arrow moves an edge. Defaults to ten steps. Example: [Keeping a Shape](#keeping-a-shape).
- `scale?` (`(() => number)`): How many screen pixels one unit takes, like a canvas's zoom. Defaults to 1. Example: [Several Boxes, and from Code](#several-boxes-and-from-code).
- `disabled?` (`((key: string) => boolean)`): Whether a box can't be changed. Example: [Several Boxes, and from Code](#several-boxes-and-from-code).
- `label?` (`((key: string) => string | undefined)`): The name screen readers hear for a box. Example: [Several Boxes, and from Code](#several-boxes-and-from-code).
- `message?` (`((message: ResizeMessage) => string)`): The text screen readers hear after a change. Defaults to English. Example: [Several Boxes, and from Code](#several-boxes-and-from-code).

- `key` (`keyof State & string`): The state key that holds the `SwipeOpen` row, or `null`. Example: [Actions Behind a Row](#actions-behind-a-row).
- `draft` (`keyof State & string`): The state key that holds the `SwipeDraft` while a pointer swipes. Start it at `null`, and list it in `live`. Example: [Actions Behind a Row](#actions-behind-a-row).
- `onFullSwipe?` (`((key: string, side: SwipeSide, details: { event: Event; }) => boolean)`): Runs a side's first action when a swipe goes past `fullSwipe` of the row's width, and returns whether it did. Without it, a long swipe only opens the row. Example: [Full Swipes](#full-swipes).
- `fullSwipe?` (`(() => number)`): How far across the row a swipe runs the first action, as a fraction of its width. Example: [Full Swipes](#full-swipes).
- `disabled?` (`((key: string) => boolean)`): Whether a row can't be swiped. Example: [Full Swipes](#full-swipes).

- `delay?` (`number`): How long a press lasts before it's held, in milliseconds. Example: [Hold to Confirm](#hold-to-confirm).
- `repeat?` (`number`): Runs `onHold` again this often while held, in milliseconds, like a stepper's button. Without it, `onHold` runs once. Example: [Repeat While Held](#repeat-while-held).
- `tolerance?` (`number`): How far a pointer can move before it's held, in pixels, before the press is canceled, like when a finger starts to scroll. Example: [Hold to Confirm](#hold-to-confirm).
- `keys?` (`string[]`): The keys that press it while it has focus. A short press clicks it, as a pointer's does. An empty list leaves keys alone. Example: [Repeat While Held](#repeat-while-held).
- `disabled?` (`(() => boolean)`): Whether a press can't start, and a held one stops repeating. Example: [Repeat While Held](#repeat-while-held).
- `onPress?` (`((details: HoldDetails) => boolean | void)`): Runs as a press starts. Return `false` to ignore it, like a mouse press where only touch holds. Example: [Repeat While Held](#repeat-while-held).
- `onHold?` (`((details: HoldDetails & { count: number; }) => boolean | void)`): Runs once the press is held, then every `repeat` milliseconds. Return `false` to stop repeating, like at a bound; the press goes on until it ends. Example: [Repeat While Held](#repeat-while-held).
- `onEnd?` (`((details: HoldEndDetails) => void)`): Runs once when the press ends, released or canceled. Example: [Hold to Confirm](#hold-to-confirm).

- `delay?` (`number`): How long a press lasts before it starts repeating, in milliseconds. Example: [Repeat While Held](#repeat-while-held).
- `repeat?` (`number`): How often it steps again while held, in milliseconds. Example: [Repeat While Held](#repeat-while-held).
- `keys?` (`string[]`): The keys that press it while it has focus. An empty list leaves keys to the browser, which clicks a button once per key press. Example: [Repeat While Held](#repeat-while-held).
- `disabled?` (`(() => boolean)`): Whether a press can't start, and a held one stops repeating. Example: [Repeat While Held](#repeat-while-held).
- `onPress?` (`((details: HoldDetails) => boolean | void)`): Runs as a press starts. Return `false` to ignore it. Example: [Repeat While Held](#repeat-while-held).
- `onStep?` (`((details: RepeatDetails) => boolean | void)`): Runs once for each press, then every `repeat` milliseconds while it's held. Return `false` to stop repeating, like at a bound. Example: [Repeat While Held](#repeat-while-held).
- `onEnd?` (`((details: RepeatEndDetails) => void)`): Runs once when a press ends, released or canceled, and after a click's step. Example: [Repeat While Held](#repeat-while-held).

- `value` (`(state: State) => AreaValue`): Reads the point from state, like `(state) => state.value`, or one made from other state, like a color's saturation and brightness. Example: [A Point on a Pad](#a-point-on-a-pad).
- `set` (`(value: AreaValue, details: { reason: AreaReason; event?: Event; }) => boolean`): Asks for a new value and returns whether it went through. Pass the primitive's change: `set: (value, details) => change("value", value, details)`. Example: [A Point on a Pad](#a-point-on-a-pad).
- `x?` (`(() => AreaAxis)`): The x axis, left to right. Example: [A Point on a Pad](#a-point-on-a-pad).
- `y?` (`(() => AreaAxis)`): The y axis, bottom to top, like a chart: a higher value sits higher. Example: [A Point on a Pad](#a-point-on-a-pad).
- `valueText?` (`((value: AreaValue) => string)`): The text screen readers hear for the value. Defaults to each axis's label and percentage. Example: [What's Read Out, and When It Settles](#whats-read-out-and-when-it-settles).
- `onCommit?` (`((value: AreaValue, details: { reason: AreaReason; event?: Event; }) => void)`): Runs when a press or a drag ends, or a key changed the value, with the value it ended on, like Slider's `onValueCommit`. Example: [What's Read Out, and When It Settles](#whats-read-out-and-when-it-settles).
- `disabled?` (`(() => boolean)`): Whether it can't change. Example: [What's Read Out, and When It Settles](#whats-read-out-and-when-it-settles).

- `key` (`keyof State & string`): The state key that holds the spans, an array of `Span`. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `draft` (`keyof State & string`): The state key that holds the `SpansDraft` while a pointer drags. Start it at `null`. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `set` (`(value: S[], details: { reason: SpansReason; event?: Event; id: string; action: SpanAction; }) => boolean`): Asks for the new spans and returns whether they went through. Pass the primitive's change: `set: (value, details) => change("spans", value, details)`. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `min?` (`(() => number)`): Where tracks start, in their units. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `max?` (`(() => number)`): Where tracks end. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `step?` (`(() => number)`): What every start and end snaps to, and what arrows move by. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `minSize?` (`(() => number)`): The shortest a span can be. Example: [Days That Run Down](#days-that-run-down).
- `maxSize?` (`(() => number)`): The longest a span can be. Example: [Days That Run Down](#days-that-run-down).
- `axis?` (`"x" | "y"`): The direction tracks run: `y` down, like a calendar's days, or `x` across, like a Gantt chart's rows. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `tracks?` (`(() => string[])`): The tracks in the order the arrows across them go through. Defaults to the bound tracks in document order. Example: [Days That Run Down](#days-that-run-down).
- `overlap?` (`boolean`): Whether spans on one track can overlap. When they can't, a drag stops where it would. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `create?` (`((span: Span) => S | null)`): Makes the span a press on a track starts to draw, with a new `id` and anything else it needs, like a title, or returns `null` to not draw. Runs on every press on an empty stretch of track. Without it, nothing is drawn. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `size?` (`(() => number | undefined)`): How long a span a click on an empty track makes. Without it, a click makes none. Example: [Days That Run Down](#days-that-run-down).
- `disabled?` (`((span: S) => boolean)`): Whether a span can't change. Example: [Changing Ranges from Code](#changing-ranges-from-code).
- `label?` (`((span: S) => string)`): What screen readers call a span, like `"Standup, Tuesday 9:00 to 9:30"`. Defaults to its track and range. Example: [Bookings on a Timeline](#bookings-on-a-timeline).
- `message?` (`((message: SpansMessage<S>) => string)`): The text screen readers hear for each change. Defaults to English. Example: [Changing Ranges from Code](#changing-ranges-from-code).
- `createAutoScroll?` (`false | Omit<AutoScrollOptions, "ignore" | "onScroll">`): How a drag near a scroller's edge scrolls it, or `false` not to. Example: [Days That Run Down](#days-that-run-down).

- `key` (`keyof State & string`): The state key that holds the previewed option's key, or `null`. Example: [Press and Slide](#press-and-slide).
- `slot` (`string`): The slot whose parts are the options. Example: [Press and Slide](#press-and-slide).
- `set?` (`((value: string | null, details: { reason: PreviewReason; event?: Event; }) => boolean)`): Asks for a new preview. Defaults to setting the state key; pass the primitive's change to fire `onPreviewChange`. Example: [Press and Slide](#press-and-slide).
- `choose` (`(key: string, details: { reason: "item-press"; event?: Event; }) => boolean`): Chooses an option. Pass the primitive's change for its value. Example: [Press and Slide](#press-and-slide).
- `value?` (`(() => string | null)`): The chosen option now, which previews as nothing. Example: [Press and Slide](#press-and-slide).
- `disabled?` (`((key: string) => boolean)`): Whether an option can't be previewed or chosen. Example: [Hovering, and What's Read Out](#hovering-and-whats-read-out).
- `label?` (`((key: string) => string)`): An option's name for screen readers. Defaults to its key. Example: [Hovering, and What's Read Out](#hovering-and-whats-read-out).
- `message?` (`((label: string) => string)`): What screen readers hear when the keyboard previews one. Defaults to English. Example: [Hovering, and What's Read Out](#hovering-and-whats-read-out).


# Lists

Search a list of options, render long lists, follow new messages, pick by scrolling, and edit values in place.

Use `createListbox` for options you move through and search, `createVirtualizer` for long lists, `createStickToBottom` for chats and logs, `bindScrollPicker` for wheels you scroll to pick from, and `createInlineEdit` for editable labels.

Each helper works on its own or alongside [focus](./core.md#grids) and [selection](./core.md#selection) in a component.

## Options You Search

### Move Through the Options

`createListbox` keeps one option highlighted and moves the highlight with the arrow keys, the way a listbox or a combobox does. Keep the highlighted option's key in state, starting at `null`, and create the behavior in `api`:

```ts
import { createListbox } from "@ui-sdk/core"

const listbox = createListbox(context, {
  key: "highlighted",
  focus: "virtual",
})
```

With `focus: "virtual"`, focus stays where it is, like in a search input, and the input points `aria-activedescendant` at the highlighted option. Leave `focus` out and the highlight moves real focus from option to option instead.

Each option joins in its slot's `bind`, and `attrs` gives it an `id`, `data-highlighted` and `aria-disabled`:

```ts
option: slot<{ value: string }>({
  role: "option",
  focus: "active-descendant",
  props: { value: "string" },
  selects: selects({ highlighted: ({ key }) => [key, null] }),
  attrs: (state, part) => ({
    ...part.api.listbox.attrs(state, part),
    "aria-selected": String(state.value === part.key),
  }),
  press: ({ key, api }, event) => api.choose(key, event),
  on: {
    pointerdown: (event) => event.preventDefault(),
    pointermove: (event, { key, api }) => api.listbox.highlight(key, { event }),
  },
  bind: (el, part) => part.api.listbox.bind(el, part),
}),
```

`selects` lets a move reach only the option it leaves and the one it lands on. On the input, set `aria-activedescendant` to `api.listbox.activeId(state)` and pass `keydown` to `api.listbox.keydown(event)`. The arrows, PageUp and PageDown move the highlight. With real focus, Home, End and typing an option's name move it too. Moving past either end wraps around unless `loop` returns `false`.

Choosing an option is yours. On Enter, read the highlighted key from state and write your value with [`createChange`](./core.md#changes), or with [`createSelection`](./core.md#selection) when people can choose several.

### Filter as You Type

Pass the text to filter by as `query`. In composed lists like the one above, an option only renders while it matches, so add `present` to the option slot:

```ts
const listbox = createListbox(context, {
  key: "highlighted",
  focus: "virtual",
  query: () => context.store.get().query,
})
```

```ts
present: (_state, part) => part.api.listbox.shows(part),
```

Options match by their `label` prop, or by their text when they have none, ignoring case and accents. When the query changes, call `listbox.move("first")` to highlight the best match, as this search does:

Type to filter the fruit. Use Up and Down to move the highlight, and Enter or a click to choose one.

`filter` decides what matches: `"contains"` by default, `"startsWith"`, or a function that returns `true`, `false`, or a score. A score ranks the options, best first, and 0 hides one. `listbox.count()` says how many options match, for a message when none do.

### Options as Data

For options that come from data, pass them as `items`: strings, items with a `value` and `label`, groups and separators. `listbox.items()` returns what matches the query, in order, so render that instead of the full list:

```ts
const listbox = createListbox(context, {
  key: "highlighted",
  items: () => context.options().items,
  query: () => context.store.get().query,
})
```

Pass `onHighlight` to hear where the highlight moved, with its index for a [virtualizer](#long-lists) to scroll to, and `onEnd` to load the next page when it reaches the last option.

### Options

- `key` (`keyof State & string`): The state key that holds the highlighted option's key. Start it at `null`. Example: [Move Through the Options](#move-through-the-options).
- `focus?` (`"real" | "virtual"`): `"real"` moves focus to the highlighted option. `"virtual"` keeps it where it is, like in an input that points `aria-activedescendant` at `activeId(state)`. Defaults to `"real"`. Example: [Move Through the Options](#move-through-the-options).
- `items?` (`(() => ListData<T>)`): The options as data: items, plain strings, groups and separators. Without it, the bound parts are the options, in document order. Example: [Options as Data](#options-as-data).
- `query?` (`(() => string)`): The text options are filtered by. Empty shows every option. Example: [Filter as You Type](#filter-as-you-type).
- `filter?` (`(() => ListFilter<T>)`): How `query` narrows the options. A function that returns a number ranks them too, best first. Defaults to `"contains"`. Example: [Filter as You Type](#filter-as-you-type).
- `loop?` (`(() => boolean)`): Whether moving past either end wraps around. Defaults to `true`. Example: [Move Through the Options](#move-through-the-options).
- `onHighlight?` (`((key: string | null, details: ListHighlightDetails) => void)`): Runs when the highlight moves, with the option's index among those that match, for a virtualizer to scroll to. Example: [Options as Data](#options-as-data).
- `onEnd?` (`(() => void)`): Runs when the highlight reaches the last option, so the next page can load. Example: [Options as Data](#options-as-data).

## Long Lists

### Render What's in View

`createVirtualizer` tells you which rows to render and where to place them. Start with the number of rows and an estimated height in pixels:

```ts
import { createVirtualizer } from "@ui-sdk/core"

const virtual = createVirtualizer({
  count: () => entries.length,
  estimate: () => 32,
})
```

Once the scroller mounts, connect it and subscribe to changes:

```ts
const disconnect = virtual.connect(scroller)
const unsubscribe = virtual.subscribe(render)
```

Render `virtual.items()` inside a relatively positioned box `virtual.size()` pixels tall. Each item gives you its `index`, `key`, `start` and `size`. Position its element absolutely at `start`, leaving the full-height box to provide the scrollbar.

Scroll through the ledger. The count shows how few of its 10,000 rows are rendered at once.

Call `disconnect()` and `unsubscribe()` when the view unmounts. In a primitive, return `virtual.connect(el)` from the scroller slot's `bind`. Call `virtual.refresh()` after the row count or order changes.

`items()` returns the same array until its contents change, so it works with subscriptions such as React's `useSyncExternalStore`. Give each row `aria-setsize` and `aria-posinset`, or use `aria-rowcount` and `aria-rowindex` for a grid, so assistive technology can tell where it sits in the full list.

### Rows of Any Height

For rows that wrap, estimate their height first and measure them after rendering. Give each row a stable data key so its measured size follows it when you sort:

```ts
const virtual = createVirtualizer({
  count: () => notes.length,
  key: (index) => notes[index].id,
  estimate: () => 52,
  overscan: 2,
})
```

In the row slot, return the measurement cleanup:

```ts
bind: (el, { api, props }) => api.virtual.measure(props.index, el),
```

`measure` also observes later size changes. Keep each measurement binding associated with its index; this demo keys the rendered rows by index while the virtualizer tracks sizes by data key.

Scroll through the notes, then try Newest First and Larger Text. Row positions adjust to their measured heights.

Call `virtual.reset()` to discard cached measurements after a change that affects every row, such as a new text size. `overscan` keeps a few extra rows beyond each edge; it defaults to four. Fixed-height rows can skip measurement.

### Jumping and Loading More

Use `scrollToIndex` to bring a row into view. Indexes start at zero:

```ts
virtual.scrollToIndex(49, { align: "center" })
virtual.scrollToIndex(79)
```

`align` can be `"start"`, `"center"`, `"end"` or `"auto"`. The default, `"auto"`, scrolls only far enough to show the row.

Try Center 50 and Last. Near the end, more contacts load. Click a contact and scroll away; its focused element stays rendered.

For a sticky header, set `scrollMargin` to its height. To load more, provide `onEnd` and optionally `endThreshold`:

```ts
scrollMargin: 32,
onEnd: () => loadMore(),
endThreshold: 5,
keep: () => (focusedIndex === null ? [] : [focusedIndex]),
```

`onEnd` runs once per row count when the visible range approaches the end. After loading, update the count and call `refresh()`. `keep()` adds indexes that must stay rendered, such as the row holding focus.

### Sideways

For a horizontal list, set `horizontal: true`:

```ts
const virtual = createVirtualizer({
  count: () => 365,
  estimate: () => 56,
  horizontal: true,
})
```

Now `start` and `size` describe horizontal positions. Use a spacer `virtual.size()` pixels wide and position items with `translateX`.

Scroll sideways through the days. Only the visible days and a few nearby ones are rendered.

### Find in Page

Find in page (⌘F, or Ctrl+F) sees only the rows a virtualizer renders. Give it the text of each row with `findable`, and connect with the findable layers, so it finds every row and the list scrolls to the one it matched:

```ts
const virtual = createVirtualizer({
  count: () => invoices.length,
  estimate: () => 36,
  findable: (index) => [invoices[index].id, invoices[index].customer],
})

virtual.connect(scroller, { findable: true })
```

Keep `findable` the text the row shows, so a row is found the same rendered or not. Pass only the text worth finding, like a title rather than a timestamp.

Then render that text through `findableText`, one empty element per piece, from its ref:

**React**

```tsx
<span ref={(el) => virtual.findableText(item.index, el, 0)} />
<span ref={(el) => virtual.findableText(item.index, el, 1)} />
```

**Vue**

```vue
<span
  :ref="(el) => virtual.findableText(item.index, el as HTMLElement | null, 0)"
/>
<span
  :ref="(el) => virtual.findableText(item.index, el as HTMLElement | null, 1)"
/>
```

**Svelte**

```svelte
<span {@attach (el) => virtual.findableText(item.index, el, 0)}></span>
<span {@attach (el) => virtual.findableText(item.index, el, 1)}></span>
```

**Solid**

```tsx
<span ref={(el) => virtual.findableText(item.index, el, 0)} />
<span ref={(el) => virtual.findableText(item.index, el, 1)} />
```

**Web Components**

```ts
const [idText, customerText] = row.querySelectorAll("span")
const off = [
  virtual.findableText(index, idText, 0),
  virtual.findableText(index, customerText, 1),
]
```

A row that leaves `items()` gives its text back on its own, so frameworks that call a ref with `null` instead of running what it returned work the same.

The element holds the very text find in page searches, so the browser highlights the match in the row itself, in the row's own styles, and counts it once. `part`, the last argument, picks the piece when `findable` returns several.

Press ⌘F or Ctrl+F and search for Acme. The find bar counts every Acme invoice, rendered or not; press Enter to step through them, and the list scrolls to each one.

### The Row It Found

The row find in page matched is `found` in `items()` until the next match, until it scrolls away, or until someone presses or types in the list. A row that renders its text without `findableText` still scrolls into view, but the browser's highlight can't show on it, so mark it yourself:

```tsx
<div data-found={item.found ? "" : undefined} className="data-found:bg-neutral-100">
```

### How It Works

The findable layers are two elements that take no space, one at the start of the scroller and one at its end. They hold a stand-in for every row that isn't rendered: an element with just the row's text, `hidden="until-found"`, which find in page can search and nothing renders.

1. **Order:** find in page steps through matches in page order, so the stand-ins of the rows above the ones in view sit in the first layer, and the rest in the last. Rendered rows have no stand-in in the page, so their text is found once, where it shows.
2. **A match** fires the stand-in's `beforematch` before the browser scrolls to it. The list scrolls to the row first and renders it, with the stand-in lying clear over the row, so the browser's own scroll has nothing to do.
3. **On the next frame,** the matched text moves into the row's `findableText` elements, so the browser's highlight shows there and the find bar's Enter continues with the rows after it. A row without them takes the clear stand-in instead, and the find bar counts it twice until it scrolls away.
4. **Groups of stand-ins** are hidden until found too, so the browser skips style and layout for all of them until one matches.

Each row costs a stand-in and a text node per piece, with a space between pieces: two DOM nodes for a single string, four for two pieces. They cost almost no layout, since the browser lays out only the groups. Call `virtual.refresh()` after the rows change: it updates only the text that changed, in place, and rebuilds the stand-ins only when the count changes.

The stand-ins' code loads the first time a list connects with `findable`, so lists without it don't download it.

Browsers without `hidden="until-found"` don't get the layers, and find in page sees only the rows on screen, as without `findable`; `supportsHiddenUntilFound()` tells you. Closed tabs, accordions, collapsibles, trees and navigation menus are findable the same way, through their `hiddenUntilFound` option or [`findableText`](./core.md#find-in-page-on-its-own), and a list inside a closed panel opens the panel first.

### Options

- `count` (`() => number`): How many rows the list has. Read on every update, so it can grow, like a list that loads more. Example: [Render What's in View](#render-whats-in-view).
- `estimate` (`(index: number) => number`): The size of a row before it's measured, in pixels. A close guess keeps the scrollbar steady. Example: [Render What's in View](#render-whats-in-view).
- `key?` (`((index: number) => string)`): A stable key for each row, so a measured size follows its row when the list sorts or filters. Defaults to the index. Example: [Rows of Any Height](#rows-of-any-height).
- `overscan?` (`number`): How many rows to render past each edge, so a fast scroll or Tab doesn't show a gap. Example: [Rows of Any Height](#rows-of-any-height).
- `horizontal?` (`boolean`): Whether the list scrolls sideways. Example: [Sideways](#sideways).
- `scrollMargin?` (`number`): Pixels in the scroller before the first row, like a sticky header. Example: [Jumping and Loading More](#jumping-and-loading-more).
- `keep?` (`(() => readonly number[])`): Rows rendered wherever the scroller is, like the one with focus, so scrolling it away doesn't drop focus to the page. Example: [Jumping and Loading More](#jumping-and-loading-more).
- `onEnd?` (`(() => void)`): Runs when the rendered rows come within `endThreshold` rows of the last, to load more. Runs once per `count`, so it doesn't ask again before the list grows. Example: [Jumping and Loading More](#jumping-and-loading-more).
- `endThreshold?` (`number`): How close to the end `onEnd` runs, in rows. Example: [Jumping and Loading More](#jumping-and-loading-more).
- `findable?` (`((index: number) => string | readonly string[])`): The text the browser's find in page should find in a row, like its title, so it finds rows that aren't rendered too. Keep it what the row shows. Return a list of pieces to give each its own `findableText`. Example: [Find in Page](#find-in-page).

## Logs That Follow Their End

### Follow the Newest Line

`createStickToBottom` follows new content while the reader is at the bottom. Scrolling up lets them read without being pulled away:

```ts
import { createStickToBottom } from "@ui-sdk/core"

const stick = createStickToBottom()
const disconnect = stick.connect(scroller)
```

The helper watches content size changes, including text that arrives a word at a time. Call `disconnect()` on unmount, or return `stick.connect(el)` from a slot's `bind`.

While new lines arrive, scroll up to pause following. Jump to latest takes you back to the end.

Use `stick.get()` to read whether the log is `following`, currently `atBottom`, or has `unseen` content below. `stick.subscribe(listener)` reports changes and returns a cleanup. These values can drive a jump button:

```ts
stick.scrollToBottom({ behavior: "smooth" })
```

Give the content `role="log"` when new entries should be announced by a screen reader.

### Older Messages and Letting Go

To open a conversation at its current position instead of jumping to the end, use `initial: false`:

```ts
const stick = createStickToBottom({ initial: false, threshold: 48 })
```

`threshold` is the distance in pixels that still counts as being at the bottom. Before adding older messages above the current ones, call `prepend()` to preserve the reader's position:

```ts
stick.prepend()
addOlderMessages()
```

Scroll to the end and Send a message. Load Older adds messages above without moving your view. Let Go stops following new messages. The console logs whether the thread is following.

`stick.release()` stops following from code. Scrolling back to the end or calling `scrollToBottom()` resumes it. The helper manages scroll anchoring while connected so the browser doesn't apply a second adjustment.

### Options

- `threshold?` (`number`): How close to the end, in pixels, still counts as at the bottom. Example: [Older Messages and Letting Go](#older-messages-and-letting-go).
- `initial?` (`boolean`): Whether it follows from the start. Example: [Older Messages and Letting Go](#older-messages-and-letting-go).
- `onChange?` (`((state: StickToBottomState) => void)`): Runs when `get()` changes. Example: [Follow the Newest Line](#follow-the-newest-line).

## Wheels You Scroll to Pick From

### Pick by Scrolling

Import `bindScrollPicker` from `@ui-sdk/core`. It turns a scrolling listbox into a wheel, like the hour and minute drums of a time picker: the option at the center is the value. Bind it to a [Listbox](./components/listbox.md) once the list is in the page, and select the option it reports. It returns a cleanup for when the list leaves:

**React**

```tsx
const list = React.useRef<HTMLDivElement>(null)
const select = React.useEffectEvent((index: number) => setHour(hours[index]))

React.useLayoutEffect(
  () => bindScrollPicker(list.current!, { onSelect: (index) => select(index) }),
  []
)

<Listbox ref={list} keepInView={false} value={hour} onValueChange={setHour}>
```

**Vue**

```vue
<script setup lang="ts">
const holder = useTemplateRef<HTMLElement>("holder")
let unbind: (() => void) | undefined
onMounted(() => {
  const list = holder.value!.querySelector<HTMLElement>('[role="listbox"]')!
  unbind = bindScrollPicker(list, {
    onSelect: (index) => (hour.value = hours[index]),
  })
})
onBeforeUnmount(() => unbind?.())
</script>

<template>
  <div ref="holder">
    <Listbox v-model="hour" :keep-in-view="false">…</Listbox>
  </div>
</template>
```

**Svelte**

```svelte
<Listbox
  bind:value={hour}
  keepInView={false}
  {@attach (el) =>
    bindScrollPicker(el, { onSelect: (index) => (hour = hours[index]) })}
>
```

**Solid**

```tsx
let list: HTMLDivElement | undefined
onSettled(() =>
  bindScrollPicker(list!, { onSelect: (index) => setHour(hours[index]) })
)

<Listbox ref={list} keepInView={false} value={hour()} onValueChange={setHour}>
```

**Web Components**

```ts
const listbox = document.querySelector("ui-listbox")!
const unbind = bindScrollPicker(listbox, {
  onSelect: (index) => (listbox.value = hours[index]),
})
```

`index` counts every option in the list, disabled ones included, so it matches your array. The picker selects nothing itself, so `onSelect` is where a read-only form or a check of your own decides.

The list stays a listbox with one selection. Scrolling, a flick on a touch screen and a drag with the mouse select the option at the center as it passes, and the list settles on the nearest enabled option once it stops. When the listbox selects an option itself, from a click, an arrow key, Home, End or typing its name, the picker scrolls there smoothly without selecting the options in between. Page Up and Page Down move a screenful of options.

Set the listbox's `keepInView` option to `false`, so it doesn't jump to an option the wheel is about to glide to. Give the list a height, `scroll-snap-type` and room at both ends for the first and last options to reach the center, and give each option `scroll-snap-align: center`:

```css
[role="listbox"] {
  height: 180px;
  padding-block: 72px;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

[role="option"] {
  height: 36px;
  scroll-snap-align: center;
}
```

Snapping is the browser's own, so the list snaps before your JavaScript loads. Options can be any size: the picker measures them, and measures again when they or the list resize.

### Draw a Wheel in CSS

Each option gets `--picker-offset`, its distance from the center in options: `0` at the center, `1` for the next option, `-2` two before it. It's fractional while the list moves between options and updates every frame, so CSS can draw the wheel with no code of your own:

```css
[role="option"] {
  transform: rotateX(calc(var(--picker-offset, 0) * -24deg));
  opacity: calc(1 - abs(var(--picker-offset, 0)) * 0.25);
}
```

The fallback of `0` covers the server's HTML, before the picker binds. Give the list `perspective` so the rotation looks round, and fade its ends with a `mask-image`:

Scroll or drag a wheel, or flick it on a touch screen. Click an hour, or focus a wheel and use Up, Down, Home and End. The console logs the time.

With reduced motion, the wheel jumps to an option instead of gliding there.

### Sideways

For a horizontal wheel, like a strip of page numbers, set the listbox's `orientation` to `"horizontal"`. The picker reads it from `aria-orientation`, so it scrolls and measures sideways, and in right-to-left text the strip runs from the right:

Scroll or drag the strip, or focus it and use Left and Right. The page in the middle is the current one, and the console logs it.

### Options

- `orientation?` (`"horizontal" | "vertical"`): Which way the list scrolls. A horizontal list runs from the right in right-to-left text. Example: [Sideways](#sideways).
- `onSelect?` (`((index: number, details: ScrollPickerSelectDetails) => void)`): Runs when someone's scroll, drag, or Page Up or Page Down brings another enabled option to the center, with its index among all the options. Select it here. Clicks and arrow keys select through the list itself. Example: [Pick by Scrolling](#pick-by-scrolling).

## Editing in Place

### Rename Where It Shows

`createInlineEdit` manages the editing session. Your state holds the item's id, or `null` when nothing is being edited. Your `commit` callback saves the new text:

```ts
import { createInlineEdit } from "@ui-sdk/core"

const edit = createInlineEdit(context, {
  key: "editing",
  value: (id) => nameOf(id),
  commit: (id, text, details) => {
    if (!text.trim()) {
      return false
    }
    return rename(id, text, details)
  },
})
```

Returning `false` keeps the editor open. Unchanged text finishes editing without calling `commit`.

Focus a playlist and press Enter or F2, or double-click it. Enter saves the name; Escape cancels. Typing a letter starts a replacement.

On the item, pass `keydown` to `edit.keydown(event, key)` and `dblclick` to `edit.dblclick(event, key)`. Render an input for the id returned by `edit.editing(state)`, then connect it:

```ts
input: slot({
  on: {
    keydown: (event, { api }) => api.edit.inputKeydown(event),
    focusout: (event, { api }) => api.edit.end("focus-out", event),
  },
  bind: (el, { api }) => api.edit.bindInput(el as HTMLInputElement),
}),
```

`bindInput` fills and focuses the input. Enter saves; Escape cancels. The `focusout` handler saves when focus leaves. After editing ends, the helper restores focus if removing the input would otherwise lose it.

### Moving on and Starting from Code

Tab also saves, but your component decides where focus goes next. `inputKeydown` returns `true` when it handled the key successfully:

```ts
if (event.key === "Tab" && edit.inputKeydown(event)) {
  nextField.focus()
}
```

Keep validation in `commit`. Use `disabled(id)` for values that can't be edited, and `edit.start(id)` to begin from a separate button or menu. If that button or menu is gone when editing ends, focus goes to the closest focusable element around the input instead, such as its row.

Edit a product value and press Tab to save and move on. Price requires a number, SKU stays read-only, and Rename starts editing the name.

### Options

- `key` (`keyof State & string`): The state key that holds the id being edited, or `null`. Example: [Rename Where It Shows](#rename-where-it-shows).
- `value` (`(id: string) => string`): The text an id shows now, put in the input when editing starts. Example: [Rename Where It Shows](#rename-where-it-shows).
- `commit` (`(id: string, text: string, details: { reason: InlineEditReason; event?: Event; }) => boolean`): Saves the text and returns whether it went through. Return `false` to keep editing, like when the text isn't valid. Example: [Rename Where It Shows](#rename-where-it-shows).
- `disabled?` (`((id: string) => boolean)`): Whether an id can't be edited. Example: [Moving on and Starting from Code](#moving-on-and-starting-from-code).


# Trees

Work with nested data, show open branches, and calculate checked states.

Use these helpers to look up parents and children, find visible rows, and calculate checked states across a tree.

They work with plain data, so you can use them in components, on the server, or in tests.

## A Tree's Shape

### Levels and Places

Give `createTreeCollection` a list of nodes, with parents before children and siblings in display order:

```ts
import { createTreeCollection } from "@ui-sdk/core"

const outline = createTreeCollection([
  { key: "basics", parent: null },
  { key: "setup", parent: "basics" },
  { key: "hello", parent: "basics" },
  { key: "extras", parent: null, branch: true },
])

outline.parent("hello") // "basics".
outline.level("hello") // 2.
outline.position("hello") // { index: 2, size: 2 }.
```

`level` and `position` count from one, matching `aria-level`, `aria-posinset` and `aria-setsize`. A node with children is a branch. Use `branch: true` for an empty folder or children you'll load later.

Read the level and position beside each section. Setup and Hello are siblings under Basics; Extras is a branch with no loaded children.

`outline.size` counts nodes, `has(key)` checks whether one exists, and `isBranch(key)` identifies branches. A node whose parent isn't in the collection is treated as a top-level node.

### Open and Closed Branches

Keep the open branch keys in your own state. `visible` returns the keys whose ancestors are open:

```ts
outline.visible([]) // ["basics", "extras"].
outline.visible(["basics"]) // ["basics", "setup", "hello", "extras"].
```

It reuses the result for the same expanded array. Replace that array when the open branches change.

Open lib, then choose date.ts; the console logs its path. Close src to hide its descendants, or use Expand All to reveal every folder.

Use `children(key)` for immediate children, or `children(null)` for the top level. `descendants(key)` includes everything below a node; `ancestors(key)` returns its path from the outermost parent inward. `keys()` lists the whole collection in tree order.

### Tree Data and File Paths

If your data is already nested, `treeDataNodes` converts it to collection nodes:

```ts
import { createTreeCollection, treeDataNodes } from "@ui-sdk/core"

const items = [
  {
    value: "src",
    label: "src",
    children: [{ value: "index", label: "index.ts" }],
  },
]
const tree = createTreeCollection(treeDataNodes(items))
```

Each node keeps the original `item`. An item with `children`, even an empty array, is a branch. Leave `children` out for a leaf.

For file paths, `treeFromPaths` builds the nested data for you:

```ts
import { treeFromPaths } from "@ui-sdk/core"

const items = treeFromPaths([
  "src/index.ts",
  "src/lib/util.ts",
  "README.md",
  "assets/",
])
```

Edit the paths, one per line. Folders appear before files; add a trailing slash to create an empty folder.

### Flat Rows

You can render nested data as a flat list. `visibleTreeRows` returns each visible item with its parent, level and row index:

```ts
import { visibleTreeRows } from "@ui-sdk/core"

const rows = visibleTreeRows(items, ["src"])
```

`level` starts at one; `index` starts at zero. Use them to indent rows or connect a [virtualized list](./core.md#long-lists).

Open Guides to reveal its rows. The labels show each row's index and parent; Old setup remains unavailable.

The helper supplies data. Your renderer decides how to handle it: this demo renders `href` items as links and an unavailable item as a non-interactive row. In a tree component, a disabled item can still receive focus while selection and activation are blocked.

### Data Fields

- `value` (`string`): Identifies the item. Unique in the tree. Example: [Tree Data and File Paths](#tree-data-and-file-paths).
- `label` (`string`): What it shows, and what typeahead matches. Example: [Tree Data and File Paths](#tree-data-and-file-paths).
- `children?` (`TreeItemData[]`): Its children. Leave it out for a leaf. An empty array is a branch with no children, or one whose children load when it opens. Example: [Tree Data and File Paths](#tree-data-and-file-paths).
- `disabled?` (`boolean`): Whether it can't be selected, checked or activated. It can still take focus. Example: [Flat Rows](#flat-rows).
- `href?` (`string`): Makes the item a link to this address. Example: [Flat Rows](#flat-rows).

## Checkboxes

### Check a Branch

`treeCheckedStates` calculates whether each node is checked, unchecked or mixed. `toggleTreeChecked` returns the next checked value:

```ts
import {
  createTreeCollection,
  toggleTreeChecked,
  treeCheckedStates,
} from "@ui-sdk/core"

const tree = createTreeCollection([
  { key: "fruit", parent: null },
  { key: "apple", parent: "fruit" },
  { key: "pear", parent: "fruit" },
])

const checked = treeCheckedStates(tree, ["apple"])
checked("fruit") // "indeterminate".
toggleTreeChecked(tree, ["apple"], "fruit") // ["apple", "pear"].
```

Calculate the states once for a checked value, then read each node with `checked(key)`. Render `"indeterminate"` as `aria-checked="mixed"`.

Check a folder to check its contents. Uncheck one file to make its folder mixed, then change the strategy and compare the values in the console.

### Strategies and Locked Items

The strategy controls how the checked value is represented:

| Strategy        | Value                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| `"leaf"`        | Checked leaves. This is the default.                                           |
| `"trunk"`       | Outermost fully checked nodes, so a checked folder can stand for its contents. |
| `"branch"`      | Every fully checked node, including branches and leaves.                       |
| `"independent"` | Each checked node on its own, with no cascading or mixed state.                |

Pass the same strategy when calculating states and toggling a node:

```ts
const checked = treeCheckedStates(tree, value, "trunk")
const next = toggleTreeChecked(tree, value, "fruit", { strategy: "trunk" })
```

For the cascading strategies, a branch in the value stands for its leaves. That lets a value remain meaningful after changing strategies or loading children.

Check Photos to select its editable files, then press it again to clear them. Try each strategy; the locked file stays unchecked.

To lock nodes, pass `checkable`. A refused node keeps its state, and a refused branch protects its descendants:

```ts
toggleTreeChecked(tree, value, key, {
  strategy,
  checkable: (node) => !locked.includes(node),
})
```

A folder can remain mixed because of a locked file. Pressing it again unchecks its editable files when those are already checked.

## Nested Parts

Events from a nested item bubble through its parents. Before a parent handles one, check that the closest tree item is its own element:

```ts
const own = (el: HTMLElement | undefined, event?: Event) =>
  !el ||
  !(event?.target instanceof Element) ||
  event.target.closest('[role="treeitem"]') === el
```

Use that check in the item's handlers. For example:

```ts
press: ({ api, key, el }, event) => own(el, event) && api.press(key, event),
```

For a virtualized tree, see [rows that aren't rendered](./core.md#rows-that-arent-rendered) to move focus to an item as it appears.


# Transitions and Gestures

Run your CSS transitions as panels come and go, keep them present until they finish, and turn pointer movement into gestures.

Motion here follows state. When state changes, your CSS transitions run, and an element stays in the page until its animation finishes. Someone who prefers reduced motion gets the end at once. `bindPanel` manages panel transitions, and `animateIn` and `animateOut` apply the states for CSS entry and exit animations.

Import these helpers from `@ui-sdk/core`. The functions in `@ui-sdk/core/gesture` calculate velocity, spring motion, resistance, and direction. You choose how to use those calculations in your input handlers and animation loop.

To slide items into new places, use CSS, View Transitions or a motion library.

## Panels and Presence

### Open and Close

`bindPanel` coordinates a panel's height, opening and closing styles, and focus. Your state tells it whether the panel is open or still exiting:

```ts
present: (state, { key }) => state.expanded.includes(key) || state.exiting.includes(key),
```

Keep a closing panel present until its transition finishes. Inside its `bind`, connect those values to `bindPanel` and return the cleanup:

```ts
bind: (el, { api, key, store }) =>
  bindPanel(el, {
    size: (el, height) => el.style.setProperty("--panel-height", height),
    isOpen: () => store.get().expanded.includes(key),
    isExiting: () => store.get().exiting.includes(key),
    isFindable: () => false,
    opening: () => "animate",
    reveal: () => api.toggle(key),
    trigger: () => el.previousElementSibling as HTMLElement | undefined,
    subscribe: store.subscribe,
    settled: () => {},
    exited: () => store.set({ exiting: store.get().exiting.filter((item) => item !== key) }),
  }),
```

Import `bindPanel` from `@ui-sdk/core`. The trigger in this example sits immediately before its panel. `exited` removes the key from `exiting`, allowing the panel to unmount.

Open a question, then close it. The answer stays mounted while its height transitions to zero.

Use the attributes it sets to write the transition:

```css
[data-slot="faq-panel"] {
  height: var(--panel-height);
  overflow: hidden;
  transition: height 200ms ease-out;
}
[data-slot="faq-panel"][data-starting-style],
[data-slot="faq-panel"][data-ending-style] {
  height: 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="faq-panel"] {
    transition: none;
  }
}
```

`size` receives a measured height during the transition and `auto` once open. If focus is inside a closing panel, `trigger()` provides the element to focus instead.

### Find in Page, and Opening at Once

A closed panel can stay searchable with `hidden="until-found"`. Keep it mounted and use `hiddenAttrs` for its visibility:

```ts
attrs: (state, { key }) => hiddenAttrs(state.expanded.includes(key), true),
```

Import `hiddenAttrs` from `@ui-sdk/core`. In the panel binding, enable find in page and open the matching section in `reveal`:

```ts
isFindable: () => true,
reveal: () => api.show([key]),
opening: () => store.get().opening,
```

Use your browser's find command to search for offline. In a supporting browser, its closed section opens. Open All reveals the remaining sections immediately.

`opening()` returns `"mount"` for an initially open panel, `"instant"` to skip its opening animation, or `"animate"`. `settled(open)` reports completed opens and closes, including instant changes, but does not run for the initial `"mount"`.

### Find in Page on Its Own

For hidden content without transitions, use `bindFindable` with `hiddenAttrs`. It restores `hidden="until-found"` when needed and calls your `reveal` callback on a match:

```ts
import { bindFindable } from "@ui-sdk/core"

const findable = bindFindable(el, {
  shown: () => store.get().shown,
  findable: () => true,
  reveal: () => api.show(),
})
const unsubscribe = store.subscribe(findable.check)
```

Inside a slot's `bind`, return a cleanup that calls both `unsubscribe()` and `findable()`.

Search the page for simmer to reveal the hidden method in a supporting browser. Show Method and Hide Method work without browser search.

`supportsHiddenUntilFound()` tells you whether the browser supports this feature. Provide a visible control for revealing the content either way.

### Entering and Leaving

For an element that simply appears and disappears, use `animateIn` and `animateOut`:

```ts
import { animateIn, animateOut } from "@ui-sdk/core"

const stopEntering = animateIn(el)
```

When it should leave, stop the pending entrance and begin the exit. Remove the element in the completion callback:

```ts
stopEntering()
const stopExiting = animateOut(el, () => removeToast(key))
```

Press Save to add a message. Press its Dismiss button; it leaves the page after fading out.

Style `data-starting-style` and `data-ending-style` with CSS. The exit waits for running animations, with a timeout so a stuck animation can't keep the element mounted forever. Both helpers return cleanup functions; call the current one when the element unmounts. Add a reduced-motion rule to your CSS, as in the panel example.

### Options

- `size` (`(el: HTMLElement, height: string, width: string) => void`): Writes the panel's size variables, like `--accordion-panel-height`: the measured size while animating, `auto` once open and `0px` while closed. Example: [Open and Close](#open-and-close).
- `isOpen` (`() => boolean`): Whether the panel is open now. Example: [Open and Close](#open-and-close).
- `isExiting` (`() => boolean`): Whether a closed panel is still shown while it animates out. Keep the panel `present` while it is. Example: [Open and Close](#open-and-close).
- `isFindable` (`() => boolean`): Whether a closed panel stays in the page, findable with `hidden="until-found"`. Example: [Find in Page, and Opening at Once](#find-in-page-and-opening-at-once).
- `opening` (`() => "mount" | "instant" | "animate"`): How the panel opens: as it mounts with the page, at once, or animated. Example: [Find in Page, and Opening at Once](#find-in-page-and-opening-at-once).
- `reveal` (`(event: Event) => void`): Find in page matched text in the closed panel. Open it here. Example: [Find in Page, and Opening at Once](#find-in-page-and-opening-at-once).
- `trigger` (`() => HTMLElement`): Where focus goes when the panel closes with focus inside it, like its trigger. Example: [Open and Close](#open-and-close).
- `subscribe` (`(listener: () => void) => () => void`): Runs `listener` when the panel's state may have changed, like `store.subscribe`. Returns the unsubscribe. Example: [Open and Close](#open-and-close).
- `settled` (`(open: boolean) => void`): The open or close animation finished, or there was none. Never on mount. Example: [Find in Page, and Opening at Once](#find-in-page-and-opening-at-once).
- `exited` (`() => void`): The exit animation finished, so the panel can leave the page: stop counting it as exiting here. Example: [Open and Close](#open-and-close).

## Gestures

The functions in `@ui-sdk/core/gesture` help interpret pointer movement. Your component still handles input, state and animation frames.

### Throws and Springs

Record positions while the pointer moves, then read its velocity on release:

```ts
import { createVelocityTracker, projectDistance } from "@ui-sdk/core/gesture"

const tracker = createVelocityTracker()
tracker.add(event.timeStamp, x)
```

`velocity(time)` returns pixels per millisecond. `projectDistance` estimates how far that speed would carry an object as it slows down:

```ts
const speed = tracker.velocity(release.timeStamp)
const target = x + projectDistance(speed, 0.994)
```

Drag the fan control slowly, then try a quick flick. A faster release travels farther. Left and Right also change the speed.

To settle onto a target, create a spring and read its position each frame:

```ts
import { solveSpring } from "@ui-sdk/core/gesture"

const spring = solveSpring(0.4, 0.8, x - target, speed)
const position = target + spring.position(elapsedMilliseconds)
```

The first argument is the response in seconds. The second is the damping ratio: `1` settles without oscillating; a lower value allows a bounce. The remaining arguments are the initial displacement and velocity. `position(t)` and `velocity(t)` take elapsed milliseconds. In your animation loop, check both position and velocity before deciding the spring has settled.

### Past an Edge

`rubberBand` makes a pull resist as it moves farther past an edge:

```ts
import { rubberBand } from "@ui-sdk/core/gesture"

const offset = rubberBand(distancePastEdge, list.clientHeight)
```

Pull the inbox down far enough to refresh, then release. Try a short pull held still before release; it returns without refreshing. Refresh also works by button.

The result approaches the supplied dimension as the pull grows. Call `tracker.reset()` at the start of each gesture. `staleAfter` makes an old sample read as zero, so holding still before release doesn't act like a fresh flick.

### Which Way a Stroke Points

`sectorOf` turns a drag direction into a numbered wedge. With four wedges, zero is up, then right, down and left:

```ts
import { sectorOf } from "@ui-sdk/core/gesture"

const index = sectorOf(dx, dy, 4) // -1 near the center
```

Drag from the center toward a reaction and release to choose it. A short stroke chooses nothing. You can also click a reaction directly.

Within the `deadZone`, `sectorOf` returns `-1`; the default is 18 pixels. Check for that before using the index. Pass a `start` offset, measured in turns, to rotate the wedges.

### Options

- `horizon?` (`number`): How far back samples count, in ms before the newest. Defaults to 70. Example: [Past an Edge](#past-an-edge).
- `staleAfter?` (`number`): How old the newest sample can be, in ms, before the pointer counts as stopped and reads 0. Defaults to 40. Example: [Past an Edge](#past-an-edge).
- `maxSpeed?` (`number`): The fastest the tracker reads, in px/ms either way. Defaults to 8. Example: [Past an Edge](#past-an-edge).
- `capacity?` (`number`): How many samples it keeps. Defaults to 20, enough for the horizon at 240 Hz. Example: [Past an Edge](#past-an-edge).


# Popups and Layers

Build a popup, compose an existing one, or use positioning and dismissal on their own.

Use `createPopup` to manage opening, closing, positioning, and focus for your own popup.

You can also [compose an existing Popover, Dialog, or Menu](#compose-ours) into your component, or use [positioning](#placing-a-popup) and [layers](#layers-of-your-own) separately.

## Make Your Own

### A Popup of Your Own

Start with an invite popover. `popupState` supplies its state, `createPopup` supplies its behavior, and the slot builders connect its parts:

```ts
import {
  createPopup,
  definePrimitive,
  popupClose,
  popupContent,
  popupState,
  popupTrigger,
} from "@ui-sdk/core"
import { popoverPreset } from "@ui-sdk/core/popover"

const invite = definePrimitive({
  name: "invite",
  options: { defaultOpen: "boolean" },
  state: (options: { defaultOpen?: boolean }) => popupState(options),
  api: (context) => createPopup(context, { preset: popoverPreset }),
  slots: (slot) => ({
    trigger: popupTrigger(slot),
    content: popupContent(slot),
    close: popupClose(slot),
  }),
})
```

Render these parts with your framework's adapter, as in [Build a Component](./core.md#build-a-component). The popover preset provides placement beside the trigger, dismissal, and focus handling:

Press Invite, then close it with Escape, a press outside, or Done. Escape and Done return focus to Invite.

`state.open` tells you whether the popup is open. `state.mounted` stays true during its exit animation. Use the content builder to keep that presence behavior when rendering your popup.

The default slot names are `content` and `trigger`. If yours have different names, pass `slot` and `trigger` to `createPopup`.

### Pick Its Behavior

Change the preset to change the interaction. For example, this makes the popup a modal dialog:

```ts
import { dialogPreset } from "@ui-sdk/core/dialog"

api: (context) => createPopup(context, { preset: dialogPreset }),
```

Open Filters, then Rename, and compare how Tab behaves. Hover or focus Help to open the tooltip.

A preset chooses the content's role, how it opens and closes, whether it is positioned beside a trigger, and whether it is modal. Our components use the same presets, so `dialogPreset` behaves like [Dialog](./components/dialog.md): an untitled dialog takes its trigger's name, since a modal dialog makes the page inert, its trigger included.

| Preset            | Import From               | Use It For                            |
| ----------------- | ------------------------- | ------------------------------------- |
| `popoverPreset`   | `@ui-sdk/core/popover`    | Interactive content beside a trigger  |
| `dialogPreset`    | `@ui-sdk/core/dialog`     | A modal task that holds focus         |
| `tooltipPreset`   | `@ui-sdk/core/tooltip`    | A short label shown on hover or focus |
| `hoverCardPreset` | `@ui-sdk/core/hover-card` | A preview shown on hover or focus     |

The `role` option can override the preset's content role. A role alone doesn't add a pattern's behavior; use [Alert Dialog](./components/alert-dialog.md), for example, when a confirmation must follow that pattern.

### The Options It Reads

Your primitive can expose popup options alongside its own. Add the fields you need to its options type and schema; `createPopup` reads them for you.

For example, `dismissible: false` keeps Escape and outside presses from closing a popup with unsaved work. `onDismissAttempt` tells you why someone tried to dismiss it:

```tsx
<Cart
  dismissible={false}
  onDismissAttempt={(details) => setStatus(`Kept open: ${details.reason}`)}
>
  {children}
</Cart>
```

Open Cart and watch the reason when it closes. Try Modal, Open on hover, and clearing Dismissible. Check Out still closes the cart.

| Option                                | What It Changes                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `open`, `defaultOpen`, `onOpenChange` | Control the open state or observe changes, with reasons such as `trigger-press` and `escape-key`.           |
| `modal`                               | Override the preset's modality. `true` makes the page outside inert while the popup is open.                |
| `openOnHover`, `delay`, `closeDelay`  | Add hover opening to a press-opened popup and set the opening and closing delays in milliseconds.           |
| `dismissible`, `onDismissAttempt`     | Refuse dismissals and hear the attempted reason. Triggers, Close parts, and controllers can still close it. |
| `disabled`                            | Prevent opening.                                                                                            |

Controlled `open` uses the same [change and sync pattern](./core.md#state-a-user-controls) as other state. The cart's source shows those fields together.

### One Popup, Many Triggers

Several triggers can share one popup. Give each a `payload` prop, such as the person its card should show:

```tsx
<TeamCardTrigger payload={person}>{person.initials}</TeamCardTrigger>
```

The content receives that value as `state.payload`. Opening another trigger updates the payload and moves the popup to it. `onPayloadChange` reports the change.

Open one person's card, then press another avatar. The same popup moves to the new trigger and shows that person's details.

Add `popupTitle(slot)` and `popupDescription(slot)` to connect a visible title and description to the content. `popupArrow(slot)` adds an arrow whose `data-side` follows its placement.

### Every Part, and Parts of Your Own

`popupSlots(slot)` gives you the standard parts together: `trigger`, `content`, `title`, `description`, `close`, `arrow`, `backdrop`, and `viewport`.

You can add another slot beside them. This link preview adds an image that only renders when the payload has one:

```ts
slots: (slot) => ({
  ...popupSlots(slot),
  image: slot({
    present: (state) => !!(state.payload as LinkPreviewPage | undefined)?.image,
    attrs: (state) => ({
      src: (state.payload as LinkPreviewPage | undefined)?.image,
      alt: "",
    }),
  }),
}),
```

Use `hoverCardPreset` with the same `popupState` and `createPopup` setup as before. In this example, `LinkPreviewPage` describes the payload's title, description, and optional image:

Hover or focus popup layer, focus, and motion. The preview follows each link; motion has no image, so its image part doesn't render.

The `backdrop` part sits behind a modal popup; a press on it counts as outside. `viewport` provides the full-screen container for a sheet. Use individual builders when you only need a few parts, or `popupSlots` when you need the set.

### Creation Options

- `preset` (`PopupPreset`): The behavior, like `popoverPreset` or `hoverCardPreset`. Example: [A Popup of Your Own](#a-popup-of-your-own).
- `slot?` (`string`): The slot that is the popup. Example: [A Popup of Your Own](#a-popup-of-your-own).
- `trigger?` (`string`): The slot that opens it. Example: [A Popup of Your Own](#a-popup-of-your-own).
- `role?` (`"alertdialog" | "dialog" | "menu" | "tooltip"`): The content's role, like `"alertdialog"`. Example: [Pick Its Behavior](#pick-its-behavior).

## Compose Ours

A picker can own its selection while an existing Popover handles opening, placement, and dismissal. Choose the component that fits what you're showing:

| You Need                             | Render                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Interactive content beside a trigger | [Popover](./components/popover.md)                                              |
| A list of actions                    | [Menu](./components/menu.md)                                                    |
| A modal task or confirmation         | [Dialog](./components/dialog.md), [Alert Dialog](./components/alert-dialog.md) |
| A sheet from the screen's edge       | [Drawer](./components/drawer.md)                                                |
| A hover label or preview             | [Tooltip](./components/tooltip.md), [Hover Card](./components/hover-card.md)   |
| A choice from a list                 | [Select](./components/select.md), [Combobox](./components/combobox.md)         |

### A Picker in a Popover

This emoji picker already owns `open`. Its React renderer passes that state to Popover and forwards Popover's change details into the picker's `setOpen` method:

```tsx
<Popover
  open={state.open}
  onOpenChange={(open, details) =>
    handle.api.setOpen(open, {
      reason: details.reason,
      event: details.event,
      source: details.source,
    })
  }
>
  {children}
</Popover>
```

Forwarding the reason, event, and source keeps the change meaningful to the picker's caller. Picking an emoji closes the same state with its own `item-press` reason.

Open React and choose an emoji. The picker records the reaction and closes its Popover.

The demo's Code tab includes the React renderer. [Custom Parts](./custom-parts.md) covers the rendering helpers, and the Web Components guide shows the connection in custom elements. The popup's content props, such as `initialFocus`, still work normally.

## Open from Code

A popup controller lets an event handler open a popup and wait for its result. Each popup exports a factory, such as `createPopoverController`, from its core entry and its framework adapter.

### Open, Wait, and Close

Create a controller and pass it to the popup. Here the payload is a point:

```tsx
import {
  createPopoverController,
  Popover,
  PopoverContent,
} from "@ui-sdk/react/popover"

const note = createPopoverController<{ x: number; y: number }>()

function Note() {
  return (
    <Popover controller={note}>
      <PopoverContent>Leave a note at this point.</PopoverContent>
    </Popover>
  )
}
```

From a click handler, give `open` an anchor and payload. The anchor uses viewport coordinates; the payload can be any data your content needs:

```ts
const result = await note.open({
  anchor: { x: event.clientX, y: event.clientY },
  payload: { x: event.clientX, y: event.clientY },
})
```

The content reads the payload from its render state. `open` resolves when the popup closes, with `reason`, `source`, and an optional `returnValue`. To return a value from a button inside the popup:

```ts
note.close({ returnValue: "kept" })
```

Click the card to open a note at that point. Press Keep or Escape and read the result. Select Close by itself to close after two seconds.

Pass `signal: AbortSignal.timeout(2000)` to `open` for a timed close. An abort closes with reason `imperative`; removing the popup's component resolves with `unmount`. The promise resolves once and doesn't reject.

To expose your own component's API this way, see [Controllers](./core.md#controllers).

## Placing a Popup

`position(anchor, element, options)` places an element beside an anchor, watches for movement, and flips it when there isn't room. It doesn't open or dismiss the element.

### Beside an Anchor

An anchor can be an element, a point such as `{ x, y }`, or an object with `getBoundingClientRect`, such as a text selection's range.

```ts
import { position } from "@ui-sdk/core"

const stop = position(anchor, popup, {
  side: "bottom",
  align: "start",
  sideOffset: 4,
})
```

Call `stop()` when the element goes away. In a primitive, return the cleanup from the slot's `bind`:

```ts
card: slot({
  present: (state) => state.open,
  bind: (el, { store }) => position(() => store.get().anchor, el),
}),
```

The getter lets the anchor change while the element stays mounted. A virtual anchor's rectangle is checked each frame, so a toolbar can follow a changing text selection.

Click the map to place a pin, then close it with Escape or Done. Focus the map and press Enter to open the card from the keyboard.

The demo combines `position` with [a layer](#layers-of-your-own) for dismissal, and handles focus when opening and closing.

### Sides, Gaps and an Arrow

Pass placement options directly, or return them from a getter when they can change while open. The arrow can also be a getter, so it can mount after the content:

```ts
bubble: slot({
  bind: (el, { api }) =>
    position(api.target, el, () => ({
      side: "top",
      align: "center",
      sideOffset: 8,
      arrow: () => api.arrow(),
      arrowPadding: 8,
    })),
}),
```

Change Side, Align, and the offsets. With the hint above its button, scroll the button near the top of the window to see the hint flip below.

`data-side` and `data-align` report the final placement on both the popup and arrow. Use `--available-width` and `--available-height` to constrain the content, and `--transform-origin` for its animation origin. The returned cleanup also has a `place()` method to recalculate immediately.

### Position Options

- `side?` (`Side`): Which side of the anchor it opens on. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `align?` (`Align`): How it lines up with the anchor along that side. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `sideOffset?` (`number`): Gap between the anchor and the element, in pixels. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `arrow?` (`HTMLElement | (() => HTMLElement | null | undefined) | null`): An element inside that points at the anchor, like an arrow, placed along the edge facing it. A function is read on every check, so an arrow that mounts later is still found. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).
- `arrowPadding?` (`number`): Space to keep between the arrow and the corners, in pixels. Example: [Sides, Gaps and an Arrow](#sides-gaps-and-an-arrow).

## Layers of Your Own

`bindLayer` registers an element in the same dismissal stack as the SDK's popups. Use it when you're building a floating UI with its own shape and behavior, such as a ring of actions or a toolbar over a selection.

### A Layer in the Stack

Bind the layer while its part is present, and return the cleanup. `contains` lets you count another element, such as its trigger, as inside the layer:

```ts
import { bindLayer } from "@ui-sdk/core"

panel: slot({
  present: (state) => state.open,
  bind: (el, { api }) =>
    bindLayer(el, {
      topLayer: true,
      contains: (target) => !!api.trigger()?.contains(target),
      onDismiss: () => api.close(),
    }),
}),
```

Escape goes to the topmost layer. Nested popups count as inside their parent, so interacting with a menu inside your panel keeps the panel open:

Open Share, then its access menu. Press Escape once to close the menu and again to close Share. Choosing an access level keeps Share open.

`onDismiss(reason, event)` asks your code to close the layer. You still own its state, role, focus behavior, and placement. `topLayer: true` uses the browser's top layer when supported, so the element can appear above clipping ancestors.

### Modal Layers, and What Stays Usable

For `bindLayer`, `modal: true` blocks an outside press from reaching the page beneath. `closeOnBlur` asks it to close when the window loses focus:

```ts
bindLayer(el, {
  topLayer: true,
  modal: true,
  closeOnBlur: true,
  onDismiss: (reason) => api.close(reason),
})
```

This layer option handles outside presses. Use a dialog preset when you also need modal focus handling and the rest of the page made inert.

Open the timer and press Count with Modal on, then off. Try Pause while the panel is open: the player stays usable. Switching windows dismisses the panel too.

`bindPersistentLayer` keeps an element usable across layers, including modal popups. It works well for a toast region or player; presses inside it don't dismiss other layers:

```ts
player: slot({ bind: (el) => bindPersistentLayer(el) }),
```

Use `isDismissal(reason)` to distinguish a dismissal, such as Escape or an outside press, from a choice made inside your UI:

```ts
onClose: (reason) => {
  setStatus(isDismissal(reason) ? "Dismissed" : "Closed")
},
```

### Layer Options

- `onDismiss` (`(reason: LayerDismissReason, event: Event) => void`): Runs when Escape, a press outside or the window losing focus asks the layer to close. Example: [A Layer in the Stack](#a-layer-in-the-stack).
- `contains?` (`((target: Node) => boolean)`): Other elements that count as inside, like the trigger that opened it. Example: [A Layer in the Stack](#a-layer-in-the-stack).
- `modal?` (`boolean`): Whether a press outside only closes the layer, without reaching the page beneath. Defaults to `false`. Example: [Modal Layers, and What Stays Usable](#modal-layers-and-what-stays-usable).
- `topLayer?` (`boolean`): Whether the element joins the browser's top layer. Defaults to `false`. Example: [A Layer in the Stack](#a-layer-in-the-stack).
- `closeOnBlur?` (`boolean`): Whether the window losing focus closes it, like a click into an iframe. Defaults to `false`. Example: [Modal Layers, and What Stays Usable](#modal-layers-and-what-stays-usable).

## Types and the Top Layer

SDK popups render in place using the browser's top layer. When it isn't supported, adapters use a portal to the body. A `container` prop lets you choose a container explicitly. `supportsTopLayer()` checks support.

A raw element passed to `bindLayer` needs its own placement and styles. Reset the browser's default popover `inset`, `margin`, `padding`, `border`, and `background` before applying your design.

### Popup Types

Use `PositionProps` for the placement props you forward to a popup, and `Anchor` for an element or virtual anchor. `Side` and `Align` type individual placement values; `PopupController` describes the methods returned by a popup controller factory.


# Preferences

Define choices such as skin tone or density, save them, and keep components in sync.

Use `createPreference` to share a user preference across your app. It keeps components in sync when the preference changes and can save it between visits.

You can use it for a theme, like light or dark mode (see [`createColorScheme`](#choose-a-color-scheme)), or other user preferences like a preferred package manager or whether the sidebar is open.

## Create a Preference

Give the preference its allowed values, a default, and a `data-*` attribute. Here's a skin-tone preference:

```ts
import { createPreference } from "@ui-sdk/core"

const skinTone = createPreference({
  values: ["default", "light", "medium-light", "medium", "medium-dark", "dark"],
  defaultValue: "default",
  attribute: "data-skin-tone",
})

export { skinTone }
```

The attribute gives CSS a way to use the choice. [Apply Preferences](#apply-preferences) shows how to put it on the page. You decide what each value looks like.

### Read and Change the Value

Call `set` to change the choice and `get` to read its state:

```ts
skinTone.set("medium")
skinTone.get().value
```

After setting `"medium"`, `get().value` returns `"medium"`. `set` only accepts values from the allowed list. It returns `true` when the value changes, or `false` if it stays the same or the change is canceled.

### Respond to Changes

Add `onValueChange` to the preference's options to hear a proposed change:

```ts
onValueChange: (value, details) => {
  console.log(value, details.reason)
},
```

This runs before the value changes. The details include the reason, event, and source. Call `details.cancel()` if your app needs to keep the current value. [Handle Changes](./core.md#handle-changes) covers these details.

### Follow Changes

Use `subscribe` to update something outside a framework component when the value changes:

```ts
const stop = skinTone.subscribe(({ value }) => {
  console.log(value)
})
```

Read the current state with `get()` when you set up. Call `stop()` when you no longer need the subscription. For a framework component, use [Read a Preference](#read-a-preference) below.

## Remember the Choice

Add [storage](./core.md#storage) to save each choice and restore it on the next visit:

```ts
import { createLocalStorage, createPreference } from "@ui-sdk/core"

const skinTone = createPreference({
  values: ["default", "light", "medium-light", "medium", "medium-dark", "dark"],
  defaultValue: "default",
  attribute: "data-skin-tone",
  storage: createLocalStorage("skin-tone"),
})

export { skinTone }
```

This demo uses localStorage:

Choose a skin tone, then reload the page. Your choice is saved.

| Storage                | Use It For                                                    |
| ---------------------- | ------------------------------------------------------------- |
| `createLocalStorage`   | A choice that lasts between visits and is shared across tabs. |
| `createSessionStorage` | A choice that lasts while the tab is open.                    |
| `createCookieStorage`  | A choice the server needs to read to render content.          |

When subscribing restores a different saved value, `onValueChange` receives the reason `"restore"`. Changes received from another storage instance or tab report `"storage-sync"`. Which tabs can share a value depends on the storage.

If you render on the server, [apply saved preferences before the page paints](#show-a-preference-before-hydration) so styles use the saved choice from the start.

### When Nothing Is Saved

If there's no saved value, the preference starts with `defaultValue`. A saved value outside the allowed `values` uses that default too. For the skin-tone example, that's `"default"`.

### When Saving Is Unavailable

A browser can block storage or run out of space. The preference still changes and updates its subscribers, but the new choice may be lost on reload.

`skinTone.set(...)` returns whether the preference changed. If your interface needs to tell someone whether saving is available, [check the storage](./core.md#when-storage-is-unavailable).

### Remember a Sidebar's State

Here's another example. Use `createPreference` to remember whether a sidebar is open or closed. Define `sidebarPreference` in its own file:

```ts title="sidebar-preference.ts"
import { createLocalStorage, createPreference } from "@ui-sdk/core"

const sidebarPreference = createPreference({
  values: ["open", "closed"],
  defaultValue: "open",
  attribute: "data-sidebar",
  storage: createLocalStorage("sidebar-state"),
})

export { sidebarPreference }
```

Then read it in your sidebar component:

**React**

```tsx title="sidebar.tsx"
import { usePreference } from "@ui-sdk/react/preferences"
import { sidebarPreference } from "./sidebar-preference"

function Sidebar() {
  const { value } = usePreference(sidebarPreference)

  return <aside hidden={value === "closed"}>Sidebar content</aside>
}

export { Sidebar }
```

**Vue**

```vue title="sidebar.vue"
<script setup lang="ts">
import { usePreference } from "@ui-sdk/vue/preferences"
import { sidebarPreference } from "./sidebar-preference"

const sidebar = usePreference(sidebarPreference)
</script>

<template>
  <aside :hidden="sidebar.value === 'closed'">Sidebar content</aside>
</template>
```

**Svelte**

```svelte title="sidebar.svelte"
<script lang="ts">
  import { usePreference } from "@ui-sdk/svelte/preferences"
  import { sidebarPreference } from "./sidebar-preference"

  const sidebar = usePreference(sidebarPreference)
</script>

<aside hidden={sidebar.current.value === "closed"}>Sidebar content</aside>
```

**Solid**

```tsx title="sidebar.tsx"
import { usePreference } from "@ui-sdk/solid/preferences"
import { sidebarPreference } from "./sidebar-preference"

function Sidebar() {
  const sidebar = usePreference(sidebarPreference)

  return <aside hidden={sidebar().value === "closed"}>Sidebar content</aside>
}

export { Sidebar }
```

**Web Components**

```ts title="sidebar.ts"
import { sidebarPreference } from "./sidebar-preference"

class AppSidebar extends HTMLElement {
  #stop?: () => void

  connectedCallback() {
    const update = () => {
      this.hidden = sidebarPreference.get().value === "closed"
    }

    this.#stop = sidebarPreference.subscribe(update)
    update()
  }

  disconnectedCallback() {
    this.#stop?.()
  }
}

customElements.define("app-sidebar", AppSidebar)
```

```html
<app-sidebar>
  <aside>Sidebar content</aside>
</app-sidebar>
```

Call `sidebarPreference.set("closed")` from your toggle to close the sidebar, or `sidebarPreference.set("open")` to open it. The component updates when the preference changes, and the choice is saved for the next visit.

## Apply Preferences

Pass your preferences to your framework's [`Preferences` component](./components/preferences.md) to apply their attributes and keep them current:

**React**

```tsx
import type * as React from "react"
import { Preferences } from "@ui-sdk/react/preferences"
import { skinTone } from "./preferences"

function App({ children }: { children: React.ReactNode }) {
  return <Preferences preferences={[skinTone]}>{children}</Preferences>
}

export { App }
```

**Vue**

```vue
<script setup lang="ts">
import { Preferences } from "@ui-sdk/vue/preferences"
import { skinTone } from "./preferences"
</script>

<template>
  <Preferences :preferences="[skinTone]">
    <RouterView />
  </Preferences>
</template>
```

**Svelte**

```svelte
<script lang="ts">
  import { Preferences } from "@ui-sdk/svelte/preferences"
  import { skinTone } from "$lib/preferences"

  let { children } = $props()
</script>

<Preferences preferences={[skinTone]}>
  {@render children()}
</Preferences>
```

**Solid**

```tsx
import { Preferences } from "@ui-sdk/solid/preferences"
import type { JSX } from "@solidjs/web"
import { skinTone } from "./preferences"

function App(props: { children: JSX.Element }) {
  return <Preferences preferences={[skinTone]}>{props.children}</Preferences>
}
```

**Web Components**

```html
<ui-preferences>
  <main>…</main>
</ui-preferences>

<script type="module">
  import "@ui-sdk/web/preferences"
  import { skinTone } from "./preferences.js"

  document.querySelector("ui-preferences").preferences = [skinTone]
</script>
```

See [Server Rendering](#server-rendering) to apply saved values before the page hydrates.

### On the Whole Page

Set `global: true` on a preference, then pass it to `Preferences`. Its attribute goes on `<html>` instead of the wrapper. For example, a density setting can apply to the whole page:

```ts
const density = createPreference({
  values: ["comfortable", "compact"],
  defaultValue: "comfortable",
  attribute: "data-density",
  global: true,
})
```

Without `global`, the attribute stays on its own `Preferences` element. Use separate preference instances when different parts of a page need their own choices.

### Read a Preference

Read the preference's current state in a component:

**React**

```tsx
import { usePreference } from "@ui-sdk/react/preferences"
import { skinTone } from "./preferences"

function CurrentTone() {
  const { value } = usePreference(skinTone)
  return <span>Selected tone: {value}</span>
}
```

**Vue**

```vue
<script setup lang="ts">
import { usePreference } from "@ui-sdk/vue/preferences"
import { skinTone } from "./preferences"

const tone = usePreference(skinTone)
</script>

<template>
  <span>Selected tone: {{ tone.value }}</span>
</template>
```

It returns a computed ref, so the template reads `tone.value` for the state's `value`.

**Svelte**

```svelte
<script lang="ts">
  import { usePreference } from "@ui-sdk/svelte/preferences"
  import { skinTone } from "$lib/preferences"

  const tone = usePreference(skinTone)
</script>

<span>Selected tone: {tone.current.value}</span>
```

**Solid**

```tsx
import { usePreference } from "@ui-sdk/solid/preferences"
import { skinTone } from "./preferences"

function CurrentTone() {
  const tone = usePreference(skinTone)
  return <span>Selected tone: {tone().value}</span>
}
```

**Web Components**

Use `get()` and `subscribe()` to read the value and keep your element current, as shown in [Follow Changes](#follow-changes).

## Use in a Primitive

Use `initialState` and `follow` when a primitive needs the preference in its own state. Start with `initialState` so server rendering and hydration agree:

```ts
state: () => ({ tone: skinTone.initialState }),
```

Then call `follow` from the root's `bind` to keep that state current. Return its cleanup function:

```ts
root: slot({
  attrs: (state) => ({ "data-skin-tone": state.tone.value }),
  bind: (_el, part) => skinTone.follow(part.store, "tone"),
}),
```

Call `skinTone.set(...)` from the primitive's API to change the choice.

## Choose a Color Scheme

`createColorScheme` uses `createPreference` internally. Its choice starts with these options:

```ts
const choice = createPreference({
  values: ["system", "light", "dark"],
  defaultValue: "system",
  attribute: "data-color-scheme",
})
```

That holds the choice. `createColorScheme` also reads the browser's preferred scheme and works out which scheme to use. For your app, use the helper:

```ts
import { createColorScheme, createLocalStorage } from "@ui-sdk/core"

const colorScheme = createColorScheme({
  storage: createLocalStorage("color-scheme"),
})

export { colorScheme }
```

It supports the same `set`, `subscribe`, `follow`, and cancelable `onValueChange` callback. Pass it to `Preferences` alongside your other preferences to apply its `data-color-scheme` attribute.

Call `colorScheme.set("dark")` to choose Dark. Call `colorScheme.set("system")` to follow the browser again. The default is `"system"`; an explicit Light or Dark choice stays the same when the browser's preference changes.

Choose Light or Dark. Choose Default (System), then change your system's color scheme to see it follow.

### Read the Color Scheme

`get()` returns three fields:

| Field      | What It Tells You                                                                      |
| ---------- | -------------------------------------------------------------------------------------- |
| `value`    | The app's choice: `"system"`, `"light"`, or `"dark"`.                                  |
| `system`   | The browser's preference: `"light"`, `"dark"`, or `"unknown"` when it isn't known yet. |
| `resolved` | The scheme to use: `value`, or `system` when the choice is `"system"`.                 |

For example, choosing Light while the browser prefers Dark gives `{ value: "light", system: "dark", resolved: "light" }`.

Use `value` for your CSS attribute, so CSS can handle `"system"` before JavaScript runs. [Style by Preferences](#style-by-preferences) shows how.

### Follow the Browser's Scheme

`onSystemValueChange` reports browser changes while something subscribes or follows:

```ts
const colorScheme = createColorScheme({
  onSystemValueChange: (value) => console.log(value),
})
```

Use `onValueChange` for the app's choice and `onSystemValueChange` for the browser's preference. Browser changes can't be canceled.

### Inside a Frame

Pass `view` to read an iframe's browser preference:

```ts
const colorScheme = createColorScheme({ view: frame.contentWindow! })
```

## Style by Preferences

When you pass a preference to `Preferences`, it adds the data attribute you chose with `attribute`. With `global: true`, the attribute goes on `<html>`. Otherwise, it goes on the `Preferences` element.

The density preference above uses `attribute: "data-density"` and `global: true`. When you call `density.set("compact")`, `Preferences` updates the attribute:

```html
<html data-density="compact">
  …
</html>
```

You can use that attribute in CSS or Tailwind to change how the page looks.

### CSS

Match the attribute's value in a selector. For example, reduce the space between rows in compact mode:

```css
.row {
  padding-block: 0.5rem;
}

[data-density="compact"] .row {
  padding-block: 0.25rem;
}
```

### Tailwind CSS

Define a variant that matches the attribute:

```css
@custom-variant compact (&:where([data-density="compact"], [data-density="compact"] *));
```

Then use it alongside your other utilities:

```html
<li class="py-2 compact:py-1">…</li>
```

### Color Scheme

Map `data-color-scheme` to the CSS `color-scheme` property. Use `light-dark()` to choose each color:

```css
:root,
[data-color-scheme="system"] {
  color-scheme: light dark;
}

[data-color-scheme="light"] {
  color-scheme: light;
}

[data-color-scheme="dark"] {
  color-scheme: dark;
}

:root,
[data-color-scheme] {
  --background: light-dark(oklch(1 0 0), oklch(0.145 0 0));
  --foreground: light-dark(oklch(0.145 0 0), oklch(0.985 0 0));
}
```

For `"system"`, the browser chooses the scheme. Form controls and scrollbars follow it too. Declare the color variables on each element with its own scheme, so a dark sidebar can use different colors from the page.

For a page with one global scheme, Tailwind's `dark:` variant can handle both Dark and System:

```css
@custom-variant dark {
  &:where([data-color-scheme="dark"], [data-color-scheme="dark"] *) {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    &:where([data-color-scheme="system"], [data-color-scheme="system"] *) {
      @slot;
    }
  }
}
```

### Show Matching Content

For a few versions of some content, render each one and let CSS show the matching value. The skin-tone demo uses this for its greeting:

```tsx
import { skinTone } from "./preferences"

const waves = {
  default: "👋",
  light: "👋🏻",
  "medium-light": "👋🏼",
  medium: "👋🏽",
  "medium-dark": "👋🏾",
  dark: "👋🏿",
}

function Wave() {
  return (
    <span className="wave" role="img" aria-label="Waving hand">
      {skinTone.values.map((tone) => (
        <span key={tone} data-tone={tone} aria-hidden="true">
          {waves[tone]}
        </span>
      ))}
    </span>
  )
}

export { Wave }
```

```css
.wave [data-tone] {
  display: none;
}

[data-skin-tone="default"] .wave [data-tone="default"],
[data-skin-tone="light"] .wave [data-tone="light"],
[data-skin-tone="medium-light"] .wave [data-tone="medium-light"],
[data-skin-tone="medium"] .wave [data-tone="medium"],
[data-skin-tone="medium-dark"] .wave [data-tone="medium-dark"],
[data-skin-tone="dark"] .wave [data-tone="dark"] {
  display: inline;
}
```

The container supplies the accessible name. CSS shows one hand and hides the others.

## Server Rendering

The server can read cookies, but localStorage and sessionStorage are only available in the browser. Choose how to render based on what the preference changes:

| What Depends on the Preference                | How to Render It                           |
| --------------------------------------------- | ------------------------------------------ |
| Colors, spacing, or fonts                     | Style the attribute in CSS.                |
| A few versions of some content                | Render each version and show one with CSS. |
| Formatted text or content throughout the page | Read a cookie on the server.               |
| Content that can update after hydration       | Read the state with `usePreference`.       |

### Show a Preference Before Hydration

For a preference saved in localStorage or sessionStorage, pass it to `Preferences`. It renders an inline script that applies the saved choice before the page paints:

1. The server renders using `defaultValue`.
2. The script reads the saved choice and sets the preference's data attribute. CSS can use it immediately.
3. After hydration, `usePreference` and `follow` pick up the saved value.

For example, if someone saved `"medium"`, CSS sees `data-skin-tone="medium"` on the first paint. A label rendered from `usePreference` still starts with `"default"` and updates after hydration.

When your framework checks those attributes during hydration, [account for the script's changes](./server-rendering.md#saved-preferences-and-storage). Pass `nonce` to `Preferences` if your Content Security Policy requires one for inline scripts.

For HTML you render yourself, `preferencesScript([skinTone])` generates the script. Place it inside the element that holds the preferences. For a single storage value, you can [render the storage's script](./core.md#show-a-value-before-hydration) instead.

### Read a Cookie on the Server

Use a cookie when the server needs the saved choice to render content, such as an install command for someone's preferred package manager. Inside your request handler, pass the `Cookie` header to the storage:

```ts
import { createCookieStorage, createPreference } from "@ui-sdk/core"

const packageManager = createPreference({
  values: ["npm", "pnpm", "yarn", "bun"],
  defaultValue: "npm",
  attribute: "data-package-manager",
  storage: createCookieStorage("package-manager", {
    cookie: request.headers.get("cookie"),
  }),
})
```

If the cookie contains `"pnpm"`, `packageManager.initialState.value` and `packageManager.get().value` both start at `"pnpm"`. A missing or invalid cookie uses `"npm"`.

In the browser, the storage reads `document.cookie`. [Create and share the preference for each request](./server-rendering.md#read-a-cookie-on-the-server) so visitors don't share state. Components can then use the saved choice from their first render.

### Browser Preferences on the Server

When content depends on the system's color scheme, a supporting browser can send it in the `Sec-CH-Prefers-Color-Scheme` request header. Ask for it with these response headers:

```http
Accept-CH: Sec-CH-Prefers-Color-Scheme
Critical-CH: Sec-CH-Prefers-Color-Scheme
Vary: Sec-CH-Prefers-Color-Scheme
```

`Critical-CH` asks a supporting browser to retry a request that was missing the hint. `Vary` tells caches that the response depends on it. See [color-scheme client hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-CH-Prefers-Color-Scheme) for browser support.

Read the header with `colorSchemeOf` and pass it as `initial`:

```ts
import { colorSchemeOf, createColorScheme } from "@ui-sdk/core"

const colorScheme = createColorScheme({
  initial: colorSchemeOf(request.headers.get("Sec-CH-Prefers-Color-Scheme")),
})
```

`colorSchemeOf` returns `"unknown"` when the header is missing. Keep CSS handling for `"system"` so styles still follow the browser. Share the same `initial` value with the browser when hydrating.

Create preferences from a request's cookies or hints per request. This keeps one visitor's choices separate from another's.

## API Reference

### Preference Options

- `values` (`readonly Value[]`): Every value people can choose. A saved value that isn't one of them is ignored. Example: [Create a Preference](#create-a-preference).
- `defaultValue` (`NoInfer<Value>`): The value before anything is saved, and after a saved value is removed. Example: [Create a Preference](#create-a-preference).
- `attribute` (``data-${string}``): The attribute that shows the value, which has to start with `data-`, like `"data-skin-tone"`. Example: [Create a Preference](#create-a-preference).
- `global?` (`boolean`): Whether the attribute goes on `<html>`, for a preference the whole page styles by. Otherwise it goes on the `Preferences` element, for the part of the page inside it. Example: [On the Whole Page](#on-the-whole-page).
- `storage?` (`object`): Where the value is kept between visits, from `createLocalStorage`, `createSessionStorage` or `createCookieStorage`. Example: [Remember the Choice](#remember-the-choice).
- `onValueChange?` (`((value: Value, details: ChangeDetails<ChangeReason>) => void)`): Called before the value changes, with its reason. `details.cancel()` keeps the current one. Example: [Respond to Changes](#respond-to-changes).

### Preference State and Methods

Both `createPreference` and `createColorScheme` return these fields. A color scheme's state also includes [the browser's scheme and the resolved value](#read-the-color-scheme).

- `initialState` (`{ value: string; }`): What the server and the first client render show: `defaultValue`, or the value a cookie keeps. Example: [Use in a Primitive](#use-in-a-primitive).
- `get` (`() => { value: string; }`): The current state, the same object until the value changes. In the browser it's the saved value even before anything subscribes, for a render in the browser only. Hydrate from `initialState`. Example: [Read and Change the Value](#read-and-change-the-value).
- `set` (`(next: string, change?: { reason?: ChangeReason; event?: Event; }) => boolean`): Changes the value, through `onValueChange`, which can cancel it, and saves it. The reason defaults to `"imperative"`. Returns whether it changed. Example: [Read and Change the Value](#read-and-change-the-value).
- `subscribe` (`(listener: (state: { value: string; }) => void) => () => void`): Hears every change. The first subscriber reads back the saved value. Returns the function that stops it. Example: [Follow Changes](#follow-changes).
- `follow` (`<Key extends string>(store: PreferenceStore<Key, { value: string; }>, key: Key) => () => void`): Keeps `key` in a store set to the preference's state. Call it from a part's `bind`: the state starts at `initialState`, catches up a microtask later, once hydration is done, and follows every change after that. Returns the cleanup for `bind`. Example: [Use in a Primitive](#use-in-a-primitive).

### Preferences Component

- `nonce?` (`string`): The nonce your Content Security Policy gives inline scripts. Example: [Server Rendering](#server-rendering).
- `preferences` (`readonly PreferenceLike[]`): The preferences to show, from `createPreference` or `createColorScheme`. Example: [Apply Preferences](#apply-preferences).

### Color Scheme Options

`storage`, `global`, and `onValueChange` work the same way as in [`createPreference`](#preference-options). These options control the color scheme:

- `defaultValue?` (`ColorSchemeValue`): The scheme the app starts with, like a choice saved in a cookie that the server read. Example: [Choose a Color Scheme](#choose-a-color-scheme).
- `initial?` (`SystemColorScheme`): The browser's preference the server and the first client render assume, so hydration matches. Read the request's `Sec-CH-Prefers-Color-Scheme` hint with `colorSchemeOf`. Example: [Browser Preferences on the Server](#browser-preferences-on-the-server).
- `onSystemValueChange?` (`((value: "light" | "dark") => void)`): Called when the browser's preference changes, while something subscribes or follows. Example: [Follow the Browser's Scheme](#follow-the-browsers-scheme).
- `view?` (`Window`): The window to read, like an iframe's. Defaults to the page's window. Example: [Inside a Frame](#inside-a-frame).


# Canvas

Pan and zoom a canvas and connect its nodes.

`createViewport` pans and zooms a canvas, and `createConnect` connects its ports.

Import them from `@ui-sdk/core`. For moving nodes, choosing them, navigating with the keyboard, and finding them, use [Dragging and Resizing](./core.md#dragging-and-resizing), [Selection](./core.md#selection), [Focus and Keys](./core.md#focus-and-keys), and [Find in Page](#find-in-page).

## Panning and Zooming

The viewport is `{ x, y, zoom }`. `x` and `y` place the canvas origin inside its frame, in screen pixels. `zoom: 1` means its normal size.

### Pan and Zoom

Start with a viewport in state and mark it as [live](./core.md#live-state):

```ts
state: () => ({ viewport: { x: 0, y: 0, zoom: 1 } }),
live: ["viewport"],
```

In `api`, create the behavior and return it with the rest of your API:

```ts
const viewport = createViewport(context, {
  key: "viewport",
  surface: () => context.element("root"),
})
```

The `root` is the frame; `world` holds everything inside it. Connect the frame's events and the world's live style:

```ts
root: slot({
  attrs: () => ({
    tabindex: "0",
    style: css({ position: "relative", overflow: "clip", "touch-action": "none" }),
  }),
  on: {
    wheel: (event, { api }) => api.viewport.wheel(event),
    pointerdown: (event, { el, api }) => {
      if (event.target === el) api.viewport.pointerdown(event)
    },
    keydown: (event, { api }) => api.viewport.keydown(event),
  },
}),
world: slot({
  attrs: () => ({ style: css({ position: "absolute", left: "0", top: "0" }) }),
  live: live((state, { api }) => ({ style: api.viewport.style(state) })),
}),
```

Give the frame a visible size and an accessible name in your component. One transform moves the world; the live style keeps a pan from rendering every node again.

Drag the empty board or scroll to pan. Pinch, or hold Control or Command while scrolling, to zoom. Focus the board and try +, −, and 0; Reset View restores its starting position.

`0` resets the scale to 100%. To reset the position too, call `viewport.setViewport({ x: 0, y: 0, zoom: 1 })`.

### Fit, Reveal and Zoom from Code

Use `fit` to show a rectangle in full. Its coordinates are in canvas units:

```ts
viewport.fit(
  { left: 0, top: 0, right: 800, bottom: 600 },
  { padding: 16, maxZoom: 1 }
)
viewport.zoomBy(1.25)
viewport.panBy(80, 0)
```

`zoomBy` and `zoomTo` use the center of the frame unless you pass a point. `panBy` takes screen pixels. Set `minZoom` and `maxZoom` in the behavior's options to limit the scale; the defaults are 0.1 and 4.

When a node receives focus, `reveal` brings it into view. `rectOf` reads an element's rectangle in canvas units:

```ts
sight: slot({
  on: {
    focus: (_event, { el, api }) => {
      if (el) api.viewport.reveal(api.viewport.rectOf(el), { padding: 16 })
    },
  },
}),
```

Use `overflow: clip` on the frame so native focus scrolling doesn't compete with the viewport, or let the viewport take those scrolls with [`bindFindable`](#find-in-page). The `message` option customizes what a zoom key announces:

```ts
message: (zoom) => `Map at ${Math.round(zoom * 100)} percent`,
```

Press Fit to see every sight. Try the zoom and pan buttons, then Tab through the sights: the map brings each focused sight into view.

### Find in Page

Find in page (⌘F, or Ctrl+F) finds text anywhere on the canvas, but it reveals a match by scrolling, and the viewport pans instead. Put the world in a pane that fills the frame, and bind the pane with `bindFindable`:

```ts
pane: slot({
  attrs: () => ({
    style: css({
      position: "absolute",
      inset: "0",
      overflow: "scroll",
      "scrollbar-width": "none",
      "touch-action": "none",
      "pointer-events": "none",
    }),
  }),
  bind: (el, { api }) => api.viewport.bindFindable(el),
}),
world: slot({
  attrs: () => ({ style: css({ position: "absolute", left: "0", top: "0", "pointer-events": "auto" }) }),
  live: live((state, { api }) => ({ style: api.viewport.style(state) })),
}),
```

The pane must be one a user could scroll, with `overflow: scroll`, because find in page doesn't scroll `overflow: hidden`; `scrollbar-width: none` hides its scrollbars. Keep the frame's `overflow: clip`, and keep controls like a reset button in the frame, outside the pane. The pane passes presses and the wheel on empty space through to the frame, so its handlers work as before.

Every scroll the browser makes in the pane becomes a pan with the reason `find-in-page`, so the match comes into view the way the browser would show it, with its own highlight and count. The same goes for anything else that scrolls to an element, like `scrollIntoView` or a link to its id; Tab to a node out of view pans with `focus-in`.

The pane rests scrolled far from its origin, with an empty element to make room, so the browser can scroll toward a node whichever side of the view it's on. The world's `style` moves to match while it's bound; anything else in the pane would scroll away, which is why it holds only the world. A smooth `scrollIntoView` pans by its first step only; to animate a pan, call `reveal`.

Press ⌘F or Ctrl+F and search for lighthouse. Each one is off the map in a different direction; press Enter to go from one to the next, and the map pans to each.

### Screen and Canvas Points

A pointer event gives you screen coordinates. Convert them before placing something on the canvas:

```ts
const point = viewport.toCanvas(event.clientX, event.clientY)
```

`toScreen(point)` converts back to client coordinates, useful for a label outside the scaled world. `visible()` gives the rectangle currently in view, and `get()` returns the viewport.

By default, the behavior writes its state key directly. To let a component control the viewport, use the [change pattern](./core.md#state-a-user-controls) with `set`:

```ts
set: (value, details) => change("viewport", value, details),
```

Changes report a reason: `wheel`, `drag`, `pinch`, `zoom-key`, `focus-in`, `find-in-page`, or `imperative`.

Double-click to add a dot. Pan or zoom, then add another: it lands where you click. The newest dot's label keeps its size while the canvas scales.

## Connections

`createConnect` follows a line from one port to another. You decide which pairs can connect and what to save when they do.

### Draw a Connection

Add a `connecting` field to state, initially `null as ConnectDraft | null`, and list it in `live`. Then create the behavior in `api`:

```ts
const connect = createConnect(context, {
  slot: "port",
  draft: "connecting",
  canConnect: (from, to) => from.endsWith(":out") && to.endsWith(":in"),
  point: (x, y) => viewport.toCanvas(x, y),
  connect: (from, to, details) =>
    change("edges", [...context.store.get().edges, { from, to }], details),
})
```

Here, port keys end in `:out` or `:in`. `canConnect` accepts only output-to-input pairs. Add your own checks there, such as refusing two ports on the same node. `point` puts the loose end of the line in canvas coordinates.

Give each port a `value`, such as `"prompt:out"` or `"answer:in"`, and connect its pointer handler. `role` gives you `source`, `target`, or `candidate` for styling:

```ts
port: slot<{ value: string }>({
  props: { value: "string" },
  live: live((state, { api, key }) => ({ "data-connect": api.connect.role(state, key) })),
  on: {
    pointerdown: (event, { el, api, key }) => {
      if (el) api.connect.pointerdown(event, key, el)
    },
  },
}),
```

While drawing, `connecting` holds `{ from, to, x, y, keyboard }`. Render that draft alongside the saved edges, using `x` and `y` for its loose end when `to` is `null`.

For keyboard access, call `connect.start(portKey)` from an action on the node, then pass its key events to `connect.keydown(event)`. Arrows choose a valid port in that direction; Enter or Space connects; Escape or Tab cancels.

Drag from Prompt's output to an input on Answer or Summary. Or focus Prompt, press C, choose an input with the arrow keys, and press Enter. Escape cancels.

The behavior announces each step. Give it a `label` function for readable port names. If the ports are hidden from assistive technology, keep the node's keyboard action accessible and describe its connections in text, such as `aria-description="Connected to Answer."`.

### Snapping, Words and Code

`radius` controls how close the pointer must get before a port becomes the target. It uses screen pixels, so it stays consistent at different zoom levels. The default is 28.

Override `message` when the default announcements don't fit. `connectMessage` supplies the defaults for the other steps:

```ts
radius: () => 48,
message: (message, label) =>
  message.type === "connect"
    ? `${label(message.from)} into ${label(message.to)}.`
    : connectMessage(message, label),
```

You can also connect from code:

```ts
if (connect.start("synth")) {
  connect.target("ch3")
  connect.commit({ reason: "connect-key" })
}
```

`active()` tells you whether a connection is underway; `cancel()` clears its draft. The `connect` callback decides what to save. In this patch bay, connecting an existing pair removes its cable.

Drag a source jack toward a channel, then connect the same pair again to unplug it. Try Synth into 3, or focus a source and press Enter to start; use arrows to choose, Enter to connect, and Escape to cancel.

## Accessibility

Give every pointer action a keyboard path and explain it beside the canvas. Bring focused nodes into view, and describe connections in words as well as lines.

For a full editor, combine these helpers with [moving in two dimensions](./core.md#moving-in-two-dimensions), [selection](./core.md#selection) and [spatial focus](./core.md#spatial-focus). [Testing](./core.md#testing) covers keyboard and accessibility checks for the result.

## API Reference

- `key` (`keyof State & string`): The state key that holds the `Viewport`. List it in `live`, so panning renders nothing. Example: [Pan and Zoom](#pan-and-zoom).
- `surface` (`() => HTMLElement | null`): The element that clips the canvas and takes the gestures. Example: [Pan and Zoom](#pan-and-zoom).
- `set?` (`((value: Viewport, details: { reason: ViewportReason; event?: Event; }) => boolean)`): Asks for a new viewport. Defaults to setting the state key; pass the primitive's change to make it controllable. Example: [Screen and Canvas Points](#screen-and-canvas-points).
- `minZoom?` (`(() => number)`) Example: [Fit, Reveal and Zoom from Code](#fit-reveal-and-zoom-from-code).
- `maxZoom?` (`(() => number)`) Example: [Fit, Reveal and Zoom from Code](#fit-reveal-and-zoom-from-code).
- `message?` (`((zoom: number) => string)`): What screen readers hear after a zoom key. Defaults to English, like "Zoom 150%". Example: [Fit, Reveal and Zoom from Code](#fit-reveal-and-zoom-from-code).

- `slot` (`string`): The slot whose parts are ports. Example: [Draw a Connection](#draw-a-connection).
- `draft` (`keyof State & string`): The state key that holds the `ConnectDraft` while one is drawn. Start it at `null`, and list it in `live`. Example: [Draw a Connection](#draw-a-connection).
- `connect` (`(from: string, to: string, details: { reason: ConnectReason; event?: Event; }) => boolean`): Makes the connection and returns whether it went through. Example: [Draw a Connection](#draw-a-connection).
- `canConnect?` (`((from: string, to: string) => boolean)`): Whether `from` can connect to `to`. Defaults to any other port. Example: [Draw a Connection](#draw-a-connection).
- `point?` (`((clientX: number, clientY: number) => { x: number; y: number; })`): Turns a point on screen into your units, like a canvas viewport's `toCanvas`. Defaults to client pixels. Example: [Draw a Connection](#draw-a-connection).
- `radius?` (`(() => number)`): How near, in screen pixels, a pointer must come to a port to snap to it. Example: [Snapping, Words and Code](#snapping-words-and-code).
- `label?` (`((key: string) => string)`): A port's name for screen readers. Defaults to its key. Example: [Draw a Connection](#draw-a-connection).
- `message?` (`((message: ConnectMessage, label: (key: string) => string) => string)`): What screen readers hear. Defaults to English. Example: [Snapping, Words and Code](#snapping-words-and-code).


# Observe

Subscribe to component changes across a page or within one part of it.

`observe` reports changes from ui-sdk components in one stream. Use it to keep an activity log, update a preview, or see which actions came from a person or an agent.

It works with every framework. Import it from `@ui-sdk/core/observe`; the framework packages also re-export it.

## Listen for Changes

Start observing in your browser entry point, before rendering the app. This lets the observer register each component as it's created:

```ts
import { observe } from "@ui-sdk/core/observe"

const stop = observe((change) => {
  console.log(change.label, change.key, change.previous, change.value)
})
```

For example, choosing a different visibility setting might report `Visibility`, `value`, `private`, and `internal`.

Call the returned function when you no longer need the subscription:

```ts
stop()
```

Register outside component render functions. An effect can run after child components have already been created, so use the app's browser setup when you need to observe the whole page.

## Read a Change

Each notification is an `ObservedChange`:

| Field               | What It Tells You                                                           |
| ------------------- | --------------------------------------------------------------------------- |
| `component`, `id`   | The component's kind and instance ID.                                       |
| `label`, `row`      | Its accessible name and nearby row text, when available.                    |
| `key`               | The state key that changed, such as `value` or `checked`.                   |
| `value`, `previous` | The new value and the value before it.                                      |
| `reason`            | Why it changed, such as `item-press` or `drag`.                             |
| `source`            | `keyboard`, `mouse`, `touch`, `pen`, `virtual`, `programmatic`, or `agent`. |
| `ref`               | A reference you can pass to `elementOf` or use with the agent bridge.       |

Changes canceled with `details.cancel()` aren't reported. A controlled component reports the requested change before its owner passes the value back; the notification doesn't mean the owner has accepted it.

Password, card, and one-time-code fields report `"[redacted]"` for both `value` and `previous`.

## Watch Part of a Page

Use `within` to limit the stream to a panel or another element:

```ts
import { observe } from "@ui-sdk/core/observe"

const stop = observe((change) => console.log(change), {
  within: () => document.querySelector("#settings"),
})
```

The function can return an element that mounts later. You can also pass an element directly. A component is included when any of its parts is inside it, so a popup can belong to the panel through its trigger.

## Wait for an Interaction to Finish

Some components change a value repeatedly before committing it. By default, a slider drag produces one notification when it finishes, with `previous` taken from before the drag.

Use `live: true` for every intermediate change instead:

```ts
import { observe } from "@ui-sdk/core/observe"

const stop = observe((change) => console.log(change.value), { live: true })
```

The live stream leaves out commit notifications. State that doesn't commit, such as a text field's input, reports each change in either mode. Changes made by code or an agent are reported immediately.

## Keep the Source After an Await

An agent's press reports `"agent"`, and so do the changes it causes while the press runs. Work that finishes later, like a save that awaits a request, runs after the press is over, so its changes report `"programmatic"`.

Every action that can return a Promise, like a Button's click handler, a Close part's `action` or a toast's buttons, receives the press's `source` after the event. Pass it to `withSource` around the changes made after the `await`:

```ts
import type { ButtonActionDetails } from "@ui-sdk/core/button"
import { withSource } from "@ui-sdk/core/observe"

async function onSave(event: MouseEvent, { source }: ButtonActionDetails) {
  await save()
  withSource(source, () => status.setValue("Saved"))
}
```

Here `status` is an Input's controller. When an agent presses Save, the new status reports `"agent"`, as it would have during the press. A change someone makes while the save runs keeps its own source, since only the function passed to `withSource` takes the press's source. Each framework's Button page shows the handler in place.

## Find the Element

`elementOf` finds the root element, or the first available part, for a component's ref. For example, scroll an agent's changed control into view:

```ts
import { elementOf, observe } from "@ui-sdk/core/observe"

const stop = observe((change) => {
  if (change.source === "agent") {
    elementOf(change.ref)?.scrollIntoView({ block: "nearest" })
  }
})
```

To keep an agent informed between turns, see [Observe Changes](./agents.md#observe-changes). To record changes you can undo, see [History and Undo](./agents.md#history-and-undo).


# Testing

Test a primitive's interactions, accessibility attributes, server output, and reading direction.

`@ui-sdk/core/testing` provides helpers to simulate input, check focus and accessibility attributes, and inspect a primitive's state and server output.

Use them to test a primitive directly or check a rendered component. Interaction tests need a DOM, such as jsdom or a browser. Server output and part reads work without one.

## Check a Pattern

If you've rendered a widget that follows a common accessibility pattern, `checkPattern` checks its roles, names, states, references between parts, and keyboard interactions:

```ts
import { checkPattern } from "@ui-sdk/core/testing"

await checkPattern(root, "tabs")
```

`root` is the widget's element, or an element around it. The check throws one error listing the problems it found. Here, removing the tab list's name gives it something to report:

Press Check the Tabs Pattern. Then select Leave the tab list unnamed and run the check again to see the missing-name error.

The supported patterns are `listbox`, `menu`, `menubar`, `tabs`, `radio-group`, `toolbar`, `tree`, `dialog`, `alertdialog`, `disclosure`, `accordion`, `combobox`, `slider`, `switch`, and `checkbox`.

The check uses the widget's keys and restores focus and state where it can. Open a menu or dialog before checking it. A menu check activates an item, so use test actions that are safe to run.

It requires Home and End for listboxes, tabs, and toolbars, a name for every tab list, and `aria-modal="true"` for modal dialogs. Those are deliberately stricter than the optional behavior in parts of the WAI-ARIA Authoring Practices.

## Mount a Primitive

Use `mount` when you want to test the primitive itself. Pass its definition, options, and a little markup. Tags that match slots become parts; their attributes supply the part props.

This test uses the [confirm button](./core.md#changes). The first press arms it. The next confirms and disarms it:

```ts
import { expect, test } from "vitest"
import { mount } from "@ui-sdk/core/testing"
import { confirmButton } from "./confirm-button"

test("confirm with a click and Enter", async () => {
  const button = mount(confirmButton, {}, `<root>Delete</root>`)
  try {
    await button.click(button.root)
    expect(button.state.armed).toBe(true)
    expect(button.changes.at(-1)).toMatchObject({
      key: "armed",
      reason: "press",
      source: "mouse",
    })

    await button.keys("Enter")
    expect(button.state.armed).toBe(false)
  } finally {
    button.unmount()
  }
})
```

Press Run the Test to click the confirm button, press Enter, and inspect the resulting state, change reasons, and input sources.

`root` is the first element in the markup. Use `part(slot, key)` to find another part, such as `view.part("item", "pear")`. `state` reads the current state, `api` exposes the primitive's methods, and `changes` records each accepted change.

Always call `unmount` when you're done. It removes the markup, unbinds the parts, and destroys the instance.

## Typing, Hovering and Announcements

Focus an input before calling `type`. Use `keys` for special keys and combinations, including `Tab`, `Shift+Tab`, and `Space`:

```ts
const search = mount(
  searchField,
  {},
  `<root><input aria-label="Search"></input></root>`
)
try {
  search.part("input")!.focus()
  await search.type("pear")
  expect(search.state.query).toBe("pear")

  await search.keys("Escape")
  expect(search.state.query).toBe("")
} finally {
  search.unmount()
}
```

For pointer interactions, `hover(element)` moves the pointer onto a part. `drag(element, { to: target })` drags to another element; `drag(element, { by: { x, y } })` moves by a distance.

Press Run the Tests to type and clear a search, hover a seat, and check the announcement from an empty sign-up form.

`announced` captures the text the primitive sends to its screen reader announcer. Wait for scheduled work with `settle` before checking a delayed announcement:

```ts
await form.click(form.root.querySelector("button")!)
await form.settle()
expect(form.announced).toContain("Enter an email address")
```

`settle` waits for microtasks, a timer turn, and two animation frames. If you need the grouped changes reported by the devtools, read `settled`; `changes` keeps every intermediate change.

## The Server's HTML

`checkServer` renders the supplied parts without a DOM and returns the HTML. It checks that creating the primitive reads no browser globals, clock, or randomness, and that the parts' attributes, public state, and presence read none of those nor options:

```ts
import { checkServer } from "@ui-sdk/core/testing"

const html = checkServer(
  readMore,
  {},
  `<root><trigger>Read more</trigger><panel>More</panel></root>`
)
```

This uses the [read-more primitive](./core.md#parts-that-come-and-go). The check throws if it finds a dependency that could make a part render differently on the server and client:

Press Check the Server HTML to read the rendered parts. Then select Read the clock in attrs and run it again to see the dependency reported.

The markup follows the same rules as `mount`. Ordinary HTML tags stay as they are. Use `as="form"`, for example, when a slot needs to render a specific tag.

## Both Directions

For widgets with horizontal arrow navigation, `checkDirection` compares left-to-right and right-to-left behavior. It mounts a fresh instance for each check, Tabs into it, and compares focus and state after the arrows:

```ts
import { checkDirection } from "@ui-sdk/core/testing"

await checkDirection(pager, {}, `<root>Page</root>`)
```

Left in right-to-left text should match Right in left-to-right text, and vice versa. The check also fails when Right does nothing in left-to-right text, because it has no movement to compare.

Press Check Both Directions. Then select Ignore the direction to try a pager whose horizontal arrows never swap.

The [pager example](./core.md#direction) shows how it reads direction from the page.

## Reading Parts

For a focused rendering assertion, create an instance and inspect a part directly. These helpers need no DOM:

```ts
import { partAttrs, partPresent, partState } from "@ui-sdk/core/testing"

const instance = readMore({ id: "more" })
try {
  instance.api.toggle()
  const trigger = instance.part("trigger", {})
  expect(partAttrs(trigger)).toMatchObject({ "aria-expanded": "true" })
  expect(partState(trigger)).toEqual({ open: true })
  expect(partPresent(instance.part("panel", {}))).toBe(true)
} finally {
  instance.destroy()
}
```

`partAttrs` reads HTML attributes, `partState` reads the public state passed to render functions, and `partPresent` tells you whether the part should render.

Select Open it and compare the trigger's attributes and public state with the panel's presence.

## Picking the Platform

Shortcut labels use Command on Apple platforms and Control elsewhere. Set the platform explicitly when testing them, so the machine running the test doesn't change the result:

```ts
import { formatShortcut } from "@ui-sdk/core"
import { setPlatform } from "@ui-sdk/core/testing"

setPlatform("apple")
expect(formatShortcut("mod+b")).toContain("⌘B")

setPlatform("other")
expect(formatShortcut("mod+b")).toContain("Ctrl+B")
```

The override stays in effect for later tests. Set it in your test setup to give each test the platform it expects.

## Testing in a Framework

Render through the framework's testing tools when you need to check your component's markup, props, or integration with surrounding UI. The same approach applies: interact, then read the result. You can also pass its rendered element to `checkPattern`.

Unlike `mount`, framework renderers don't fill gaps in a DOM test environment. For tests that only need a popup to render, a jsdom setup can provide these small stubs:

```ts
HTMLElement.prototype.showPopover ??= function () {}
HTMLElement.prototype.hidePopover ??= function () {}
Element.prototype.getAnimations ??= () => []
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: "[popover] { display: block !important }",
  })
)
```

These stubs don't exercise native popup or animation behavior. Use a browser for those checks, and for checking the finished component with a keyboard and screen reader.

Some things land a moment after a render or an event. An icon-only button gets its name from its tooltip a tick after it renders, and focus moves into a menu that opened on a press in the next frame. Wait for them with `settle`, inside `act` in React, or query with `findByRole`:

```ts
import { checkPattern, settle } from "@ui-sdk/core/testing"

await user.click(screen.getByRole("button", { name: "Options" }))
await act(settle)
await checkPattern(screen.getByRole("menu"), "menu")
```


# Get Started

Paste one prompt into your agent and you're set up. Then pick where to go next.

UI SDK is a library of behaviors, like popups, lists and typeahead, that your agent puts together into components. It works with React, Vue, Svelte, Solid and Web Components.

New here? The [Introduction](./core.md) shows how it all works.

## Quick Start

Pick your framework, then copy this prompt into your agent.

**React**

```text prompt
Set up ui-sdk in this React project. It needs React 19 or newer.

1. Install @ui-sdk/react and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/react/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/react/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

**Vue**

```text prompt
Set up ui-sdk in this Vue project. It needs Vue 3.5 or newer.

1. Install @ui-sdk/vue and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. If it's a Nuxt 4 or newer app, add "@ui-sdk/vue" to modules in nuxt.config.ts.
3. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/vue/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/vue/docs/core.md by heading, and read rendering.md next to it.
4. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

**Svelte**

```text prompt
Set up ui-sdk in this Svelte project. It needs Svelte 5.33 or newer.

1. Install @ui-sdk/svelte and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/svelte/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/svelte/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

**Solid**

```text prompt
Set up ui-sdk in this Solid project. It needs Solid 2: solid-js and @solidjs/web 2.0.0 or newer.

1. Install @ui-sdk/solid and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/solid/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/solid/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

**Web Components**

```text prompt
Set up ui-sdk in this Web Components project. Each component registers its tags when you import its entry, like @ui-sdk/web/dialog.

1. Install @ui-sdk/web and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/web/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/web/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

Then ask your agent to build a component:

```text prompt
Build a search field with ui-sdk: a text input and a Clear button that only shows when there's text. Clear empties the input and puts focus back in it. Use our existing styles.
```

## Find a Component

- [Select](./components/select.md): Choose one value or several from a popup list.
- [Field](./components/field.md): Connect a form control to its label, description, and validation errors.
- [Tabs](./components/tabs.md): Switch between related panels with one tab selected at a time.
- [Combobox](./components/combobox.md): Search a list of options and choose one or several values.
- [Date Picker](./components/date-picker.md): Type a date or choose one from a calendar, with support for ranges and forms.
- [Menu](./components/menu.md): Choose actions and settings from a button or a context menu.

Or [see all components](./README.md).

## Build Your Own

- [Core](./core.md): The behaviors, and how they fit together.
- [Build a Component](./core.md#build-a-component): Build a toggle button, then render it in your framework.
- [Behaviors](./core.md#all-behaviors): Focus, selection, popups and the other pieces your components are made of.
- [Compose Behaviors](./core.md#compose-behaviors): Build a star rating with shared state and keyboard navigation.

## Work with Agents

- [Build with an Agent](./agents.md#build-with-an-agent): Give an agent the right context, build a small version, and check how it behaves.
- [Skills](./agents.md#skills): Help your agent build custom components with @ui-sdk/core.
- [Connect an Agent](./agents.md#get-started): Let an agent read your components and call their actions.
- [WebMCP](./agents.md#webmcp): Let the agent built into a browser read and use your components.

See what's new in the [changelog](./core.md#changelog).
