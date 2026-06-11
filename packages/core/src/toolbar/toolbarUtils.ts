import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Divider } from "../divider";
import { getRefFromChildren } from "../utils";

import {
  ToolbarContent,
  type ToolbarContentPosition,
  type ToolbarContentProps,
} from "./ToolbarContent";
import {
  Tooltray,
  type TooltrayOverflowMode,
  type TooltrayProps,
} from "./Tooltray";

export type ToolbarMode = "explicit" | "flat" | "invalid";

type ToolbarChild = Exclude<ReactNode, boolean | null | undefined>;

export interface ToolbarOverflowItem {
  align: NonNullable<TooltrayProps["align"]>;
  element: ReactElement<TooltrayProps>;
  id: string;
  leadingDecorations: ReactElement[];
  order: number;
  overflowGroup: string;
  overflowGroupKey: string;
  overflowLabel?: string;
  overflowMode: TooltrayOverflowMode;
  overflowPriority: number;
  contentKey: string;
  trailingDecorations: ReactElement[];
}

export interface ToolbarOverflowRenderSlot {
  item: ToolbarOverflowItem;
  overflowed: boolean;
  showLeadingDecorations: boolean;
  showTrailingDecorations: boolean;
  triggerGroupKey?: string;
}

export interface ToolbarContentModel {
  implicit: boolean;
  items: ToolbarOverflowItem[];
  key: string;
  position: ToolbarContentPosition;
  props: Omit<ToolbarContentProps, "children" | "position">;
  ref: Ref<HTMLDivElement> | null;
}

export interface ToolbarModel {
  mode: ToolbarMode;
  content: ToolbarContentModel[];
}

export function buildContentOverflowRenderSlots(
  items: ToolbarOverflowItem[],
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

  const slots: ToolbarOverflowRenderSlot[] = [];
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

export function flattenToolbarChildren(children: ReactNode): ToolbarChild[] {
  const flattened: ToolbarChild[] = [];

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
  child: ToolbarChild,
): child is ReactElement<ToolbarContentProps> {
  return isValidElement(child) && child.type === ToolbarContent;
}

function isTooltrayElement(
  child: ToolbarChild,
): child is ReactElement<TooltrayProps> {
  return isValidElement(child) && child.type === Tooltray;
}

function isDividerElement(child: ToolbarChild): child is ReactElement {
  return isValidElement(child) && child.type === Divider;
}

function buildItemId(
  contentKey: string,
  element: ReactElement<TooltrayProps>,
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
): ToolbarOverflowItem[] | null {
  const flattenedChildren = flattenToolbarChildren(children);
  const items: ToolbarOverflowItem[] = [];
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
  children: ToolbarChild[],
): ToolbarContentModel[] | null {
  const content: ToolbarContentModel[] = [];

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

function normalizeFlatChildren(children: ToolbarChild[]) {
  const buckets: Record<ToolbarContentPosition, ToolbarChild[]> = {
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
    ToolbarContentModel[]
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

export function normalizeToolbarChildren(children: ReactNode): ToolbarModel {
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
