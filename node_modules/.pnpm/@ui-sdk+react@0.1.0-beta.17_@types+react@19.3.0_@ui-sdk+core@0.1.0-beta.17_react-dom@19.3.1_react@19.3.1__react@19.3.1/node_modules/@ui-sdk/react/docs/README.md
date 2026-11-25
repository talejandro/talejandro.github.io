# @ui-sdk/react docs

The ui-sdk docs for React, as Markdown. Every page here is generated from the same source as the docs site, for the release this package came from.

Start with [llms.txt](./llms.txt): how the components fit together, then an index of every component, in one file for an agent's context. Each page below has the rest.

## Core and Agents

- [Core](./core.md): Give your agents the behaviors to build headless and accessible components, with keyboard, focus and screen reader support built in. Every Core page in one file.
- [Agents](./agents.md): ui-sdk gives agents the building blocks to create components and the tools to use them. Every Agents page in one file.

## Components

- [Accordion](./components/accordion.md): Show and hide sections of content from their headings.
- [Alert Dialog](./components/alert-dialog.md): Ask someone to confirm an action before you continue.
- [Autocomplete](./components/autocomplete.md): Suggest text while someone types, without limiting what they can enter.
- [Avatar](./components/avatar.md): Show an image with a fallback while it loads or if it fails.
- [Button](./components/button.md): Run an action, show that it's working, and keep it reachable when disabled.
- [Calendar](./components/calendar.md): Choose one date, several dates, or a range from a month grid.
- [Carousel](./components/carousel.md): Page through slides with native scrolling, keyboard controls, and optional rotation.
- [Checkbox](./components/checkbox.md): Choose one or more options, individually or as a group.
- [Collapsible](./components/collapsible.md): Show and hide a panel, preserve its contents, and animate its height.
- [Color Picker](./components/color-picker.md): Choose a color by dragging across an area and along sliders, typing any CSS color, or picking a preset.
- [Combobox](./components/combobox.md): Search a list of options and choose one or several values.
- [Command](./components/command.md): Search commands, run actions, and open pages of more choices.
- [Date Input](./components/date-input.md): Type a date one part at a time, in the order your user's language writes it.
- [Date Picker](./components/date-picker.md): Type a date or choose one from a calendar, with support for ranges and forms.
- [Dialog](./components/dialog.md): Open a focused task over the page.
- [Drawer](./components/drawer.md): A sheet you can open, drag, and resize from an edge of the screen.
- [Field](./components/field.md): Connect a form control to its label, description, and validation errors.
- [File Input](./components/file-input.md): Choose, drop, or paste files, validate them, and submit them with a form.
- [Hover Card](./components/hover-card.md): Preview a link on hover or keyboard focus while keeping its normal navigation.
- [Image Cropper](./components/image-cropper.md): Choose the part of an image to keep by moving and resizing a selection, or by panning and zooming the image under it.
- [Input](./components/input.md): Enter text, add a clear button, and connect the value to your form or state.
- [Label](./components/label.md): Name any control with a label, and let a press on the label reach it.
- [Listbox](./components/listbox.md): Choose one or several options from an always-visible list.
- [Menu](./components/menu.md): Choose actions and settings from a button or a context menu.
- [Menubar](./components/menubar.md): Move between an application’s menus with one tab stop.
- [Meter](./components/meter.md): Show a measurement within a known range, such as storage used or an account quota.
- [Navigation Menu](./components/navigation-menu.md): Groups site links into panels that open from a row of triggers.
- [Number Input](./components/number-input.md): Enter numbers, step through values, and format them for a locale.
- [OTP Input](./components/otp-input.md): Enter a one-time code with support for pasting, autofill, and native form validation.
- [Pagination](./components/pagination.md): Navigate pages with buttons, links, or your router.
- [Password Input](./components/password-input.md): Enter a password, show or hide it, and use it in a native form.
- [Popover](./components/popover.md): Edit or explore something beside its trigger.
- [Preferences](./components/preferences.md): Apply user preferences to data attributes so your styles can follow them.
- [Progress](./components/progress.md): Show a task’s progress, or an indeterminate state while its progress is unknown.
- [Radio](./components/radio.md): Choose one option, move the selection with arrow keys, and submit it with a form.
- [Rating](./components/rating.md): Pick a score from a row of stars, whole or half, with a preview as the pointer moves over them.
- [Resizable](./components/resizable.md): Resize, collapse, and save panel layouts with pointer and keyboard controls.
- [Scroll Area](./components/scroll-area.md): Add styled scrollbars, edge indicators, and follow-to-end behavior to native scrolling.
- [Segmented Control](./components/segmented-control.md): Pick one of a few options from a row of buttons, with an indicator that slides to the choice.
- [Select](./components/select.md): Choose one value or several from a popup list.
- [Separator](./components/separator.md): Divide groups of content with a horizontal or vertical line.
- [Slider](./components/slider.md): Adjust a number or a range with draggable thumbs and keyboard controls.
- [Switch](./components/switch.md): Turn a setting on or off.
- [Tabs](./components/tabs.md): Switch between related panels with one tab selected at a time.
- [Textarea](./components/textarea.md): Enter multiple lines of text, grow the field as you type, and connect it to a form.
- [Time Input](./components/time-input.md): Type a time one part at a time, on the clock your user's language uses.
- [Timeline](./components/timeline.md): Show dated events in order, like an activity feed, a changelog or an order's progress, with arrow keys between them.
- [Toast](./components/toast.md): Show notifications with actions, timed dismissal, and screen reader announcements.
- [Toggle](./components/toggle.md): Keep a button pressed, or group toggles with a shared value and arrow-key navigation.
- [Token Input](./components/token-input.md): Mix editable text with tokens for files, people, tags, and other references.
- [Toolbar](./components/toolbar.md): Give buttons, toggles, menus and fields one tab stop with arrow-key navigation.
- [Tooltip](./components/tooltip.md): Name a control or add a short hint on hover and keyboard focus.
- [Tree](./components/tree.md): Browse a hierarchy of files, pages, or choices with expandable branches.
- [Trigger Menu](./components/trigger-menu.md): "Opens suggestions at the caret when you type a trigger such as @, /, or #."
- [Waterfall](./components/waterfall.md): Show a trace or a page's requests as bars on a shared time axis, with spans that expand to show what they started.

