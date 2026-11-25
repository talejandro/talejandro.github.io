# Tabs

Switch between related panels with one tab selected at a time.

Use Tabs when several views share the same space, such as settings sections or a preview and its source. Each tab opens the panel with the same value.

<ComponentExample
  name="tabs/basic"
  inspect
  caption="Choose Password to show its panel. Use the left and right arrow keys to move between the tabs."
/>

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Tabs`:

```text
Tabs
├── TabsList
│   ├── TabsTab
│   └── TabsTab
├── TabsPanel
└── TabsPanel
```

Give each tab and its panel the same unique `value`. Give the list an accessible name. Set `defaultValue` to choose the initial tab; otherwise, the first enabled tab is selected. On the server, panels that render before the list don't know that tab yet, so a layout with the panels first, like a bottom tab bar, needs `defaultValue` or a controlled `value` to render its panel before hydration.

## Usage

Import the parts and put them together:

```tsx
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="password">Password</TabsTab>
      </TabsList>
      <TabsPanel value="account">Manage your profile.</TabsPanel>
      <TabsPanel value="password">Choose a new password.</TabsPanel>
    </Tabs>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/tabs` comes with ready-made Tabs. If you'd like to build your own, with your own names, start from the `tabs` primitive in `@ui-sdk/core`:

```ts title="segments.ts"
"use client"

import { tabs } from "@ui-sdk/core/tabs"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: Segments,
  List: SegmentList,
  Tab: Segment,
  Panel: SegmentPanel,
} = createParts(tabs, { root: "div", list: "div", tab: "button", panel: "div" })

export { Segment, SegmentList, SegmentPanel, Segments }
```

```tsx
<Segments defaultValue="day">
  <SegmentList aria-label="Range">
    <Segment value="day">Day</Segment>
    <Segment value="week">Week</Segment>
  </SegmentList>
  <SegmentPanel value="day">128 visitors today.</SegmentPanel>
  <SegmentPanel value="week">1,024 visitors this week.</SegmentPanel>
</Segments>
```

Add `"tab-icon": "span"` and `indicator: "span"` to the elements to get the `TabIcon` and `Indicator` parts too. Each part keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` to use Up and Down Arrow instead. Style the list as a column beside the panels to match.

```tsx title="vertical.tsx"
"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="general" orientation="vertical">
      <TabsList aria-label="Preferences">
        <TabsTab value="general">General</TabsTab>
        <TabsTab value="security">Security</TabsTab>
        <TabsTab value="integrations">Integrations</TabsTab>
      </TabsList>
      <TabsPanel value="general">
        Choose your language, time zone and the page you start on.
      </TabsPanel>
      <TabsPanel value="security">
        Manage passkeys, signed-in sessions and recovery codes.
      </TabsPanel>
      <TabsPanel value="integrations">
        Connect your calendar and chat apps to get reminders.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
```

Focus General, then press Down Arrow to choose Security. Up Arrow moves back through the vertical list.

## Disabled

Add `disabled` to a tab to prevent selection. Arrow keys can still focus it so people can discover it.

```tsx title="disabled.tsx"
"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Dashboard">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="analytics">Analytics</TabsTab>
        <TabsTab value="reports" disabled>
          Reports
        </TabsTab>
      </TabsList>
      <TabsPanel value="overview">
        Revenue, visitors and sign-ups for the last 30 days.
      </TabsPanel>
      <TabsPanel value="analytics">
        Where your visitors come from and the pages they read most.
      </TabsPanel>
      <TabsPanel value="reports">
        Monthly reports are available on the Pro plan.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
```

Use the arrow keys to reach Reports. It can receive focus, but pressing it leaves the current panel selected.

## Icons

Put decorative icons in `TabsTabIcon` so they stay out of the tab’s accessible name. Add `mirror` to directional icons, such as Reply, to flip them in right-to-left text. An icon-only tab still needs an `aria-label`.

