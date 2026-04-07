import {
  makePrefixer,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FocusManager } from "../focus-manager";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelGroup } from "./SidePanelGroupContext";

const withBaseName = makePrefixer("saltSidePanel");

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * Which element to focus when the panel opens.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Reference to the trigger element for manual mode. Used to return focus when panel closes.
   * When inside SidePanelGroup, this is automatically managed via SidePanelTrigger.
   */
  triggerRef?: MutableRefObject<HTMLElement | null>;
}

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  // Use getComputedStyle so position:fixed elements (offsetParent===null but
  // fully visible) are not incorrectly excluded. ownerDocument.defaultView
  // keeps this window-agnostic for portals and multi-window environments.
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  if (!style) return true;
  return style.display !== "none" && style.visibility !== "hidden";
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisible);
}

/**
 * Walk forward from `trigger` to find the next focusable element in document
 * order. Uses TreeWalker so we stop as soon as we find the target rather than
 * collecting every focusable node on the page.
 *
 * Note: TreeWalker does not descend into shadow roots. If shadow DOM support
 * is ever needed here, see findAllTabbableElements in focus-manager/internal.
 */
function getNextFocusableAfter(
  trigger: HTMLElement,
  skip?: HTMLElement | null,
): HTMLElement | null {
  const doc = trigger.ownerDocument;
  const walker = doc.createTreeWalker(
    doc.documentElement,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        const el = node as HTMLElement;
        // FILTER_REJECT skips the node and its entire subtree in a TreeWalker.
        // This prevents the walker from re-entering the panel when searching
        // for the next focusable element after the trigger.
        if (skip && el === skip) {
          return NodeFilter.FILTER_REJECT;
        }
        return el.matches(FOCUSABLE_SELECTOR) && isVisible(el)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    },
  );

  while (walker.nextNode()) {
    if (walker.currentNode === trigger) {
      return walker.nextNode() as HTMLElement | null;
    }
  }
  return null;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      position = "right",
      initialFocus = 0,
      open: openProp = false,
      onOpenChange: onOpenChangeProp,
      variant = "primary",
      children,
      className,
      id: idProp,
      onKeyDownCapture,
      triggerRef: manualTriggerRef,
      ...rest
    } = props;
    const [showComponent, setShowComponent] = useState(false);
    const targetWindow = useWindow();
    const {
      open: groupOpen,
      setOpen: setGroupOpen,
      panelId,
      activationCount,
      triggerRef: groupTriggerRef,
    } = useSidePanelGroup();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const id = useId(idProp || panelId);

    // Use SidePanelGroup props if available
    const open = groupOpen ?? openProp;
    const onOpenChange = setGroupOpen ?? onOpenChangeProp;
    const focusReturnTriggerRef = groupTriggerRef ?? manualTriggerRef;

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef<HTMLDivElement>(panelRef, ref);
    const previousActivationCount = useRef(0);

    const getFocusTarget = useCallback(() => {
      let focusTarget: HTMLElement | null = null;

      if (
        initialFocus != null &&
        typeof initialFocus === "object" &&
        "current" in initialFocus
      ) {
        focusTarget = initialFocus.current;
      } else if (typeof initialFocus === "number" && panelRef.current) {
        // Use getFocusableElements so disabled/hidden elements are excluded,
        // and the full numeric index (not just 0) is correctly supported.
        focusTarget =
          getFocusableElements(panelRef.current)[initialFocus] ?? null;
      }

      return focusTarget || panelRef.current;
    }, [initialFocus]);

    useIsomorphicLayoutEffect(() => {
      const prevCount = previousActivationCount.current;
      previousActivationCount.current = activationCount ?? 0;

      // No new activation since the last render (e.g. open toggled without a
      // new trigger click, another dep changed, or count reset to 0 on remount).
      if (!open || !activationCount || activationCount <= prevCount) return;

      // Defer focus so it lands after the click event fully completes.
      const timeoutId = targetWindow?.setTimeout(() => {
        getFocusTarget()?.focus();
      }, 0);

      return () => targetWindow?.clearTimeout(timeoutId);
    }, [activationCount, getFocusTarget, open, targetWindow]);

    useEffect(() => {
      if (open) {
        setShowComponent(true);
        return;
      }
      // If open flips back to true before the animation completes, React runs
      // the cleanup below (clearTimeout) before the new effect, so the pending
      // setShowComponent(false) and focus-return are correctly cancelled.
      const animate = targetWindow?.setTimeout(() => {
        setShowComponent(false);
        if (focusReturnTriggerRef?.current) {
          focusReturnTriggerRef.current.focus();
        }
      }, 300); // var(--salt-duration-perceptible)
      return () => targetWindow?.clearTimeout(animate);
    }, [open, focusReturnTriggerRef, targetWindow]);

    const handleKeyDownCapture = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownCapture?.(event);

        if (event.defaultPrevented) {
          return;
        }

        const panelElement = panelRef.current;
        if (!panelElement) return;

        // Handle Escape key to close panel
        if (event.key === "Escape") {
          event.stopPropagation();
          onOpenChange?.(false);
          return;
        }

        // Handle Tab key for focus management
        if (event.key === "Tab") {
          const panelFocusables = getFocusableElements(panelElement);

          if (panelFocusables.length === 0) {
            // No focusable elements in panel: keep non-modal behavior and allow native tab navigation
            return;
          }

          const activeElement = targetWindow?.document
            .activeElement as HTMLElement;
          const firstPanelFocusable = panelFocusables[0];
          const lastPanelFocusable =
            panelFocusables[panelFocusables.length - 1];
          const trigger = focusReturnTriggerRef?.current;

          if (event.shiftKey) {
            // Shift+Tab: move to previous element or back to trigger
            if (activeElement === firstPanelFocusable) {
              // From first panel element, move focus back to trigger
              event.preventDefault();
              trigger?.focus();
            }
          } else {
            // Tab: move to next element or forward to next element after trigger
            if (activeElement === lastPanelFocusable && trigger) {
              // From last panel element, move to next focusable after trigger,
              // skipping the panel itself to avoid looping back in.
              const nextElement = getNextFocusableAfter(trigger, panelElement);
              if (nextElement) {
                event.preventDefault();
                nextElement.focus();
              }
              // else: let the browser handle Tab naturally
            }
          }
        }
      },
      [onOpenChange, targetWindow, onKeyDownCapture, focusReturnTriggerRef],
    );

    if (!showComponent) return null;

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: open,
            [withBaseName("exitAnimation")]: !open,
          },
          className,
        )}
        tabIndex={-1}
        role="region"
        id={id}
        onKeyDownCapture={handleKeyDownCapture}
        {...rest}
      >
        <div className={clsx(withBaseName("inner"))}>{children}</div>
      </div>
    );

    if (open) {
      return (
        <FocusManager
          active={open}
          // Auto-focus is handled by the activationCount-driven
          // useIsomorphicLayoutEffect above; disabling here prevents a
          // synchronous tryFocus() racing with the deferred manual focus.
          disableAutoFocus
          fallbackFocusRef={panelRef}
          disableFocusTrap
          disableReturnFocus
        >
          {panelDiv}
        </FocusManager>
      );
    }

    return panelDiv;
  },
);
