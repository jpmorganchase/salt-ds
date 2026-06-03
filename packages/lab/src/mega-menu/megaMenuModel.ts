/**
 * Selector for the focusables that make up the navigable grid: menu item
 * anchors and any consumer focusables placed inside a custom region. Matches
 * what `FloatingFocusManager` walks for Tab, so arrow navigation and Tab order
 * stay consistent by construction.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Marker attribute applied to each navigable column root (`MegaMenuGroup` and
 * the supporting regions). The only DOM contract the model relies on.
 */
export const COLUMN_SELECTOR = "[data-mega-menu-column]";

/**
 * Sort nodes by their position in the document, so columns/items resolve to the
 * same layout order the user sees (surviving arbitrary consumer wrappers and
 * left/right custom regions). Mirrors floating-ui's internal `FloatingList`
 * ordering.
 */
function byDocumentPosition(a: Node, b: Node): number {
  const position = a.compareDocumentPosition(b);
  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING ||
    position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1;
  }
  if (
    position & Node.DOCUMENT_POSITION_PRECEDING ||
    position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1;
  }
  return 0;
}

/**
 * Build the ordered 2D navigation model directly from the open panel's DOM.
 *
 * The DOM is the source of truth: items are natively focusable and already in
 * document order, so no registration/bookkeeping is needed. Called lazily per
 * keystroke, so a dynamic mount/unmount is always reflected.
 *
 * - Each `[data-mega-menu-column]` (a group or a supporting region) owns the
 *   focusables it contains — a single rule for groups and custom regions alike.
 * - A focusable that is not inside any column (e.g. an item placed directly in
 *   the panel) becomes a singleton column at its own document position.
 * - Columns are ordered by document position; empty columns are dropped.
 *
 * @param panel the open `MegaMenuPanel` (floating) element.
 */
export function getModel(panel: HTMLElement): HTMLElement[][] {
  const columns = Array.from(
    panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR),
  );
  const focusables = Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  const owned = new Set<HTMLElement>();
  const entries = columns.map((node) => {
    // `focusables` is in document order, so each column's items are too.
    const items = focusables.filter((f) => f !== node && node.contains(f));
    for (const f of items) owned.add(f);
    return { node, items };
  });

  for (const f of focusables) {
    if (!owned.has(f)) entries.push({ node: f, items: [f] });
  }

  return entries
    .sort((a, b) => byDocumentPosition(a.node, b.node))
    .map((entry) => entry.items)
    .filter((items) => items.length > 0);
}

/** Resolve the focusable trigger element from its floating-ui reference node. */
export function getTriggerFocusable(
  reference: HTMLElement | null,
): HTMLElement | null {
  return (
    reference?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
    reference ??
    null
  );
}

/**
 * Find the focusable trigger of the adjacent nav-bar item. Triggers are
 * expected to sit in sibling `<li>` elements (the documented `<ul>`/`<ol>` nav
 * structure). Shared by `MegaMenuTrigger` (Arrow Left/Right between triggers)
 * and `useMegaMenuKeyboard` (Arrow Right off the last column), so "the adjacent
 * trigger" is defined in exactly one place.
 */
export function getAdjacentTrigger(
  triggerEl: HTMLElement | null,
  direction: "next" | "previous",
): HTMLElement | null {
  const li = triggerEl?.closest("li");
  if (!li) return null;
  const sibling =
    direction === "next" ? li.nextElementSibling : li.previousElementSibling;
  if (!(sibling instanceof HTMLElement)) return null;
  return sibling.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}