```tsx title="icons.tsx"
"use client"

import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  TabsTabIcon,
} from "@ui-sdk/react/tabs"
import { ArchiveIcon, MailIcon, ReplyIcon } from "lucide-react"

function Example() {
  return (
    <Tabs defaultValue="inbox">
      <TabsList aria-label="Mail">
        <TabsTab value="inbox">
          <TabsTabIcon>
            <MailIcon />
          </TabsTabIcon>
          Inbox
        </TabsTab>
        <TabsTab value="replies">
          <TabsTabIcon mirror>
            <ReplyIcon />
          </TabsTabIcon>
          Replies
        </TabsTab>
        <TabsTab value="archive">
          <TabsTabIcon>
            <ArchiveIcon />
          </TabsTabIcon>
          Archive
        </TabsTab>
      </TabsList>
      <TabsPanel value="inbox">
        3 new messages from Inès Moreau and Kofi Mensah.
      </TabsPanel>
      <TabsPanel value="replies">
        Wren Takahashi replied to your message about the launch.
      </TabsPanel>
      <TabsPanel value="archive">
        Messages you archived stay here and in search.
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
```

Choose Replies. Its directional icon mirrors when the surrounding page uses right-to-left text.

## Manual Activation

Set `activation="manual"` when opening a panel takes time, such as a view that fetches data. Arrow keys move focus; Enter or Space selects the focused tab.

```tsx
<Tabs activation="manual" />
```

A panel becomes a tab stop only when it has no focusable content. A panel with a field lets Tab go straight to the field.

```tsx title="manual.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="preview" activation="manual">
      <TabsList aria-label="Snippet">
        <TabsTab value="preview">Preview</TabsTab>
        <TabsTab value="code">Code</TabsTab>
      </TabsList>
      <TabsPanel value="preview">
        Welcome back, Hollis. You have 3 unread messages.
      </TabsPanel>
      <TabsPanel value="code">
        <Field>
          <FieldLabel>Source</FieldLabel>
          <Input defaultValue='<Welcome name="Hollis" unread={3} />' />
        </Field>
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
```

Focus Preview, then press Right Arrow. Code receives focus; press Enter or Space to show its panel. Tab then moves into the Source field.

## Loop

Arrow keys normally wrap around at either end. Set `loop={false}` to stop there instead.

```tsx title="loop.tsx"
"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const ranges = [
  {
    value: "day",
    label: "Day",
    content: "128 visitors today, up 12% from yesterday.",
  },
  {
    value: "week",
    label: "Week",
    content: "1,024 visitors this week, up 8% from last week.",
  },
  {
    value: "month",
    label: "Month",
    content: "4,210 visitors this month, down 3% from last month.",
  },
  {
    value: "year",
    label: "Year",
    content: "48,930 visitors this year, up 21% from last year.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="day" loop={false}>
      <TabsList aria-label="Range">
        {ranges.map((range) => (
          <TabsTab key={range.value} value={range.value}>
            {range.label}
          </TabsTab>
        ))}
      </TabsList>
      {ranges.map((range) => (
        <TabsPanel key={range.value} value={range.value}>
          {range.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
```

Focus Year and press Right Arrow. Focus stays at the end because looping is off.

## Indicator

