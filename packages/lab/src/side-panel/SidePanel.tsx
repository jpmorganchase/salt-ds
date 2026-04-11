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
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelContext } from "./SidePanelContext";

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
   * When inside SidePanelProvider, this is automatically managed via SidePanelTrigger.
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

/**
 * Find the first focusable element in document order that comes after
 * `panel` and is not inside it. Used to skip the panel during natural
 * Tab navigation when the panel should only receive focus via its trigger.
 */
function getNextFocusableAfterPanel(panel: HTMLElement): HTMLElement | null {
  const doc = panel.ownerDocument;
  const allFocusables = Array.from(
    doc.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  for (const el of allFocusables) {
    if (
      !panel.contains(el) &&
      isVisible(el) &&
      panel.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return el;
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
    const [animating, setAnimating] = useState(false);
    const targetWindow = useWindow();
    const {
      openState: groupOpen,
      setOpen: setGroupOpen,
      panelId,
      activationCount,
      triggerRef: groupTriggerRef,
    } = useSidePanelContext();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const id = useId(idProp || panelId);

    // Use SidePanelContext props if available
    const open = groupOpen ?? openProp;
    const onOpenChange = setGroupOpen ?? onOpenChangeProp;
    const focusReturnTriggerRef = groupTriggerRef ?? manualTriggerRef;

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef<HTMLDivElement>(panelRef, ref);
    const previousActivationCount = useRef(0);
    const wasOpenRef = useRef(false);
    const tabDirectionRef = useRef<"forward" | "backward">("forward");
    const tabJustPressedRef = useRef(false);

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

    const handleAnimationEnd = useCallback(() => {
      setAnimating(false);
      if (!open) {
        setShowComponent(false);
      }
    }, [open]);

    useEffect(() => {
      const prefersReducedMotion = targetWindow?.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;

      if (open) {
        setShowComponent(true);
        wasOpenRef.current = true;

        if (!prefersReducedMotion) {
          setAnimating(true);
        }
        return;
      }

      // Capture whether the panel was previously open so we only return focus
      // on a genuine open→close transition, not on the initial mount when
      // `focusReturnTriggerRef.current` may already be set (manual trigger case).
      const shouldReturnFocus = wasOpenRef.current;
      wasOpenRef.current = false;

      if (prefersReducedMotion) {
        setShowComponent(false);
        if (shouldReturnFocus && focusReturnTriggerRef?.current) {
          focusReturnTriggerRef.current.focus();
        }
        return;
      }

      // Animation: wait for exit animation to complete before unmounting.
      // handleAnimationEnd will call setShowComponent(false).
      setAnimating(true);

      // Fallback: if the animation never fires (e.g. display:none prevents it),
      // unmount after the animation duration and return focus.
      const animate = targetWindow?.setTimeout(() => {
        setShowComponent(false);
        if (shouldReturnFocus && focusReturnTriggerRef?.current) {
          focusReturnTriggerRef.current.focus();
        }
      }, 300); // var(--salt-duration-perceptible)
      return () => targetWindow?.clearTimeout(animate);
    }, [open, focusReturnTriggerRef, targetWindow]);

    // Track Tab direction so handleFocus knows which way focus was moving
    useEffect(() => {
      const doc = targetWindow?.document;
      if (!doc) return;
      const onKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Tab") {
          tabDirectionRef.current = e.shiftKey ? "backward" : "forward";
          tabJustPressedRef.current = true;
        }
      };
      doc.addEventListener("keydown", onKeyDown, true);
      return () => doc.removeEventListener("keydown", onKeyDown, true);
    }, [targetWindow]);

    // Redirect focus when natural Tab/Shift+Tab would enter the panel.
    // The panel should only receive focus via trigger activation, not by
    // tabbing through the page.
    const handleFocus = useCallback(
      (event: ReactFocusEvent<HTMLDivElement>) => {
        const panel = panelRef.current;
        if (!panel) return;

        // Consume the flag immediately — only the focus event directly following
        // a Tab keydown should be treated as natural tab navigation.
        const wasTabNavigation = tabJustPressedRef.current;
        tabJustPressedRef.current = false;

        const relatedTarget = event.relatedTarget as HTMLElement | null;

        // Focus moved within the panel — normal internal tabbing, allow it
        if (relatedTarget && panel.contains(relatedTarget)) return;

        // Focus came from the trigger — programmatic open, allow it
        const trigger = focusReturnTriggerRef?.current;
        if (relatedTarget === trigger) return;

        // Programmatic .focus() call (e.g. from outside code or mouse click)
        // — not Tab navigation, allow it
        if (!wasTabNavigation) return;

        // Natural tab navigation reached the panel — redirect away
        if (tabDirectionRef.current === "forward") {
          const nextEl = getNextFocusableAfterPanel(panel);
          nextEl?.focus();
          // No next element: let the browser wrap to the top naturally
        } else {
          // Shift+Tab backward into panel — return to trigger
          trigger?.focus();
        }
      },
      [focusReturnTriggerRef],
    );

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

    return (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: open && animating,
            [withBaseName("exitAnimation")]: !open && animating,
          },
          className,
        )}
        tabIndex={-1}
        role="region"
        id={id}
        onFocus={handleFocus}
        onKeyDownCapture={handleKeyDownCapture}
        onAnimationEnd={handleAnimationEnd}
        {...rest}
      >
        <div className={clsx(withBaseName("inner"))}>{children}</div>
      </div>
    );
  },
);
