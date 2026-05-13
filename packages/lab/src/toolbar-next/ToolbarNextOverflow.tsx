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
  isValidElement,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ToolbarContent } from "./ToolbarContent";
import toolbarNextOverflowCss from "./ToolbarNextOverflow.css";
import {
  getToolbarNextOverflowBoundaryKey,
  isTargetInsideOverflowBoundary,
  ToolbarNextOverflowFloatingComponentProvider,
  useToolbarNextOverflowFloatingBoundary,
} from "./ToolbarNextOverflowFloatingBoundary";
import {
  getDocumentFocusableElements,
  getToolbarNextFocusMemory,
  getToolbarNextScopeFocusableElements,
  getToolbarNextTabMoveTarget,
  scheduleToolbarNextFocus,
  shouldToolbarNextPreserveNativeTab,
  TOOLBAR_NEXT_GROUP_KEY_ATTR,
  TOOLBAR_NEXT_ITEM_ATTR,
  TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR,
  TOOLBAR_NEXT_SCOPE_ROOT_ATTR,
  type ToolbarNextFocusMemory,
  toolbarNextFocusableSelector,
} from "./toolbarNextKeyboardUtils";
import type {
  ToolbarNextContentModel,
  ToolbarNextOverflowItem,
} from "./toolbarNextUtils";
import { buildContentOverflowRenderSlots } from "./toolbarNextUtils";
import { useToolbarNextKeyboardNavigation } from "./useToolbarNextKeyboardNavigation";
import type { ToolbarNextOverflowGroup } from "./useToolbarNextOverflow";

const withBaseName = makePrefixer("saltToolbarNextOverflow");

export type ToolbarNextItemHostKind = "main" | "measurement" | "overflow";

function canSeedOverflowFocusMemory(
  focusMemory: ToolbarNextFocusMemory | null | undefined,
  group: ToolbarNextOverflowGroup,
): focusMemory is Extract<ToolbarNextFocusMemory, { type: "item" }> {
  return (
    focusMemory?.type === "item" &&
    group.items.some((item) => item.id === focusMemory.itemId)
  );
}

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
  const lastOverflowBoundaryKeyRef = useRef<string | null>(null);
  const currentOverflowBoundaryKey = getToolbarNextOverflowBoundaryKey(host);

  if (host) {
    lastOverflowBoundaryKeyRef.current = currentOverflowBoundaryKey;
  }

  const boundaryKey = host
    ? currentOverflowBoundaryKey
    : lastOverflowBoundaryKeyRef.current;

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
          mountNode.querySelectorAll<HTMLElement>(toolbarNextFocusableSelector),
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

  if (!mountNode) {
    return null;
  }

  const clonedItem = cloneElement(
    item.element as ReactElement<Record<string, ReactNode>>,
    {
      [TOOLBAR_NEXT_GROUP_KEY_ATTR]: item.overflowGroupKey,
      [TOOLBAR_NEXT_ITEM_ATTR]: item.id,
    },
  );
  const itemContent = (
    <ToolbarNextOverflowFloatingComponentProvider boundaryKey={boundaryKey}>
      {clonedItem}
    </ToolbarNextOverflowFloatingComponentProvider>
  );

  return createPortal(itemContent, mountNode);
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
    ? `${group.label} overflow. ${hiddenCount} ${hiddenLabel}.`
    : `Overflow. ${hiddenCount} ${hiddenLabel}.`;
}

interface ToolbarNextOverflowMenuProps {
  focusMemoryRef?: RefObject<ToolbarNextFocusMemory | null>;
  getItemHostRef: (
    id: string,
    kind: ToolbarNextItemHostKind,
  ) => (node: HTMLDivElement | null) => void;
  group: ToolbarNextOverflowGroup;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
}

