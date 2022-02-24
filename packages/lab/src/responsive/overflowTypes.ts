// TODO rename ?
import { RefObject } from "react";

type dimension =
  | "clientWidth"
  | "clientHeight"
  | "scrollWidth"
  | "scrollHeight";

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

export type FilterPredicate = (item: ManagedItem) => boolean;

export type ElementRef = RefObject<HTMLDivElement>;

export type ManagedItem = {
  collapsed?: boolean;
  collapsible?: collapsibleType;
  collapsing?: boolean;
  fullSize: number | null;
  index: number;
  isOverflowIndicator?: boolean;
  label?: string;
  minSize?: number;
  overflowed?: boolean;
  priority: number;
  reclaimSpace?: boolean;
  reclaimedSpace?: boolean;
  size: number;
};

export type ManagedListRef = NonNullableRefObject<ManagedItem[]>;

export type overflowState = {
  overflowIndicatorSize: number;
  visibleItems: ManagedItem[];
};

export type overflowAction = {
  type: string;
  managedItems?: ManagedItem[];
  managedItem?: ManagedItem;
};

export type overflowDispatch = (action: overflowAction) => void;

export interface overflowHookProps {
  innerContainerSize?: number;
  label?: string;
  ref: ElementRef;
  orientation: orientationType;
  hasOverflowedItems?: boolean;
  managedItemsRef: ManagedListRef;
  dispatchOverflowAction: overflowDispatch;
}
