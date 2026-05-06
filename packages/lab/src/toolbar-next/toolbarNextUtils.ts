import { Divider } from "@salt-ds/core";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  ToolbarRegion,
  type ToolbarRegionPosition,
  type ToolbarRegionProps,
} from "./ToolbarRegion";
import {
  TooltrayNext,
  type TooltrayNextOverflowMode,
  type TooltrayNextProps,
} from "./Tooltray";

export type ToolbarNextMode = "explicit" | "flat" | "invalid";

type ToolbarNextChild = Exclude<ReactNode, boolean | null | undefined>;

export interface ToolbarNextOverflowItem {
  align: NonNullable<TooltrayNextProps["align"]>;
  element: ReactElement<TooltrayNextProps>;
  id: string;
  leadingDecorations: ReactElement[];
  order: number;
  overflowGroup: string;
  overflowGroupKey: string;
  overflowLabel?: string;
  overflowMode: TooltrayNextOverflowMode;
  overflowPriority: number;
  regionKey: string;
  trailingDecorations: ReactElement[];
}

export interface ToolbarNextOverflowRenderSlot {
  item: ToolbarNextOverflowItem;
  overflowed: boolean;
  showLeadingDecorations: boolean;
  showTrailingDecorations: boolean;
  triggerGroupKey?: string;
}

export interface ToolbarNextRegionModel {
  implicit: boolean;
  items: ToolbarNextOverflowItem[];
  key: string;
  position: ToolbarRegionPosition;
  props: Omit<ToolbarRegionProps, "children" | "position">;
}

export interface ToolbarNextModel {
  mode: ToolbarNextMode;
  regions: ToolbarNextRegionModel[];
}

export function buildRegionOverflowRenderSlots(
  items: ToolbarNextOverflowItem[],
  overflowedIds: Set<string>,
  activeNamedGroupKeys: Set<string>,
) {
  const triggerGroupByItemId = new Map<string, string>();

  for (const groupKey of activeNamedGroupKeys) {
    const anchorItem = items.find((item) => {
      return overflowedIds.has(item.id) && item.overflowGroupKey === groupKey;
    });

    if (anchorItem) {
      triggerGroupByItemId.set(anchorItem.id, groupKey);
    }
  }

  const slots: ToolbarNextOverflowRenderSlot[] = [];
  let hasSurvivingPredecessor = false;

  for (const item of items) {
    const overflowed = overflowedIds.has(item.id);
    const triggerGroupKey = triggerGroupByItemId.get(item.id);
    const survives = !overflowed || triggerGroupKey != null;

    if (overflowed && !triggerGroupKey) {
      continue;
    }

    slots.push({
      item,
      overflowed,
      showLeadingDecorations:
        item.leadingDecorations.length > 0 &&
        hasSurvivingPredecessor &&
        survives,
      showTrailingDecorations:
        !overflowed && item.trailingDecorations.length > 0,
      triggerGroupKey,
    });

    if (survives) {
      hasSurvivingPredecessor = true;
    }
  }

  return slots;
}

export function flattenToolbarChildren(
  children: ReactNode,
): ToolbarNextChild[] {
  const flattened: ToolbarNextChild[] = [];

  Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") {
      return;
    }

    if (isValidElement(child) && child.type === Fragment) {
      flattened.push(...flattenToolbarChildren(child.props.children));
      return;
    }

    flattened.push(child);
  });

  return flattened;
}

function isToolbarRegionElement(
  child: ToolbarNextChild,
): child is ReactElement<ToolbarRegionProps> {
  return isValidElement(child) && child.type === ToolbarRegion;
}

function isTooltrayElement(
  child: ToolbarNextChild,
): child is ReactElement<TooltrayNextProps> {
  return isValidElement(child) && child.type === TooltrayNext;
}

function isDividerElement(child: ToolbarNextChild): child is ReactElement {
  return isValidElement(child) && child.type === Divider;
}

function buildItemId(
  regionKey: string,
  element: ReactElement<TooltrayNextProps>,
  order: number,
) {
  const elementKey =
    element.key != null ? String(element.key) : `tray-${order}`;
  return `${regionKey}-${elementKey}-${order}`;
}

