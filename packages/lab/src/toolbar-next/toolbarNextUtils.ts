import { Divider, getRefFromChildren } from "@salt-ds/core";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  ToolbarContent,
  type ToolbarContentPosition,
  type ToolbarContentProps,
} from "./ToolbarContent";
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
  contentKey: string;
  trailingDecorations: ReactElement[];
}

export interface ToolbarNextOverflowRenderSlot {
  item: ToolbarNextOverflowItem;
  overflowed: boolean;
  showLeadingDecorations: boolean;
  showTrailingDecorations: boolean;
  triggerGroupKey?: string;
}

export interface ToolbarNextContentModel {
  implicit: boolean;
  items: ToolbarNextOverflowItem[];
  key: string;
  position: ToolbarContentPosition;
  props: Omit<ToolbarContentProps, "children" | "position">;
  ref: Ref<HTMLDivElement> | null;
}

export interface ToolbarNextModel {
  mode: ToolbarNextMode;
  content: ToolbarNextContentModel[];
}

export function buildContentOverflowRenderSlots(
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

function isToolbarContentElement(
  child: ToolbarNextChild,
): child is ReactElement<ToolbarContentProps> {
  return isValidElement(child) && child.type === ToolbarContent;
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
  contentKey: string,
  element: ReactElement<TooltrayNextProps>,
  order: number,
) {
  const elementKey =
    element.key != null ? String(element.key) : `tray-${order}`;
  return `${contentKey}-${elementKey}-${order}`;
}

function buildOverflowGroupKey(contentKey: string, overflowGroup: string) {
  return overflowGroup === "shared"
    ? "shared"
    : `${contentKey}:${overflowGroup}`;
}

function normalizeContentItems(
  children: ReactNode,
  contentKey: string,
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
      id: buildItemId(contentKey, child, order),
      leadingDecorations: pendingLeadingDecorations,
      order,
      overflowGroup,
      overflowGroupKey: buildOverflowGroupKey(contentKey, overflowGroup),
      overflowLabel,
      overflowMode,
      overflowPriority,
      contentKey,
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

function normalizeExplicitContent(
  children: ToolbarNextChild[],
): ToolbarNextContentModel[] | null {
  const content: ToolbarNextContentModel[] = [];

  for (const [index, child] of children.entries()) {
    if (!isToolbarContentElement(child)) {
      continue;
    }

    const {
      children: contentChildren,
      position,
      ...contentProps
    } = child.props;
    const contentKey =
      child.key != null ? String(child.key) : `${position}-content-${index}`;
    const items = normalizeContentItems(contentChildren, contentKey);

    if (items == null) {
      return null;
    }

    content.push({
      implicit: false,
      items,
      key: contentKey,
      position,
      props: contentProps,
      ref: getRefFromChildren(child),
    });
  }

  return content;
}

function normalizeFlatChildren(children: ToolbarNextChild[]) {
  const buckets: Record<ToolbarContentPosition, ToolbarNextChild[]> = {
    start: [],
    center: [],
    end: [],
  };
  let currentPosition: ToolbarContentPosition = "start";

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

  return (Object.keys(buckets) as ToolbarContentPosition[]).reduce<
    ToolbarNextContentModel[]
  >((content, position) => {
    const contentKey = `${position}-implicit`;
    const contentItems = normalizeContentItems(buckets[position], contentKey);

    if (contentItems == null || contentItems.length === 0) {
      return content;
    }

    content.push({
      implicit: true,
      items: contentItems,
      key: contentKey,
      position,
      props: {},
      ref: null,
    });

    return content;
  }, []);
}

export function normalizeToolbarChildren(
  children: ReactNode,
): ToolbarNextModel {
  const flattenedChildren = flattenToolbarChildren(children);
  const hasContentChildren = flattenedChildren.some(isToolbarContentElement);
  const hasOnlyContent =
    hasContentChildren && flattenedChildren.every(isToolbarContentElement);
  const hasOnlyFlatChildren = flattenedChildren.every(
    (child) => isTooltrayElement(child) || isDividerElement(child),
  );

  if (hasOnlyContent) {
    const content = normalizeExplicitContent(flattenedChildren);

    if (content == null) {
      return { mode: "invalid", content: [] };
    }

    return {
      mode: "explicit",
      content,
    };
  }

  if (hasOnlyFlatChildren) {
    const content = normalizeFlatChildren(flattenedChildren);

    if (content == null) {
      return { mode: "invalid", content: [] };
    }

    return {
      mode: "flat",
      content,
    };
  }

  return {
    mode: "invalid",
    content: [],
  };
}
