# Preferences

Apply user preferences to data attributes so your styles can follow them.

`Preferences` puts your preferences on `data-*` attributes and keeps them up to date. Use it around a part of your app, or apply a preference to the whole page.

```tsx title="basic.tsx"
"use client"

import { createLocalStorage, createPreference } from "@ui-sdk/core"
import { Button } from "@ui-sdk/react/button"
import { Preferences, usePreference } from "@ui-sdk/react/preferences"
import { useLog } from "./log"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("ui-sdk-preferences-view"),
})

const files = [
  { name: "Q3 roadmap.pdf", detail: "2.4 MB" },
  { name: "Launch checklist.md", detail: "12 KB" },
  { name: "Offsite photos", detail: "24 items" },
  { name: "Brand assets.zip", detail: "18 MB" },
]

function Example() {
  const log = useLog()
  const { value } = usePreference(view)

  const choose = (next: "list" | "grid", event: React.MouseEvent) => {
    view.set(next, { reason: "press", event: event.nativeEvent })
    log(`Saved the ${next} view`)
  }

  return (
    <Preferences preferences={[view]}>
      <div data-slot="stack">
        <div data-slot="controls" role="group" aria-label="View">
          <Button
            aria-pressed={value === "list"}
            onClick={(event) => choose("list", event)}
          >
            List
          </Button>
          <Button
            aria-pressed={value === "grid"}
            onClick={(event) => choose("grid", event)}
          >
            Grid
          </Button>
        </div>
        <ul data-slot="files" aria-label="Files">
          {files.map((file) => (
            <li key={file.name}>
              <span>{file.name}</span>
              <span data-slot="hint">{file.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </Preferences>
  )
}

export { Example }
```

Choose Grid, then reload the page. The files come back in the view you chose, and the console logs each change.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Usage

Define the preference you want to apply. Here, `view` chooses how a file list is laid out:

```ts title="preferences.ts"
import { createPreference } from "@ui-sdk/core"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
})

export { view }
```

Pass it to `Preferences`, then style the content by its attribute:

```tsx title="file-list.tsx"
import { Preferences } from "@ui-sdk/react/preferences"
import { view } from "./preferences"

function FileList() {
  return (
    <Preferences preferences={[view]}>
      <ul data-slot="files">
        <li>Q3 roadmap.pdf</li>
        <li>Launch checklist.md</li>
      </ul>
    </Preferences>
  )
}

export { FileList }
```

```css
[data-view="grid"] [data-slot="files"] {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

`Preferences` starts with `data-view="list"`. Calling `view.set("grid")` updates it, and the list becomes a grid. `Preferences` renders with `display: contents`, so it adds no box of its own.

## Save the Value

Add `storage` to save the choice between visits:

```ts title="preferences.ts"
import { createLocalStorage, createPreference } from "@ui-sdk/core"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("ui-sdk-preferences-view"),
})

export { view }
```

The preference now saves changes in local storage and restores the saved value when the page reloads. You can also [use session storage or cookies with `createPreference`](../core.md#remember-the-choice).

## Read the Value

Use `usePreference` when the value affects what your component renders:

```tsx title="view-switch.tsx"
import { usePreference } from "@ui-sdk/react/preferences"
import { view } from "./preferences"

function ViewSwitch() {
  const { value } = usePreference(view)

  return (
    <button
      aria-pressed={value === "grid"}
      onClick={() => view.set(value === "grid" ? "list" : "grid")}
    >
      Grid
    </button>
  )
}

export { ViewSwitch }
```

Pass the same preference instance wherever you need its value. `usePreference` also works outside a `Preferences` component.

## Apply to the Whole Page

Set `global: true` when defining the preference:

```ts
const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  global: true,
  storage: createLocalStorage("ui-sdk-preferences-view"),
})
```

Keep passing it to `Preferences`. Its attribute now goes on `<html>`, so styles throughout the page can use it. A global preference needs only one mounted `Preferences` component to apply it.

## Multiple Preferences

Pass more than one preference in the list. For example, you can apply `view` alongside a [color scheme](../core.md#choose-a-color-scheme):

```tsx
<Preferences preferences={[view, colorScheme]}>
  <App />
</Preferences>
```

Each preference uses its own attribute and `global` option. Wrappers that share a preference instance follow the same value. For independent choices, use separate preference instances and different storage keys.

## Server Rendering

On the server, `Preferences` includes a script that applies saved values before the page paints. CSS can use those attributes immediately. `usePreference` starts with the server's value and updates after hydration.

Follow the [server rendering setup](../server-rendering.md#saved-preferences-and-storage) to place `Preferences` in your app and keep cookie-backed preferences separate for each request.

If your Content Security Policy requires a nonce, pass the nonce from your response:

```tsx
<Preferences preferences={[view]} nonce={nonce}>
  <App />
</Preferences>
```

## API Reference

### Preferences

- `nonce?` (`string`): The nonce your Content Security Policy gives inline scripts. Example: [Server Rendering](#server-rendering).
- `preferences` (`readonly PreferenceLike[]`): The preferences to show, from `createPreference` or `createColorScheme`. Example: [Usage](#usage).

### usePreference

`usePreference(preference)` returns the preference's current state and updates the component when it changes. For a preference created with `createPreference`, the state is `{ value }`. For a color scheme, it also includes `system` and `resolved`.
