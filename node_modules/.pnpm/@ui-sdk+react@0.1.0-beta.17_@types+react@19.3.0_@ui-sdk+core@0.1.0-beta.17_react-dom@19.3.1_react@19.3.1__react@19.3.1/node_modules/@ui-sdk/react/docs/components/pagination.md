# Pagination

Navigate pages with buttons, links, or your router.

```tsx title="basic.tsx"
"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <Pagination
      aria-label="Pagination"
      pageCount={10}
      onPageChange={(page, details) => log(`Page ${page} (${details.reason})`)}
    >
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious data-variant="ghost">
                <ChevronLeftIcon />
                <span data-slot="visually-hidden">Previous</span>
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink data-variant="ghost" page={item} />
                ) : (
                  <PaginationEllipsis>
                    <EllipsisIcon />
                  </PaginationEllipsis>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext data-variant="ghost">
                <span data-slot="visually-hidden">Next</span>
                <ChevronRightIcon />
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}

export { Example }
```

Choose a page, or use Previous and Next. The console logs each page and its reason, and the step at either end stays focusable as a button.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Pagination`:

```text
Pagination
└── PaginationList
    ├── PaginationItem
    │   └── PaginationPrevious
    ├── PaginationItem
    │   └── PaginationLink
    ├── PaginationItem
    │   └── PaginationEllipsis
    ├── PaginationItem
    │   └── PaginationLink
    └── PaginationItem
        └── PaginationNext
```

Name the navigation with `aria-label`, then put the page links and steps in a list.

`items` contains page numbers and the strings `"ellipsis-start"` and `"ellipsis-end"`. Render a link for each number and an ellipsis for each gap. Key entries by the item itself so a page link keeps its element as the range moves.

`PaginationLink` shows its page number unless you supply children. The current link gets `aria-current="page"` and `data-current`. `PaginationEllipsis` shows “…” and is hidden from screen readers.

Give Previous, Next, First, and Last text or an `aria-label`. At an end, a step gets `aria-disabled="true"` and `data-disabled` and stops changing the page. As a button, it stays in the tab order. Set `disabled` on the root to do the same for every page and step, like while results load. A controller still changes the page.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"

function PageNavigation() {
  return (
    <Pagination aria-label="Pagination" pageCount={10}>
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious>Previous</PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink page={item} />
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext>Next</PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}

export { PageNavigation }
```

## Total and Page Size

Instead of `pageCount`, pass `total`, how many items there are, and `pageSize`, how many fit on a page (10 by default). Pagination calculates the page count, with a minimum of one. This example resets to page 1 when the page size changes.

A page past the end, like after the count shrinks, reads as the last page.

```tsx title="total.tsx"
"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [page, setPage] = React.useState(2)
  const [pageSize, setPageSize] = React.useState(20)
  const total = 95

  return (
    <div data-slot="stack">
      <div data-slot="row">
        <p>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
          of {total}
        </p>
        <label data-slot="label">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
              log(`${event.target.value} rows per page`)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <Pagination
        aria-label="Pagination"
        total={total}
        pageSize={pageSize}
        page={page}
        onPageChange={(next) => {
          setPage(next)
          log(`Page ${next}`)
        }}
      >
        <PaginationList>
          {({ items }) => (
            <>
              <PaginationItem>
                <PaginationPrevious data-variant="ghost">
                  <ChevronLeftIcon />
                  <span data-slot="visually-hidden">Previous</span>
                </PaginationPrevious>
              </PaginationItem>
              {items.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink data-variant="ghost" page={item} />
                  ) : (
                    <PaginationEllipsis>
                      <EllipsisIcon />
                    </PaginationEllipsis>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext data-variant="ghost">
                  <span data-slot="visually-hidden">Next</span>
                  <ChevronRightIcon />
                </PaginationNext>
              </PaginationItem>
            </>
          )}
        </PaginationList>
      </Pagination>
    </div>
  )
}

export { Example }
```

Choose a page, then change Rows per page. The console logs each change, and a new size starts again at page 1.

## Simple

