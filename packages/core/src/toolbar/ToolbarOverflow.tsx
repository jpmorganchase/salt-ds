import {
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { compute } from "compute-scroll-into-view";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../button";
import { useIcon } from "../semantic-icon-provider";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "../utils";
import { ToolbarContent } from "./ToolbarContent";
import toolbarOverflowCss from "./ToolbarOverflow.css";
import {
  getToolbarOverflowBoundaryKey,
  isTargetInsideOverflowBoundary,
  ToolbarOverflowFloatingComponentProvider,
  useToolbarOverflowFloatingBoundary,
} from "./ToolbarOverflowFloatingBoundary";
import {
  getDocumentFocusableElements,
  getToolbarFocusMemory,
  getToolbarScopeFocusableElements,
  getToolbarTabMoveTarget,
  scheduleToolbarFocus,
  shouldToolbarPreserveNativeTab,
  TOOLBAR_GROUP_KEY_ATTR,
  TOOLBAR_ITEM_ATTR,
  TOOLBAR_OVERFLOW_TRIGGER_ATTR,
  TOOLBAR_SCOPE_ROOT_ATTR,
  type ToolbarFocusMemory,
  toolbarFocusableSelector,
} from "./toolbarKeyboardUtils";
import type { ToolbarContentModel, ToolbarOverflowItem } from "./toolbarUtils";
import { buildContentOverflowRenderSlots } from "./toolbarUtils";
import { useToolbarKeyboardNavigation } from "./useToolbarKeyboardNavigation";
import type { ToolbarOverflowGroup } from "./useToolbarOverflow";

const withBaseName = makePrefixer("saltToolbarOverflow");

export type ToolbarItemHostKind = "main" | "measurement" | "overflow";

const toolbarStatefulFocusRootSelector = [
  ".saltComboBox-focused",
  ".saltDateInput-focused",
  ".saltInput-focused",
].join(", ");

const toolbarOverflowFocusScrollRootSelector = [
  ".saltComboBox",
  ".saltDateInput",
  ".saltDropdown",
  ".saltInput",
  ".saltSwitch",
].join(", ");

type ToolbarOverflowOpenModality = "keyboard" | "pointer" | null;

function createToolbarFocusEvent(
  eventName: "blur" | "focusout",
  target: HTMLElement,
  relatedTarget: Element | null,
) {
  const FocusEventCtor = target.ownerDocument.defaultView?.FocusEvent;
  const eventInit = {
    bubbles: eventName === "focusout",
    relatedTarget,
  };

  return FocusEventCtor
    ? new FocusEventCtor(eventName, eventInit)
    : new Event(eventName, eventInit);
}

function notifyToolbarReparentedFocusLoss(mountNode: HTMLDivElement) {
  const activeElement = mountNode.ownerDocument.activeElement;

  if (mountNode.contains(activeElement)) {
    return;
  }

  // Browser focus can move to the document when a portaled toolbar item is
  // reparented, without notifying controls that keep their own focused state.
  const staleFocusTargets = Array.from(
    mountNode.querySelectorAll<HTMLElement>(toolbarStatefulFocusRootSelector),
  )
    .map(
      (root) =>
        root.querySelector<HTMLElement>("input") ??
        root.querySelector<HTMLElement>(toolbarFocusableSelector),
    )
    .filter((target): target is HTMLElement => target != null);

  for (const target of staleFocusTargets) {
    const relatedTarget =
      activeElement instanceof Element ? activeElement : null;

    target.dispatchEvent(
      createToolbarFocusEvent("blur", target, relatedTarget),
    );
    target.dispatchEvent(
      createToolbarFocusEvent("focusout", target, relatedTarget),
    );
  }
}

function getToolbarOverflowFocusScrollTarget(target: HTMLElement) {
  const itemRoot = target.closest<HTMLElement>(`[${TOOLBAR_ITEM_ATTR}]`);
  const controlRoot = target.closest<HTMLElement>(
    toolbarOverflowFocusScrollRootSelector,
  );

  return controlRoot && itemRoot?.contains(controlRoot) ? controlRoot : target;
}

function getToolbarOverflowPanelInlinePadding(target: HTMLElement) {
  const panelContent = target.closest<HTMLElement>(
    `[${TOOLBAR_SCOPE_ROOT_ATTR}]`,
  );
  const styles =
    panelContent?.ownerDocument.defaultView?.getComputedStyle(panelContent);

  return {
    left: Number.parseFloat(styles?.paddingLeft ?? "0") || 0,
    right: Number.parseFloat(styles?.paddingRight ?? "0") || 0,
  };
}

function scrollToolbarOverflowTargetIntoView(
  panel: HTMLDivElement | null,
  target: HTMLElement,
) {
  if (!panel || !panel.contains(target)) {
    return;
  }

  const scrollTarget = getToolbarOverflowFocusScrollTarget(target);
  const actions = compute(scrollTarget, {
    block: "nearest",
    boundary: panel,
    inline: "nearest",
    scrollMode: "if-needed",
  });

  for (const { el, left, top } of actions) {
    if (el === panel) {
      const targetRect = scrollTarget.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportLeft = panelRect.left + panel.clientLeft;
      const viewportRight = viewportLeft + panel.clientWidth;
      const padding = getToolbarOverflowPanelInlinePadding(scrollTarget);
      const nextLeft =
        targetRect.left < viewportLeft + padding.left
          ? left - padding.left
          : targetRect.right > viewportRight - padding.right
            ? left + padding.right
            : left;

      el.scrollLeft = Math.max(0, nextLeft);
    } else {
      el.scrollLeft = left;
    }

    el.scrollTop = top;
  }
}

function canSeedOverflowFocusMemory(
  focusMemory: ToolbarFocusMemory | null | undefined,
  group: ToolbarOverflowGroup,
): focusMemory is Extract<ToolbarFocusMemory, { type: "item" }> {
  return (
    focusMemory?.type === "item" &&
    group.items.some((item) => item.id === focusMemory.itemId)
  );
}

interface ToolbarOverflowOwnersProps {
  hostNodes: Record<string, HTMLDivElement | null>;
  items: ToolbarOverflowItem[];
}

function ToolbarOverflowItemOwner({
  host,
  item,
}: {
  host: HTMLDivElement | null;
  item: ToolbarOverflowItem;
}) {
  const targetWindow = useWindow();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const mainToolbarTabIndexMemoryRef = useRef(
    new WeakMap<HTMLElement, string | null>(),
  );
  const lastOverflowBoundaryKeyRef = useRef<string | null>(null);
  const currentOverflowBoundaryKey = getToolbarOverflowBoundaryKey(host);

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
        notifyToolbarReparentedFocusLoss(mountNode);
      }

      const isMainToolbarHost =
        host
          .closest(`[${TOOLBAR_SCOPE_ROOT_ATTR}]`)
          ?.getAttribute(TOOLBAR_SCOPE_ROOT_ATTR) === "main";

      if (isMainToolbarHost) {
        const focusableElements = Array.from(
          mountNode.querySelectorAll<HTMLElement>(toolbarFocusableSelector),
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

    notifyToolbarReparentedFocusLoss(mountNode);
    mountNode.parentElement?.removeChild(mountNode);
  }, [host, mountNode]);

  if (!mountNode) {
    return null;
  }

  const clonedItem = cloneElement(
    item.element as ReactElement<Record<string, ReactNode>>,
    {
      [TOOLBAR_GROUP_KEY_ATTR]: item.overflowGroupKey,
      [TOOLBAR_ITEM_ATTR]: item.id,
    },
  );
  const itemContent = (
    <ToolbarOverflowFloatingComponentProvider boundaryKey={boundaryKey}>
      {clonedItem}
    </ToolbarOverflowFloatingComponentProvider>
  );

  return createPortal(itemContent, mountNode);
}