`TabsIndicator` measures the selected tab. Position it inside a relative tab list and use its [CSS variables](#styling-tabsindicator) to make a marker that follows the selection. It measures again when a tab or the list changes size.

```css
[data-slot="tabs-list"] {
  position: relative;
}

[data-slot="tabs-indicator"] {
  position: absolute;
  top: var(--active-tab-top);
  left: var(--active-tab-left);
  width: var(--active-tab-width);
  height: var(--active-tab-height);
  transition-property: top, left, width, height;
  transition-duration: 200ms;

  &[data-activation-direction="none"] {
    transition: none;
  }
}
```

Add transitions for the properties you animate. Skip them while `data-activation-direction="none"` to avoid animating the first placement.

```tsx title="indicator.tsx"
"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"
import * as React from "react"

const orientations = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
] as const

function Example() {
  const [orientation, setOrientation] = React.useState<
    "horizontal" | "vertical"
  >("horizontal")

  return (
    <div>
      <div data-slot="controls" role="group" aria-label="Orientation">
        {orientations.map((option) => (
          <button
            key={option.value}
            type="button"
            data-size="sm"
            aria-pressed={orientation === option.value}
            onClick={() => setOrientation(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Tabs defaultValue="music" orientation={orientation}>
        <TabsList aria-label="Library">
          <TabsTab value="music">Music</TabsTab>
          <TabsTab value="podcasts">Podcasts</TabsTab>
          <TabsTab value="audiobooks">Audiobooks</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="music">
          312 songs in 24 albums, synced to this device.
        </TabsPanel>
        <TabsPanel value="podcasts">
          8 shows you follow, with 3 new episodes.
        </TabsPanel>
        <TabsPanel value="audiobooks">
          2 books in progress, 6 hours left in total.
        </TabsPanel>
      </Tabs>
    </div>
  )
}

export { Example }
```

Choose Podcasts, then choose Vertical. The same indicator measures and follows the selected tab in either layout.

## Keep Mounted

Panels normally unmount when another tab is selected. Add `keepMounted` to a panel to keep its content hidden in the page, preserving local state such as a draft.

```tsx title="keep-mounted.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="reply">
      <TabsList aria-label="Comment">
        <TabsTab value="reply">Reply</TabsTab>
        <TabsTab value="formatting">Formatting</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="reply" keepMounted>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <Textarea rows={3} placeholder="Write a reply…" />
        </Field>
      </TabsPanel>
      <TabsPanel value="formatting">
        <p>Use **bold**, _italics_ and `code` to format your reply.</p>
        <p>Paste a link on its own line to show a preview.</p>
      </TabsPanel>
    </Tabs>
  )
}

export { Example }
```

Write a message, switch to Formatting, then return to Reply. Your draft is still there.

## Find in Page

Add `hiddenUntilFound` to the tabs or a panel to keep closed content available to the browser’s Find command. A match selects its tab with the reason `find-in-page`. This also keeps the panel mounted.

React renders `hidden` as a boolean on the server, so these panels become findable after hydration.

```tsx title="find-in-page.tsx"
"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const policies = [
  {
    value: "shipping",
    label: "Shipping",
    text: "Orders leave our warehouse within two working days. Express delivery arrives the next morning.",
  },
  {
    value: "returns",
    label: "Returns",
    text: "Send anything back within 30 days. Opened electronics carry a restocking fee of 10 percent.",
  },
  {
    value: "warranty",
    label: "Warranty",
    text: "Every product has a two-year warranty. Batteries are covered for one year from delivery.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="shipping" hiddenUntilFound>
      <TabsList aria-label="Policies">
        {policies.map((policy) => (
          <TabsTab key={policy.value} value={policy.value}>
            {policy.label}
          </TabsTab>
        ))}
      </TabsList>
      {policies.map((policy) => (
        <TabsPanel key={policy.value} value={policy.value}>
          {policy.text}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
```

Use your browser’s Find command to search for “restocking fee”. Returns opens to reveal the match.

## Animation

Panels expose `data-starting-style` as they enter and `data-ending-style` as they leave. The previous panel stays mounted through its exit animation, then unmounts or hides if it is kept mounted.

Use `data-activation-direction` to choose a slide direction. Put the panels in the same grid cell so they overlap during the transition, as this example does.

```tsx title="animation.tsx"
"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
        <TabsIndicator />
      </TabsList>
      <div data-slot="stack">
        <TabsPanel value="overview">
          The launch is on track for Friday, with 4 of 6 tasks done.
        </TabsPanel>
        <TabsPanel value="activity">
          Inès Moreau deployed to production and Kofi Mensah left a review.
        </TabsPanel>
        <TabsPanel value="settings">
          Rename the project, transfer it to another team or archive it.
        </TabsPanel>
      </div>
    </Tabs>
  )
}

export { Example }
```

Move between Overview, Activity and Settings. The panels slide in the direction you moved.

## Controlled

Use `value` and `onValueChange` to own the selected tab. [State and Events](../state-and-events.md) covers the shared pattern. Call `details.cancel()` in the change callback to reject a change.

`onValueChange` receives the new value and a [reason](#reasons), such as `item-press`, `list-navigation`, or `imperative`. It does not run for the initial selection. A [controller](../controllers.md) lets another control select a tab too.

```tsx title="controlled.tsx"
"use client"

import { createTabsController } from "@ui-sdk/core/tabs"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [tabs] = React.useState(() => createTabsController())
  const [value, setValue] = React.useState<string | null>("inbox")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => tabs.select("sent")}>
          Show Sent Mail
        </button>
      </div>
      <Tabs
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(`value: ${next} (${details.reason})`)
        }}
        controller={tabs}
      >
        <TabsList aria-label="Mail">
          <TabsTab value="inbox">Inbox</TabsTab>
          <TabsTab value="drafts">Drafts</TabsTab>
          <TabsTab value="sent">Sent</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="inbox">
          3 unread messages from Hollis Grant and Inès Moreau.
        </TabsPanel>
        <TabsPanel value="drafts">
          2 drafts, the last one edited yesterday at 4:12 PM.
        </TabsPanel>
        <TabsPanel value="sent">
          12 messages sent this week, all delivered.
        </TabsPanel>
      </Tabs>
    </div>
  )
}

export { Example }
```

Choose Drafts, then press Show Sent Mail. The console logs each new value with its reason.

## Links

Render a tab as a link when selection should navigate. It keeps its tab role; arrow keys follow the link when they select it. Modified clicks, such as Cmd-click, keep their normal browser behavior without selecting the tab.

```tsx
<TabsTab value="activity" render={<a href="#activity" />}>
  Activity
</TabsTab>
```

```tsx title="links.tsx"
"use client"

import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"

const pages = [
  {
    value: "overview",
    href: "#project-overview",
    label: "Overview",
    content:
      "Hollis Grant started this project in March. It has 14 open issues.",
  },
  {
    value: "activity",
    href: "#project-activity",
    label: "Activity",
    content:
      "Wren Takahashi merged 3 pull requests and closed 5 issues this week.",
  },
  {
    value: "members",
    href: "#project-members",
    label: "Members",
    content:
      "Hollis Grant owns the project. Wren Takahashi and 3 others can edit it.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project">
        {pages.map((page) => (
          <TabsTab
            key={page.value}
            value={page.value}
            render={<a href={page.href} />}
          >
            {page.label}
          </TabsTab>
        ))}
        <TabsIndicator />
      </TabsList>
      {pages.map((page) => (
        <TabsPanel key={page.value} value={page.value}>
          {page.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
```

Choose Activity. Its panel opens and the URL hash changes. Modified clicks keep the link’s usual browser behavior.

## Query String

Use the URL as the source of the selected value, and validate it against your tab values. Read the parameter on the server when possible, then pass it as the controlled value. Write changes through your router so browser navigation and the rendered page stay in sync. For a plain client page, keep the rest of the URL when updating it:

```ts
function saveSelectedTab(value: string | null) {
  const url = new URL(location.href)
  if (value === null) {
    url.searchParams.delete("tab")
  } else {
    url.searchParams.set("tab", value)
  }
  history.replaceState(null, "", url)
}
```

Call this from `onValueChange` after accepting the value. Read it again on `popstate` if your page uses browser history directly; remove that listener when the view unmounts.

## URL Hash

A hash such as `#activity` works on a client-rendered page. Read it after mount and on `hashchange`, then select the matching tab. Setting `location.hash` adds a history entry. The server cannot read the hash, so give the page an initial tab while it loads.

## Route Tabs

When each tab is a route, render [links](#links) and derive the controlled value from the current path. Let navigation update the value. You do not also need a change handler that navigates to the same route.

## Scroll into View

If the list scrolls, selecting a tab scrolls it into view inside that list, whether you click it, reach it with an arrow key, or select it through a controller or the URL.

## Custom Rendering

Use `render` to change a part’s element or add to its content, as in the [links](#links) example. [Parts and Composition](../parts-and-composition.md) covers the shared rendering API. Each part’s state is listed under [State](#state).

```tsx title="render.tsx"
"use client"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    count: 12,
    content: "12 conversations, 3 of them unread.",
  },
  {
    value: "unread",
    label: "Unread",
    count: 3,
    content: "Hollis Grant, Inès Moreau and Kofi Mensah wrote to you.",
  },
  {
    value: "archived",
    label: "Archived",
    count: 0,
    content: "Nothing archived yet. Archived mail stays searchable.",
  },
]

function Example() {
  return (
    <Tabs defaultValue="inbox">
      <TabsList aria-label="Mail">
        {folders.map((folder) => (
          <TabsTab
            key={folder.value}
            value={folder.value}
            render={(props) => (
              <button {...props}>
                {props.children}
                {folder.count > 0 && (
                  <span data-slot="badge">{folder.count}</span>
                )}
              </button>
            )}
          >
            {folder.label}
          </TabsTab>
        ))}
      </TabsList>
      {folders.map((folder) => (
        <TabsPanel key={folder.value} value={folder.value}>
          {folder.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Example }
```

Each tab renders its own button with an unread count after the label. Choose Unread to see who wrote to you.

## Styling

Parts are unstyled. Use `data-selected` and `data-disabled` to style a tab, and `data-selected` on a panel that shows. `data-orientation` on every part lets one stylesheet lay out horizontal and vertical tabs. Icon parts also set `data-has-icon` on the tab and `data-has-icons` on the list, which can help align mixed text and icon tabs.

The indicator’s position and size are measured from the tab list into the variables below. Use them for an underline, a background, or a marker beside a vertical list.

Each part has a `data-slot`, such as `tabs-tab`, and its state attributes are listed under [Data Attributes](#data-attributes).

### TabsIndicator
- `--active-tab-left`: Distance from the tab list's left edge to the selected tab.
- `--active-tab-right`: Distance from the tab list's right edge to the selected tab.
- `--active-tab-top`: Distance from the tab list's top edge to the selected tab.
- `--active-tab-bottom`: Distance from the tab list's bottom edge to the selected tab.
- `--active-tab-width`: Width of the selected tab.
- `--active-tab-height`: Height of the selected tab.

## Data Attributes

### Tabs
`[data-slot="tabs"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.

### TabsList
`[data-slot="tabs-list"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-has-icons`: Present while any tab inside holds an icon part, so items without one can line up.

### TabsTab
`[data-slot="tabs-tab"]`

- `data-selected`: Present on the selected tab and its panel.
- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-disabled`: Present when the tab can't be selected.
- `data-has-icon`: Present on a tab while it holds an icon part.

### TabsTabIcon
`[data-slot="tabs-tab-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### TabsIndicator
`[data-slot="tabs-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.

### TabsPanel
`[data-slot="tabs-panel"]`

- `data-selected`: Present on the selected tab and its panel.
- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between tabs.
- `data-activation-direction` (`none`, `left`, `right`, `up`, `down`): Which way the last selection moved on screen. Use it to slide panels in from the right side.
- `data-starting-style`: Present for a panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while the previous panel animates out. Style the state you animate to.

## API Reference

Props and callbacks are the same as below, as React props.

### Tabs

- `value?` (`T | null`): The selected tab's value. Pass it to control the tabs. `null` selects nothing.
- `defaultValue?` (`T | null`): The tab selected at first, when uncontrolled. Defaults to the first enabled tab, which never calls `onValueChange`.
- `onValueChange?` (`((value: T | null, details: ChangeDetails<TabsValueChangeReason>) => void)`): Runs when the selection wants to change. `details.reason` says why, and `details.cancel()` stops it.
- `orientation?` (`TabsOrientation`): Which arrow keys move between tabs: left and right, or up and down.
- `activation?` (`"automatic" | "manual"`): `"automatic"` selects a tab as soon as arrow keys focus it. `"manual"` waits for Enter or Space.
- `loop?` (`boolean`): Whether arrow keys wrap from the last tab to the first.
- `hiddenUntilFound?` (`boolean`): Keeps hidden panels in the page as `hidden="until-found"`, so the browser's find in page can match their text and select their tab. Implies `keepMounted`.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, options?: TabsChangeOptions) => boolean; select: (value: T, options?: TabsChangeOptions) => boolean; focus: () => void; }`): Selects tabs from anywhere. Create one with `createTabsController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TabsList

The list takes no options of its own, only the props of the element it renders.

### TabsTab

- `value` (`string`): Identifies the tab and pairs it with the panel of the same value.
- `disabled?` (`boolean`): Keeps the tab focusable but stops it from being selected, as the tabs pattern asks.

### TabsTabIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### TabsIndicator

The indicator takes no props of its own. Its [CSS variables](#styling-tabsindicator) hold the selected tab's box.

### TabsPanel

- `value` (`string`): The value of the tab this panel belongs to.
- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while its tab isn't selected.
- `hiddenUntilFound?` (`boolean`): Whether the panel stays findable with `hidden="until-found"` while its tab isn't selected. Overrides the tabs'.

### State

What render functions, state-based class names and slots receive, per part.

`Tabs`:

- `value` (`T | null`): The selected tab's value.
- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.
- `direction` (`Direction`): Which way the last selection moved.

`TabsList`:

- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.

`TabsTab`:

- `selected` (`boolean`): Whether this tab's value is the tabs' `value`.
- `disabled` (`boolean`): Whether this tab can't be selected.

`TabsTabIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`TabsPanel`:

- `selected` (`boolean`): Whether this panel's tab is selected. False while it animates out.

`TabsIndicator`:

- `orientation` (`TabsOrientation`): The tabs' `orientation` option, or `"horizontal"` when it's unset or invalid.
- `direction` (`Direction`): Which way the last selection moved.

### Reasons

`details.reason` says why the selection changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `item-removed` (`none`): The selected item left the page, and another was picked.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createTabsController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs `onValueChange` like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T | null`): The selected tab's value, or null when nothing is selected.
- `setValue(value, options?)` (`(value: T | null, options?: TabsChangeOptions | undefined) => boolean`): Selects a tab, or nothing with `null`. Disabled tabs never select. Returns false when canceled.
- `select(value, options?)` (`(value: T, options?: TabsChangeOptions | undefined) => boolean`): Selects a tab, the same as `setValue`.
- `focus()` (`() => void`): Moves focus to the selected tab, or the tab that holds the tab stop.

### Events

Callbacks get the new value first, then the details. `onValueChange` never runs on mount.

| Prop            | On     | Receives                                                      |
| --------------- | ------ | ------------------------------------------------------------- |
| `onValueChange` | `Tabs` | `(value, details)`: the new value, and the [reason](#reasons) |

## Accessibility

Tabs follow the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). The list is a `tablist`, each tab controls its panel, and each panel is labelled by its tab.

### Keyboard

Tab enters the list at the selected tab and leaves it on the next Tab. Left and Right Arrow move between tabs and select them, or only move focus with `activation="manual"`, where Enter or Space selects. Up and Down Arrow do the same in a vertical list. Home and End move to the first and last tabs. The list reads `dir="rtl"` from the page or any ancestor, and Left and Right follow the reading direction, with no provider.

### Tested Behavior

Every line below is an automated test.

**Selection**

- The default tab is selected and shows its panel.
- Clicking a tab selects it and shows its panel.
- Clicking a disabled tab does nothing.
- Clicking the selected tab keeps it selected.
- A change can be cancelled.
- Without a default value, the first enabled tab is selected.
- Without a default value, the first render already selects the first enabled tab.

**Keyboard navigation**

- Tab moves focus to the selected tab.
- ArrowRight and ArrowLeft move focus and select the tab.
- Disabled tabs are focusable but never selected.
- Focus wraps at both ends.
- Home and End move to the first and last tabs.
- ArrowUp and ArrowDown do nothing in a horizontal tab list.
- Arrow keys with a modifier are left to the browser.
- Keys pressed in quick succession are never lost.
- Tab moves focus from the tab list into the selected panel.
- Shift+Tab from the panel returns to the selected tab.

**Manual activation**

- Arrow keys move focus without selecting.
- Enter selects the focused tab.
- Space selects the focused tab.
- Enter on a disabled tab does nothing.

**Vertical**

- The tab list reports its orientation.
- ArrowDown and ArrowUp move between tabs.
- ArrowLeft and ArrowRight do nothing in a vertical tab list.

**Panels**

- The selected tab controls its panel, and the panel is labelled by its tab.
- With keepMounted, hidden panels stay in the page.
- With keepMounted, a class that sets display doesn't show hidden panels.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- In manual mode, re-entering the tab list focuses the selected tab.
- A panel that holds a field is not a tab stop of its own.
- A controller selects a tab from anywhere.
- An infinite exit animation still unmounts the panel.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the tabs with a keyboard.

Runs in React, Vue and web components.