function buildOverflowGroupKey(regionKey: string, overflowGroup: string) {
  return overflowGroup === "shared"
    ? "shared"
    : `${regionKey}:${overflowGroup}`;
}

function normalizeRegionItems(
  children: ReactNode,
  regionKey: string,
): ToolbarNextOverflowItem[] | null {
  const flattenedChildren = flattenToolbarChildren(children);
  const items: ToolbarNextOverflowItem[] = [];
  let pendingLeadingDecorations: ReactElement[] = [];

  for (const child of flattenedChildren) {
    if (isDividerElement(child)) {
      pendingLeadingDecorations.push(child);
      continue;
    }

    if (!isTooltrayElement(child)) {
      return null;
    }

    const {
      align = "start",
      overflowGroup = "shared",
      overflowLabel,
      overflowMode = "independent",
      overflowPriority = 0,
    } = child.props;
    const order = items.length;

    items.push({
      align,
      element: child,
      id: buildItemId(regionKey, child, order),
      leadingDecorations: pendingLeadingDecorations,
      order,
      overflowGroup,
      overflowGroupKey: buildOverflowGroupKey(regionKey, overflowGroup),
      overflowLabel,
      overflowMode,
      overflowPriority,
      regionKey,
      trailingDecorations: [],
    });

    pendingLeadingDecorations = [];
  }

  if (pendingLeadingDecorations.length > 0 && items.length > 0) {
    items[items.length - 1]?.trailingDecorations.push(
      ...pendingLeadingDecorations,
    );
  }

  return items;
}

function normalizeExplicitRegions(
  children: ToolbarNextChild[],
): ToolbarNextRegionModel[] | null {
  const regions: ToolbarNextRegionModel[] = [];

  for (const [index, child] of children.entries()) {
    if (!isToolbarRegionElement(child)) {
      continue;
    }

    const { children: regionChildren, position, ...regionProps } = child.props;
    const regionKey =
      child.key != null ? String(child.key) : `${position}-region-${index}`;
    const items = normalizeRegionItems(regionChildren, regionKey);

    if (items == null) {
      return null;
    }

    regions.push({
      implicit: false,
      items,
      key: regionKey,
      position,
      props: regionProps,
    });
  }

  return regions;
}

function normalizeFlatChildren(children: ToolbarNextChild[]) {
  const buckets: Record<ToolbarRegionPosition, ToolbarNextChild[]> = {
    start: [],
    center: [],
    end: [],
  };
  let currentPosition: ToolbarRegionPosition = "start";

  for (const child of children) {
    if (isTooltrayElement(child)) {
      currentPosition = child.props.align ?? "start";
      buckets[currentPosition].push(child);
      continue;
    }

    if (isDividerElement(child)) {
      buckets[currentPosition].push(child);
      continue;
    }

    return null;
  }

  return (Object.keys(buckets) as ToolbarRegionPosition[]).reduce<
    ToolbarNextRegionModel[]
  >((regions, position) => {
    const regionKey = `${position}-implicit`;
    const regionItems = normalizeRegionItems(buckets[position], regionKey);

    if (regionItems == null || regionItems.length === 0) {
      return regions;
    }

    regions.push({
      implicit: true,
      items: regionItems,
      key: regionKey,
      position,
      props: {},
    });

    return regions;
  }, []);
}

export function normalizeToolbarChildren(
  children: ReactNode,
): ToolbarNextModel {
  const flattenedChildren = flattenToolbarChildren(children);
  const hasRegionChildren = flattenedChildren.some(isToolbarRegionElement);
  const hasOnlyRegions =
    hasRegionChildren && flattenedChildren.every(isToolbarRegionElement);
  const hasOnlyFlatChildren = flattenedChildren.every(
    (child) => isTooltrayElement(child) || isDividerElement(child),
  );

  if (hasOnlyRegions) {
    const regions = normalizeExplicitRegions(flattenedChildren);

    if (regions == null) {
      return { mode: "invalid", regions: [] };
    }

    return {
      mode: "explicit",
      regions,
    };
  }

  if (hasOnlyFlatChildren) {
    const regions = normalizeFlatChildren(flattenedChildren);

    if (regions == null) {
      return { mode: "invalid", regions: [] };
    }

    return {
      mode: "flat",
      regions,
    };
  }

  return {
    mode: "invalid",
    regions: [],
  };
}
