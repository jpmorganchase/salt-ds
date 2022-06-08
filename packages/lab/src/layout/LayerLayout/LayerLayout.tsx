import { forwardRef, HTMLAttributes, useState, useEffect } from "react";
import cx from "classnames";

import { makePrefixer, Breakpoints } from "@jpmorganchase/uitk-core";
import { Scrim, ScrimProps } from "../../scrim";
import "./LayerLayout.css";
import { useChangeView } from "../utils";

export const LAYER_POSITION = [
  "center",
  "left",
  "top",
  "right",
  "bottom",
] as const;

export type LayerPosition = typeof LAYER_POSITION[number];

export interface LayerLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display or hide the scrim.
   */
  displayScrim?: boolean;
  /**
   * Defines the layer position within the screen.
   */
  position?: LayerPosition;
  /**
   * Breakpoint at which the layer will become fullscreen.
   */
  fullScreenAtBreakpoint?: keyof Breakpoints;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Props to be passed to the Scrim component.
   */
  scrimProps?: ScrimProps;
}

const withBaseName = makePrefixer("uitkLayerLayout");

export const LayerLayout = forwardRef<HTMLDivElement, LayerLayoutProps>(
  function LayerLayout(props, ref) {
    const {
      children,
      className,
      displayScrim = true,
      position = "center",
      fullScreenAtBreakpoint = "sm",
      disableAnimations = false,
      scrimProps,
      open = true,
      ...rest
    } = props;

    const [showComponent, setShowComponent] = useState(false);

    useEffect(() => {
      if (!open && disableAnimations) {
        setShowComponent(false);
      }

      if (open && !showComponent) {
        setShowComponent(true);
      }
    }, [open, showComponent, disableAnimations]);

    const fullScreen = useChangeView(fullScreenAtBreakpoint);

    const anchored = position !== "center" && !fullScreen;

    const layerLayout = showComponent ? (
      <div
        ref={ref}
        className={cx(withBaseName(), className, {
          [withBaseName("anchor")]: anchored,
          [withBaseName("fullScreen")]: fullScreen,
          [withBaseName(position)]: !fullScreen,
          [withBaseName("enter-animation")]: !disableAnimations && open,
          [withBaseName("exit-animation")]: !disableAnimations && !open,
        })}
        onAnimationEnd={() => {
          if (!open && showComponent) {
            setShowComponent(false);
          }
        }}
        {...rest}
      >
        {children}
      </div>
    ) : null;

    return displayScrim ? (
      <Scrim
        open={showComponent}
        className="uitkEmphasisMedium"
        {...scrimProps}
      >
        {layerLayout}
      </Scrim>
    ) : (
      layerLayout
    );
  }
);
