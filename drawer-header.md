# Drawer — Header block

## Overview

Describes the purpose of the drawer header block and its functional requirements.

### What is it?

Drawer is a temporary, focused region that supports a small, self-contained action, such as choosing an option, confirming a decision, or entering a few fields, without leaving the current screen. It's designed to briefly pause the primary flow, allow the completion of tasks and then return directly to the prior context.

The header block sits at the top of the drawer. It introduces the task with a heading (and optional supporting text) and provides the primary means of dismissing the drawer.

### Functional requirements

- Provide a modal surface that spans the full height of the viewport, preventing interaction with background content while open.
- Support `variant="primary" | "secondary" | "tertiary"` with `primary` as the default.
- Support `position="left" | "right" | "top" | "bottom"` with `left` as the default.
- Render a Header block at the top, including:
  - Heading with optional preheader and description
  - Optional accent/status styling for messaging emphasis
  - A Close button to dismiss the drawer
- Provide a scrollable content area that does not move the header.
- Provide dismissal behaviors:
  - Close via the header Close button (pointer and keyboard <kbd>Space</kbd>/<kbd>Enter</kbd>)
  - Close via <kbd>Escape</kbd> (when enabled by the application and not conflicting with in-drawer interactions)
  - Close via scrim click when scrim is present
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
   - **Then** it anchors/animates from the specified edge and the header remains at the top (full-height drawer)

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

## Open / close interaction

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

## Header block interactions

1. **Header content is displayed**
   - **Given** the drawer is open
   - **When** the header block renders
   - **Then** it displays a Heading and it may display optional Preheader and Description. Accent/status styling may be applied to highlight messaging (ensure meaning isn't colour-only)

## Overflow dividers

Overflow dividers separate the scrollable content area from the header block above it and from the drawer's bottom edge below it. They are inset left and right by `spacing-300` and are consistent with `Dialog`.

1. **Top divider appears once the content has been scrolled**

   - **Given** the content area overflows vertically
   - **When** the user scrolls down from the top of the content
   - **Then** a divider appears between the header block and the content area
   - **And** it is removed again when the content is scrolled back to the top

2. **Bottom divider appears while content remains below**

   - **Given** the content area overflows vertically
   - **When** there is more content below the visible area
   - **Then** a divider appears at the bottom of the content area
   - **And** it is removed once the content is scrolled to the end

3. **No dividers when the content fits**
   - **Given** the content area does not overflow vertically
   - **When** the drawer renders
   - **Then** neither divider is shown

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
   - **Then** focus cycles through focusable elements within the drawer only

### Focus return

1. **Focus returns on close**
   - **Given** the drawer closes
   - **When** focus returns to the trigger
   - **Or** a logical fallback target if the opener no longer exists
