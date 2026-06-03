import { createContext, useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Selector for focusables discovered inside a custom region. Custom-region
 * content (arbitrary consumer markup inside `MegaMenuSupportingContent` /
 * `MegaMenuSupportingActions`) cannot self-register, so a column that collects
 * no registered items falls back to a *scoped* query on its own node.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sort nodes by their position in the document. Copied from floating-ui's
 * internal `FloatingList` ordering so registered columns/items resolve to the
 * same layout order the user sees (surviving arbitrary wrappers and
 * left/right custom regions).
 */
function sortByDocumentPosition(a: Node, b: Node): number {
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

export interface MegaMenuGridContextValue {
  /** Register a column node (group / supporting region) for its lifetime. */
  registerColumn: (node: HTMLElement) => () => void;
  /** Register an item node (a menu item's `<a>`) for its lifetime. */
  registerItem: (node: HTMLElement) => () => void;
  /**
   * Build the ordered 2D navigation model from the current registrations.
   * Called lazily per keystroke — never memoised — so a DOM reorder (dynamic
   * mount/unmount) can't leave a stale grid behind.
   */
  getModel: () => HTMLElement[][];
  /** Live set of registered columns. Exposed for test probes only. */
  columnsRef: MutableRefObject<Set<HTMLElement>>;
  /** Live set of registered items. Exposed for test probes only. */
  itemsRef: MutableRefObject<Set<HTMLElement>>;
  /** Bumped on every (un)registration so subscribers (probes) re-render. */
  version: number;
}

const MegaMenuGridContext = createContext<MegaMenuGridContextValue | undefined>(
  "MegaMenuGridContext",
  undefined,
);

/**
 * Build the ordered 2D model from the registered nodes.
 *
 * - Columns + items are merged into a single document-position-ordered stream.
 * - Walking the stream, each column opens a bucket; a focusable item joins the
 *   open column if that column contains it, otherwise it becomes an orphan
 *   column at its own document position. Non-focusable registered items (e.g. an
 *   `<a>` with no `href`) are skipped.
 * - A registered column that collected no registered items (a custom region of
 *   arbitrary consumer focusables) falls back to a *scoped*
 *   `querySelectorAll(FOCUSABLE_SELECTOR)` on that column's node only.
 */
export function buildModelFromRegistry(
  columns: Set<HTMLElement>,
  items: Set<HTMLElement>,
): HTMLElement[][] {
  const stream = [...columns, ...items].sort(sortByDocumentPosition);

  const grid: HTMLElement[][] = [];
  const bucketFor = new Map<HTMLElement, HTMLElement[]>();
  let openColumn: HTMLElement | null = null;
  let openBucket: HTMLElement[] | null = null;

  for (const node of stream) {
    if (columns.has(node)) {
      openColumn = node;
      openBucket = [];
      bucketFor.set(node, openBucket);
      grid.push(openBucket);
    } else {
      // An item — skip ones that aren't actually focusable.
      if (!node.matches(FOCUSABLE_SELECTOR)) continue;
      if (openColumn && openBucket && openColumn.contains(node)) {
        openBucket.push(node);
      } else {
        grid.push([node]); // orphan, at its document position
      }
    }
  }

  // Scoped fallback: a registered column with no registered items discovers its
  // own focusables (custom-region content that can't self-register).
  for (const [column, bucket] of bucketFor) {
    if (bucket.length === 0) {
      bucket.push(
        ...Array.from(column.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)),
      );
    }
  }

  // Drop columns that ended up with no focusables at all.
  return grid.filter((bucket) => bucket.length > 0);
}

/**
 * Create the registration store. Lives in the `MegaMenu` provider so the
 * keyboard handler (which sits above the panel) can read it via `getModel`,
 * while columns/items below register through context. Modelled on floating-ui's
 * `FloatingList` (the parent owns the store; descendants register into it), but
 * deliberately *without* `useListNavigation`/`Composite` — no roving tabindex,
 * items stay natively tabbable.
 */
export function useMegaMenuGridRegistry(): MegaMenuGridContextValue {
  const columnsRef = useRef<Set<HTMLElement>>(new Set());
  const itemsRef = useRef<Set<HTMLElement>>(new Set());
  const [version, setVersion] = useState(0);

  const registerColumn = useCallback((node: HTMLElement) => {
    columnsRef.current.add(node);
    setVersion((v) => v + 1);
    return () => {
      columnsRef.current.delete(node);
      setVersion((v) => v + 1);
    };
  }, []);

  const registerItem = useCallback((node: HTMLElement) => {
    itemsRef.current.add(node);
    setVersion((v) => v + 1);
    return () => {
      itemsRef.current.delete(node);
      setVersion((v) => v + 1);
    };
  }, []);

  const getModel = useCallback(
    () => buildModelFromRegistry(columnsRef.current, itemsRef.current),
    [],
  );

  return useMemo(
    () => ({
      registerColumn,
      registerItem,
      getModel,
      columnsRef,
      itemsRef,
      version,
    }),
    [registerColumn, registerItem, getModel, version],
  );
}

export function MegaMenuGridProvider({
  value,
  children,
}: {
  value: MegaMenuGridContextValue;
  children: ReactNode;
}) {
  return (
    <MegaMenuGridContext.Provider value={value}>
      {children}
    </MegaMenuGridContext.Provider>
  );
}

/** Access the registration store; `undefined` outside a `MegaMenu`. */
export function useMegaMenuGrid(): MegaMenuGridContextValue | undefined {
  return useContext(MegaMenuGridContext);
}

/**
 * Shared registration hook, modelled on floating-ui's `useListItem`: the
 * returned ref callback only records the node, and (un)registration happens in
 * a layout effect with stable deps. Registering inside the ref callback would
 * infinite-loop, because `useForkRef` hands back a fresh callback each render.
 */
function useRegister(
  register: ((node: HTMLElement) => () => void) | undefined,
) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const node = nodeRef.current;
    if (node && register) {
      return register(node);
    }
  }, [register]);

  return ref;
}

/** Ref callback registering a DOM node as a column for its lifetime. */
export function useRegisterColumn() {
  return useRegister(useMegaMenuGrid()?.registerColumn);
}

/** Ref callback registering a DOM node as an item for its lifetime. */
export function useRegisterItem() {
  return useRegister(useMegaMenuGrid()?.registerItem);
}

function labelFor(el: HTMLElement): string {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Test-only probe (imported directly from source, never exported from the
 * package). Renders the registered items and the built 2D model into data
 * attributes so a test can assert that in-group items actually *register* —
 * not merely that they appear in the final model, where the scoped fallback
 * could otherwise mask a ref regression.
 */
export function MegaMenuGridProbe() {
  const grid = useMegaMenuGrid();
  const rawItems = grid
    ? JSON.stringify([...grid.itemsRef.current].map(labelFor))
    : "[]";
  const model = grid ? grid.getModel() : [];
  const json = JSON.stringify(model.map((col) => col.map(labelFor)));
  return (
    <div
      data-testid="grid-model"
      data-model={json}
      data-raw-items={rawItems}
      style={{ display: "none" }}
    />
  );
}
