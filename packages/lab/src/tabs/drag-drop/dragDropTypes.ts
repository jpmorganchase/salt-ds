import type { MouseEventHandler, ReactElement, RefObject } from "react";

import type { orientationType } from "../../responsive";

export type dragStrategy = "drop-indicator" | "natural-movement";

export type Direction = "fwd" | "bwd";
export const FWD: Direction = "fwd";
export const BWD: Direction = "bwd";

export type Rect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type DragHookResult = {
  draggable: ReactElement | null;
  dropIndicator: ReactElement | null;
  draggedItemIndex?: number;
  isDragging: boolean;
  onMouseDown?: MouseEventHandler;
  revealOverflowedItems: boolean;
  // tabProps?: Partial<TabProps>;
};

export type DragDropHook = (props: {
  allowDragDrop?: boolean | dragStrategy;
  extendedDropZone?: boolean;
  onDrop: (fromIndex: number, toIndex: number) => void;
  orientation: orientationType;
  containerRef: RefObject<HTMLElement | null>;
  itemQuery?: string;
}) => DragHookResult;
