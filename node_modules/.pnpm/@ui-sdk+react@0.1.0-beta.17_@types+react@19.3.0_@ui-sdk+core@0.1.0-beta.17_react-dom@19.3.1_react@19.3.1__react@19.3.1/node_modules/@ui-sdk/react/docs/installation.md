# Installation

Install UI SDK in your React app.

Start with an app using React 19 and React DOM 19 or newer.

## Install the Packages

```bash
npm install @ui-sdk/react @ui-sdk/core
```

`@ui-sdk/react` provides the React components. `@ui-sdk/core` provides their behavior and is a peer dependency. Install both so the components and any helpers you use share one copy of the core.

If you use TypeScript, you'll also need `@types/react` 19.2.10 or newer.

## Import a Component

Import each component from its own entry:

```tsx
import { Button } from "@ui-sdk/react/button"
import { Toggle } from "@ui-sdk/react/toggle"
```

A Dialog has separate parts for its trigger, content, and title. Import those parts from the same entry:

```tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
```

There is no root import from `@ui-sdk/react`. Each [component page](./README.md) lists the parts you can use.

## Add Your Styles

Components are unstyled, so you style them with your app's CSS or with Tailwind CSS. [Styling and Animation](./styling-and-animation.md) covers both.

For a default look to start from, import `@ui-sdk/core/web.css` once. In Next.js, import it at the top of `app/layout.tsx`. In a Vite app, import it at the top of `main.tsx`:

```ts
import "@ui-sdk/core/web.css"
```

With Tailwind CSS, import it in your global stylesheet instead, after Tailwind. `layer(components)` puts it above Tailwind's base styles, so they don't reset it, and below its utilities, so a class still wins. Declare [the ui-sdk layer](./styling-and-animation.md#the-ui-sdk-layer) above both:

```css
@layer ui-sdk;

@import "tailwindcss";
@import "@ui-sdk/core/web.css" layer(components);
```

You can render your first component without setting up a provider. If you use Next.js, [Server Rendering](./server-rendering.md) explains when your own components need `"use client"`.

Continue with [First Component](./first-component.md) to add a working toggle to your app.
