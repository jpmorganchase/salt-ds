# Mega Menu — UX Specification

## Overview

Mega menu is a large, expandable panel which opens from the main navigation. It displays and categorizes links to key application pages, allowing users to easily access a wide range of app features and content from a single menu. It organizes complex site structures into a visually clear, multi-column layout, enhancing user experience by reducing the number of clicks needed to find information.

---

## Component Anatomy

The mega menu consists of the following structural elements:

- **Trigger** — A button (typically in a horizontal navigation bar) that opens/closes the mega menu.
- **Mega menu container** — The expanded panel that holds all content.
- **Mega menu group** — A column of related items, headed by a group header.
- **Mega menu header** — The label/title for a group of items.
- **Mega menu item** — An individual navigable link within a group. May include an optional secondary label / help text.
- **Content region** — An optional area for custom content (e.g., images, promotional blocks, CTAs) placed alongside the link groups.
- **Help text** — Optional descriptive text associated with headers or items.

---

## Accessibility Specifications

### Accessibility Semantics

#### 1. Triggering element

Any button that triggers a Mega Menu container should:

- Be wrapped in a `<nav>` element to establish a navigation landmark. (If there is more than one `<nav>` element, teams need to ensure it has an appropriate accessible name.)
- The group of buttons should be structured as a `<ul>` or `<ol>`, with each button placed inside an `<li>`.
- Include the `aria-expanded` attribute to reflect their expanded or collapsed state.
- Include the `aria-controls` attribute to reference the associated mega menu region.

#### 2. Mega menu container

- Should use `role="region"`.

#### 3. Mega menu groups

- Should use link lists, structured as `<ul>` elements containing `<li>` items.
- Each `<ul>` should have an accessible name that corresponds to the group label.

---

### Keyboard Interaction

#### Opening the Mega Menu

When a trigger button has focus, pressing **Enter**, **Spacebar**, or **Down Arrow** will open the Mega Menu container.

#### Tab Navigation

| Key | Behavior |
|-----|----------|
| **Tab** | When focus is on the trigger and the menu is displayed, pressing Tab places focus on the **first mega menu item** and moves sequentially through each item in a group, then continues to the first item of the next group once the last item is reached. Tab includes interactive elements within content regions in the focus sequence, based on their position in the layout. The content region itself is not focusable. When focus is on the **last interactive item** in the mega menu, pressing Tab places focus on the next interactive element after the mega menu and **collapses** the menu. |
| **Shift+Tab** | Sets focus to the previous focusable component in the tab order. When the first element in the mega menu has focus, Shift+Tab places focus back on the **triggering element**. |
| **Escape** | Closes the mega menu and returns focus to the **triggering element**. |

#### Arrow Key Navigation

| Key | Behavior |
|-----|----------|
| **Up Arrow** | Moves focus to the **previous item** within the current group. |
| **Down Arrow** | Moves focus to the **next item** within the current group. Does **not** wrap when on the last item. |
| **Left Arrow** | Shifts focus to the **first item of the previous** mega menu group. |
| **Right Arrow** | Shifts focus to the **first item of the next** mega menu group. |

#### Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Left/Up Arrow on the first item** | Moves focus to the trigger. The mega menu container **remains open**. |
| **Right Arrow on the last item** | Moves focus to the **next trigger element** and **collapses** the mega menu panel. If there is no following trigger element, no effect. |
| **Down Arrow on the last item** | No effect (does not wrap). |
| **Tab past the last focusable element** | Focus exits the mega menu, the menu collapses. If there is another mega menu trigger on the page, focus moves to the next mega menu trigger. |

---

### Content Region Accessibility

The content region allows you to include custom content within the mega menu.

#### Focus behavior

- The content region itself is **not focusable** if it only contains static content (images or text).
- If the content contains **interactive elements** (links, buttons, form fields), keyboard focus will include those elements in the tab and arrow key navigation.

#### Focus order based on content position

The focus order should align with the visual layout and reading order to preserve the meaning and operability of the menu:

| Content Position | Focus Order |
|------------------|-------------|
| **Top** or **Left** | Interactive elements in the content receive focus **before** the link lists. |
| **Right** or **Bottom** | Interactive elements in the content receive focus **after** the link lists. |

#### Arrow key navigation between regions

