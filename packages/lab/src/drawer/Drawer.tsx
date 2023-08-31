import { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from "@floating-ui/react";
import { makePrefixer, SaltProvider, useForkRef } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useDrawer } from "./useDrawer";

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

  const { floating, context } = useDrawer({
    open,
    onOpenChange,
  });

  const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

  useEffect(() => {
    if (open && !showComponent) {
      setShowComponent(true);
    }
  }, [open, showComponent]);

  return (
    <FloatingPortal>
      <SaltProvider>
        {showComponent && (
          <FloatingOverlay className={withBaseName("overlay")} lockScroll>
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
                onAnimationEnd={() => {
                  if (!open && showComponent) {
                    setShowComponent(false);
                  }
                }}
                {...rest}
              >
                {children}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </SaltProvider>
    </FloatingPortal>
  );
});