## Hooks

- [Async Options](./hooks/async-options.md): Load search results, cancel stale requests, and fetch the next page.
- [Shortcuts](./hooks/shortcuts.md): Register keyboard shortcuts and show the right keys for the user's platform.

## Framework Guides

- [Introduction](./introduction.md): Use unstyled React components with keyboard, focus, and screen reader support built in.
- [Installation](./installation.md): Install UI SDK in your React app.
- [First Component](./first-component.md): Add a component to your app and style its state.
- [Parts and Composition](./parts-and-composition.md): Put a component's parts together and choose what each one renders.
- [State and Events](./state-and-events.md): Set an initial value, control it from React, and respond to changes.
- [Styling and Animation](./styling-and-animation.md): Style parts and their state, then add entry and exit transitions.
- [Controllers](./controllers.md): Read and change a component from outside its parts.
- [Popups](./popups.md): Place popup content, control dismissal, and choose when it stays mounted.
- [Lists and Menus](./lists-and-menus.md): Supply options as data, load them from a server, and define menu actions.
- [Forms](./forms.md): Submit component values, label controls, and show validation errors.
- [Server Rendering](./server-rendering.md): Render the initial HTML on the server and add interactions when React hydrates.
- [Rendering Primitives](./rendering.md): Turn a Core primitive into React components with createParts.
- [Custom Parts](./custom-parts.md): Write a part with its own React logic and connect it to a primitive.