- Arrow keys move between items **within the same region** first (either the mega menu items or interactive elements in the content).
- When focus reaches the **first or last item** in a region, pressing the arrow key again moves focus to the **adjacent region**, following the visual order.
- Arrow keys do **not** cross from the link list region into the content region mid-group. For example, pressing Left Arrow on "Supply Chain Optimization" moves focus to "E-Commerce Platforms" (the adjacent link group), not to a link in the content region.

---

## Basic Interaction

### User Story

> As a user, I want to open the mega menu and view organized groups of links or items in a single, expanded panel, so I can easily navigate to the section I need without searching through multiple menus or pages.

### Triggering and Dismissing the Mega Menu

#### 1. Initial State (Mega Menu Hidden)

- **Given** the trigger component (usually a button or horizontal navigation bar) is displayed
- **When** the user views the component
- **Then** the mega menu is not yet triggered

#### 2. Triggering the Mega Menu

- **Given** the trigger component is visible
- **When** the user **clicks** the trigger component
- **Then** the mega menu expands and displays grouped navigation links or categories

> **Note:** The mega menu will **not** appear on hover. It will only appear when the trigger component is **clicked**.

#### 3. Navigating the Mega Menu

- **Given** the mega menu is expanded
- **When** the user moves the cursor over a menu item
- **Then** the menu item changes to its **hover** state

#### 4. Selecting a Menu Item

- **Given** the mega menu is expanded and menu items are visible
- **When** the user clicks on a specific menu item
- **Then** the menu item changes to its **active** state
- **And** upon release, the user is navigated to the selected section or page, and the mega menu **closes**

#### 5. Closing the Mega Menu

- **Given** the mega menu is expanded
- **When** the user clicks outside the menu, presses the **Escape** key, or clicks the trigger component again
- **Then** the mega menu **collapses** and is no longer visible

#### 6. Re-opening the Mega Menu

- **Given** the user is on a page that was opened from a mega menu item
- **When** the user clicks the mega menu trigger to open the mega menu again
- **Then** the mega menu opens

---

## Positioning & Responsiveness

### Overview

This section defines how the mega menu container is positioned relative to the trigger and how it responds to limited viewport space (shrinking viewport or growing menu content). It covers initial opening placement and subsequent overflow behavior (wrapping and vertical scrolling).

### Positioning Rules

| Property | Value |
|----------|-------|
| **Constraint boundary** | Viewport |
| **Default width** | Hug-content (intrinsic width) |
| **Alignment** | Centered to the trigger on open |
| **Horizontal overflow** | Clamps to the nearest viewport edge (or both edges when needed, becoming full-viewport width), then wraps/reflows columns down to a minimum of 1 column |
| **Vertical overflow** | Enables vertical scrolling |

### Trigger Position Variants

#### Trigger Centered

1. **Initial positioning**: Menu is centered to the trigger.
2. **Overflow behavior**: When the viewport shrinks or content grows, the menu reaches **both viewport edges around the same time**, then wraps/reflows, and if the menu height exceeds the viewport it enables vertical scrolling.

#### Trigger Offset (from center)

1. **Initial positioning**: Menu is still centered to the trigger.
2. **Overflow behavior**: The menu reaches the **nearest viewport edge first**, then the far edge, then wraps/reflows, and if the menu height exceeds the viewport it enables vertical scrolling.

#### Trigger Near Viewport Edge

1. **Initial positioning**: Menu is centered to the trigger, and is expected to be at/near the nearest viewport edge due to limited space.
2. **Overflow behavior**: The menu reaches the nearest viewport edge **immediately**, then the far edge, then wraps/reflows, and if the menu height exceeds the viewport it enables vertical scrolling.

### Small Viewport Reflow

- **Given** the mega menu is triggered in a small viewport, or the screen size changes to a small viewport
- **When** the mega menu expands
- **Then** the content reflows in this order:
  1. **Menu region wraps first**: Groups and links reflow from multiple columns to fewer columns, down to a minimum of one column, preserving the original order.
  2. **Content stacks when needed**: If the viewport becomes too narrow to keep the menu region and content side-by-side, the content moves into the stacked flow following the original content order.

### Scrollable Container

- **Given** the mega menu content exceeds the visible area
- **When** the user views the expanded mega menu
- **Then** the mega menu container becomes **scrollable**, allowing vertical scrolling to access all menu items and groups
