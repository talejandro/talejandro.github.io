# Server Rendering

Render the initial HTML on the server and add interactions when React hydrates.

ui-sdk parts render their initial HTML on the server, including ARIA state and keyboard tab stops. Hydration connects the event handlers in the browser.

## Render from a Server Component

In an app with React Server Components, such as Next.js, you can render ui-sdk components directly from a server page. Their modules already include `"use client"`:

```tsx
import { Toggle } from "@ui-sdk/react/toggle"

function Page() {
  return <Toggle defaultPressed>Bold</Toggle>
}

export { Page }
```

The server sends a button with `aria-pressed="true"`. It can toggle after hydration. Native HTML behavior, such as submitting a form, can work before hydration.

## Wrappers in a Server Component

A wrapper that only renders markup can stay on the server. `renderElement` lets it support the same `render` prop as other parts:

```tsx
import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

function Card({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-card": "" }, render)
}

function Page() {
  return (
    <Card render={<section />} className="card">
      Your plan renews on May 1.
    </Card>
  )
}

export { Card, Page }
```

The server renders a `section` with the card’s props.

Put custom parts built with `usePrimitive`, `usePart`, or `createParts` in a client module. A Server Component can then render those exported parts, just like `Toggle` above.

## Add Your Own Client Boundary

If your component owns React state, callbacks, or render functions, put `"use client"` at the top of its entry file:

```tsx title="mute-button.tsx"
"use client"

import { Toggle } from "@ui-sdk/react/toggle"
import { useState } from "react"

function MuteButton() {
  const [muted, setMuted] = useState(false)

  return (
    <>
      <Toggle pressed={muted} onPressedChange={setMuted}>
        Mute
      </Toggle>
      <output>{muted ? "Sound is off" : "Sound is on"}</output>
    </>
  )
}

export { MuteButton }
```

Render `MuteButton` from your server page. Clicking Mute changes its pressed state and the output; the button keeps the same accessible name.

Keep ordinary callbacks and render functions inside the client boundary. They cannot cross from a Server Component as props.

## Saved Preferences and Storage

Preferences like a color scheme or an emoji skin tone are saved in the browser, so the server can't render them. [Preferences](./core.md#preferences) covers the preferences themselves; this is how they fit server rendering.

### Show Them Before Hydration

Render `Preferences` at the top of `<body>`. On the server it renders one inline script as its first child, which puts every saved value on its `data-*` attribute as the page loads, before React hydrates, so CSS that selects those attributes is right from the first paint. Preferences hold functions, which can't cross from a Server Component as props, so give them to `Preferences` in a client module:

```tsx title="app-preferences.tsx"
"use client"

import { Preferences } from "@ui-sdk/react/preferences"
import { colorScheme, skinTone } from "./preferences"

function AppPreferences({ children }: { children: React.ReactNode }) {
  return (
    <Preferences preferences={[colorScheme, skinTone]}>{children}</Preferences>
  )
}

export { AppPreferences }
```

```tsx title="root.tsx"
import { AppPreferences } from "./app-preferences"

function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppPreferences>{children}</AppPreferences>
      </body>
    </html>
  )
}

export { Root }
```

A preference made with `global: true` goes on `<html>`, which the script sets before hydration, so `<html>` needs `suppressHydrationWarning`. Pass `nonce` to `Preferences` if your Content Security Policy only allows inline scripts with one.

