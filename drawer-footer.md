# Drawer — Footer (button bar)

## Overview

Describes the purpose of the drawer footer and its functional requirements.

### What is it?

Drawer is a temporary, focused region that supports a small, self-contained action, such as choosing an option, confirming a decision, or entering a few fields, without leaving the current screen. It's designed to briefly pause the primary flow, allow the completion of tasks and then return directly to the prior context.

The footer is a button bar pinned to the bottom of the drawer. It hosts the primary and secondary actions that complete or abandon the task.

### Functional requirements

- Provide a modal surface that spans the full height of the viewport, preventing interaction with background content while open.
- Support `variant="primary" | "secondary" | "tertiary"` with `primary` as the default.
- Support `position="left" | "right" | "top" | "bottom"` with `left` as the default.
- Provide a scrollable content area that does not move the footer.
- Render a Button bar pinned to the bottom for primary/secondary actions.
- Always pair the footer with the drawer's content area. The footer stays pinned because the content area absorbs the drawer's free space, so a footer without a content area is not supported.
- Footer actions may close the drawer; when they do, focus returns per the focus rules below.
- Support `disableScrim` to prevent scrim rendering while maintaining modal behavior (background remains non-interactive).

## Keyboard interaction summary

| Key                                                                     | Function                                                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd> (and <kbd>Shift</kbd> + <kbd>Tab</kbd>)                  | Navigate between components (ie., tabs > list > data grid)                                                             |
| Arrows                                                                  | Navigate within components (ie., between tabs, list items, grid rows); Open components (ie., dropdown, tree nodes)     |
| <kbd>Home</kbd>/<kbd>End</kbd>, <kbd>Page Up</kbd>/<kbd>Page Down</kbd> | Jump to start/end within components; Jump pages                                                                        |
| <kbd>Ctrl</kbd> & Func combos                                           | Convenient shortcuts to navigate, action, select, manipulate components or their content (ie., copy, paste, duplicate) |
| <kbd>Esc</kbd>                                                          | Close components                                                                                                       |
| Alphanumerics                                                           | Enter string into component                                                                                            |
| <kbd>Backspace</kbd>/<kbd>Delete</kbd>                                  | Remove strings/content (ie., pills)                                                                                    |
| <kbd>Enter</kbd>                                                        | Select items                                                                                                           |
| <kbd>Space</kbd>                                                        | Toggle item selection state                                                                                            |

## Position & variant

1. **Drawer opens on specified edge**

   - **Given** `position` is set to `left`/`right`/`top`/`bottom`
   - **When** the drawer opens
   - **Then** it anchors/animates from the specified edge and the button bar remains at the bottom (full-height drawer)

2. **Variant does not change interaction**
   - **Given** `variant` is `primary`, `secondary`, or `tertiary`
   - **When** the drawer is opened/closed and navigated
   - **Then** interaction rules remain the same

## Modal behavior (non-negotiable)

1. **Drawer is always modal**
   - **Given** the drawer is open
   - **When** background content is not interactive
   - **Then** focus is contained within the drawer until it closes
   - **And** focus is moved into the drawer

## Footer interactions (button bar)

1. **Button bar is pinned**

   - **Given** the drawer is open and the button bar is present
   - **When** the user scrolls long drawer content
   - **Then** the Button bar remains pinned to the bottom edge of the drawer and only the content area scrolls

2. **Activate footer actions**
   - **Given** footer actions are present
   - **When** the user activates an action (click/tap or <kbd>Space</kbd>/<kbd>Enter</kbd>)
   - **Then** the product-defined action occurs and if the action closes the drawer, focus returns per Focus & keyboard

## Overflow dividers

The bottom overflow divider separates the scrollable content area from the button bar below it. It is inset left and right by `spacing-300` and is consistent with `Dialog`.

1. **Bottom divider appears while content remains below**

   - **Given** the content area overflows vertically
   - **When** there is more content below the visible area
   - **Then** a divider appears between the content area and the button bar
   - **And** it is removed once the content is scrolled to the end

2. **No divider when the content fits**
   - **Given** the content area does not overflow vertically
   - **When** the drawer renders
   - **Then** no divider is shown above the button bar

> **Note:** there is no spacing between the divider and the body content / overflow content.

## Accessibility specs

### Focus and keyboard

1. **Focus moves into drawer on open**
   - **Given** the user opens the drawer
   - **When** the drawer finishes opening
   - **Then** focus is moved into the drawer and placed on the most appropriate target:
     - drawer's close button, or
     - the first interactive element inside the drawer (e.g., the first form field or primary control)
   - **And** focus is never left on, or moved to, content behind the modal drawer

### Focus trap

1. **Tab stays within drawer**
   - **Given** the drawer is open
   - **When** the user presses <kbd>Tab</kbd>/<kbd>Shift</kbd> + <kbd>Tab</kbd>
   - **Then** focus cycles through focusable elements within the drawer only, including the footer actions

### Focus return

1. **Focus returns on close**
   - **Given** the drawer closes
   - **When** focus returns to the trigger
   - **Or** a logical fallback target if the opener no longer exists
