# Styling and Animation

Style parts and their state, then add entry and exit transitions.

Parts render without styles. The component demos use plain CSS, and the same state attributes and CSS variables work with Tailwind CSS or any other stylesheet.

## Style a Part

Every part has a `data-slot` attribute. State adds attributes such as `data-open`, `data-pressed`, or `data-disabled`:

```tsx
import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return (
    <Toggle className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm data-pressed:bg-neutral-100 data-disabled:opacity-50">
      Bold
    </Toggle>
  )
}

export { Example }
```

Most state attributes are present or absent. Others have values, such as `data-side="top"` or `data-orientation="vertical"`. Each component's Styling section lists its attributes and CSS variables. Use these rather than generated IDs, which can change.

## CSS Modules

Import a CSS Module and pass its class to the part. State selectors work the same way:

```tsx
import { Toggle } from "@ui-sdk/react/toggle"
import styles from "./toggle.module.css"

function Example() {
  return <Toggle className={styles.toggle}>Bold</Toggle>
}

export { Example }
```

```css title="toggle.module.css"
.toggle {
  cursor: default;
  border: 1px solid var(--input, #e5e5e5);
  border-radius: 1.125rem;
  background: transparent;
  padding: 0.375rem 0.625rem;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
}

.toggle[data-pressed] {
  background: var(--muted, #f5f5f5);
}

.toggle[data-disabled] {
  opacity: 0.5;
}

.toggle:focus-visible {
  outline: 2px solid var(--ring, #a3a3a3);
  outline-offset: 2px;
}
```

## Use State in React

`className` and `style` can be functions of the part's state:

```tsx
"use client"

import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return (
    <Toggle
      className={(state) => (state.pressed ? "font-bold" : "font-normal")}
    >
      Bold
    </Toggle>
  )
}

export { Example }
```

With Tailwind, you can also use attribute variants, such as `data-pressed:font-bold`.

## Animate Opening and Closing

Popup content gets `data-starting-style` before it enters and `data-ending-style` while it exits. The content stays mounted until its exit transition or animation finishes.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent
        aria-label="Project details"
        className="origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-none"
      >
        Last updated today.
      </PopoverContent>
    </Popover>
  )
}

export { Example }
```

Put exit styles on `data-ending-style`. `data-closed` describes the state, but doesn't keep the element around for an exit.

An exit animation you start from script is waited for too, when it starts in the same task that closes the popup, like in its open change callback. One started later, from an effect or an observer, isn't.

Popups also provide `--anchor-width` and `--available-height` for sizing. See [Popups](./popups.md) for placement and mounting options.

## The ui-sdk Layer

A few behaviors need a little CSS, like keeping a closed popup hidden or dimming the page behind a sheet, so ui-sdk adds it to the page in a cascade layer named `ui-sdk`. Declare that layer at the top of your global stylesheet, the one your app's entry or root layout imports, so your own styles win over it wherever the page puts them. With Tailwind, put it above `@import "tailwindcss"`:

```css
@layer ui-sdk;
```

A CSS Module loads with its component, too late to come first, so keep the line in the global stylesheet.

ui-sdk adds this CSS once a component mounts, so HTML rendered on the server doesn't have it until the page hydrates. Closed content kept in the page, like a tooltip's, carries `hidden`, and a class that sets `display` shows it until then. Tailwind's base styles already hide `hidden` elements. With other CSS, add the same rule to your global stylesheet:

```css
@layer ui-sdk {
  :where([data-slot][hidden]:not([hidden="until-found"])) {
    display: none !important;
  }
}
```

It leaves `hidden="until-found"` alone, so find in page can still open a closed panel.

The same layer takes the browser's own popover border, padding and background off Popover, Dialog, Drawer, Tooltip and Hover Card content. Menu, Select, Combobox and Date Picker content keep them, so give those parts a `border`, `padding` and `background` of your own. `web.css` already does.

## Content Security Policy

A Content Security Policy without `'unsafe-inline'` in `style-src` blocks the CSS ui-sdk adds. Give ui-sdk your policy's nonce with a meta tag in the page's `<head>`:

```html
<meta property="csp-nonce" nonce="your-nonce" />
```

With Vite, set `html.cspNonce` in your Vite config to a placeholder, and Vite writes this tag for you. Your server replaces the placeholder with a new nonce on each request.

In Next.js, render the tag in the root layout's `<head>`, with the nonce your middleware passes in a request header:

```tsx
import { headers } from "next/headers"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined
  return (
    <html lang="en">
      <head>
        <meta property="csp-nonce" nonce={nonce} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Pages rendered on the server also carry a few `style` attributes, like the one that hides a select's native input, so the policy needs `style-src-attr 'unsafe-inline'` too.

If your policy has no nonce for styles, add the tag without the `nonce` attribute. ui-sdk then adds its CSS as constructed style sheets, which no policy blocks. If your code replaces `document.adoptedStyleSheets`, ui-sdk adds its sheets back the next time a component mounts.
