import {
  flip,
  offset,
  size,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingUI,
  useForkRef,
  useIcon,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useFocusOutside } from "../tabs-next/hooks/useFocusOutside";
import toolbarNextOverflowCss from "./ToolbarNextOverflow.css";
import { ToolbarRegion } from "./ToolbarRegion";
import {
  TOOLBAR_NEXT_GROUP_KEY_ATTR,
  TOOLBAR_NEXT_ITEM_ATTR,
  TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR,
  TOOLBAR_NEXT_SCOPE_ROOT_ATTR,
} from "./toolbarNextKeyboardUtils";
import type {
  ToolbarNextOverflowItem,
  ToolbarNextRegionModel,
} from "./toolbarNextUtils";
import { buildRegionOverflowRenderSlots } from "./toolbarNextUtils";
import { useToolbarNextKeyboardNavigation } from "./useToolbarNextKeyboardNavigation";
import type { ToolbarNextOverflowGroup } from "./useToolbarNextOverflow";

const withBaseName = makePrefixer("saltToolbarNextOverflow");

interface ToolbarNextOverflowOwnersProps {
  hostNodes: Record<string, HTMLDivElement | null>;
  items: ToolbarNextOverflowItem[];
}

function ToolbarNextOverflowItemOwner({
  host,
  item,
}: {
  host: HTMLDivElement | null;
  item: ToolbarNextOverflowItem;
}) {
  const targetWindow = useWindow();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const nextMountNode = targetWindow?.document.createElement("div");

    if (!nextMountNode) {
      return;
    }

    nextMountNode.className = withBaseName("contentHost");
    setMountNode(nextMountNode);

    return () => {
      nextMountNode.parentElement?.removeChild(nextMountNode);
    };
  }, [targetWindow]);

  useIsomorphicLayoutEffect(() => {
    if (!mountNode) {
      return;
    }

    if (host) {
      if (mountNode.parentElement !== host) {
        host.appendChild(mountNode);
      }

      return;
    }

    mountNode.parentElement?.removeChild(mountNode);
  }, [host, mountNode]);

  return mountNode
    ? createPortal(
        cloneElement(item.element as ReactElement<Record<string, ReactNode>>, {
          [TOOLBAR_NEXT_GROUP_KEY_ATTR]: item.overflowGroupKey,
          [TOOLBAR_NEXT_ITEM_ATTR]: item.id,
        }),
        mountNode,
      )
    : null;
}

export function ToolbarNextOverflowOwners({
  hostNodes,
  items,
}: ToolbarNextOverflowOwnersProps) {
  return (
    <>
      {items.map((item) => (
        <ToolbarNextOverflowItemOwner
          host={hostNodes[item.id] ?? null}
          item={item}
          key={item.id}
        />
      ))}
    </>
  );
}

function cloneDecorations(
  itemId: string,
  decorations: ReactElement[],
  slot: "leading" | "trailing",
) {
  return Children.toArray(decorations).flatMap((decoration) => {
    if (!isValidElement(decoration)) {
      return [];
    }

    return [
      cloneElement(decoration, {
        key: `${itemId}-${slot}-${String(
          decoration.key ??
            (typeof decoration.type === "string"
              ? decoration.type
              : "decoration"),
        )}`,
      }),
    ];
  });
}

export function ToolbarNextOverflowTriggerContent({
  label,
  named,
}: {
  label: string;
  named: boolean;
}) {
  const { OverflowIcon } = useIcon();

  if (named) {
    return <>{label}</>;
  }

  return <OverflowIcon aria-hidden />;
}

function getOverflowTriggerLabel(group: ToolbarNextOverflowGroup) {
  const hiddenCount = group.items.length;
  const hiddenLabel = hiddenCount === 1 ? "tray hidden" : "trays hidden";

  return group.named
    ? `Open ${group.label} overflow. ${hiddenCount} ${hiddenLabel}.`
    : `Open overflow. ${hiddenCount} ${hiddenLabel}.`;
}

interface ToolbarNextOverflowMenuProps {
  getItemHostRef: (id: string) => (node: HTMLDivElement | null) => void;
  group: ToolbarNextOverflowGroup;
}

