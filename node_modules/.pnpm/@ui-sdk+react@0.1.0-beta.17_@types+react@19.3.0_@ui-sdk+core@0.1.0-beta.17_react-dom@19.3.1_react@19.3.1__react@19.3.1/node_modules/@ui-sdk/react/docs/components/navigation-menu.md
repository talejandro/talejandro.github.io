# Navigation Menu

Groups site links into panels that open from a row of triggers.

Use a Navigation Menu for a site's main links, grouped into panels that open from a row of triggers. For a list of actions, use a [Menu](./menu.md).

```tsx title="basic.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkIcon,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CircleIcon,
  CircleCheckIcon,
  CircleQuestionMarkIcon,
} from "lucide-react"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const components = [
  {
    title: "Alert Dialog",
    href: "#",
    description:
      "Asks for a decision before anything else on the page can be used.",
  },
  {
    title: "Hover Card",
    href: "#",
    description:
      "A preview of what a link points to, for people who pause on it.",
  },
  {
    title: "Progress",
    href: "#",
    description: "Shows how far along a task is, like an upload.",
  },
  {
    title: "Scroll Area",
    href: "#",
    description: "Scrolls its content with scrollbars you can style.",
  },
  {
    title: "Tabs",
    href: "#",
    description:
      "Shows one panel of content at a time, picked from a list of tabs.",
  },
  {
    title: "Tooltip",
    href: "#",
    description:
      "A short label for a control, shown on hover or keyboard focus.",
  },
]

const statuses = [
  { title: "Backlog", href: "#", icon: CircleQuestionMarkIcon },
  { title: "To do", href: "#", icon: CircleIcon },
  { title: "Done", href: "#", icon: CircleCheckIcon },
  { title: "All issues", href: "#", icon: ArrowRightIcon, mirror: true },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="getting-started">
          <NavigationMenuTrigger>
            Getting started
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              <li>
                <NavigationMenuLink href="#" data-variant="featured">
                  <span>ui-sdk</span>
                  <span data-slot="hint">
                    Accessible components for React, Vue, Svelte, Solid and Web
                    Components.
                  </span>
                </NavigationMenuLink>
              </li>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              {components.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="with-icon">
          <NavigationMenuTrigger>
            With Icon
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {statuses.map((status) => (
                <li key={status.title}>
                  <NavigationMenuLink href={status.href}>
                    <NavigationMenuLinkIcon mirror={status.mirror}>
                      <status.icon />
                    </NavigationMenuLinkIcon>
                    {status.title}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Open each section, then use Tab or the arrow keys to move through its links.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `NavigationMenu`:

```text
NavigationMenu
├── NavigationMenuList
│   ├── NavigationMenuItem
│   │   ├── NavigationMenuTrigger
│   │   └── NavigationMenuContent
│   │       └── NavigationMenuLink
│   └── NavigationMenuItem
│       ├── NavigationMenuTrigger
│       └── NavigationMenuContent
│           └── NavigationMenuLink
└── NavigationMenuViewport
```

Give the navigation an `aria-label`. Each item holds a trigger and its panel, or a plain link. This follows the [disclosure navigation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/): buttons show groups of ordinary links. Use a [Menu](./menu.md) for actions instead.

The viewport holds the open panel and follows its size and position. Size it with `--viewport-width` and `--viewport-height` and clip its overflow when you use one; [Contents in the Viewport](#contents-in-the-viewport) explains the geometry. You can also [leave the viewport out](#without-a-viewport) and position each panel separately.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}

export { Example }
```

## Link Component

Render your router's link for client-side navigation. `current` marks the link for the current page with `aria-current="page"` and `data-current`.

Pass the router's link to `render`, like `render={<Link href="/docs" />}`.

