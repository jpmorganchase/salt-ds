import { FloatingFocusManager } from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Whether the panel animates its own open/close transitions.
   * Set to `false` when the parent controls sizing and animation (e.g. inside a splitter).
   * @default true
   */
  animated?: boolean;
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * Which element receives focus when the panel opens.
   * Pass a number for the tabbable element index (0 = first), or a ref to a specific element.
   * Defaults to the side panel close button.
   */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
  /**
   * The background color palette. Options are 'primary', 'secondary' and 'tertiary'.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * The appearance of the panel, affecting background and border styles. Options are 'solid' and 'transparent'.
   * @default "solid"
   */
  appearance?: "solid" | "transparent";
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      animated = true,
      position = "right",
      appearance = "solid",
      initialFocus,
      variant = "primary",
      children,
      className,
      ...rest
    } = props;

    const {
      openState,
      floatingRootContext,
      setFloating,
      getFloatingProps,
      closeButtonRef,
    } = useSidePanelContext();

    const [showComponent, setShowComponent] = useState(openState);
    const [animating, setAnimating] = useState(false);
    // Track whether this is the initial render. Skip animation on first render
    // when panel is already open (e.g. defaultOpen=true), but still move focus
    // to the panel for accessibility announcements.
    const initialRender = useRef(true);
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const { context } = useFloatingUI({
      rootContext: floatingRootContext,
    });

    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    const handleAnimationEnd = useCallback(() => {
      setAnimating(false);
      if (!openState) {
        setShowComponent(false);
      }
    }, [openState]);

    useEffect(() => {
      if (!animated) {
        // When not animated the panel is always kept mounted so the parent can
        // control sizing (e.g. flex-grow transition in a splitter).
        setShowComponent(true);
        setAnimating(false);
        initialRender.current = false;
        return;
      }

      // Skip animation on initial render when panel is already open
      if (initialRender.current && openState) {
        setShowComponent(true);
        setAnimating(false);
        initialRender.current = false;
        return;
      }

      const prefersReducedMotion = targetWindow?.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;

      if (openState) {
        setShowComponent(true);
      }

      if (prefersReducedMotion) {
        setAnimating(false);
        if (!openState) {
          setShowComponent(false);
        }
      } else {
        setAnimating(true);
      }

      initialRender.current = false;
    }, [openState, targetWindow, animated]);

    if (!showComponent) return null;

    const resolvedInitialFocus = initialFocus ?? closeButtonRef;

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(appearance)]: appearance,
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]:
              animated && openState && animating,
            [withBaseName("exitAnimation")]:
              animated && !openState && animating,
          },
          className,
        )}
        onAnimationEnd={animated ? handleAnimationEnd : undefined}
        {...getFloatingProps(rest)}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={resolvedInitialFocus}
          closeOnFocusOut={false}
          guards={false}
        >
          {panelDiv}
        </FloatingFocusManager>
      );
    }

    return panelDiv;
  },
);
