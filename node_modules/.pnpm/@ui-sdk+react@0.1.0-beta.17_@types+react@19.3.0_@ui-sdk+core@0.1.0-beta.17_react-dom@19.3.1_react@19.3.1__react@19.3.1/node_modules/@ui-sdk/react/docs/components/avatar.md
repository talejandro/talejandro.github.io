# Avatar

Show an image with a fallback while it loads or if it fails.

Use an Avatar for a person or a team, like in a comment, a member list or an account menu. It shows initials or an icon until the image loads, and keeps showing them if the image fails.

```tsx title="basic.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar"

const person = {
  name: "shadcn",
  src: "https://github.com/shadcn.png",
}

export function Example() {
  return (
    <div data-slot="row">
      <Avatar>
        <AvatarImage src={person.src} alt={person.name} />
        <AvatarFallback>
          <span aria-hidden="true">CN</span>
          <span data-slot="visually-hidden">shadcn</span>
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
```

The image replaces the initials once it loads. A screen reader can read the person's name in either state.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `Avatar`:

```text
Avatar
├── AvatarImage
└── AvatarFallback
```

- `Avatar` shares the image's loading state with its parts.
- `AvatarImage` renders the image.
- `AvatarFallback` shows when no image is loaded.

The image is a real `img`, including in server markup. The browser can start fetching it before hydration. The fallback stays visible until the image loads; if loading fails, the fallback remains.

## Usage

Import the parts and put them together:

```tsx
<Avatar>
  <AvatarImage src="/ada.png" alt="Ada Lovelace" />
  <AvatarFallback>AL</AvatarFallback>
</Avatar>
```

## Build Your Own

`@ui-sdk/react/avatar` comes with a ready-made Avatar. If you'd like to build your own, with your own names, start from the `avatar` primitive in `@ui-sdk/core`:

```ts title="user-photo.ts"
"use client"

import { avatar } from "@ui-sdk/core/avatar"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: UserPhoto,
  Image: UserPhotoImage,
  Fallback: UserPhotoInitials,
} = createParts(avatar, { root: "span", image: "img", fallback: "span" })

export { UserPhoto, UserPhotoImage, UserPhotoInitials }
```

```tsx
<UserPhoto>
  <UserPhotoImage src="https://github.com/shadcn.png" alt="shadcn" />
  <UserPhotoInitials>CN</UserPhotoInitials>
</UserPhoto>
```

