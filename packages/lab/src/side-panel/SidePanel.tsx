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
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
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
   * Change background color palette.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      position = "right",
      initialFocus = 0,
      variant = "primary",
      children,
      className,
      ...rest
    } = props;

    const [showComponent, setShowComponent] = useState(false);
    const [animating, setAnimating] = useState(false);
    const targetWindow = useWindow();

    const { openState, floatingRootContext, setFloating, getFloatingProps } =
      useSidePanelContext();

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
    }, [openState, targetWindow]);

    if (!showComponent) return null;

    const panelDiv = (
      <div
        aria-expanded={showComponent ? "true" : "false"}
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: openState && animating,
            [withBaseName("exitAnimation")]: !openState && animating,
          },
          className,
        )}
        onAnimationEnd={handleAnimationEnd}
        {...getFloatingProps(rest)}
        role={"region"}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState) {
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
