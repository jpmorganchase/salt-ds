import { FloatingArrow } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "../utils";
import { useOverlayContext } from "./OverlayContext";
import overlayPanelCss from "./OverlayPanel.css";

const withBaseName = makePrefixer("saltOverlayPanel");
export interface OverlayPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Overlay Panel
   */
  children?: ReactNode;
}

export const OverlayPanel = forwardRef<HTMLDivElement, OverlayPanelProps>(
  function OverlayPanel(props, ref) {
    const {
      className,
      "aria-labelledby": ariaLabelledby,
      children,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-overlay-panel",
      css: overlayPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      openState,
      floatingStyles,
      context,
      getFloatingProps,
      floating,
      arrowProps,
    } = useOverlayContext();

    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    const { top, left, width, height, position } = floatingStyles;

    return (
      <FloatingComponent
        open={openState}
        className={clsx(withBaseName(), className)}
        aria-modal="true"
        {...getFloatingProps()}
        ref={handleRef}
        width={width}
        height={height}
        top={top}
        left={left}
        position={position}
        focusManagerProps={{
          context: context,
        }}
        aria-labelledby={ariaLabelledby}
      >
        <div {...rest}> {children} </div>
        <FloatingArrow
          {...arrowProps}
          strokeWidth={1}
          fill="var(--overlay-background)"
          stroke="var(--overlay-borderColor)"
          height={5}
          width={10}
        />
      </FloatingComponent>
    );
  },
);
