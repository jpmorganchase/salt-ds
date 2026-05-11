import { ownerWindow, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToolbarRegionPosition } from "./ToolbarRegion";
import {
  buildRegionOverflowRenderSlots,
  type ToolbarNextOverflowItem,
  type ToolbarNextRegionModel,
} from "./toolbarNextUtils";

interface OverflowGroupDefinition {
  id: string;
  key: string;
  label: string;
  named: boolean;
  order: number;
  overflowGroup: string;
  regionKey?: string;
}

interface CollapseUnit {
  groupKey: string;
  itemIds: string[];
  order: number;
  priority: number;
}

export interface ToolbarNextOverflowGroup {
  id: string;
  items: ToolbarNextOverflowItem[];
  key: string;
  label: string;
  named: boolean;
  overflowGroup: string;
  regionKey?: string;
}

interface OverflowState {
  overflowGroups: ToolbarNextOverflowGroup[];
  overflowedIds: Set<string>;
}

interface UseToolbarNextOverflowProps {
  regions: ToolbarNextRegionModel[];
}

type ObservedWidthTarget =
  | {
      kind: "container";
    }
  | {
      id: string;
      kind: "item";
    }
  | {
      id: string;
      kind: "named-trigger";
    }
  | {
      id: string;
      kind: "named-trigger-measure";
    }
  | {
      groupKey: string;
      kind: "shared-trigger-measure";
    };

const emptyOverflowState: OverflowState = {
  overflowGroups: [],
  overflowedIds: new Set<string>(),
};

const bandPositions: ToolbarRegionPosition[] = ["start", "center", "end"];

function measureWidth(element: HTMLElement | null) {
  if (!element) {
    return 0;
  }

  const { width } = element.getBoundingClientRect();
  return Math.ceil(width);
}

function isVisibleMeasurementElement(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const { width, height } = element.getBoundingClientRect();
  const styles = ownerWindow(element).getComputedStyle(element);

  return (
    width > 0 &&
    height > 0 &&
    styles.display !== "none" &&
    styles.visibility !== "hidden"
  );
}

function measureOverflowItemWidth(element: HTMLElement | null) {
  if (!element) {
    return 0;
  }

  const rect = element.getBoundingClientRect();
  let left = rect.left;
  let right = rect.right;

  for (const descendant of element.querySelectorAll("*")) {
    if (!isVisibleMeasurementElement(descendant)) {
      continue;
    }

    const descendantRect = descendant.getBoundingClientRect();
    left = Math.min(left, descendantRect.left);
    right = Math.max(right, descendantRect.right);
  }

  return Math.ceil(Math.max(rect.width, right - left));
}

function readGap(gapValue: string) {
  return Number.parseFloat(gapValue || "0") || 0;
}

function sumFlexWidths(widths: number[], gap: number) {
  if (widths.length === 0) {
    return 0;
  }

  return (
    widths.reduce((total, width) => total + width, 0) +
    gap * (widths.length - 1)
  );
}

function buildGroupDefinitions(items: ToolbarNextOverflowItem[]) {
  const groupMap = new Map<string, OverflowGroupDefinition>();

  for (const [sequence, item] of items.entries()) {
    if (item.overflowMode === "none") {
      continue;
    }

    const existing = groupMap.get(item.overflowGroupKey);

    if (existing) {
      if (!existing.named && item.overflowGroup === "shared") {
        continue;
      }

      if (existing.label === item.overflowGroup && item.overflowLabel) {
        existing.label = item.overflowLabel;
      }

      continue;
    }

    groupMap.set(item.overflowGroupKey, {
      id: `${item.overflowGroupKey}-${sequence}`,
      key: item.overflowGroupKey,
      label:
        item.overflowGroup === "shared"
          ? "More"
          : (item.overflowLabel ?? item.overflowGroup),
      named: item.overflowGroup !== "shared",
      order: sequence,
      overflowGroup: item.overflowGroup,
      regionKey: item.overflowGroup === "shared" ? undefined : item.regionKey,
    });
  }

  return Array.from(groupMap.values()).sort(
    (left, right) => left.order - right.order,
  );
}