```tsx title="link-component.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#introduction",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#installation",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#styling",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

function Link({
  href,
  onNavigate,
  ...props
}: React.ComponentProps<"a"> & {
  href: string
  onNavigate: (href: string) => void
}) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        props.onClick?.(event)
        event.preventDefault()
        onNavigate(href)
      }}
    />
  )
}

function Example() {
  const log = useLog()
  const [route, setRoute] = React.useState("#introduction")
  const navigate = (href: string) => {
    setRoute(href)
    log(`Navigated to ${href}`)
  }

  return (
    <NavigationMenu aria-label="Docs">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink
                    render={<Link href={page.href} onNavigate={navigate} />}
                    current={route === page.href}
                  >
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            render={<Link href="#components" onNavigate={navigate} />}
            current={route === "#components"}
          >
            Components
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Choose a link to update the current page without reloading the example.

Routers call `preventDefault()` on a link's click to navigate without a page load. The menu listens on the link element itself, so it still closes after a client-side route change. A press with a modifier key or the middle button opens the link elsewhere and leaves the menu open. Set `closeOnSelect` to false to keep it open on every press, see [Close on Select](#close-on-select).

## Icons

Put a link's icon in a `NavigationMenuLinkIcon`, before its text, like the With Icon panel in the menu at the top of the page. Screen readers skip it, so an SVG's `<title>`, an icon font's glyph or an emoji never joins the link's name.

- **Icons that point a way**, like the arrow on All issues, flip in right-to-left text with `mirror`.
- **Links with only an icon** need an `aria-label`. In development, one with no name warns.
- **Lining up links.** Links with an icon get `data-has-icon`, and the content or list around them gets `data-has-icons` while any link has one, so links without an icon can leave its space: `[data-has-icons] [data-slot="navigation-menu-link"]:not([data-has-icon])`.

## Vertical

`orientation="vertical"` is for a sidebar: Up and Down move between the items, and panels open beside the menu, at the inline end, unless `side` says otherwise.

```tsx title="vertical.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronRightIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Sidebar" orientation="vertical">
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger>
              {section.label}
              <ChevronRightIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                {section.links.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink href={link.href}>
                      <span>{link.title}</span>
                      <span data-slot="hint">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Use Up and Down between the sidebar items, then open a panel beside its trigger.

## Click Only

Resting the pointer on a trigger opens its panel. With `openOnHover` set to false, the menu opens on click only: pressing a trigger opens and closes its panel, and moving the pointer does nothing. Keyboard and touch work the same either way.

```tsx title="click-only.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main" openOnHover={false}>
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger>
              {section.label}
              <ChevronDownIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul>
                {section.links.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink href={link.href}>
                      <span>{link.title}</span>
                      <span data-slot="hint">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Click a trigger to open it. Moving the pointer between triggers does not open another panel.

## Nested

A navigation menu inside another menu's content is a submenu. It renders a plain element instead of a second `<nav>` landmark, gets `data-nested`, and closes with its parent when the parent moves on to another item. Without a viewport of its own, its panels open beside its triggers. Pressing a link in it closes every menu.

```tsx title="nested.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const groups = [
  {
    value: "overlays",
    label: "Overlays",
    links: [
      { title: "Dialog", href: "#" },
      { title: "Popover", href: "#" },
      { title: "Tooltip", href: "#" },
    ],
  },
  {
    value: "forms",
    label: "Forms",
    links: [
      { title: "Input", href: "#" },
      { title: "Select", href: "#" },
      { title: "Checkbox", href: "#" },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((link) => (
                <li key={link.title}>
                  <NavigationMenuLink href={link.href}>
                    <span>{link.title}</span>
                    <span data-slot="hint">{link.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenu orientation="vertical">
              <NavigationMenuList>
                {groups.map((group) => (
                  <NavigationMenuItem key={group.value} value={group.value}>
                    <NavigationMenuTrigger>
                      {group.label}
                      <ChevronRightIcon />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent sideOffset={9} alignOffset={-5}>
                      <ul>
                        {group.links.map((link) => (
                          <li key={link.title}>
                            <NavigationMenuLink href={link.href}>
                              {link.title}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Open Components, then open Overlays or Forms. Escape closes the inner panel first.

## Animation

The viewport and contents get `data-starting-style` for their first frame and `data-ending-style` while they animate out, and stay mounted until their animation finishes. Contents also get `data-motion` while another item takes over: `from-end` or `from-start` on the one coming in, and `to-start` or `to-end` on the one giving way. Order is logical, so in right-to-left layouts the end is on the left. The viewport can transition `width`, `height`, `left` and `top` as it follows the open item.

`onOpenChangeComplete` runs once the menu has finished opening or closing, after any animation, with the new open state. Switching between items doesn't count.

```tsx title="animation.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"

const gettingStarted = [
  {
    title: "Introduction",
    href: "#",
    description: "Unstyled components with one core for every framework.",
  },
  {
    title: "Installation",
    href: "#",
    description:
      "Add the package for your framework and render your first part.",
  },
  {
    title: "Styling",
    href: "#",
    description: "Style parts with data attributes, CSS variables and any CSS.",
  },
]

const components = [
  {
    title: "Alert Dialog",
    href: "#",
    description:
      "Asks for a decision before anything else on the page can be used.",
  },
  {
    title: "Hover Card",
    href: "#",
    description:
      "A preview of what a link points to, for people who pause on it.",
  },
  {
    title: "Progress",
    href: "#",
    description: "Shows how far along a task is, like an upload.",
  },
  {
    title: "Scroll Area",
    href: "#",
    description: "Scrolls its content with scrollbars you can style.",
  },
  {
    title: "Tabs",
    href: "#",
    description:
      "Shows one panel of content at a time, picked from a list of tabs.",
  },
  {
    title: "Tooltip",
    href: "#",
    description:
      "A short label for a control, shown on hover or keyboard focus.",
  },
]

function Example() {
  const log = useLog()

  return (
    <NavigationMenu
      aria-label="Main"
      onValueChange={(value) => log(value ? `Showing ${value}` : "Closing")}
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>
            Guides
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              {gettingStarted.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>
            Components
            <ChevronDownIcon />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul data-slot="grid">
              {components.map((page) => (
                <li key={page.title}>
                  <NavigationMenuLink href={page.href}>
                    <span>{page.title}</span>
                    <span data-slot="hint">{page.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} data-variant="slide" />
    </NavigationMenu>
  )
}

export { Example }
```

Switch between Guides and Components to see the viewport resize and the panels slide.

The menu waits for whatever animations run, and only those. Turn them off for people who ask for less motion with a `prefers-reduced-motion` media query, and panels switch and close at once.

## Delay

`delay` is how long the pointer rests on a trigger before its panel opens, and `closeDelay` how long the panel stays once the pointer leaves the trigger and the panel: 50 milliseconds each by default. The pointer can cross the gap between a trigger and its panel without closing it. Once a panel is open, moving to another trigger switches at once, unless the pointer is only passing over it on the way into the open panel. Coming back right after closing skips the delay.

```tsx
<NavigationMenu aria-label="Main" delay={400} closeDelay={600}>
  ...
</NavigationMenu>
```

## Indicator

`NavigationMenuIndicator` sits under the open trigger, or under the top-level link with `current` while every panel is closed. Its box comes from the `--active-item-*` [variables](#styling-navigationmenuindicator), relative to its positioned ancestor, and it gets `data-visible` while it has something to cover. Screen readers skip it.

```tsx
<NavigationMenu aria-label="Main">
  <NavigationMenuList>...</NavigationMenuList>
  <NavigationMenuIndicator />
  <NavigationMenuViewport />
</NavigationMenu>
```

```css
[data-slot="navigation-menu"] {
  position: relative;
}

[data-slot="navigation-menu-indicator"] {
  position: absolute;
  left: var(--active-item-left);
  bottom: var(--active-item-bottom);
  width: var(--active-item-width);
  height: 2px;
  opacity: 0;
}

[data-slot="navigation-menu-indicator"][data-visible] {
  opacity: 1;
}
```

## Viewport Placement

The viewport opens below the open trigger, lined up with its start, or beside it in a vertical menu. `side` and `align` change that, `sideOffset` is the gap (4 pixels by default), `alignOffset` shifts it along the trigger, and `collisionPadding` is the space kept from the window's edges. It flips and shifts to stay on screen.

`anchor` positions it against something else: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. Anchoring to the whole bar gives one dropdown that stays put while its contents change.

```tsx
<NavigationMenuViewport
  side="bottom"
  align="center"
  sideOffset={8}
  collisionPadding={16}
  anchor="#site-header"
/>
```

## Without a Viewport

Leave the viewport out and each content is its own popup, placed against its trigger. Contents then take the same placement props as the viewport: `side`, `align`, `sideOffset`, `alignOffset`, `collisionPadding` and `anchor`. Style each content as a popup rather than positioning it inside one.

```tsx
<NavigationMenu aria-label="Main">
  <NavigationMenuList>
    <NavigationMenuItem value="guides">
      <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
      <NavigationMenuContent side="bottom" align="start" sideOffset={8}>
        ...
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Controlled

Pass `value` and `onValueChange` to control which item is open. `value` is the open item's `value`, or `null` while every panel is closed. Use `defaultValue` to start with a panel open without controlling it.

Items take a `value`, which is generated when left out. Every change carries a [reason](#reasons), like `trigger-hover`, `trigger-press`, `link-press` or `outside-press`. Call `details.cancel()` to stop it.

```tsx
const [value, setValue] = React.useState<string | null>(null)

<NavigationMenu aria-label="Main" value={value} onValueChange={setValue}>
  ...
</NavigationMenu>
```

## Opening from Anywhere

A [controller](#controller), from `createNavigationMenuController()`, opens, closes and focuses the menu from anywhere, without controlling it. Pass it as `controller`.

```tsx
const [menu] = React.useState(() => createNavigationMenuController())

<button onClick={() => menu.setValue("components")}>Browse Components</button>
<NavigationMenu aria-label="Main" controller={menu}>
  ...
</NavigationMenu>
```

## Keep Mounted

Closed contents leave the page by default. `keepMounted` keeps them in it, hidden, so the server's HTML and crawlers have every link. `hiddenUntilFound` also lets find in page reach them: closed content gets `hidden="until-found"`, and a match opens its item with the `find-in-page` reason. It implies `keepMounted`.

Closed content stays in its item, with its own classes, and moves into the viewport when it opens. Put padding on an element inside it rather than on the content, so the hidden box has no size where it sits.

```tsx
<NavigationMenuContent hiddenUntilFound>...</NavigationMenuContent>
```

## Close on Select

Pressing a link closes the menu by default, like after a route change. With `closeOnSelect` set to false on the menu, it stays open, and a link's own `closeOnSelect` wins over the menu's.

```tsx
<NavigationMenu aria-label="Main" closeOnSelect={false}>
  ...
  <NavigationMenuLink href="/docs/components" closeOnSelect>
    Browse All
  </NavigationMenuLink>
</NavigationMenu>
```

## Container

Panels render in place and show in the top layer, so no ancestor clips or covers them. `container` renders the viewport, or each content without one, somewhere else, for iframes, shadow roots or a specific stacking context. Set it on the menu, or on the viewport or a content.

```tsx
<NavigationMenu aria-label="Main" container={container}>
  ...
</NavigationMenu>
```

## Custom Rendering

```tsx title="custom-rendering.tsx"
"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import { MinusIcon, PlusIcon } from "lucide-react"

const sections = [
  {
    value: "guides",
    label: "Guides",
    links: [
      {
        title: "Introduction",
        href: "#",
        description: "Unstyled components with one core for every framework.",
      },
      {
        title: "Installation",
        href: "#",
        description:
          "Add the package for your framework and render your first part.",
      },
      {
        title: "Styling",
        href: "#",
        description:
          "Style parts with data attributes, CSS variables and any CSS.",
      },
    ],
  },
  {
    value: "components",
    label: "Components",
    links: [
      {
        title: "Alert Dialog",
        href: "#",
        description:
          "Asks for a decision before anything else on the page can be used.",
      },
      {
        title: "Hover Card",
        href: "#",
        description:
          "A preview of what a link points to, for people who pause on it.",
      },
      {
        title: "Progress",
        href: "#",
        description: "Shows how far along a task is, like an upload.",
      },
      {
        title: "Scroll Area",
        href: "#",
        description: "Scrolls its content with scrollbars you can style.",
      },
    ],
  },
]

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        {sections.map((section) => (
          <NavigationMenuItem key={section.value} value={section.value}>
            <NavigationMenuTrigger
              render={(props, state) => (
                <button {...props}>
                  {section.label}
                  {state.open ? <MinusIcon /> : <PlusIcon />}
                </button>
              )}
            />
            <NavigationMenuContent
              render={<section aria-label={section.label} />}
            >
              {(state) => (
                <>
                  <p data-slot="hint">
                    {state.motion ? `Moved in ${state.motion}` : "Opened"}
                  </p>
                  <ul>
                    {section.links.map((link, index) => (
                      <li key={link.title}>
                        <NavigationMenuLink
                          href={link.href}
                          current={index === 0}
                          render={(props, linkState) => (
                            <a {...props}>
                              <span>{link.title}</span>
                              {linkState.current && (
                                <span data-slot="hint" data-show="current">
                                  You're here
                                </span>
                              )}
                            </a>
                          )}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem value="pricing">
          <NavigationMenuTrigger
            disabled
            render={(props, state) => (
              <button {...props}>
                Pricing
                {state.disabled && (
                  <span data-slot="badge" data-show="disabled">
                    Soon
                  </span>
                )}
              </button>
            )}
          />
          <NavigationMenuContent>Plans for teams.</NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={8} />
    </NavigationMenu>
  )
}

export { Example }
```

Open Guides to see its render state, then compare the current link and disabled trigger.

Use [render functions](../parts-and-composition.md) to change the markup or read a part's state. Here a trigger reads `open` to swap its icon, the content reads `motion`, the current link reads `current` to say you're there, and a disabled trigger reads `disabled` to show a badge.

`disabled` on a trigger stops it from opening its panel. Each part's state is listed under [State](#state).

## Styling

Parts are unstyled. Style them through the attributes they render, which are the same in every framework. Each part has a `data-slot`, such as `navigation-menu-trigger`, and its state attributes are listed under [Data Attributes](#data-attributes).

### Contents in the Viewport

The viewport is one popup that holds whichever content is open. For it to take that content's size:

- Place contents at the viewport's corner, with their own width: `position: absolute; top: 0; inset-inline-start: 0`, and a width like `400px` or `max-content`. Contents of different widths make the viewport resize as it switches.
- Put padding on the contents, not the viewport. `--viewport-width` and `--viewport-height` are the open content's size plus the viewport's own border.
- Size the viewport with those variables and clip it, so contents sliding in and out stay inside.
- Copy `--available-height` to an inheriting variable such as `--panel-height`, then use it to cap the content and let long panels scroll. The positioning variables themselves do not inherit.

In plain CSS:

```css
[data-slot="navigation-menu-viewport"] {
  --panel-height: var(--available-height);
  width: var(--viewport-width);
  height: var(--viewport-height);
  overflow: hidden;
  transition:
    width 200ms,
    height 200ms,
    left 200ms,
    top 200ms,
    opacity 200ms;
}

[data-slot="navigation-menu-viewport"] > [data-slot="navigation-menu-content"] {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  max-height: var(--available-height, var(--panel-height));
  overflow-y: auto;
}

[data-slot="navigation-menu-content"][data-motion="from-end"][data-starting-style],
[data-slot="navigation-menu-content"][data-motion="to-end"][data-ending-style] {
  translate: 48px 0;
}

[data-slot="navigation-menu-content"][data-motion="from-start"][data-starting-style],
[data-slot="navigation-menu-content"][data-motion="to-start"][data-ending-style] {
  translate: -48px 0;
}

[data-slot="navigation-menu-content"]:dir(
    rtl
  )[data-motion="from-end"][data-starting-style],
[data-slot="navigation-menu-content"]:dir(
    rtl
  )[data-motion="to-end"][data-ending-style] {
  translate: -48px 0;
}

[data-slot="navigation-menu-content"]:dir(
    rtl
  )[data-motion="from-start"][data-starting-style],
[data-slot="navigation-menu-content"]:dir(
    rtl
  )[data-motion="to-start"][data-ending-style] {
  translate: 48px 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="navigation-menu-viewport"],
  [data-slot="navigation-menu-content"] {
    transition: none;
  }
}
```

### NavigationMenuContent
- `--anchor-width`: Without a viewport: width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Without a viewport: height of the anchor.
- `--available-width`: Without a viewport: space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Without a viewport: space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: Without a viewport: the point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Without a viewport: where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.

### NavigationMenuViewport
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.
- `--viewport-width`: The open content's width plus the viewport's own border. Transition width for a viewport that resizes as it switches.
- `--viewport-height`: The open content's height plus the viewport's own border.

### NavigationMenuIndicator
- `--active-item-left`: Distance from its positioned ancestor's left edge to the open trigger, or the current page's link.
- `--active-item-right`: Distance from its positioned ancestor's right edge to the item.
- `--active-item-top`: Distance from its positioned ancestor's top edge to the item.
- `--active-item-bottom`: Distance from its positioned ancestor's bottom edge to the item.
- `--active-item-width`: Width of the item it sits under.
- `--active-item-height`: Height of the item it sits under.

## Data Attributes

### NavigationMenu
`[data-slot="navigation-menu"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between the items, and where panels open.
- `data-nested`: Present on a menu inside another menu's content.

### NavigationMenuList
`[data-slot="navigation-menu-list"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between the items, and where panels open.
- `data-has-icons`: Present while any link inside holds an icon part, so items without one can line up.

### NavigationMenuItem
`[data-slot="navigation-menu-item"]`

- `data-closed`: Present while the item's panel is closed, including while it animates out.
- `data-open`: Present while the item's panel is open.

### NavigationMenuTrigger
`[data-slot="navigation-menu-trigger"]`

- `data-closed`: Present while the item's panel is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the item's panel is open.

### NavigationMenuContent
`[data-slot="navigation-menu-content"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between the items, and where panels open.
- `data-closed`: Present while the item's panel is closed, including while it animates out.
- `data-open`: Present while the item's panel is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while it animates out. Style the state you animate to.
- `data-motion` (`from-start`, `from-end`, `to-start`, `to-end`): Which way the content moves while another item takes over. Order is logical, so in right-to-left layouts the end is on the left.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the viewport, or a content without one, ended up after flipping away from edges.
- `data-align` (`start`, `center`, `end`): How it lines up with the trigger.

### NavigationMenuLink
`[data-slot="navigation-menu-link"]`

- `data-has-icon`: Present on a link while it holds an icon part.

### NavigationMenuLinkIcon
`[data-slot="navigation-menu-link-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### NavigationMenuViewport
`[data-slot="navigation-menu-viewport"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between the items, and where panels open.
- `data-closed`: Present while every panel is closed, including while it animates out.
- `data-open`: Present while a panel is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while it animates out. Style the state you animate to.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the viewport, or a content without one, ended up after flipping away from edges.
- `data-align` (`start`, `center`, `end`): How it lines up with the trigger.

### NavigationMenuIndicator
`[data-slot="navigation-menu-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between the items, and where panels open.
- `data-closed`: Present while every panel is closed.
- `data-open`: Present while a panel is open, so it sits under a trigger.
- `data-visible`: Present while there's a trigger or a current page's link to sit under.

## API Reference

Props and callbacks are the same as below, as React props.

### NavigationMenu

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `value?` (`T | null`): The open item's value. Pass it to control the menu. `null` closes every panel.
- `defaultValue?` (`T | null`): The item open at first, when uncontrolled.
- `onValueChange?` (`((value: T | null, details: ChangeDetails<NavigationMenuValueChangeReason>) => void)`): Runs when an item wants to open or the open one to close. `details.reason` says why, and `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the menu has finished opening or closing, after any animation. Switching items doesn't count.
- `delay?` (`number`): Milliseconds the pointer rests on a trigger before its panel opens. Moving to another trigger while one is open switches at once.
- `closeDelay?` (`number`): Milliseconds before the open panel closes once the pointer leaves its trigger and the panel.
- `openOnHover?` (`boolean`): Whether resting the pointer on a trigger opens its panel. Pressing a trigger always does, so `false` makes a click-only menu.
- `closeOnSelect?` (`boolean`): Whether pressing a link closes the menu, like after a client-side route change. A link's own `closeOnSelect` wins. A press with a modifier key, which opens a new tab, never closes it.
- `orientation?` (`NavigationMenuOrientation`): Which arrow keys move between the top-level items, and the side panels open on: below a horizontal menu, beside a vertical one.
- `controller?` (`object`): Opens and closes panels from anywhere. Create one with `createNavigationMenuController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### NavigationMenuItem

- `value?` (`string`): Identifies the item, for `value` and `onValueChange`. Generated when left out.

### NavigationMenuTrigger

- `disabled?` (`boolean`): Stops the trigger from opening its panel. A native button can't be focused or pressed.

### NavigationMenuContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger it opens on: below a horizontal menu, at the inline end of a vertical one.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How it lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and it, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the content stays in the page, hidden, while its item is closed, so crawlers and the server's HTML have it. Closed content stays in its item; it moves into the viewport when it opens.
- `hiddenUntilFound?` (`boolean`): Whether closed content stays findable with `hidden="until-found"`, so find in page opens its item. Implies `keepMounted`.

### NavigationMenuLink

- `current?` (`boolean`): Whether the link is the current page. Sets `aria-current="page"` and `data-current`.
- `closeOnSelect?` (`boolean`): Whether pressing the link closes the menu. Overrides the menu's `closeOnSelect`.

### NavigationMenuLinkIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### NavigationMenuViewport

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger it opens on: below a horizontal menu, at the inline end of a vertical one.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How it lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and it, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.

`NavigationMenuList` takes no props of its own.

### NavigationMenuIndicator

The indicator takes no props of its own.

### State

What render functions, state-based class names and slots receive, per part.

`NavigationMenu`:

- `value` (`T | null`): The open item's value, or null.
- `open` (`boolean`): Whether a panel is open.
- `orientation` (`NavigationMenuOrientation`): The menu's `orientation` option, or `"horizontal"` when it's unset or invalid.
- `nested` (`boolean`): Whether the menu sits inside another one's content.

`NavigationMenuList`:

- `open` (`boolean`): Whether a panel is open.
- `orientation` (`NavigationMenuOrientation`): The menu's `orientation` option, or `"horizontal"` when it's unset or invalid.

`NavigationMenuItem`:

- `open` (`boolean`): Whether this item's panel is open.

`NavigationMenuTrigger`:

- `open` (`boolean`): Whether this trigger's panel is open.
- `disabled` (`boolean`): Set by the trigger's `disabled` prop, which stops it opening its panel.

`NavigationMenuContent`:

- `open` (`boolean`): Whether this content's item is open. False while it animates out.
- `motion` (`NavigationMenuMotion | null`): Which way it moves when another item takes over or gives way, or null when the menu opened or closed as a whole.
- `orientation` (`NavigationMenuOrientation`): The menu's `orientation` option, or `"horizontal"` when it's unset or invalid.

`NavigationMenuLink`:

- `current` (`boolean`): Whether the link is the current page.

`NavigationMenuLinkIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`NavigationMenuViewport`:

- `open` (`boolean`): Whether a panel is open. False while it animates out.
- `orientation` (`NavigationMenuOrientation`): The menu's `orientation` option, or `"horizontal"` when it's unset or invalid.

`NavigationMenuIndicator`:

- `open` (`boolean`): Whether a panel is open.
- `orientation` (`NavigationMenuOrientation`): The menu's `orientation` option, or `"horizontal"` when it's unset or invalid.

### Reasons

`details.reason` says why an item opened or closed.

- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `link-press` (`MouseEvent | KeyboardEvent`): A link was pressed, which closes the navigation menu it is in, like after a route change.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `parent-close` (`none`): The parent layer closed.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createNavigationMenuController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, passed to `onValueChange`.

- `getValue()` (`() => T | null`): The open item's value, or null when every panel is closed.
- `setValue(value, options?)` (`(value: T | null, options?: NavigationMenuChangeOptions | undefined) => boolean`): Opens an item's panel, or closes the open one with `null`. Returns false when canceled.
- `isOpen()` (`() => boolean`): Whether a panel is open.
- `close(options?)` (`(options?: NavigationMenuChangeOptions | undefined) => boolean`): Closes the open panel. Returns false when canceled or already closed.
- `focus(value?)` (`(value?: T | undefined) => void`): Moves focus to an item's trigger: the open one, or the first one, without a value.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On               | Receives                                                      |
| ---------------------- | ---------------- | ------------------------------------------------------------- |
| `onValueChange`        | `NavigationMenu` | `(value, details)`: the open item, and the [reason](#reasons) |
| `onOpenChangeComplete` | `NavigationMenu` | `(open)`, after the animation                                 |

## Accessibility

The menu follows the [disclosure navigation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/): a landmark with a list of buttons that show and hide groups of links.

### Keyboard

Tab moves through the triggers and top-level links in order, like any links on a page. Enter or Space on a trigger opens its panel and leaves focus on the trigger, and Tab from an open trigger moves into its panel, wherever the panel renders. Tab past the panel's last link moves on to the next item, and Shift+Tab from its first link returns to the trigger. Escape closes the panel and returns focus to its trigger, and focus leaving the navigation closes it.

The arrow keys add to Tab, as the pattern allows: Left and Right move between the top-level items (Up and Down in a vertical menu), Home and End go to the first and last, Down (the inline end in a vertical menu) opens a trigger's panel and moves into it, and in a panel Up and Down, or Left and Right, move between the links and Home and End go to the first and last. Nothing wraps, and keys pressed with a modifier, like Alt+Left for Back, are left to the browser.

Touch screens have no hover: a tap on a trigger opens its panel and another tap closes it.

### Tested Behavior

Every line below is an automated test.

**Pointer**

- Resting the pointer on a trigger opens its panel.
- The panel waits for its delay before opening.
- Moving to another trigger while a panel is open switches at once.
- Crossing another trigger on the way to the open panel keeps the panel.
- Resting on another trigger on the way to the open panel switches to it.
- Moving the pointer away closes the panel after its close delay.
- Moving the pointer into the panel keeps it open.
- Opening on hover leaves focus where it was.
- Clicking a trigger opens its panel, and clicking it again closes it.
- Clicking a trigger the pointer just opened keeps it open.
- A press outside closes the panel.
- A tap opens a panel and another tap closes it.
- Escape closes a panel the pointer opened, which stays closed while the pointer rests.
- Sweeping across every trigger leaves the menu working.

**Keyboard**

- Tab moves through the triggers and links in order while closed.
- Enter opens a panel and leaves focus on its trigger.
- Space toggles a panel.
- Enter on another trigger switches panels.
- Tab from an open trigger moves into its panel.
- Tab past the panel's last link moves on to the next trigger.
- Shift+Tab from the panel's first link returns to its trigger.
- Shift+Tab from the item after an open panel goes back into the panel.
- Tab from the last item past an open panel leaves the navigation and closes it.
- Escape inside a panel closes it and returns focus to its trigger.
- Escape on an open trigger closes its panel.
- Focus leaving the navigation closes the panel.
- Right and Left arrows move between the top-level items.
- Arrows stop at the first and last items.
- ArrowDown on a trigger opens its panel.
- Down and Up arrows move between the links in a panel.
- An editable element in a panel keeps Down, and a tab stop that isn't editable passes it on.
- A vertical menu moves between items with Down and Up.

**Links**

- A link in a panel follows its href and closes the menu.
- Enter on a link follows it.
- A link with closing turned off leaves the menu open.
- The current page's link says so.

**Viewport**

- The viewport opens below the open trigger, lined up with its start.
- The viewport takes the open panel's size.
- The viewport moves to the newly open trigger.

**Kept content**

- Closed content kept mounted stays in the page, hidden.
- The viewport follows the open panel when its size changes.

**Animation**

- The viewport and its content animate in from their starting style.
- The viewport stays in the page while it animates out.
- A menu opening from closed has no motion.
- With reduced motion, panels switch and close without waiting.
- The viewport appears in place, without sliding in from the corner.
- Exit keyframes keyed on data-closed play on the content that gave way.
- The content that gave way animates out while the next one comes in.

**Reasons**

- Changes report why the menu opened, switched and closed.

**Nested**

- A menu inside a panel opens its own panel.
- A link in a nested panel closes every menu.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Keyboard**

- ArrowDown on a trigger opens its panel and moves focus to its first link.
- ArrowDown on an open trigger moves into its panel.
- Home and End move to the first and last top-level items.
- The same keys pressed without waiting still land.

**Pointer**

- With hover opening off, resting the pointer opens nothing and a click still does.
- A click long after the pointer opened a panel still keeps it open.
- An outside press reports itself, not a focus change.
- The panel stays open while focus is in it, even when the pointer leaves.

**Links**

- A link pressed with a modifier key, which opens a new tab, leaves the menu open.

**Without a viewport**

- Each panel opens as its own popup below its trigger.
- Panels switch, close on Escape and return focus like with one.

**Motion**

- Content coming from a later item enters from the end, and the one it replaced leaves toward the start.
- Content coming from an earlier item enters from the start.

**Indicator**

- The indicator rests on the current page's link while closed.
- The indicator moves under the open trigger.
- The indicator follows an item added later as it grows. Web components only.

**Find in page**

- Find in page opens the item whose closed panel matched.

**Nested**

- A nested menu adds no second navigation landmark.
- Escape closes only the nested panel, then the outer one.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while opening a panel and tabbing through it.

Runs in React, Vue and web components.
