import { forwardRef, HTMLAttributes, Ref, useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
} from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import drawerCss from "./Drawer.css";

export const DRAWER_POSITIONS = ["left", "top", "right", "bottom"] as const;

export type DrawerPositions = typeof DRAWER_POSITIONS[number];

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the drawer position within the screen.
   */
  position?: DrawerPositions;
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Change background color palette
   */
  variant?: "primary" | "secondary";
}

const withBaseName = makePrefixer("saltDrawer");

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  props,
  ref
) {
  const {
    children,
    className,
    position = "left",
    open = true,
    onOpenChange,
    variant = "primary",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-drawer",
    css: drawerCss,
    window: targetWindow,
  });

  const [showComponent, setShowComponent] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const { context, floating } = useFloatingUI({
    open,
    onOpenChange,
  });

  const floatingRef = useForkRef(floating, ref) as Ref<HTMLDivElement>;

  const role = useRole(context);
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

  const { getFloatingProps } = useInteractions([role, dismiss]);

  useEffect(() => {
    if (!open && !isAnimating) {
      setShowComponent(false);
    }

    if (open && !showComponent) {
      setShowComponent(true);
    }
  }, [open, showComponent, isAnimating]);

  return (
    <FloatingPortal>
      {showComponent && (
        <FloatingOverlay className={withBaseName("overlay")}>
          <FloatingFocusManager context={context}>
            <div
              ref={floatingRef}
              className={clsx(
                withBaseName(),
                withBaseName(position),
                {
                  [withBaseName("enterAnimation")]: open,
                  [withBaseName("exitAnimation")]: !open,
                  [withBaseName(variant)]: variant,
                },
                className
              )}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationEnd={() => {
                if (!open && showComponent) {
                  setShowComponent(false);
                }
              }}
              {...getFloatingProps()}
              {...rest}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
});