function buildCollapseUnits(items: ToolbarNextOverflowItem[]) {
  const groupedUnits = new Map<string, CollapseUnit>();
  const units: CollapseUnit[] = [];

  for (const [sequence, item] of items.entries()) {
    if (item.overflowMode === "none") {
      continue;
    }

    if (item.overflowMode === "grouped" && item.overflowGroup !== "shared") {
      const existing = groupedUnits.get(item.overflowGroupKey);

      if (existing) {
        existing.itemIds.push(item.id);
        existing.order = Math.max(existing.order, sequence);
        existing.priority = Math.max(existing.priority, item.overflowPriority);
        continue;
      }

      const unit: CollapseUnit = {
        groupKey: item.overflowGroupKey,
        itemIds: [item.id],
        order: sequence,
        priority: item.overflowPriority,
      };

      groupedUnits.set(item.overflowGroupKey, unit);
      units.push(unit);
      continue;
    }

    units.push({
      groupKey: item.overflowGroupKey,
      itemIds: [item.id],
      order: sequence,
      priority: item.overflowPriority,
    });
  }

  return units.sort((left, right) => {
    if (left.priority !== right.priority) {
      return right.priority - left.priority;
    }

    return right.order - left.order;
  });
}

function areOverflowStatesEqual(previous: OverflowState, next: OverflowState) {
  if (previous.overflowedIds.size !== next.overflowedIds.size) {
    return false;
  }

  for (const itemId of previous.overflowedIds) {
    if (!next.overflowedIds.has(itemId)) {
      return false;
    }
  }

  if (previous.overflowGroups.length !== next.overflowGroups.length) {
    return false;
  }

  return previous.overflowGroups.every((group, index) => {
    const nextGroup = next.overflowGroups[index];

    if (
      nextGroup == null ||
      group.id !== nextGroup.id ||
      group.label !== nextGroup.label ||
      group.items.length !== nextGroup.items.length
    ) {
      return false;
    }

    return group.items.every((item, itemIndex) => {
      return item.id === nextGroup.items[itemIndex]?.id;
    });
  });
}

interface ComputeToolbarNextOverflowStateArgs {
  collapseUnits: CollapseUnit[];
  containerWidth: number;
  groupDefinitions: OverflowGroupDefinition[];
  itemWidths: Map<string, number>;
  items: ToolbarNextOverflowItem[];
  namedTriggerWidths: Map<string, number>;
  regions: ToolbarNextRegionModel[];
  regionGaps: Map<string, number>;
  rootGap: number;
  triggerWidths: Map<string, number>;
  bandGaps: Map<ToolbarRegionPosition, number>;
}

