import { orientationType } from "../../responsive";
import { Direction, FWD } from "./dragDropTypes";

const LEFT_RIGHT = ["left", "right"];
const TOP_BOTTOM = ["top", "bottom"];
// duplicated in repsonsive

export type MeasuredDropTarget = {
  currentIndex: number;
  dataIndex?: number;
  element: HTMLElement;
  index: number;
  isDraggedElement: boolean;
  isOverflowIndicator?: boolean;
  start: number;
  end: number;
  mid: number;
  size: number;
};

export type targetType = {
  element: HTMLElement | null;
  index: number;
  isLast?: boolean;
};

type MousePosKey = keyof Pick<MouseEvent, "clientX" | "clientY">;
type DOMRectKey = keyof Omit<DOMRect, "toJSON">;
type DOMRectDimensionKey = keyof Pick<DOMRect, "width" | "height">;
type Dimension = keyof Pick<DOMRect, "width" | "height">;
type ElementDimension = keyof Pick<
  HTMLElement,
  | "scrollHeight"
  | "scrollWidth"
  | "clientHeight"
  | "clientWidth"
  | "scrollTop"
  | "scrollLeft"
>;

export const measureElementSizeAndPosition = (
  element: HTMLElement,
  dimension: Dimension = "width",
  includeAutoMargin = false
) => {
  const pos = dimension === "width" ? "left" : "top";
  const { [dimension]: size, [pos]: position } =
    element.getBoundingClientRect();
  const { padEnd = false, padStart = false } = element.dataset;
  const style = getComputedStyle(element);
  const [start, end] = dimension === "width" ? LEFT_RIGHT : TOP_BOTTOM;
  const marginStart =
    padStart && !includeAutoMargin
      ? 0
      : parseInt(style.getPropertyValue(`margin-${start}`), 10);
  const marginEnd =
    padEnd && !includeAutoMargin
      ? 0
      : parseInt(style.getPropertyValue(`margin-${end}`), 10);

  let minWidth = size;
  const flexShrink = parseInt(style.getPropertyValue("flex-shrink"), 10);
  if (flexShrink > 0) {
    const flexBasis = parseInt(style.getPropertyValue("flex-basis"), 10);
    if (!isNaN(flexBasis) && flexBasis > 0) {
      minWidth = flexBasis;
    }
  }
  return [position, marginStart + minWidth + marginEnd];
};

const DIMENSIONS = {
  horizontal: {
    CLIENT_SIZE: "clientWidth" as ElementDimension,
    CONTRA: "top" as DOMRectKey,
    CONTRA_POS: "clientY" as MousePosKey,
    DIMENSION: "width" as DOMRectDimensionKey,
    END: "right" as DOMRectKey,
    POS: "clientX" as MousePosKey,
    SCROLL_POS: "scrollTop" as ElementDimension,
    SCROLL_SIZE: "scrollWidth" as ElementDimension,
    START: "left" as DOMRectKey,
  },
  vertical: {
    CLIENT_SIZE: "clientHeight" as ElementDimension,
    CONTRA: "left" as DOMRectKey,
    CONTRA_POS: "clientX" as MousePosKey,
    DIMENSION: "height" as DOMRectDimensionKey,
    END: "bottom" as DOMRectKey,
    POS: "clientY" as MousePosKey,
    SCROLL_POS: "scrollLeft" as ElementDimension,
    SCROLL_SIZE: "scrollHeight" as ElementDimension,
    START: "top" as DOMRectKey,
  },
};
export const dimensions = (orientation: orientationType) =>
  DIMENSIONS[orientation];

export const getDraggedItem = (
  measuredItems: MeasuredDropTarget[]
): MeasuredDropTarget => {
  const result = measuredItems.find((item) => item.isDraggedElement);
  if (result) {
    return result;
  } else {
    throw Error("measuredItems do not contain a draggedElement");
  }
};

export const moveDragItem = (
  measuredItems: MeasuredDropTarget[],
  dropTarget: MeasuredDropTarget
): MeasuredDropTarget[] => {
  const items: MeasuredDropTarget[] = measuredItems.slice();
  const draggedItem = getDraggedItem(items);
  const draggedIndex = items.indexOf(draggedItem!);
  const targetIndex = items.indexOf(dropTarget);

  const firstPos = Math.min(draggedIndex, targetIndex);
  const lastPos = Math.max(draggedIndex, targetIndex);
  let { start } = items[firstPos];

  items[draggedIndex] = { ...dropTarget };
  items[targetIndex] = { ...draggedItem };

  for (let i = firstPos; i <= lastPos; i++) {
    const item = items[i];
    item.currentIndex = i;
    item.start = start;
    item.end = start + item.size;
    item.mid = start + item.size / 2;
    start = item.end;
  }

  return items;
};

export const isDraggedElement = (item: MeasuredDropTarget) =>
  item.isDraggedElement;

export const measureDropTargets = (
  container: HTMLElement,
  orientation: orientationType,
  draggedItem: HTMLElement,
  itemQuery?: string
) => {
  const dragThresholds: MeasuredDropTarget[] = [];

  // TODO need to make sure we're including only the children we should
  const children = Array.from(
    itemQuery ? container.querySelectorAll(itemQuery) : container.children
  );
  let previousThreshold = null;
  for (let index = 0; index < children.length; index++) {
    const element = children[index] as HTMLElement;
    const dimension = orientation === "horizontal" ? "width" : "height";
    let [start, size] = measureElementSizeAndPosition(element, dimension);

    dragThresholds.push(
      (previousThreshold = {
        currentIndex: index,
        dataIndex: parseInt(element.dataset.index ?? "-1"),
        index,
        isDraggedElement: element === draggedItem,
        isOverflowIndicator: element.dataset.overflowIndicator === "true",
        element: element as HTMLElement,
        start,
        end: start + size,
        size,
        mid: start + size / 2,
      })
    );
  }
  return dragThresholds;
};

export const getNextDropTarget = (
  dropTargets: MeasuredDropTarget[],
  pos: number,
  direction: Direction
) => {
  const len = dropTargets.length;
  if (direction === FWD) {
    for (let index = 0; index < len; index++) {
      let dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (pos > end) {
        continue;
      } else if (pos > mid) {
        return dropTarget.isDraggedElement ? null : dropTarget;
      } else if (pos > start) {
        dropTarget = dropTargets[index - 1];
        return dropTarget.isDraggedElement ? null : dropTarget;
      }
    }
  } else {
    for (let index = len - 1; index >= 0; index--) {
      let dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (pos < start) {
        continue;
      } else if (pos < mid) {
        return dropTarget.isDraggedElement ? null : dropTarget;
      } else if (pos < end) {
        dropTarget = dropTargets[Math.min(len - 1, index + 1)];
        return dropTarget.isDraggedElement ? null : dropTarget;
      }
    }
  }
  return null;
};
