import type {
  ElementRef,
  OverflowItem,
  orientationType,
} from "./overflowTypes";

export const DropdownPlaceholder = () => null;
export const getDropdownPlaceholder = () => <DropdownPlaceholder />;

export type heightOrWidth = "width" | "height";
export const NO_DATA = {};
const LEFT_RIGHT = ["left", "right"];
const TOP_BOTTOM = ["top", "bottom"];

export const allExceptOverflowIndicator = (sum: number, m: OverflowItem) =>
  sum + (m.isOverflowIndicator ? 0 : m.size);

export const isCollapsed = (item: OverflowItem): boolean =>
  item.collapsed === true;
export const isCollapsing = (item: OverflowItem): boolean =>
  item.collapsing === true;
export const isCollapsedOrCollapsing = (item: OverflowItem): boolean =>
  isCollapsed(item) || isCollapsing(item);
export const isOverflowed = (item: OverflowItem): boolean =>
  item.overflowed === true;
export const notOverflowed = (item: OverflowItem): boolean =>
  !isOverflowed(item);

export const isCollapsible = (item: OverflowItem) =>
  item.collapsible === "instant" || item.collapsible === "dynamic";

export const getIsOverflowed = (managedItems: OverflowItem[]) =>
  managedItems.some(isOverflowed);

export const measureContainer = (
  ref: ElementRef,
  orientation: orientationType = "horizontal",
): {
  innerContainerSize: number;
  rootContainerDepth: number;
  innerContainerDepth: number;
} => {
  const innerElement = ref.current as HTMLElement;
  const container = innerElement.parentElement;
  if (container) {
    const { width: innerWidth, height: innerHeight } =
      innerElement.getBoundingClientRect();
    const { width, height } = container.getBoundingClientRect();
    if (orientation === "horizontal") {
      return {
        innerContainerSize: innerWidth,
        rootContainerDepth: height,
        innerContainerDepth: innerHeight,
      };
    }
    return {
      innerContainerSize: innerHeight,
      rootContainerDepth: width,
      innerContainerDepth: innerWidth,
    };
  }
  throw Error("measureContainer, innerContainer has no parent element");
};

const isContainerOverflowing = (
  containerDepth: number,
  parentContainerDepth: number,
  innerElement: HTMLElement,
  orientation: orientationType,
) => {
  const isHorizontal = orientation === "horizontal";
  // If true, this is a reliable indication of content wrapping, but the containerDepth
  // is not always correct
  if (containerDepth > parentContainerDepth) {
    return true;
  }
  // ... hence - expensive, but catches those situations where the containerDepth is wrong
  const { bottom, right } = innerElement.getBoundingClientRect();
  const maxPos = Array.from(innerElement.childNodes).reduce<number>(
    (maxVal, child) => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      return Math.max(isHorizontal ? rect.bottom : rect.right, maxVal);
    },
    isHorizontal ? bottom : right,
  );
  return isHorizontal ? maxPos > bottom : maxPos > right;
};

export const measureContainerOverflow = (
  ref: ElementRef,
  orientation: orientationType = "horizontal",
): {
  isOverflowing: boolean;
  innerContainerSize: number;
  rootContainerDepth: number;
} => {
  const { innerContainerDepth, innerContainerSize, rootContainerDepth } =
    measureContainer(ref, orientation);
  const innerElement = ref.current as HTMLElement;
  const isOverflowing = isContainerOverflowing(
    innerContainerDepth,
    rootContainerDepth,
    innerElement,
    orientation,
  );

  return { isOverflowing, innerContainerSize, rootContainerDepth };
};

/**
 * Compute element size including margin.
 * Exclude margin where this has been applied for alignment, via margin: auto
 * which can be identified by the data-pad-end, data-pad-start attributes.
 **/