With only a few pages, the range has no gaps, so you can write the links out and leave the steps off.

```tsx
<Pagination aria-label="Pagination" pageCount={5}>
  <PaginationList>
    {[1, 2, 3, 4, 5].map((page) => (
      <PaginationItem key={page}>
        <PaginationLink page={page} />
      </PaginationItem>
    ))}
  </PaginationList>
</Pagination>
```

## Links

Pass `getHref` to map each page to a URL. Page links and steps then render as anchors.

```tsx
<Pagination
  aria-label="Pagination"
  pageCount={10}
  getHref={(page) => `/posts?page=${page}`}
>
  ...
</Pagination>
```

Server-rendered anchors work before JavaScript loads. A normal click changes the page and follows the URL. Modifier clicks and middle clicks leave pagination state alone so the browser can open the link elsewhere.

A step at its end loses its `href` and leaves the tab order, but keeps focus if it already had it. During navigation, its original `href` stays in place so Next cannot accidentally follow the next page's URL.

## Router Links

Render your router's link to page on the client. Pass it to `render`, like `render={<Link />}`; it receives the part's props, with the `href` from [`getHref`](#links). The pagination's click handler runs first: when a change is canceled or a step is at its end, it calls `preventDefault()`, and the router leaves the link alone.

Read the page from the URL, like your router's search params, so the route [controls](#controlled) the pagination.

```tsx
const page = Number(searchParams.get("page") ?? 1)

<Pagination aria-label="Pagination" pageCount={10} page={page} getHref={(page) => `?page=${page}`}>
  <PaginationList>
    {({ items }) =>
      items.map((item) => (
        <PaginationItem key={item}>
          {typeof item === "number" ? (
            <PaginationLink page={item} render={<Link />} />
          ) : (
            <PaginationEllipsis />
          )}
        </PaginationItem>
      ))
    }
  </PaginationList>
</Pagination>
```

## Controlled

Pass `page` and `onPageChange` to control the pagination.

```tsx
const [page, setPage] = React.useState(1)

<Pagination aria-label="Pagination" pageCount={10} page={page} onPageChange={setPage}>
  ...
</Pagination>
```

Every change carries a [reason](#reasons): `item-press` for a page, `previous-press`, `next-press`, `first-press` or `last-press` for a step, and `imperative` from a [controller](#controller). Call `details.cancel()` to keep the page, like while a form has unsaved changes. A canceled change also stops a link from navigating.

## Default Page

`defaultPage` is the page it starts on, when uncontrolled. It's 1 by default.

```tsx
<Pagination aria-label="Pagination" pageCount={10} defaultPage={5}>
  ...
</Pagination>
```

## Siblings

`siblings` is how many pages show on each side of the current one, 1 by default. Near an end, the window slides over instead of shrinking, keeping the range length stable. A gap of one page shows that page instead of an ellipsis.

```tsx
<Pagination
  aria-label="Pagination"
  pageCount={20}
  defaultPage={10}
  siblings={2}
>
  ...
</Pagination>
```

## Boundaries

`boundaries` is how many pages always show at each end, 1 by default.

```tsx
<Pagination
  aria-label="Pagination"
  pageCount={20}
  defaultPage={10}
  boundaries={2}
>
  ...
</Pagination>
```

## Paging from Anywhere

A [controller](#controller), from `createPaginationController()`, pages the pagination from anywhere, like buttons elsewhere on the page or a keyboard shortcut, without controlling it. Pass it as `controller`.

```tsx
const [pagination] = React.useState(() => createPaginationController())

<button onClick={() => pagination.next()}>Next Page</button>
<Pagination aria-label="Pagination" pageCount={10} controller={pagination}>
  ...
</Pagination>
```

## Your Own Markup

`paginationRange({ page, pageCount, siblings, boundaries })` is the range the parts use, as a pure function. It runs anywhere, like on the server, in an email or for a UI that isn't a list of pages. In a Server Component, import it from `@ui-sdk/core/pagination`. Here it keeps a strip of slide dots the same length however many slides there are.

```tsx
import { paginationRange } from "@ui-sdk/core/pagination"

const items = paginationRange({ page: slide, pageCount: 20, siblings: 2, boundaries: 1 })

<div role="group" aria-label="Slides">
  {items.map((item) =>
    typeof item === "number" ? (
      <button
        key={item}
        aria-label={`Slide ${item}`}
        aria-current={item === slide ? "true" : undefined}
        onClick={() => setSlide(item)}
      />
    ) : (
      <span key={item} aria-hidden />
    ),
  )}
</div>
```

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. `className`, `style` and `children` can be functions of the same state: whether a link is `current`, and for a step, the `page` it goes to and whether it's `disabled`.

```tsx title="render.tsx"
"use client"

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

function Example() {
  return (
    <Pagination aria-label="Pagination" pageCount={10}>
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious
                aria-label="Previous page"
                render={(props, state) => (
                  <button {...props} title={ state.disabled ? undefined : `Go to page ${state.page}` } />
                )}
              >
                {(state) => (
                  <>
                    <ArrowLeftIcon aria-hidden="true" />
                    {!state.disabled && (
                      <span aria-hidden="true">{state.page}</span>
                    )}
                  </>
                )}
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink page={item}>
                    {(state) =>
                      state.current ? `Page ${state.page}` : state.page
                    }
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                aria-label="Next page"
                render={(props, state) => (
                  <button {...props} title={ state.disabled ? undefined : `Go to page ${state.page}` } />
                )}
              >
                {(state) => (
                  <>
                    {!state.disabled && (
                      <span aria-hidden="true">{state.page}</span>
                    )}
                    <ArrowRightIcon aria-hidden="true" />
                  </>
                )}
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}

export { Example }
```

Choose a page. The current page widens to say Page 3, and each arrow shows the page it goes to.

## Styling

Parts are unstyled. Style them through the attributes they render, which are the same in every framework: `aria-current="page"` or `data-current` on the current page's link, and `aria-disabled` or `data-disabled` on a step at its end.

Each part has a `data-slot`, such as `pagination-link`, and its state attributes are listed under [Data Attributes](#data-attributes). The root, list, items and ellipsis have none.

## Data Attributes

### PaginationLink
`[data-slot="pagination-link"]`

- `data-current`: Present on the current page's link, beside `aria-current="page"`.

### PaginationPrevious
`[data-slot="pagination-previous"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### PaginationNext
`[data-slot="pagination-next"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### PaginationFirst
`[data-slot="pagination-first"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

### PaginationLast
`[data-slot="pagination-last"]`

- `data-disabled`: Present on a step at the end it goes to, beside `aria-disabled`. It stays focusable and does nothing.

## API Reference

Props and callbacks are the same as below, as React props.

### Pagination

- `page?` (`number`): The current page, from 1. Pass it to control the pagination.
- `defaultPage?` (`number`): The page it starts on, when uncontrolled.
- `onPageChange?` (`((page: number, details: ChangeDetails<PaginationPageChangeReason>) => void)`): Runs when the page wants to change: a page link (`"item-press"`), the Previous, Next, First or Last part, or a controller (`"imperative"`). `details.cancel()` keeps the page, and stops a link from navigating.
- `pageCount?` (`number`): How many pages there are. Or pass `total` and `pageSize`.
- `total?` (`number`): How many items there are, for `pageCount` from `pageSize`.
- `pageSize?` (`number`): How many items fit on a page, with `total`.
- `siblings?` (`number`): How many pages show on each side of the current one.
- `boundaries?` (`number`): How many pages always show at each end.
- `getHref?` (`((page: number) => string)`): The URL of a page. With it, parts are links: they navigate, open in a new tab with a modifier key, and work before JavaScript loads. Without it, they're buttons.
- `disabled?` (`boolean`): Whether every page and step does nothing, like a step at its end. A controller still pages it.
- `controller?` (`object`): Pages it from anywhere. Create one with `createPaginationController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### PaginationLink

- `page` (`number`): The page the link goes to, from 1.

`PaginationList`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationFirst`, `PaginationLast` and `PaginationEllipsis` take no props of their own.

### State

What render functions, state-based class names and slots receive, per part.

`Pagination` and `PaginationList`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number`): How many pages there are.
- `items` (`PaginationRangeItem[]`): The pages to show, with an ellipsis for each gap. Render a PaginationLink or a PaginationEllipsis for each.

`PaginationLink`:

- `page` (`number`): The page it goes to, from its `page` prop.
- `current` (`boolean`): Whether it's the current page.

`PaginationPrevious`, `PaginationNext`, `PaginationFirst` and `PaginationLast`:

- `page` (`number`): The page it goes to.
- `disabled` (`boolean`): Whether it's at the end it goes to, or the pagination is disabled, so it does nothing.

### Reasons

`details.reason` says why the page changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `first-press` (`MouseEvent | KeyboardEvent`): A pagination's First part was pressed.
- `last-press` (`MouseEvent | KeyboardEvent`): A pagination's Last part was pressed.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createPaginationController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, passed to `onPageChange`, and returns `false` when the change is canceled or there's nowhere to go.

- `getPage()` (`() => number`): The current page, from 1.
- `getPageCount()` (`() => number`): How many pages there are.
- `setPage(page, options?)` (`(page: number, options?: PaginationChangeOptions | undefined) => boolean`): Goes to a page, clamped to the range. Returns false when canceled or already there.
- `next(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the next page. Returns false on the last page.
- `previous(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the previous page. Returns false on the first page.
- `first(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the first page.
- `last(options?)` (`(options?: PaginationChangeOptions | undefined) => boolean`): Goes to the last page.

### Events

Callbacks get the new page first, then the details.

| Prop           | On           | Receives                                                    |
| -------------- | ------------ | ----------------------------------------------------------- |
| `onPageChange` | `Pagination` | `(page, details)`: the new page, and the [reason](#reasons) |

## Accessibility

There's no WAI-ARIA pattern for pagination. It follows the common practice: a `navigation` landmark named with `aria-label`, a list of links or buttons, and `aria-current="page"` on the current one. The list keeps the `list` role even when styled without bullets, which Safari would otherwise drop.

### Focus

Steps rendered as buttons stay focusable at the ends. A clicked page link keeps focus as the range moves; the primitive also tries to restore focus to that page or step if rendering replaces its element. Key range entries by their value rather than their index.

### Tested Behavior

Every line below is an automated test.

- The pagination is a named navigation landmark with a list of pages.
- The first page is current to start with, or the default page.
- Pressing a page goes there.
- Enter on a focused page goes there.
- Space on a focused page goes there.
- Next and Previous step one page.
- First and Last go to the ends.
- First and Previous say they're disabled on the first page, and do nothing.
- Next and Last say they're disabled on the last page, and do nothing.
- A single page has nothing to step to.
- Siblings and boundaries widen the range.
- Ellipses are hidden from screen readers.
- With getHref, pages and steps are links to their pages.
- A link at an end has no href and says it's disabled.
- Pressing a link goes to its page and follows it.
- A change can be canceled.
- A canceled change stops a link from navigating.
- The controller pages it from outside.
- A controlled pagination follows its owner. React and Vue only.

Runs in React, Vue and web components.

Beyond the baseline:

- Pressing Next onto the last page keeps focus on Next.
- Pressing Previous onto the first page keeps focus on Previous.
- Paging through every page with the keyboard never loses focus.
- Pressing a page keeps focus on it while the range moves around it.
- Focus comes back to the same part when the list renders again from scratch. React and Vue only.
- The list has the same number of entries on every page, so nothing shifts under the pointer.
- A gap of one page shows that page instead of an ellipsis.
- A link pressed with a modifier opens elsewhere and leaves the page as it is.
- The list keeps its list role when styled without bullets.
- Steps at the ends stay in the tab order and say they're disabled.
- A Next link goes to the next page, not past it, even after the page renders again.
- A Next link onto the last page still goes there, though it ends there.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while paging with a keyboard.

Runs in React, Vue and web components.