These are the same parts the ready-made Avatar is made of, with your names. See [Rendering](../rendering.md) and [Custom Rendering](#custom-rendering) for more.

## Fallback Delay

<span id="behavior-and-options" />

Set `delay` on the fallback to wait before showing it. This avoids flashing initials when an image loads quickly. Without a delay, the fallback appears immediately, including on the server.

```tsx
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
  <AvatarFallback delay={600}>CN</AvatarFallback>
</Avatar>
```

## Image Attributes

Pass image attributes such as `srcSet`, `crossOrigin`, and `referrerPolicy` to the image. They work on the same `img` the browser loads. For avatars farther down a page, use `loading="lazy"`.

```tsx
<Avatar>
  <AvatarImage
    src="https://github.com/shadcn.png"
    srcSet="https://github.com/shadcn.png?size=80 1x, https://github.com/shadcn.png?size=160 2x"
    alt="shadcn"
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
    loading="lazy"
  />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

<span id="render-functions" />

## Interactive Avatar

Use a button when clicking an avatar performs an action. Give it an accessible name that stays available while the image loads.

```tsx
<Avatar
  render={<button type="button" aria-label="shadcn" />}
  onClick={openProfile}
>
  <AvatarImage src="https://github.com/shadcn.png" alt="" />
  <AvatarFallback aria-hidden>CN</AvatarFallback>
</Avatar>
```

[Parts and Composition](../parts-and-composition.md) explains how to change the root element in this framework.

## Loading Status

`onLoadingStatusChange` receives the new status and change details. The possible statuses are `loading`, `loaded`, `error`, and `idle`.

```tsx
<Avatar
  onLoadingStatusChange={(status, details) => {
    if (status === "error") reportBrokenImage(details.reason)
  }}
>
  <AvatarImage src={user.image} alt={user.name} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>
```

When you replace a loaded image, the browser keeps it visible while the next source loads. A failed replacement shows the fallback. The change details explain why the status changed; see [Reasons](#reasons).

## Custom Rendering

Use [Parts and Composition](../parts-and-composition.md) to replace an element or read its state. Every part receives the loading status, so the fallback can say something different when the image fails:

```tsx
<Avatar>
  <AvatarImage src={user.image} alt={user.name} />
  <AvatarFallback>
    {(state) => (state.loadingStatus === "error" ? "?" : user.initials)}
  </AvatarFallback>
</Avatar>
```

## Styling

Set the root's size and let the image and fallback fill it. The image manages its own hidden styles until it loads; keep those styles intact when changing its element.

Each part has a `data-slot`, such as `avatar-fallback`, and shows the loading status through the attributes listed under [Data Attributes](#data-attributes).

## Data Attributes

### Avatar
`[data-slot="avatar"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

### AvatarImage
`[data-slot="avatar-image"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

### AvatarFallback
`[data-slot="avatar-fallback"]`

- `data-loading-status` (`idle`, `loading`, `loaded`, `error`): Where the image is: no image yet, loading, loaded, or failed.

## API Reference

Props and callbacks are the same as below, as React props.

### Avatar

- `onLoadingStatusChange?` (`((status: AvatarLoadingStatus, details: ChangeDetails<AvatarLoadingStatusChangeReason>) => void)`): Runs when the image's loading status changes: `"loading"` when it gets a source, `"loaded"`, `"error"`, and `"idle"` when it leaves the page. `details.reason` says why, and `details.event` is the image's `load` or `error` event, or undefined when the status was known at once, like for a cached image.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### AvatarImage

The image. Renders a real `img`, so the browser can fetch it before hydration, and accepts its attributes, such as `srcSet`, `crossOrigin` and `referrerPolicy`.

### AvatarFallback

- `delay?` (`number`): How long to wait, in milliseconds, before showing the fallback, so a fast image appears without the fallback flashing first. Without one, the fallback shows at once, server markup included.

### State

What render functions, state-based class names and slots receive. Every part gets the same state.

- `loadingStatus` (`AvatarLoadingStatus`): Where the image is: `"idle"`, `"loading"`, `"loaded"` or `"error"`.

### Reasons

`details.reason` says why the status changed.

- `image-load` (`Event | undefined`): An image loaded. No event when it was already in the browser's cache.
- `image-error` (`Event | undefined`): An image failed to load, or has no source. No event when that was known at once.
- `src-change` (`none`): An image got a new source, or left the page, so its status starts over.

### Events

Callbacks get the new status first, then the details.

| Prop                    | On       | Receives                                                                            |
| ----------------------- | -------- | ----------------------------------------------------------------------------------- |
| `onLoadingStatusChange` | `Avatar` | `(status, details)`: the image's status, the [reason](#reasons) and `details.event` |

## Accessibility

Give the image meaningful `alt` text. Include the person's name in the fallback too, using visually hidden text if you only want to show initials.

When a visible name beside the avatar already identifies the person, use an empty `alt` and hide decorative fallback content from screen readers.

- An image that loads replaces the fallback.
- An image that fails keeps the fallback.
- An avatar without an image shows its fallback.
- A fallback with a delay waits before showing.
- The image's loading status is reported.
- Removing the image brings the fallback back.
- A new source shows its image once it loads.
- The image is fetched with its own referrer policy.
- A cached image doesn't flash the fallback when the avatar mounts again.
- A new source keeps showing the previous image until it loads.
- The image is fetched once, even when it can't be cached.

Runs in React, Vue and web components.