function computeToolbarNextOverflowState({
  bandGaps,
  collapseUnits,
  containerWidth,
  groupDefinitions,
  itemWidths,
  items,
  namedTriggerWidths,
  regions,
  regionGaps,
  rootGap,
  triggerWidths,
}: ComputeToolbarNextOverflowStateArgs): OverflowState {
  const hasCenteredLayout = regions.some(
    (region) => region.position === "center",
  );
  const regionsByPosition = bandPositions.reduce<
    Record<ToolbarRegionPosition, ToolbarNextRegionModel[]>
  >(
    (bands, position) => {
      bands[position] = regions.filter(
        (region) => region.position === position,
      );
      return bands;
    },
    {
      start: [],
      center: [],
      end: [],
    },
  );
  const overflowedIds = new Set<string>();
  const activeGroups = new Set<string>();

  const getRegionWidth = (region: ToolbarNextRegionModel) => {
    const renderSlots = buildRegionOverflowRenderSlots(
      region.items,
      overflowedIds,
      new Set(
        groupDefinitions
          .filter((group) => {
            return (
              group.named &&
              group.regionKey === region.key &&
              activeGroups.has(group.key)
            );
          })
          .map((group) => group.key),
      ),
    );
    const slotWidths: number[] = [];

    for (const slot of renderSlots) {
      const width =
        slot.triggerGroupKey != null
          ? namedTriggerWidths.get(slot.item.id)
          : itemWidths.get(slot.item.id);

      if (width == null || width <= 0) {
        return null;
      }

      slotWidths.push(width);
    }

    return sumFlexWidths(slotWidths, regionGaps.get(region.key) ?? 0);
  };

  const getBandWidth = (position: ToolbarRegionPosition) => {
    const bandChildWidths: number[] = [];

    for (const region of regionsByPosition[position]) {
      const regionWidth = getRegionWidth(region);

      if (regionWidth == null) {
        return null;
      }

      if (regionWidth > 0) {
        bandChildWidths.push(regionWidth);
      }
    }

    if (position === "end") {
      for (const group of groupDefinitions) {
        if (!group.named && activeGroups.has(group.key)) {
          const width = triggerWidths.get(group.key);

          if (width == null || width <= 0) {
            return null;
          }

          bandChildWidths.push(width);
        }
      }
    }

    return sumFlexWidths(bandChildWidths, bandGaps.get(position) ?? 0);
  };

  const getTotalWidth = () => {
    if (hasCenteredLayout) {
      const startBandWidth = getBandWidth("start");
      const centerBandWidth = getBandWidth("center");
      const endBandWidth = getBandWidth("end");

      if (
        startBandWidth == null ||
        centerBandWidth == null ||
        endBandWidth == null
      ) {
        return null;
      }

      return centerBandWidth + Math.max(startBandWidth, endBandWidth) * 2;
    }

    const visibleBandWidths: number[] = [];

    for (const position of bandPositions) {
      const bandWidth = getBandWidth(position);

      if (bandWidth == null) {
        return null;
      }

      if (bandWidth > 0) {
        visibleBandWidths.push(bandWidth);
      }
    }

    return sumFlexWidths(visibleBandWidths, rootGap);
  };

  const initialWidth = getTotalWidth();

  if (initialWidth == null) {
    return emptyOverflowState;
  }

  if (initialWidth > containerWidth) {
    for (const unit of collapseUnits) {
      for (const itemId of unit.itemIds) {
        overflowedIds.add(itemId);
      }

      activeGroups.add(unit.groupKey);

      const nextWidth = getTotalWidth();

      if (nextWidth == null) {
        return emptyOverflowState;
      }

      if (nextWidth <= containerWidth) {
        break;
      }
    }
  }

  const overflowGroups = groupDefinitions.reduce<ToolbarNextOverflowGroup[]>(
    (groups, group) => {
      const hiddenItems = items.filter(
        (item) =>
          item.overflowGroupKey === group.key && overflowedIds.has(item.id),
      );

      if (hiddenItems.length > 0) {
        groups.push({
          id: group.id,
          items: hiddenItems,
          key: group.key,
          label: group.label,
          named: group.named,
          overflowGroup: group.overflowGroup,
          regionKey: group.regionKey,
        });
      }

      return groups;
    },
    [],
  );

  return {
    overflowGroups,
    overflowedIds,
  };
}

