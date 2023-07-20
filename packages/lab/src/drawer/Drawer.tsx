import { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import { clsx } from "clsx";

import { Scrim, ScrimProps } from "../scrim";

import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import drawerCss from "./Drawer.css";

export const DRAWER_POSITIONS = ["left", "top", "right", "bottom"] as const;

export type DrawerPositions = typeof DRAWER_POSITIONS[number];

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Disable the scrim.
   */
  disableScrim?: boolean;
  /**
   * Defines the drawer position within the screen.
   */
  position?: DrawerPositions;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Display or hide the component.
   */
  isOpen?: boolean;
  /**
   * Props to be passed to the Scrim component.
   */
  scrimProps?: Partial<ScrimProps>;
  /**
   * Change background color palette
   */
  variant?: "primary" | "secondary";
}

const withBaseName = makePrefixer("saltDrawer");

const ariaAttributes = { role: "dialog", "aria-modal": true };

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  props,
  ref
) {
  const {
    children,
    className,
    disableScrim = false,
    position = "left",
    disableAnimations = false,
    scrimProps,
    isOpen = true,
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

  useEffect(() => {
    if ((!isOpen && disableAnimations) || (!isOpen && !isAnimating)) {
      setShowComponent(false);
    }

    if (isOpen && !showComponent) {
      setShowComponent(true);
    }
  }, [isOpen, showComponent, disableAnimations, isAnimating]);

  const enterAnimation = !disableAnimations && isOpen;

  const exitAnimation = !disableAnimations && !isOpen;

  const drawer = showComponent ? (
    <div
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName(position),
        {
          [withBaseName("enterAnimation")]: enterAnimation,
          [withBaseName("exitAnimation")]: exitAnimation,
          [withBaseName(variant)]: variant,
        },
        className
      )}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationEnd={() => {
        if (!isOpen && showComponent) {
          setShowComponent(false);
        }
      }}
      {...(disableScrim && ariaAttributes)}
      {...rest}
    >
      {children}
    </div>
  ) : null;

  return disableScrim ? (
    drawer
  ) : (
    <Scrim
      open={showComponent}
      className={clsx({
        [withBaseName("enterAnimation")]: enterAnimation,
        [withBaseName("exitAnimation")]: exitAnimation,
      })}
      {...scrimProps}
    >
      {drawer}
    </Scrim>
  );
});
