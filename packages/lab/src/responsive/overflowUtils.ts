import {
  collapsibleType,
  ElementRef,
  ManagedItem,
  orientationType,
} from "./overflowTypes";
import { Dimensions } from "./overflowDimensions";

export type heightOrWidth = "width" | "height";
export const NO_DATA = {};
const LEFT_RIGHT = ["left", "right"];
const TOP_BOTTOM = ["top", "bottom"];

export const allExceptOverflowIndicator = (sum: number, m: ManagedItem) =>
  sum + (m.isOverflowIndicator ? 0 : m.size);

export const isCollapsed = (item: ManagedItem) => item.collapsed === true;
export const isCollapsing = (item: ManagedItem) => item.collapsing === true;
export const isCollapsedOrCollapsing = (item: ManagedItem) =>
  isCollapsed(item) || isCollapsing(item);
export const isOverflowed = (item: ManagedItem) => item.overflowed === true;
export const notOverflowed = (item: ManagedItem) => !isOverflowed(item);

export const isCollapsible = (item: ManagedItem) =>
  item.collapsible === "instant" || item.collapsible === "dynamic";

export const getIsOverflowed = (managedItems: ManagedItem[]) =>
  managedItems.some(isOverflowed);

export const measureContainer = (
  ref: ElementRef,
  orientation: orientationType = "horizontal"
): { innerContainerSize: number; rootContainerDepth: number } => {
  const dim = Dimensions[orientation];
  const innerElement = ref.current as HTMLElement;
  const { [dim.depth]: rootContainerDepth } = innerElement.parentElement!;
  const { [dim.size]: innerContainerSize } = innerElement;
  return { innerContainerSize, rootContainerDepth };
};

export const measureContainerOverflow = (
  ref: ElementRef,
  orientation: orientationType = "horizontal"
): {
  isOverflowing: boolean;
  innerContainerSize: number;
  rootContainerDepth: number;
} => {
  const dim = Dimensions[orientation];
  const innerElement = ref.current as HTMLElement;
  const { [dim.depth]: rootContainerDepth } = innerElement.parentElement!;
  const { [dim.scrollDepth]: scrollDepth, [dim.size]: innerContainerSize } =
    innerElement;
  const isOverflowing = rootContainerDepth < scrollDepth;
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
  includeAutoMargin = false
) {
  const { [dimension]: size } = element.getBoundingClientRect();
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
    // TODO should we consider percentage values ?
    // TODO are we still using flexBasis ?
    if (!isNaN(flexBasis) && flexBasis > 0) {
      minWidth = flexBasis;
    }
  }

  return marginStart + minWidth + marginEnd;
}

export const byDescendingPriority = (m1: ManagedItem, m2: ManagedItem) => {
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
function getElementText(element: HTMLElement) {
  if (element.dataset.text) {
    return element.dataset.text;
  }
  const textNode = element.querySelector("[data-text]") as HTMLElement;
  if (textNode) {
    return textNode.dataset.text;
  }
  return "";
}
const asCollapsibleType = (value?: string): collapsibleType | undefined =>
  value === "instant" || value == "dynamic"
    ? (value as collapsibleType)
    : undefined;

export const getOverflowIndicator = (managedItems: ManagedItem[]) =>
  managedItems.find((item) => item.isOverflowIndicator);

// TODO whats the right way to deduce the label. AccessibleText added
// to eg delete button makes innerText unreliable.
const getLabelForElement = (element: HTMLElement) =>
  element.title || getElementText(element) || element.innerText;

const getPriority = (item: ManagedItem) => item.priority;

export const popNextItemByPriority = (items: ManagedItem[]) => {
  const maxPriority = Math.max(...items.map(getPriority));
  for (let i = items.length - 1; i >= 0; i--) {
    if (!items[i].isOverflowIndicator && items[i].priority === maxPriority) {
      return items.splice(i, 1)[0];
    }
  }
  return null;
};

// This is a cut down version of the same function from html-element-utils
export const measureChildNodes = (
  ref: ElementRef,
  dimension: heightOrWidth
): ManagedItem[] => {
  const { current: innerEl } = ref;
  const measurements = Array.from(innerEl!.childNodes).reduce(
    (list: ManagedItem[], node) => {
      const childElement = node as HTMLElement;
      const {
        collapsible,
        collapsed = "false",
        collapsing = "false",
        index,
        priority = "1",
        overflowIndicator,
        overflowed,
        reclaimSpace,
      } = childElement.dataset ?? NO_DATA;
      if (index) {
        const size = measureElementSize(childElement, dimension);
        // if (overflowed) {
        //   delete childElement.dataset.overflowed;
        // }
        list.push({
          collapsible: asCollapsibleType(collapsible),
          collapsed: collapsed === "true",
          collapsing: collapsing === "true",
          fullSize: null,
          index: parseInt(index, 10),
          isOverflowIndicator: overflowIndicator === "true",
          label: getLabelForElement(childElement),
          overflowed: overflowed === "true",
          priority: parseInt(priority, 10),
          reclaimSpace: reclaimSpace === "true",
          size,
        });
      }
      return list;
    },
    []
  );

  // return measurements.sort(byDescendingPriority);
  return measurements;
};

export const addAll = (sum: number, m: ManagedItem): number => sum + m.size;

export const getElementForItem = (ref: ElementRef, item: ManagedItem) =>
  ref.current!.querySelector(
    `:scope > [data-index='${item.index}']`
  ) as HTMLElement;

type dimension = "left" | "right" | "top" | "bottom";

export const getRuntimePadding = (
  el: HTMLElement,
  ...dimensions: dimension[]
): number[] => {
  const targetStyle = getComputedStyle(el);
  return dimensions.map((dimension) =>
    parseInt(targetStyle.getPropertyValue(`padding-${dimension}`), 10)
  );
};
