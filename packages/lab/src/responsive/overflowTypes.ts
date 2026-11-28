// TODO rename ?
import type { MutableRefObject, ReactElement, ReactNode } from "react";
import type { OverflowAction as overflowAction2 } from "./OverflowReducer";

type dimension = "width" | "height" | "scrollWidth" | "scrollHeight";

type dimensions = {
  size: dimension;
  depth: dimension;
  scrollDepth: dimension;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type dimensionsType = {
  horizontal: dimensions;
  vertical: dimensions;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type orientationType = keyof dimensionsType;

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type collapsibleType = "instant" | "dynamic";

interface NonNullableRefObject<T> {
  current: T;
}

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type FilterPredicate = (item: OverflowItem) => boolean;

// Read and passed to a `ref` prop. Before version 19 of the React types,
// `RefObject<T | null>` can't be passed to a `ref` prop, so this uses
// `MutableRefObject`, which every supported version has.
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type ElementRef = MutableRefObject<HTMLDivElement | null>;

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface OverflowSource {
  id?: string;
  label: string;
  editable?: boolean;
  closeable?: boolean;
  position?: number;
  priority?: number;
}

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type InjectedSourceItem = {
  source: OverflowSource;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type InjectedChildItem = {
  element: ReactElement;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type InjectedItem = InjectedChildItem | InjectedSourceItem;

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type overflowItemType = "source" | "child";
// TODO I think this should extend CollectionItem
// TODO type this so that it can have a child elment OR a source item
// TODO OR do we use ReactElement | T as the generic type
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type OverflowItem<T extends overflowItemType = "child"> = {
  collapsed?: boolean;
  collapsible?: collapsibleType;
  collapsing?: boolean;
  disabled?: boolean;
  element: T extends "child" ? ReactElement : null;
  fullSize: number | null;
  id: string;
  index: number;
  isInjectedItem?: boolean;
  isOverflowIndicator?: boolean;
  label?: string;
  minSize?: number;
  overflowed?: boolean;
  position?: number;
  priority: number;
  reclaimSpace?: boolean;
  reclaimedSpace?: boolean;
  size: number;
  source: T extends "source" ? unknown : null;
  type: overflowItemType;

  // collection types
  editable?: boolean;
  closeable?: boolean;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type OverflowItems = OverflowItem<"source" | "child">[];

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type ManagedListRef = NonNullableRefObject<OverflowItem[]>;

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type overflowState = {
  overflowIndicatorSize: number;
  visibleItems: OverflowItem[];
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type overflowAction = {
  type: string;
  managedItems?: OverflowItem[];
  managedItem?: OverflowItem;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type overflowDispatch = (action: overflowAction2) => void;

// TODO allow editable to be a function
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type OverflowCollectionOptions = {
  closeable?: boolean;
  editable?: boolean;
  getPriority?: (item: any, index: number) => number | undefined;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type OverflowCollectionHookProps = {
  children?: ReactNode;
  defaultSource?: OverflowSource[];
  id: string;
  injectedItems?: InjectedItem[];
  label?: string;
  options?: OverflowCollectionOptions;
  orientation: orientationType;
  source?: OverflowSource[];
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type OverflowCollectionHookResult = {
  data: OverflowItem[];
  dispatch: (action: overflowAction2 | { type: "reset" }) => void;
  isControlled: boolean;
  version: number;
};

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface OverflowLayoutHookProps {
  collectionHook: OverflowCollectionHookResult;
  disableOverflow?: boolean;
  id: string;
  label?: string;
  orientation: orientationType;
}

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface OverflowHookProps {
  collectionHook: OverflowCollectionHookResult;
  dispatchOverflowAction?: overflowDispatch;
  id?: string;
  innerContainerSize?: number;
  label?: string;
  overflowContainerRef: ElementRef;
  orientation: orientationType;
  hasOverflowedItems?: boolean;
  overflowItemsRef: ManagedListRef;
}

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface OverflowHookResult {
  onResize: (size: number, containerHasGrown?: boolean) => void;
  resetMeasurements?: (
    isOverflowing: boolean,
    innerContainerSize: number,
  ) => boolean | undefined;
}
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface InstantCollapseHookResult
  extends Omit<OverflowHookResult, "resetMeasurements"> {
  resetMeasurements: (isOverflowing?: boolean) => boolean | undefined;
}
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface DynamicCollapseHookResult
  extends Omit<OverflowHookResult, "resetMeasurements"> {
  resetMeasurements: () => boolean | undefined;
}