export function measureElementSize(
  element: HTMLElement,
  dimension: heightOrWidth = "width",
  includeAutoMargin = false,
): number {
  const { [dimension]: size } = element.getBoundingClientRect();
  const { padEnd = false, padStart = false } = element.dataset;
  const style = getComputedStyle(element);
  const [start, end] = dimension === "width" ? LEFT_RIGHT : TOP_BOTTOM;
  const marginStart =
    padStart && !includeAutoMargin
      ? 0
      : Number.parseInt(style.getPropertyValue(`margin-${start}`), 10);
  const marginEnd =
    padEnd && !includeAutoMargin
      ? 0
      : Number.parseInt(style.getPropertyValue(`margin-${end}`), 10);

  let minWidth = size;
  const flexShrink = Number.parseInt(style.getPropertyValue("flex-shrink"), 10);
  if (flexShrink > 0) {
    const flexBasis = Number.parseInt(style.getPropertyValue("flex-basis"), 10);
    // TODO should we consider percentage values ?
    // TODO are we still using flexBasis ?
    if (!Number.isNaN(flexBasis) && flexBasis > 0) {
      minWidth = flexBasis;
    }
  }

  return marginStart + minWidth + marginEnd;
}

export const byDescendingPriority = (m1: OverflowItem, m2: OverflowItem) => {
  let result = m1.priority - m2.priority;
  if (result === 0) {
    result = m1.index - m2.index;
  }
  return result;
};

// Helper function to try and determine the display label for an overflow item
// Currently, Tab uses data-text, so this works for any Tab. Need to decide
// whether this is appropriate for other components.
// Note: Tab uses data-text for another reason, it is not implemented there just to
// support this function.
// There may be an aria attribute we should use instead
// function getElementText(element: HTMLElement) {
//   if (element.dataset.text) {
//     return element.dataset.text;
//   }
//   const textNode = element.querySelector("[data-text]") as HTMLElement;
//   if (textNode) {
//     return textNode.dataset.text;
//   }
//   return "";
// }
// const asCollapsibleType = (value?: string): collapsibleType | undefined =>
//   value === "instant" || value == "dynamic"
//     ? (value as collapsibleType)
//     : undefined;

export const getOverflowIndicator = (managedItems: OverflowItem[]) =>
  managedItems.find((item) => item.isOverflowIndicator);

// TODO whats the right way to deduce the label. AccessibleText added
// to eg delete button makes innerText unreliable.
// const getLabelForElement = (element: HTMLElement) =>
//   element.title || getElementText(element) || element.innerText;

const getPriority = (item: OverflowItem) => item.priority;

export const popNextItemByPriority = (
  items: OverflowItem[],
): OverflowItem | null => {
  const maxPriority = Math.max(...items.map(getPriority));
  for (let i = items.length - 1; i >= 0; i--) {
    if (!items[i].isOverflowIndicator && items[i].priority === maxPriority) {
      return items.splice(i, 1)[0];
    }
  }
  return null;
};

export const measureOverflowItems = (
  items: OverflowItem[],
  dimension: heightOrWidth,
): OverflowItem[] => {
  const measurements = items.map(({ id }) => {
    const childElement = document.getElementById(id);
    const size = childElement ? measureElementSize(childElement, dimension) : 0;
    return size;
  });

  if (measurements.some((size, i) => size !== items[i].size)) {
    return items.map((item, i) =>
      item.size === measurements[i]
        ? item
        : {
            ...item,
            size: measurements[i],
          },
    );
  }
  return items;
};

export const addAll = (sum: number, m: OverflowItem): number => sum + m.size;

export const getElementForItem = (ref: ElementRef, item: OverflowItem) =>
  ref.current?.querySelector<HTMLElement>(
    `:scope > [data-index='${item.index}']`,
  );

type dimension = "left" | "right" | "top" | "bottom";

export const getRuntimePadding = (
  el: HTMLElement,
  ...dimensions: dimension[]
): number[] => {
  const targetStyle = getComputedStyle(el);
  return dimensions.map((dimension) =>
    Number.parseInt(targetStyle.getPropertyValue(`padding-${dimension}`), 10),
  );
};