Content that reads a preference through `usePreference` renders the default on the server and the saved value right after hydration. Style by the attribute instead wherever the first paint has to be right, as [Style by Preferences](./core.md#style-by-preferences) shows.

### Read a Cookie on the Server

A preference kept in a cookie can render on the server too, content included. Read the request's `Cookie` header on the server, however your server or framework gives you the request, and pass it to your root as a prop, like `<Root cookie={request.headers.get("cookie")}>`. A preference made from a request belongs to that request, so create it in the client boundary, once per render of the app, and share it through context:

```tsx title="root.tsx"
import { AppPreferences } from "./app-preferences"

function Root({
  cookie,
  children,
}: {
  cookie: string | null
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppPreferences cookie={cookie}>{children}</AppPreferences>
      </body>
    </html>
  )
}

export { Root }
```

```tsx title="app-preferences.tsx"
"use client"

import { createCookieStorage, createPreference } from "@ui-sdk/core"
import { Preferences } from "@ui-sdk/react/preferences"
import { createContext, useState } from "react"

const createSkinTone = (cookie: string | null) =>
  createPreference({
    values: ["default", "light", "medium", "dark"],
    defaultValue: "default",
    attribute: "data-skin-tone",
    storage: createCookieStorage("skin-tone", { cookie }),
  })

const SkinToneContext = createContext<ReturnType<typeof createSkinTone> | null>(
  null
)

function AppPreferences({
  cookie,
  children,
}: {
  cookie: string | null
  children: React.ReactNode
}) {
  const [skinTone] = useState(() => createSkinTone(cookie))
  return (
    <SkinToneContext value={skinTone}>
      <Preferences preferences={[skinTone]}>{children}</Preferences>
    </SkinToneContext>
  )
}

export { AppPreferences, SkinToneContext }
```

The server reads the value from `cookie`, and the browser from `document.cookie`, so both render it and hydration matches. `usePreference(skinTone)` returns the saved value from the first render.

### Render the Storage Script Yourself

`Preferences` is the usual way. For one component that keeps its own value, like a toolbar's density, a storage's `script` returns the same kind of inline script for a single element. Render it right after the element, since it writes to the element right before it:

```tsx title="toolbar.tsx"
"use client"

import { createLocalStorage } from "@ui-sdk/core"
import { useEffect, useState, useSyncExternalStore } from "react"

const density = createLocalStorage("density")
const script = density.script({
  attribute: "data-density",
  values: ["comfortable", "compact"],
})
const noSubscribe = () => () => {}

function Toolbar({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState("comfortable")
  // True on the server and while hydrating, when the script is in the HTML.
  const fromServer = useSyncExternalStore(
    noSubscribe,
    () => false,
    () => true
  )
  useEffect(
    () => setValue(density.get() === "compact" ? "compact" : "comfortable"),
    []
  )
  return (
    <>
      <div data-density={value} suppressHydrationWarning>
        {children}
      </div>
      {fromServer && script ? (
        <script dangerouslySetInnerHTML={{ __html: script }} />
      ) : null}
    </>
  )
}

export { Toolbar }
```

- **Only from the server.** The browser never runs a script React inserts, and React warns about one, so leave it out of a render in the browser only. `fromServer` is true on the server and while hydrating, and false after.
- **The element differs until hydration.** The script changes its attribute before React hydrates, so `suppressHydrationWarning` goes on that element. After hydration, render the saved value from state, as above.
- **Shared by ID.** Every script with the same storage kind and ID reads the storage once, however many elements render it, and the scripts are identical, so compression shrinks the repeats.
- **Only safe values.** Any script on your site can write the saved value, so `script` only sets attributes that start with `data-`, and only to one of `values`.
- **Not for cookies.** A cookie storage's `script` returns undefined, since the server reads the cookie and renders the value itself.

To run before the page's content at all, render `preferencesScript([...])` from `@ui-sdk/core` in `<head>` yourself. Only global preferences make sense there, since the others go on the script's parent element.

## Keep the First Render Consistent

Use the same initial values on the server and client. Read browser-only values in an effect or event handler, after hydration.

### IDs

Parts generate IDs for their relationships, such as a Dialog trigger’s `aria-controls` and a Field label’s `for`. You usually do not need to supply them.

Pass an explicit `id` when something outside the component needs to refer to a part. On the server, render order matters: if a Field label renders before a control with your ID, the label initially uses the generated ID. Hydration updates the reference to yours. The same applies to Dialog triggers, titles, and descriptions.

Keep a part with your ID in the same Suspense boundary as the parts that reference it so they hydrate together. Pass the ID to the part or its `render` element; an ID assigned inside a render function cannot be read ahead and is picked up during hydration.

Use classes or data attributes for styling, rather than generated IDs.

Popups render in place, so they don't need a portal root in your server layout. [Popups](./popups.md) covers their placement and containers; [Forms](./forms.md) covers submission and validation.
