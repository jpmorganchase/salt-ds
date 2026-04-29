import {
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingComponent,
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
  type FocusEvent,
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

import toolbarNextOverflowCss from "./ToolbarNextOverflow.css";
import { ToolbarRegion } from "./ToolbarRegion";
import {
  getToolbarNextFocusMemory,
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
  const mainToolbarTabIndexMemoryRef = useRef(
    new WeakMap<HTMLElement, string | null>(),
  );

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

      const isMainToolbarHost =
        host
          .closest(`[${TOOLBAR_NEXT_SCOPE_ROOT_ATTR}]`)
          ?.getAttribute(TOOLBAR_NEXT_SCOPE_ROOT_ATTR) === "main";

      if (isMainToolbarHost) {
        const focusableElements = Array.from(
          mountNode.querySelectorAll<HTMLElement>(focusableSelector),
        );

        for (const element of focusableElements) {
          const rememberedTabIndex =
            mainToolbarTabIndexMemoryRef.current.get(element);

          if (rememberedTabIndex !== undefined) {
            if (rememberedTabIndex == null) {
              element.removeAttribute("tabindex");
            } else {
              element.setAttribute("tabindex", rememberedTabIndex);
            }
          }
        }

        for (const element of focusableElements) {
          mainToolbarTabIndexMemoryRef.current.set(
            element,
            element.getAttribute("tabindex"),
          );
        }
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

const focusableSelector = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  "[tabindex]",
].join(", ");

function isFocusable(
  target: HTMLElement,
  { includeTabIndexMinusOne = false } = {},
) {
  if (
    target.matches(":disabled") ||
    target.getAttribute("aria-hidden") === "true" ||
    target.hidden
  ) {
    return false;
  }

  if (!includeTabIndexMinusOne && target.getAttribute("tabindex") === "-1") {
    return false;
  }

  const win = target.ownerDocument.defaultView;
  if (!win) {
    return false;
  }

  const styles = win.getComputedStyle(target);
  return (
    styles.display !== "none" &&
    styles.visibility !== "hidden" &&
    target.getClientRects().length > 0
  );
}

function getNextFocusableAfterToolbar(trigger: HTMLElement) {
  const toolbarRoot = trigger.closest<HTMLElement>(
    `[${TOOLBAR_NEXT_SCOPE_ROOT_ATTR}]`,
  );

  if (!toolbarRoot) {
    return null;
  }

  const focusableElements = Array.from(
    trigger.ownerDocument.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => isFocusable(element));

  return (
    focusableElements.find((element) => {
      return (
        !toolbarRoot.contains(element) &&
        !!(
          toolbarRoot.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_FOLLOWING
        )
      );
    }) ?? null
  );
}

interface ToolbarNextOverflowMenuProps {
  getItemHostRef: (id: string) => (node: HTMLDivElement | null) => void;
  group: ToolbarNextOverflowGroup;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
}

export function ToolbarNextOverflowMenu({
  getItemHostRef,
  group,
  onItemFocus,
}: ToolbarNextOverflowMenuProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const [panelContentNode, setPanelContentNode] =
    useState<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);
  const focusedOpenPanelRef = useRef(false);
  const {
    focusEntryTarget,
    handleBlurCapture,
    handleFocusCapture,
    handleKeyDownCapture,
  } = useToolbarNextKeyboardNavigation({
    includeTabIndexMinusOne: true,
    items: group.items,
    scopeRef: panelContentRef,
  });

  const { refs, x, y, strategy, context, elements } = useFloatingUI({
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
      shift({
        padding: 8,
      }),
    ],
  });
  const { getFloatingProps, getReferenceProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const closeMenu = useCallback(() => {
    setOpen(false);
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
      if (event.key === "Tab" && !event.shiftKey) {
        const nextFocusTarget = triggerRef.current
          ? getNextFocusableAfterToolbar(triggerRef.current)
          : null;

        if (nextFocusTarget) {
          event.preventDefault();
          setOpen(false);
          queueMicrotask(() => {
            nextFocusTarget.focus({ preventScroll: true });
          });
        }

        return;
      }

      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        setOpen(false);
        queueMicrotask(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        queueMicrotask(() => {
          triggerRef.current?.focus({ preventScroll: true });
        });
      }
    },
    [closeMenu],
  );

  const handleTriggerRef = useForkRef<HTMLButtonElement>(
    triggerRef,
    refs.setReference,
  );
  const handlePanelRef = useForkRef<HTMLDivElement>(panelRef, refs.setFloating);
  const handlePanelContentRef = useForkRef<HTMLDivElement>(
    panelContentRef,
    setPanelContentNode,
  );
  const handlePanelFocusCapture = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      handleFocusCapture(event);

      const panelContent = panelContentRef.current;
      const target = event.target;

      if (!panelContent || !(target instanceof HTMLElement)) {
        return;
      }

      const focusMemory = getToolbarNextFocusMemory(panelContent, target, {
        includeTabIndexMinusOne: true,
      });

      if (focusMemory?.type !== "item") {
        return;
      }

      onItemFocus?.(focusMemory.itemId, focusMemory.controlIndex);
    },
    [handleFocusCapture, onItemFocus],
  );
  const { Component: FloatingComponent } = useFloatingComponent();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      focusEntryTarget();
    }

    wasOpenRef.current = open;
  }, [focusEntryTarget, open]);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      focusedOpenPanelRef.current = false;
      return;
    }

    if (!panelContentNode || focusedOpenPanelRef.current) {
      return;
    }

    const getPanelFocusables = () => {
      return Array.from(
        panelContentNode.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) =>
        isFocusable(element, { includeTabIndexMinusOne: true }),
      );
    };
    const focusEntryWhenReady = () => {
      const panelFocusables = getPanelFocusables();

      if (panelFocusables.length === 0) {
        return false;
      }

      focusedOpenPanelRef.current = true;
      focusEntryTarget();
      return true;
    };

    if (focusEntryWhenReady()) {
      return;
    }

    const panelWindow = panelContentNode.ownerDocument.defaultView;
    const mutationObserverCtor = panelWindow?.MutationObserver;
    const resizeObserverCtor = panelWindow?.ResizeObserver;
    let mutationObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    mutationObserver =
      mutationObserverCtor != null
        ? new mutationObserverCtor(() => {
            if (focusEntryWhenReady()) {
              mutationObserver?.disconnect();
              resizeObserver?.disconnect();
            }
          })
        : null;
    resizeObserver =
      resizeObserverCtor != null
        ? new resizeObserverCtor(() => {
            if (focusEntryWhenReady()) {
              mutationObserver?.disconnect();
              resizeObserver?.disconnect();
            }
          })
        : null;

    mutationObserver?.observe(panelContentNode, {
      childList: true,
      subtree: true,
    });
    resizeObserver?.observe(panelContentNode);

    return () => {
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [focusEntryTarget, open, panelContentNode]);

  return (
    <div
      className={withBaseName("menu")}
      data-overflowgroup={group.overflowGroup}
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
        {...getReferenceProps({
          onKeyDown: handleTriggerKeyDown,
        })}
        ref={handleTriggerRef}
        sentiment="neutral"
      >
        <ToolbarNextOverflowTriggerContent
          label={group.label}
          named={group.named}
        />
      </Button>
      <FloatingComponent
        {...getFloatingProps({
          onKeyDown: handlePanelKeyDown,
          role: "presentation",
        })}
        className={withBaseName("panel")}
        focusManagerProps={
          context
            ? {
                context,
                initialFocus: -1,
                returnFocus: false,
                modal: false,
                closeOnFocusOut: true,
              }
            : undefined
        }
        id={panelId}
        left={x ?? 0}
        open={open}
        position={strategy}
        ref={handlePanelRef}
        top={y ?? 0}
        width={elements.floating?.offsetWidth}
        height={elements.floating?.offsetHeight}
      >
        <div
          aria-label={`${group.label} overflow`}
          aria-orientation="horizontal"
          className={withBaseName("panelContent")}
          {...{ [TOOLBAR_NEXT_SCOPE_ROOT_ATTR]: group.key }}
          onBlurCapture={handleBlurCapture}
          onFocusCapture={handlePanelFocusCapture}
          onKeyDownCapture={handleKeyDownCapture}
          role="toolbar"
          ref={handlePanelContentRef}
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
              {cloneDecorations(item.id, item.trailingDecorations, "trailing")}
            </div>
          ))}
        </div>
      </FloatingComponent>
    </div>
  );
}

export interface ToolbarNextOverflowRegionProps {
  getItemHostRef: (id: string) => (node: HTMLDivElement | null) => void;
  getItemRef: (id: string) => (node: HTMLDivElement | null) => void;
  getNamedTriggerRef: (id: string) => (node: HTMLDivElement | null) => void;
  getRegionRef: (regionKey: string) => (node: HTMLDivElement | null) => void;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
  overflowGroups: ToolbarNextOverflowGroup[];
  overflowedIds: Set<string>;
  region: ToolbarNextRegionModel;
}

export function ToolbarNextOverflowRegion({
  getItemHostRef,
  getItemRef,
  getNamedTriggerRef,
  getRegionRef,
  onItemFocus,
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
                    onItemFocus={onItemFocus}
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
