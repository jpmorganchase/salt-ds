// TODO rename ?
import type { ReactElement, ReactNode, RefObject } from "react";
import type { OverflowAction as overflowAction2 } from "./OverflowReducer";

type dimension = "width" | "height" | "scrollWidth" | "scrollHeight";

type dimensions = {
  size: dimension;
  depth: dimension;
  scrollDepth: dimension;
};

export type dimensionsType = {
  horizontal: dimensions;
  vertical: dimensions;
};

export type orientationType = keyof dimensionsType;

export type collapsibleType = "instant" | "dynamic";

interface NonNullableRefObject<T> {
  current: T;
}

export type FilterPredicate = (item: OverflowItem) => boolean;

export type ElementRef = RefObject<HTMLDivElement>;

export interface OverflowSource {
  id?: string;
  label: string;
  editable?: boolean;
  closeable?: boolean;
  position?: number;
  priority?: number;
}

export type InjectedSourceItem = {
  source: OverflowSource;
};

export type InjectedChildItem = {
  element: JSX.Element;
};

export type InjectedItem = InjectedChildItem | InjectedSourceItem;

export type overflowItemType = "source" | "child";
// TODO I think this should extend CollectionItem
// TODO type this so that it can have a child elment OR a source item
// TODO OR do we use ReactElement | T as the generic type
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

export type OverflowItems = OverflowItem<"source" | "child">[];

export type ManagedListRef = NonNullableRefObject<OverflowItem[]>;

export type overflowState = {
  overflowIndicatorSize: number;
  visibleItems: OverflowItem[];
};

export type overflowAction = {
  type: string;
  managedItems?: OverflowItem[];
  managedItem?: OverflowItem;
};

export type overflowDispatch = (action: overflowAction2) => void;

// TODO allow editable to be a function
export type OverflowCollectionOptions = {
  closeable?: boolean;
  editable?: boolean;
  getPriority?: (item: any, index: number) => number | undefined;
};

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

export type OverflowCollectionHookResult = {
  data: OverflowItem[];
  dispatch: (action: overflowAction2 | { type: "reset" }) => void;
  isControlled: boolean;
  version: number;
};

export interface OverflowLayoutHookProps {
  collectionHook: OverflowCollectionHookResult;
  disableOverflow?: boolean;
  id: string;
  label?: string;
  orientation: orientationType;
}

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

export interface OverflowHookResult {
  onResize: (size: number, containerHasGrown?: boolean) => void;
  resetMeasurements?: (
    isOverflowing: boolean,
    innerContainerSize: number,
  ) => boolean | undefined;
}
export interface InstantCollapseHookResult
  extends Omit<OverflowHookResult, "resetMeasurements"> {
  resetMeasurements: (isOverflowing?: boolean) => boolean | undefined;
}
export interface DynamicCollapseHookResult
  extends Omit<OverflowHookResult, "resetMeasurements"> {
  resetMeasurements: () => boolean | undefined;
}
