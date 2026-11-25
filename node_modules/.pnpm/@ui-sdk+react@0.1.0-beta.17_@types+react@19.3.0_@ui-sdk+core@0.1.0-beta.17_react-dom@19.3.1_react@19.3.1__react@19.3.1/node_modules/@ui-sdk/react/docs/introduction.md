# Introduction

Use unstyled React components with keyboard, focus, and screen reader support built in.

These docs cover ui-sdk in React. Using another framework? See Vue, Svelte, Solid or Web Components. To build your own components from behaviors, see [Core](./core.md).

`@ui-sdk/react` gives you components such as Select, Dialog, and Tabs, built on ui-sdk's behaviors. They handle interactions, focus, and ARIA attributes. You choose their markup and styles.

Import the parts you need, put them together in your app, and style them with your own CSS.

## Quick Start

Copy this prompt into your agent:

```text prompt
Set up ui-sdk in this React project. It needs React 19 or newer.

1. Install @ui-sdk/react and @ui-sdk/core with the project's package manager. If a release-age policy blocks the install, stop and ask me instead of changing it.
2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/react/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/react/docs/core.md by heading, and read rendering.md next to it.
3. If you support skills, run: npx skills@latest add vercel-labs/ui --skill ui-sdk
```

It installs ui-sdk and points your `AGENTS.md` at the docs that ship with the packages.

## Set It Up Yourself

- [Installation](./installation.md): Install the packages in your React app.
- [First Component](./first-component.md): Add and style your first component.

## Explore the Components

The [Using Components guides](./parts-and-composition.md) cover patterns the components share, such as composing parts, handling state, and styling.