export function ToolbarNextOverflowMenu({
  focusMemoryRef,
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
  const floatingBoundary = useToolbarNextOverflowFloatingBoundary();
  const {
    focusEntryTarget,
    handleScopeBlur,
    handleScopeFocus,
    handleScopeKeyDown,
    handleScopePointerDown,
    rememberedFocusRef,
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
        scheduleToolbarNextFocus(triggerRef.current);
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
    useDismiss(context, {
      escapeKey: false,
      outsidePress(event) {
        return !isTargetInsideOverflowBoundary(
          panelContentRef.current,
          floatingBoundary,
          group.key,
          event.target,
        );
      },
    }),
  ]);

  const handleTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (!open && ["Enter", " "].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        scheduleToolbarNextFocus(triggerRef.current);
      }
    },
    [open],
  );

  const handlePanelKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Tab") {
      const panelContent = panelContentRef.current;
      const target = event.target;

      if (
        panelContent &&
        target instanceof HTMLElement &&
        shouldToolbarNextPreserveNativeTab(target)
      ) {
        const focusableElements = getDocumentFocusableElements(
          panelContent.ownerDocument,
        );
        const currentIndex = focusableElements.indexOf(target);
        const nextFocusTarget =
          focusableElements[currentIndex + (event.shiftKey ? -1 : 1)];

        if (
          currentIndex !== -1 &&
          nextFocusTarget &&
          panelContent.contains(nextFocusTarget)
        ) {
          return;
        }
      }
    }

    if (event.key === "Tab" && !event.shiftKey) {
      const toolbarRoot = triggerRef.current?.closest<HTMLElement>(
        `[${TOOLBAR_NEXT_SCOPE_ROOT_ATTR}]`,
      );
      const nextFocusTarget = toolbarRoot
        ? getToolbarNextTabMoveTarget(toolbarRoot, false)
        : null;

      if (nextFocusTarget) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        scheduleToolbarNextFocus(nextFocusTarget);
      }

      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      scheduleToolbarNextFocus(triggerRef.current);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      scheduleToolbarNextFocus(triggerRef.current);
    }
  }, []);

  const handleTriggerRef = useForkRef<HTMLButtonElement>(
    triggerRef,
    refs.setReference,
  );
  const handlePanelRef = useForkRef<HTMLDivElement>(panelRef, refs.setFloating);
  const handlePanelContentRef = useForkRef<HTMLDivElement>(
    panelContentRef,
    setPanelContentNode,
  );
  const handlePanelFocus = useCallback(
    (event: FocusEvent) => {
      handleScopeFocus(event);

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
    [handleScopeFocus, onItemFocus],
  );
  const { Component: FloatingComponent } = useFloatingComponent();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const externalFocusMemory = focusMemoryRef?.current;

      if (canSeedOverflowFocusMemory(externalFocusMemory, group)) {
        rememberedFocusRef.current = externalFocusMemory;
      }

      focusEntryTarget();
    }

    wasOpenRef.current = open;
  }, [focusEntryTarget, focusMemoryRef, group, open, rememberedFocusRef]);

  useEffect(() => {
    if (!open || !panelContentNode) {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      handlePanelFocus(event);
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (
        isTargetInsideOverflowBoundary(
          panelContentRef.current,
          floatingBoundary,
          group.key,
          event.relatedTarget,
        )
      ) {
        return;
      }

      handleScopeBlur(event);
    };
    const handleKeyDownCapture = (event: KeyboardEvent) => {
      handleScopeKeyDown(event);
    };
    const handlePointerDownCapture = (event: PointerEvent) => {
      handleScopePointerDown(event);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.defaultPrevented) {
        handlePanelKeyDown(event);
      }
    };

    panelContentNode.addEventListener("focusin", handleFocusIn);
    panelContentNode.addEventListener("focusout", handleFocusOut);
    panelContentNode.addEventListener("keydown", handleKeyDownCapture, true);
    panelContentNode.addEventListener(
      "pointerdown",
      handlePointerDownCapture,
      true,
    );
    panelContentNode.addEventListener("keydown", handleKeyDown);

    return () => {
      panelContentNode.removeEventListener("focusin", handleFocusIn);
      panelContentNode.removeEventListener("focusout", handleFocusOut);
      panelContentNode.removeEventListener(
        "keydown",
        handleKeyDownCapture,
        true,
      );
      panelContentNode.removeEventListener(
        "pointerdown",
        handlePointerDownCapture,
        true,
      );
      panelContentNode.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handlePanelFocus,
    handlePanelKeyDown,
    handleScopeBlur,
    handleScopeKeyDown,
    handleScopePointerDown,
    floatingBoundary,
    group.key,
    open,
    panelContentNode,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      focusedOpenPanelRef.current = false;
      return;
    }

    if (!panelContentNode || focusedOpenPanelRef.current) {
      return;
    }

    const getPanelFocusables = () =>
      getToolbarNextScopeFocusableElements(panelContentNode, {
        includeTabIndexMinusOne: true,
      });
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
                closeOnFocusOut: false,
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
                ref={open ? getItemHostRef(item.id, "overflow") : null}
              />
              {cloneDecorations(item.id, item.trailingDecorations, "trailing")}
            </div>
          ))}
        </div>
      </FloatingComponent>
    </div>
  );
}

export interface ToolbarNextOverflowContentProps {
  focusMemoryRef?: RefObject<ToolbarNextFocusMemory | null>;
  getItemHostRef: (
    id: string,
    kind: ToolbarNextItemHostKind,
  ) => (node: HTMLDivElement | null) => void;
  getItemRef: (id: string) => (node: HTMLDivElement | null) => void;
  getNamedTriggerRef: (id: string) => (node: HTMLDivElement | null) => void;
  getContentRef: (contentKey: string) => (node: HTMLDivElement | null) => void;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
  overflowGroups: ToolbarNextOverflowGroup[];
  overflowedIds: Set<string>;
  content: ToolbarNextContentModel;
}

export function ToolbarNextOverflowContent({
  content,
  focusMemoryRef,
  getItemHostRef,
  getItemRef,
  getNamedTriggerRef,
  getContentRef,
  onItemFocus,
  overflowGroups,
  overflowedIds,
}: ToolbarNextOverflowContentProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toolbar-next-overflow",
    css: toolbarNextOverflowCss,
    window: targetWindow,
  });

  const { className, ...contentProps } = content.props;
  const handleContentRef = useForkRef(content.ref, getContentRef(content.key));
  const overflowGroupByKey = new Map(
    overflowGroups.map((group) => [group.key, group] as const),
  );

  const renderSlots = buildContentOverflowRenderSlots(
    content.items,
    overflowedIds,
    new Set(overflowGroups.map((group) => group.key)),
  );

  return (
    <ToolbarContent
      {...contentProps}
      data-implicit={content.implicit || undefined}
      className={clsx(className, withBaseName("content"))}
      position={content.position}
      ref={handleContentRef}
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
                  ? `${content.key}-${triggerGroup.id}-anchor-${item.id}`
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
                    ref={getItemHostRef(item.id, "main")}
                  />
                </div>
              ) : null}
              {triggerGroup ? (
                <div className={withBaseName("item")}>
                  <ToolbarNextOverflowMenu
                    focusMemoryRef={focusMemoryRef}
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
    </ToolbarContent>
  );
}