export function useToolbarNextOverflow({
  regions,
}: UseToolbarNextOverflowProps) {
  const targetWindow = useWindow();
  const items = useMemo(
    () => regions.flatMap((region) => region.items),
    [regions],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const bandRefs = useRef<Record<ToolbarRegionPosition, HTMLDivElement | null>>(
    {
      start: null,
      center: null,
      end: null,
    },
  );
  const bandRefCallbacks = useRef(
    new Map<ToolbarRegionPosition, (node: HTMLDivElement | null) => void>(),
  );
  const regionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const regionRefCallbacks = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const itemRefCallbacks = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );
  const namedTriggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const namedTriggerRefCallbacks = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );
  const namedTriggerMeasureRefs = useRef<Record<string, HTMLDivElement | null>>(
    {},
  );
  const namedTriggerMeasureCallbacks = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );
  const triggerMeasureRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const triggerMeasureCallbacks = useRef(
    new Map<string, (node: HTMLButtonElement | null) => void>(),
  );
  const rafRef = useRef<number | null>(null);
  const clearComputingRafRef = useRef<number | null>(null);
  const isComputingRef = useRef(false);
  const pendingMeasureRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedWidthTargetsRef = useRef(
    new Map<Element, ObservedWidthTarget>(),
  );

  const cachedItemWidths = useRef<Record<string, number>>({});
  const cachedNamedTriggerWidths = useRef<Record<string, number>>({});
  const cachedSharedTriggerWidths = useRef<Record<string, number>>({});
  const [overflowState, setOverflowState] =
    useState<OverflowState>(emptyOverflowState);

  const namedTriggerItems = useMemo(
    () =>
      items.filter((item) => {
        return item.overflowMode !== "none" && item.overflowGroup !== "shared";
      }),
    [items],
  );

  const groupDefinitions = useMemo(() => buildGroupDefinitions(items), [items]);
  const collapseUnits = useMemo(() => buildCollapseUnits(items), [items]);

  const computeOverflow = useCallback((): OverflowState => {
    const container = containerRef.current;

    if (!container) {
      return emptyOverflowState;
    }

    const containerStyles = ownerWindow(container).getComputedStyle(container);
    const paddingLeft =
      Number.parseFloat(containerStyles.paddingLeft || "0") || 0;
    const paddingRight =
      Number.parseFloat(containerStyles.paddingRight || "0") || 0;
    const borderLeft =
      Number.parseFloat(containerStyles.borderLeftWidth || "0") || 0;
    const borderRight =
      Number.parseFloat(containerStyles.borderRightWidth || "0") || 0;
    const containerWidth = Math.floor(
      container.getBoundingClientRect().width -
        paddingLeft -
        paddingRight -
        borderLeft -
        borderRight,
    );

    if (containerWidth <= 0) {
      return emptyOverflowState;
    }

    const rootGap = readGap(
      containerStyles.columnGap || containerStyles.gap || "0",
    );
    const bandGaps = new Map<ToolbarRegionPosition, number>();
    const regionGaps = new Map<string, number>();
    const itemWidths = new Map<string, number>();
    const namedTriggerWidths = new Map<string, number>();
    const triggerWidths = new Map<string, number>();

    for (const position of bandPositions) {
      const bandElement = bandRefs.current[position];

      if (!bandElement) {
        bandGaps.set(position, 0);
        continue;
      }

      const bandStyles = ownerWindow(bandElement).getComputedStyle(bandElement);
      bandGaps.set(
        position,
        readGap(bandStyles.columnGap || bandStyles.gap || "0"),
      );
    }

    for (const region of regions) {
      const regionElement = regionRefs.current[region.key];

      if (!regionElement) {
        return emptyOverflowState;
      }

      const regionStyles =
        ownerWindow(regionElement).getComputedStyle(regionElement);

      regionGaps.set(
        region.key,
        readGap(regionStyles.columnGap || regionStyles.gap || "0"),
      );
    }

    for (const item of items) {
      const element = itemRefs.current[item.id];

      if (element) {
        const width = measureOverflowItemWidth(element);

        if (width > 0) {
          itemWidths.set(item.id, width);
          cachedItemWidths.current[item.id] = width;
          continue;
        }
      }

      const cached = cachedItemWidths.current[item.id];
      if (cached != null && cached > 0) {
        itemWidths.set(item.id, cached);
        continue;
      }

      return emptyOverflowState;
    }

    for (const item of namedTriggerItems) {
      const liveWidth = measureWidth(namedTriggerRefs.current[item.id]);

      if (liveWidth > 0) {
        namedTriggerWidths.set(item.id, liveWidth);
        cachedNamedTriggerWidths.current[item.id] = liveWidth;
        continue;
      }

      const measureWidthForItem = measureWidth(
        namedTriggerMeasureRefs.current[item.id],
      );

      if (measureWidthForItem > 0) {
        namedTriggerWidths.set(item.id, measureWidthForItem);
        cachedNamedTriggerWidths.current[item.id] = measureWidthForItem;
        continue;
      }

      const cached = cachedNamedTriggerWidths.current[item.id];
      if (cached != null && cached > 0) {
        namedTriggerWidths.set(item.id, cached);
        continue;
      }

      return emptyOverflowState;
    }

    for (const group of groupDefinitions.filter((entry) => !entry.named)) {
      const width = measureWidth(triggerMeasureRefs.current[group.key]);

      if (width <= 0) {
        const cached = cachedSharedTriggerWidths.current[group.key];

        if (cached != null && cached > 0) {
          triggerWidths.set(group.key, cached);
          continue;
        }

        return emptyOverflowState;
      }

      triggerWidths.set(group.key, width);
      cachedSharedTriggerWidths.current[group.key] = width;
    }

    const nextOverflowState = computeToolbarNextOverflowState({
      bandGaps,
      collapseUnits,
      containerWidth,
      groupDefinitions,
      itemWidths,
      items,
      namedTriggerWidths,
      regions,
      regionGaps,
      rootGap,
      triggerWidths,
    });

    return nextOverflowState;
  }, [collapseUnits, groupDefinitions, items, namedTriggerItems, regions]);

  const scheduleMeasureRef = useRef<() => void>(() => {});

  const scheduleMeasure = useCallback(() => {
    if (!targetWindow) {
      return;
    }

    if (isComputingRef.current) {
      pendingMeasureRef.current = true;
      return;
    }

    if (rafRef.current != null) {
      targetWindow.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = targetWindow.requestAnimationFrame(() => {
      rafRef.current = null;
      isComputingRef.current = true;

      try {
        const nextState = computeOverflow();

        setOverflowState((previous) => {
          return areOverflowStatesEqual(previous, nextState)
            ? previous
            : nextState;
        });
      } finally {
        clearComputingRafRef.current = targetWindow.requestAnimationFrame(
          () => {
            clearComputingRafRef.current = null;
            isComputingRef.current = false;

            if (pendingMeasureRef.current) {
              pendingMeasureRef.current = false;
              scheduleMeasureRef.current();
            }
          },
        );
      }
    });
  }, [computeOverflow, targetWindow]);

  useIsomorphicLayoutEffect(() => {
    scheduleMeasureRef.current = scheduleMeasure;
  }, [scheduleMeasure]);

  const getCachedWidthForObservedTarget = useCallback(
    (target: Exclude<ObservedWidthTarget, { kind: "container" }>) => {
      switch (target.kind) {
        case "item":
          return cachedItemWidths.current[target.id];
        case "named-trigger":
        case "named-trigger-measure":
          return cachedNamedTriggerWidths.current[target.id];
        case "shared-trigger-measure":
          return cachedSharedTriggerWidths.current[target.groupKey];
      }
    },
    [],
  );

  const setCachedWidthForObservedTarget = useCallback(
    (
      target: Exclude<ObservedWidthTarget, { kind: "container" }>,
      width: number,
    ) => {
      switch (target.kind) {
        case "item":
          cachedItemWidths.current[target.id] = width;
          return;
        case "named-trigger":
        case "named-trigger-measure":
          cachedNamedTriggerWidths.current[target.id] = width;
          return;
        case "shared-trigger-measure":
          cachedSharedTriggerWidths.current[target.groupKey] = width;
          return;
      }
    },
    [],
  );

  const observeWidthTarget = useCallback(
    (node: Element | null, target: ObservedWidthTarget) => {
      if (!node) {
        return;
      }

      observedWidthTargetsRef.current.set(node, target);
      resizeObserverRef.current?.observe(node);
    },
    [],
  );

  const unobserveWidthTarget = useCallback((node: Element | null) => {
    if (!node) {
      return;
    }

    observedWidthTargetsRef.current.delete(node);
    resizeObserverRef.current?.unobserve(node);
  }, []);

  const updateObservedNode = useCallback(
    <TElement extends Element>(
      nodes: Record<string, TElement | null>,
      key: string,
      node: TElement | null,
      target: ObservedWidthTarget,
    ) => {
      const previous = nodes[key];

      if (previous === node) {
        return;
      }

      if (previous) {
        unobserveWidthTarget(previous);
      }

      nodes[key] = node;

      if (node) {
        observeWidthTarget(node, target);
      }
    },
    [observeWidthTarget, unobserveWidthTarget],
  );

  useIsomorphicLayoutEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const win = ownerWindow(container);
    const resizeObserver = new win.ResizeObserver((entries) => {
      let shouldMeasure = false;

      for (const entry of entries) {
        const target = observedWidthTargetsRef.current.get(entry.target);

        if (!target) {
          continue;
        }

        if (target.kind === "container") {
          shouldMeasure = true;
          continue;
        }

        const nextWidth =
          target.kind === "item"
            ? measureOverflowItemWidth(entry.target as HTMLElement)
            : measureWidth(entry.target as HTMLElement);

        if (nextWidth <= 0) {
          continue;
        }

        const previousWidth = getCachedWidthForObservedTarget(target);

        if (previousWidth !== nextWidth) {
          setCachedWidthForObservedTarget(target, nextWidth);
          shouldMeasure = true;
        }
      }

      if (shouldMeasure) {
        scheduleMeasureRef.current();
      }
    });

    resizeObserverRef.current = resizeObserver;
    observeWidthTarget(container, { kind: "container" });

    for (const node of observedWidthTargetsRef.current.keys()) {
      resizeObserver.observe(node);
    }

    if (win.document.fonts) {
      void win.document.fonts.ready.then(() => {
        scheduleMeasureRef.current();
      });
    }

    return () => {
      resizeObserverRef.current = null;
      resizeObserver.disconnect();

      if (rafRef.current != null) {
        win.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (clearComputingRafRef.current != null) {
        win.cancelAnimationFrame(clearComputingRafRef.current);
        clearComputingRafRef.current = null;
      }

      isComputingRef.current = false;
      pendingMeasureRef.current = false;
    };
  }, [
    getCachedWidthForObservedTarget,
    observeWidthTarget,
    setCachedWidthForObservedTarget,
  ]);

  const getItemRef = useCallback(
    (id: string) => {
      const existing = itemRefCallbacks.current.get(id);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        updateObservedNode(itemRefs.current, id, node, {
          id,
          kind: "item",
        });
      };

      itemRefCallbacks.current.set(id, callback);
      return callback;
    },
    [updateObservedNode],
  );

  const getNamedTriggerRef = useCallback(
    (id: string) => {
      const existing = namedTriggerRefCallbacks.current.get(id);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        updateObservedNode(namedTriggerRefs.current, id, node, {
          id,
          kind: "named-trigger",
        });
      };

      namedTriggerRefCallbacks.current.set(id, callback);
      return callback;
    },
    [updateObservedNode],
  );

  const getNamedTriggerMeasureRef = useCallback(
    (id: string) => {
      const existing = namedTriggerMeasureCallbacks.current.get(id);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        updateObservedNode(namedTriggerMeasureRefs.current, id, node, {
          id,
          kind: "named-trigger-measure",
        });
      };

      namedTriggerMeasureCallbacks.current.set(id, callback);
      return callback;
    },
    [updateObservedNode],
  );

  const getRegionRef = useCallback((regionKey: string) => {
    const existing = regionRefCallbacks.current.get(regionKey);

    if (existing) {
      return existing;
    }

    const callback = (node: HTMLDivElement | null) => {
      regionRefs.current[regionKey] = node;
    };

    regionRefCallbacks.current.set(regionKey, callback);
    return callback;
  }, []);
  const getBandRef = useCallback((position: ToolbarRegionPosition) => {
    const existing = bandRefCallbacks.current.get(position);

    if (existing) {
      return existing;
    }

    const callback = (node: HTMLDivElement | null) => {
      bandRefs.current[position] = node;
    };

    bandRefCallbacks.current.set(position, callback);
    return callback;
  }, []);

  const getTriggerMeasureRef = useCallback(
    (groupKey: string) => {
      const existing = triggerMeasureCallbacks.current.get(groupKey);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLButtonElement | null) => {
        updateObservedNode(triggerMeasureRefs.current, groupKey, node, {
          groupKey,
          kind: "shared-trigger-measure",
        });
      };

      triggerMeasureCallbacks.current.set(groupKey, callback);
      return callback;
    },
    [updateObservedNode],
  );

  return {
    containerRef,
    getBandRef,
    getItemRef,
    getNamedTriggerMeasureRef,
    getNamedTriggerRef,
    getRegionRef,
    getTriggerMeasureRef,
    isOverflowing: overflowState.overflowGroups.length > 0,
    overflowGroups: overflowState.overflowGroups,
    overflowedIds: overflowState.overflowedIds,
    overflowTriggerGroups: groupDefinitions,
  };
}