export function ToolbarNextOverflowMenu({
  getItemHostRef,
  group,
}: ToolbarNextOverflowMenuProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const {
    focusEntryTarget,
    handleBlurCapture,
    handleFocusCapture,
    handleKeyDownCapture,
  } = useToolbarNextKeyboardNavigation({
    items: group.items,
    scopeRef: panelContentRef,
  });

  const { refs, x, y, strategy, context } = useFloatingUI({
    open,
    onOpenChange(nextOpen, _, reason) {
      setOpen(nextOpen);

      if (!nextOpen && reason === "escape-key") {
        queueMicrotask(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    },
    placement: "bottom-end",
    middleware: [
      offset(1),
      size({
        apply({ elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
      flip(),
    ],
  });
  const { getFloatingProps } = useInteractions([useDismiss(context)]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useFocusOutside(rootRef, closeMenu, open, "[data-floating-ui-portal]");

  const handleTriggerClick = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!open && ["ArrowDown", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        queueMicrotask(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    },
    [open],
  );

  const handlePanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        queueMicrotask(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    },
    [],
  );

  const handleTriggerRef = useForkRef<HTMLButtonElement>(
    triggerRef,
    refs.setReference,
  );
  const handlePanelRef = useForkRef<HTMLDivElement>(panelRef, refs.setFloating);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      focusEntryTarget();
    }

    wasOpenRef.current = open;
  }, [focusEntryTarget, open]);

  return (
    <div
      className={withBaseName("menu")}
      data-overflowgroup={group.overflowGroup}
      ref={rootRef}
    >
      <Button
        appearance="transparent"
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup
        aria-label={getOverflowTriggerLabel(group)}
        className={withBaseName("trigger")}
        {...{
          [TOOLBAR_NEXT_GROUP_KEY_ATTR]: group.key,
          [TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR]: "",
        }}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        ref={handleTriggerRef}
        sentiment="neutral"
      >
        <ToolbarNextOverflowTriggerContent
          label={group.label}
          named={group.named}
        />
      </Button>
      {open ? (
        <div
          {...getFloatingProps({
            onKeyDown: handlePanelKeyDown,
            role: "presentation",
          })}
          className={withBaseName("panel")}
          id={panelId}
          ref={handlePanelRef}
          style={{
            left: x ?? 0,
            top: y ?? 0,
            position: strategy,
          }}
        >
          <div
            aria-label={`${group.label} overflow`}
            aria-orientation="horizontal"
            className={withBaseName("panelContent")}
            {...{ [TOOLBAR_NEXT_SCOPE_ROOT_ATTR]: group.key }}
            onBlurCapture={handleBlurCapture}
            onFocusCapture={handleFocusCapture}
            onKeyDownCapture={handleKeyDownCapture}
            role="toolbar"
            ref={panelContentRef}
          >
            {group.items.map((item, index) => (
              <div
                className={withBaseName("panelItem")}
                key={`${group.id}-${item.id}`}
              >
                {index > 0 &&
                  item.leadingDecorations.length > 0 &&
                  cloneDecorations(item.id, item.leadingDecorations, "leading")}
                <div
                  className={withBaseName("itemHost")}
                  ref={getItemHostRef(item.id)}
                />
                {cloneDecorations(
                  item.id,
                  item.trailingDecorations,
                  "trailing",
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export interface ToolbarNextOverflowRegionProps {
  getItemHostRef: (id: string) => (node: HTMLDivElement | null) => void;
  getItemRef: (id: string) => (node: HTMLDivElement | null) => void;
  getNamedTriggerRef: (id: string) => (node: HTMLDivElement | null) => void;
  getRegionRef: (regionKey: string) => (node: HTMLDivElement | null) => void;
  overflowGroups: ToolbarNextOverflowGroup[];
  overflowedIds: Set<string>;
  region: ToolbarNextRegionModel;
}

export function ToolbarNextOverflowRegion({
  getItemHostRef,
  getItemRef,
  getNamedTriggerRef,
  getRegionRef,
  overflowGroups,
  overflowedIds,
  region,
}: ToolbarNextOverflowRegionProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toolbar-next-overflow",
    css: toolbarNextOverflowCss,
    window: targetWindow,
  });

  const { className, ...regionProps } = region.props;
  const overflowGroupByKey = new Map(
    overflowGroups.map((group) => [group.key, group] as const),
  );

  const renderSlots = buildRegionOverflowRenderSlots(
    region.items,
    overflowedIds,
    new Set(overflowGroups.map((group) => group.key)),
  );

  return (
    <ToolbarRegion
      data-implicit={region.implicit || undefined}
      {...regionProps}
      className={clsx(className, withBaseName("region"))}
      position={region.position}
      ref={getRegionRef(region.key)}
    >
      {renderSlots.map(
        ({
          item,
          overflowed,
          showLeadingDecorations,
          showTrailingDecorations,
          triggerGroupKey,
        }) => {
          const triggerGroup =
            triggerGroupKey != null
              ? overflowGroupByKey.get(triggerGroupKey)
              : undefined;

          return (
            <div
              className={withBaseName("slot")}
              data-align={item.align}
              data-priority={item.overflowPriority}
              key={
                triggerGroup
                  ? `${region.key}-${triggerGroup.id}-anchor-${item.id}`
                  : item.id
              }
              ref={
                triggerGroup ? getNamedTriggerRef(item.id) : getItemRef(item.id)
              }
            >
              {showLeadingDecorations
                ? cloneDecorations(item.id, item.leadingDecorations, "leading")
                : null}
              {!overflowed ? (
                <div className={withBaseName("item")}>
                  <div
                    className={withBaseName("itemHost")}
                    ref={getItemHostRef(item.id)}
                  />
                </div>
              ) : null}
              {triggerGroup ? (
                <div className={withBaseName("item")}>
                  <ToolbarNextOverflowMenu
                    getItemHostRef={getItemHostRef}
                    group={triggerGroup}
                  />
                </div>
              ) : null}
              {showTrailingDecorations
                ? cloneDecorations(
                    item.id,
                    item.trailingDecorations,
                    "trailing",
                  )
                : null}
            </div>
          );
        },
      )}
    </ToolbarRegion>
  );
}
