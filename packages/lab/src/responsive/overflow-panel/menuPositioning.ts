import { UseFloatingUIProps } from "@jpmorganchase/uitk-core";
import warning from "warning";

export const DEFAULT_ROOT_PLACEMENT = "bottom-start";

type Position = "bottom" | "right" | "left" | "top";
type Alignment = string;

export type LayoutProps = {
  parentElement?: HTMLElement;
  rootPlacement?: string;
};

export type MenuData = {
  props: LayoutProps;
  menuHeight?: number;
  menuWidth?: number;
  minWidth?: number;
  getBoundingClientRect: (el: HTMLElement) => any;
  getScreenBounds: () => { clientWidth: number; clientHeight: number };
};

const VERTICAL_POSITIONS = ["left", "right"];
const HORIZONTAL_POSITIONS = ["top", "bottom"];
const ALL_POSITIONS = VERTICAL_POSITIONS.concat(HORIZONTAL_POSITIONS);

const getPlacement = ({
  position,
  alignment,
}: {
  position: Position;
  alignment: Alignment;
}): UseFloatingUIProps["placement"] =>
  [position, alignment]
    .filter(Boolean)
    .join("-") as UseFloatingUIProps["placement"];

function getRootPlacement({ props }: MenuData) {
  const { rootPlacement = DEFAULT_ROOT_PLACEMENT } = props;
  const [position, alignment] = rootPlacement.split("-") as [
    Position,
    Alignment
  ];

  const hasValidPosition = ALL_POSITIONS.indexOf(position) !== -1;

  // when we have an unexpected rootPlacement value
  if (!hasValidPosition) {
    if (process.env.NODE_ENV !== "production") {
      warning(
        hasValidPosition,
        `${rootPlacement} is not a valid placement. ${DEFAULT_ROOT_PLACEMENT} will be used instead.`
      );
    }
    return DEFAULT_ROOT_PLACEMENT;
  }

  return getPlacement({
    position,
    alignment,
  });
}

export function evaluateMenuPlacement(
  menuData: MenuData
): UseFloatingUIProps["placement"] {
  return getRootPlacement(menuData);
}

export function evaluateMenuOffset({
  props,
  getBoundingClientRect,
  rootPlacementOffset = "0,0",
}: {
  props: LayoutProps;
  getBoundingClientRect: (el: HTMLElement) => any;
  rootPlacementOffset?: string;
}): { mainAxis: number; crossAxis: number } {
  const { parentElement } = props;
  const [x, y] = rootPlacementOffset.split(",").map(Number);
  let offsetY = y;
  if (parentElement) {
    // If beyond bounds, override offset to fit
    const { top } = getBoundingClientRect(parentElement);
    offsetY = -y - top;
  }
  return { mainAxis: x, crossAxis: offsetY }; //`${x},${offsetY}`;
}

export function getMaxHeight(
  heightProp: number | undefined,
  menuMargin: number,
  getScreenBounds: () => { clientHeight: number; clientWidth: number }
) {
  const { clientHeight } = getScreenBounds();

  let suggestedHeight = clientHeight - menuMargin;
  if (heightProp) {
    suggestedHeight = Math.min(heightProp, clientHeight) - menuMargin;
  }

  return Math.max(suggestedHeight, 0);
}

export function getHeight(
  heightProp: number | undefined,
  calculatedMenuHeight: number,
  maxHeight: number
) {
  if (heightProp) {
    return Math.min(heightProp, calculatedMenuHeight, maxHeight);
  }

  return Math.min(calculatedMenuHeight, maxHeight);
}

export const defaultGetBoundingClientRect = (containerNode: HTMLElement) =>
  containerNode.getBoundingClientRect();

export const defaultGetScreenBounds = () => {
  const { clientHeight, clientWidth } = document.documentElement;
  return { clientHeight, clientWidth };
};
