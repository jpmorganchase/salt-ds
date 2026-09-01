# Drawer

## Overview

Describes the purpose of the component and its functional requirements.

### What is it?

Drawer is a temporary, focused region that supports a small, self-contained action, such as choosing an option, confirming a decision, or entering a few fields, without leaving the current screen. It's designed to briefly pause the primary flow, allow the completion of tasks and then return directly to the prior context.

### Functional requirements

List out the features and functions the component must provide.

- Provide a modal surface that spans the full height of the viewport, preventing interaction with background content while open.
- Support `variant="primary" | "secondary" | "tertiary"` with `primary` as the default.
- Support `position="left" | "right" | "top" | "bottom"` with `left` as the default.
- Render a Header block at the top, including:
  - Heading with optional preheader and description
  - Optional accent/status styling for messaging emphasis
  - A Close button to dismiss the drawer
- Provide a scrollable content area that does not move the header or footer.
- Render a Button bar pinned to the bottom for primary/secondary actions.
- Provide dismissal behaviors:
  - Close via the header Close button (pointer and keyboard <kbd>Space</kbd>/<kbd>Enter</kbd>)
  - Close via <kbd>Escape</kbd> (when enabled by the application and not conflicting with in-drawer interactions)
  - Close via scrim click when scrim is present
- Support `disableScrim` to prevent scrim rendering while maintaining modal behavior (background remains non-interactive).

## Accessibility specs

### Focus sequence summary

1. <kbd>Tab</kbd> + Key +

### Keyboard interaction summary

Some typical keys to use as inspiration.

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

## Drawer with header & actions

### Position & variant

1. **Drawer opens on specified edge**

   - **Given** `position` is set to `left`/`right`/`top`/`bottom`
   - **When** the drawer opens
   - **Then** it anchors/animates from the specified edge and header remains at the top; button bar remains at the bottom (full-height drawer)

2. **Variant does not change interaction**
   - **Given** `variant` is `primary`, `secondary`, or `tertiary`
   - **When** the drawer is opened/closed and navigated
   - **Then** interaction rules remain the same

### Modal behavior (non-negotiable)

1. **Drawer is always modal**
   - **Given** the drawer is open
   - **When** background content is not interactive
   - **Then** focus is contained within the drawer until it closes
   - **And** focus is moved into the drawer

### Open / close interaction

1. **Open drawer (defaults)**

   - **Given** the user is on a page with a trigger that opens a drawer
   - **When** the user activates the trigger
   - **Then** the drawer opens anchored to the left edge of the screen and uses `variant="primary"` by default
   - **And** focus is moved into the drawer

2. **Close drawer (close button)**

   - **Given** the drawer is open
   - **When** the user clicks the Close button in the header block
   - **Then** the drawer closes
   - **And** focus returns to the element that opened the drawer (or a logical return target)

3. **Close via close button (keyboard)**

   - **Given** the drawer is open and the Close button has focus
   - **When** the user presses <kbd>Space</kbd> or <kbd>Enter</kbd>
   - **Then** the drawer closes and focus returns to the element that opened the drawer (or a logical return target)

4. **Close via Escape key (keyboard)**
   - **Given** the drawer is open and the application enables Escape-to-close for this drawer instance
   - **When** the user presses <kbd>Escape</kbd>
   - **Then** the drawer closes and focus returns to the element that opened the drawer (or a logical return target)

> **Note:** It is the application team's responsibility to ensure Escape handling does not conflict with drawer behaviour — enable it only when appropriate for interactive content and ensure correct layering (topmost dismissible element handles Escape first).

### Header block interactions

1. **Header content is displayed**
   - **Given** the drawer is open
   - **When** the header block renders
   - **Then** it displays a Heading and it may display optional Preheader and Description. Accent/status styling may be applied to highlight messaging (ensure meaning isn't colour-only)

### Footer interactions (button bar)

1. **Button bar is pinned**

   - **Given** the drawer is open and the button bar is present
   - **When** the user scrolls long drawer content
   - **Then** the Button bar remains pinned to the bottom edge of the drawer and only the content area scrolls

2. **Activate footer actions**
   - **Given** footer actions are present
   - **When** the user activates an action (click/tap or <kbd>Space</kbd>/<kbd>Enter</kbd>)
   - **Then** the product-defined action occurs and if the action closes the drawer, focus returns per Focus & keyboard

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
   - **Then** focus cycles through focusable elements within the drawer only

### Focus return

1. **Focus returns on close**
   - **Given** the drawer closes
   - **When** focus returns to the trigger
   - **Or** a logical fallback target if the opener no longer exists

### Overflow dividers

1. Both top and bottom overflow dividers toggled on. Dividers are inset left and right by `spacing-300`.

> **Note:** there is no spacing between the divider and the body content / overflow content.
