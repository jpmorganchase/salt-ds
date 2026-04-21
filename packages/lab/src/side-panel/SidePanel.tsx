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
   * @default 0
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
      initialFocus = 0,
      variant = "primary",
      children,
      className,
      ...rest
    } = props;

    const { openState, floatingRootContext, setFloating, getFloatingProps } =
      useSidePanelContext();

    const [showComponent, setShowComponent] = useState(openState);
    const [animating, setAnimating] = useState(false);
    // True while the panel is still in its initial open state (e.g. defaultOpen)
    // and has not yet been closed by the user.  While true we:
    //  1. Skip the CSS enter animation (the panel is already visible).
    //  2. Omit FloatingFocusManager so it cannot steal focus on mount.
    // Once the panel closes for the first time the flag is set to false
    // permanently and normal animation + focus behaviour takes over.
    const initialOpen = useRef(openState);
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
        initialOpen.current = false;
      }
    }, [openState]);

    useEffect(() => {
      if (!animated) {
        // When not animated the panel is always kept mounted so the parent can
        // control sizing (e.g. flex-grow transition in a splitter).  Only
        // initialOpen needs updating so FloatingFocusManager activates after
        // the first close.
        setShowComponent(true);
        setAnimating(false);
        if (!openState) {
          initialOpen.current = false;
        }
        return;
      }

      if (initialOpen.current && openState) {
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
          initialOpen.current = false;
        }
      } else {
        setAnimating(true);
      }
    }, [openState, targetWindow, animated]);

    if (!showComponent) return null;

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
        role={"region"}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState && !initialOpen.current) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={initialFocus}
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
