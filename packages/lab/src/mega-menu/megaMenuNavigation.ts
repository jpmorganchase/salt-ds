/**
 * Selector for the focusables that make up the navigable grid: menu item
 * anchors and any consumer focusables inside a custom region. Matches what
 * `FloatingFocusManager` walks for Tab, so arrow navigation and Tab order stay
 * consistent.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Marker attribute on each navigable column root (`MegaMenuGroup` and the
 * supporting regions). The only DOM contract arrow navigation relies on — read
 * by nothing but the keyboard handlers, so it stays decoupled from the distinct
 * HTML/ARIA semantics of groups vs custom regions.
 */
export const COLUMN_SELECTOR = "[data-mega-menu-column]";

/** Focusables inside an element, in document order. */
export function focusablesIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/** The navigable columns of a panel, in document order. */
export function columnsOf(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR));
}

/** The first focusable inside an element (e.g. the panel's first item). */
export function firstFocusable(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

/** Resolve the focusable trigger element from its floating-ui reference node. */
export function getTriggerFocusable(
  reference: HTMLElement | null,
): HTMLElement | null {
  return reference?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? reference;
}

/**
 * The focusable trigger of the adjacent nav-bar item. Triggers sit in sibling
 * `<li>` elements (the documented `<ul>`/`<ol>` nav structure). Shared by
 * `MegaMenuTrigger` (Arrow Left/Right between triggers) and the panel handler
 * (Arrow Right off the last column), so "the adjacent trigger" lives in one place.
 */
export function getAdjacentTrigger(
  trigger: HTMLElement | null,
  direction: "next" | "previous",
): HTMLElement | null {
  const li = trigger?.closest("li");
  const sibling =
    direction === "next" ? li?.nextElementSibling : li?.previousElementSibling;
  return sibling instanceof HTMLElement
    ? sibling.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    : null;
}
