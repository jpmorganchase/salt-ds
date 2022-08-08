import { MouseEventHandler, RefObject } from "react";

import { orientationType } from "../../responsive";

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
  draggable: JSX.Element | null;
  dropIndicator: JSX.Element | null;
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
  containerRef: RefObject<HTMLElement>;
  itemQuery?: string;
}) => DragHookResult;
