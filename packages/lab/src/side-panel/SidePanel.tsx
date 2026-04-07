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
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}

/**
 * Get all focusable elements in the document, starting from a reference element
 */
function getAllFocusableElements(referenceElement: HTMLElement): HTMLElement[] {
  const root = referenceElement.ownerDocument.documentElement;
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
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
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
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

    // Warn if neither aria-label nor aria-labelledby is provided
    useEffect(() => {
      if (
        !ariaLabel &&
        !ariaLabelledby &&
        process.env.NODE_ENV === "development"
      ) {
        console.warn(
          `SidePanel with id "${id}" is missing an accessible name. Either provide an "aria-label" or "aria-labelledby" prop.`,
        );
      }
    }, [id, ariaLabel, ariaLabelledby]);

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
        initialFocus &&
        typeof initialFocus === "object" &&
        "current" in initialFocus
      ) {
        focusTarget = initialFocus.current;
      } else if (typeof initialFocus === "number" && initialFocus === 0) {
        focusTarget = panelRef.current?.querySelector(
          FOCUSABLE_SELECTOR,
        ) as HTMLElement;
      }

      return focusTarget || panelRef.current;
    }, [initialFocus]);

    useIsomorphicLayoutEffect(() => {
      if (!open || activationCount === undefined) {
        previousActivationCount.current = activationCount ?? 0;
        return;
      }

      // Focus moves into panel whenever activation count increments
      if (activationCount > previousActivationCount.current) {
        previousActivationCount.current = activationCount;

        // Use setTimeout to ensure focus happens after click event fully completes
        const timeoutId = targetWindow?.setTimeout(() => {
          getFocusTarget()?.focus();
        }, 0);

        return () => {
          if (timeoutId) {
            targetWindow?.clearTimeout(timeoutId);
          }
        };
      }

      previousActivationCount.current = activationCount;
    }, [activationCount, getFocusTarget, open, targetWindow]);

    useEffect(() => {
      if (open) {
        setShowComponent(true);
        return;
      }
      const animate = setTimeout(() => {
        setShowComponent(false);
        if (focusReturnTriggerRef?.current) {
          focusReturnTriggerRef.current.focus();
        }
      }, 300); // var(--salt-duration-perceptible)
      return () => clearTimeout(animate);
    }, [open, focusReturnTriggerRef]);

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
            if (activeElement === lastPanelFocusable) {
              // From last panel element, move to next focusable after trigger
              event.preventDefault();

              if (trigger) {
                const allFocusables = getAllFocusableElements(panelElement);
                const triggerIndex = allFocusables.indexOf(trigger);

                if (
                  triggerIndex >= 0 &&
                  triggerIndex < allFocusables.length - 1
                ) {
                  // Find next focusable after the trigger
                  const nextFocusable = allFocusables[triggerIndex + 1];
                  nextFocusable?.focus();
                }
              }
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
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
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
          autoFocusRef={
            typeof initialFocus === "object" && "current" in initialFocus
              ? initialFocus
              : undefined
          }
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