export function ToolbarOverflowOwners({
  hostNodes,
  items,
}: ToolbarOverflowOwnersProps) {
  return (
    <>
      {items.map((item) => (
        <ToolbarOverflowItemOwner
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

export function ToolbarOverflowTriggerContent({
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

function getOverflowTriggerLabel(group: ToolbarOverflowGroup) {
  return group.named
    ? `${group.label} overflow. Hidden controls.`
    : "Overflow. Hidden controls.";
}

interface ToolbarOverflowMenuProps {
  focusMemoryRef?: RefObject<ToolbarFocusMemory | null>;
  getItemHostRef: (
    id: string,
    kind: ToolbarItemHostKind,
  ) => (node: HTMLDivElement | null) => void;
  group: ToolbarOverflowGroup;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
}

export function ToolbarOverflowMenu({
  focusMemoryRef,
  getItemHostRef,
  group,
  onItemFocus,
}: ToolbarOverflowMenuProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const [panelContentNode, setPanelContentNode] =
    useState<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);
  const focusedOpenPanelRef = useRef(false);
  const openModalityRef = useRef<ToolbarOverflowOpenModality>(null);
  const floatingBoundary = useToolbarOverflowFloatingBoundary();
  const {
    focusEntryTarget,
    handleScopeBlur,
    handleScopeFocus,
    handleScopeKeyDown,
    handleScopePointerDown,
    rememberedFocusRef,
  } = useToolbarKeyboardNavigation({
    includeTabIndexMinusOne: true,
    items: group.items,
    scopeRef: panelContentRef,
  });

  const { refs, x, y, strategy, context, elements } = useFloatingUI({
    open,
    onOpenChange(nextOpen, _, reason) {
      setOpen(nextOpen);

      if (!nextOpen) {
        openModalityRef.current = null;
      }

      if (!nextOpen && reason === "escape-key") {
        scheduleToolbarFocus(triggerRef.current);
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
        openModalityRef.current = "keyboard";
        setOpen(true);
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        scheduleToolbarFocus(triggerRef.current);
      }
    },
    [open],
  );

  const handleTriggerPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!open && event.button === 0) {
        openModalityRef.current = "pointer";
      }
    },
    [open],
  );

  const handleTriggerMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (!open && event.button === 0) {
        openModalityRef.current = "pointer";
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
        shouldToolbarPreserveNativeTab(target)
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
        `[${TOOLBAR_SCOPE_ROOT_ATTR}]`,
      );
      const nextFocusTarget = toolbarRoot
        ? getToolbarTabMoveTarget(toolbarRoot, false)
        : null;

      if (nextFocusTarget) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        scheduleToolbarFocus(nextFocusTarget);
      }

      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      scheduleToolbarFocus(triggerRef.current);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      scheduleToolbarFocus(triggerRef.current);
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

      const focusMemory = getToolbarFocusMemory(panelContent, target, {
        includeTabIndexMinusOne: true,
      });

      if (focusMemory?.type !== "item") {
        return;
      }

      scrollToolbarOverflowTargetIntoView(panelRef.current, target);
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

      if (openModalityRef.current !== "pointer") {
        focusEntryTarget();
      }
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

    if (
      !panelContentNode ||
      focusedOpenPanelRef.current ||
      openModalityRef.current === "pointer"
    ) {
      return;
    }

    const getPanelFocusables = () =>
      getToolbarScopeFocusableElements(panelContentNode, {
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
          [TOOLBAR_GROUP_KEY_ATTR]: group.key,
          [TOOLBAR_OVERFLOW_TRIGGER_ATTR]: "",
        }}
        {...getReferenceProps({
          onKeyDown: handleTriggerKeyDown,
          onMouseDown: handleTriggerMouseDown,
          onPointerDown: handleTriggerPointerDown,
        })}
        ref={handleTriggerRef}
        sentiment="neutral"
      >
        <ToolbarOverflowTriggerContent
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
          {...{ [TOOLBAR_SCOPE_ROOT_ATTR]: group.key }}
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

export interface ToolbarOverflowContentProps {
  focusMemoryRef?: RefObject<ToolbarFocusMemory | null>;
  getItemHostRef: (
    id: string,
    kind: ToolbarItemHostKind,
  ) => (node: HTMLDivElement | null) => void;
  getItemRef: (id: string) => (node: HTMLDivElement | null) => void;
  getNamedTriggerRef: (id: string) => (node: HTMLDivElement | null) => void;
  getContentRef: (contentKey: string) => (node: HTMLDivElement | null) => void;
  onItemFocus?: (itemId: string, controlIndex: number) => void;
  overflowGroups: ToolbarOverflowGroup[];
  overflowedIds: Set<string>;
  content: ToolbarContentModel;
}

export function ToolbarOverflowContent({
  content,
  focusMemoryRef,
  getItemHostRef,
  getItemRef,
  getNamedTriggerRef,
  getContentRef,
  onItemFocus,
  overflowGroups,
  overflowedIds,
}: ToolbarOverflowContentProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toolbar-overflow",
    css: toolbarOverflowCss,
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
                  <ToolbarOverflowMenu
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
