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
import { hasOverlaySection } from "./hasOverlaySection";
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
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
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
      hideArrow,
      headerId,
      descriptionId,
    } = useOverlayContext();

    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    const sectioned = hasOverlaySection(children);

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
          outsideElementsInert: true,
        }}
        aria-label={ariaLabel}
        aria-labelledby={clsx(ariaLabelledby, headerId) || undefined}
        aria-describedby={clsx(ariaDescribedby, descriptionId) || undefined}
      >
        <div
          className={clsx(withBaseName("content"), {
            [withBaseName("sectioned")]: sectioned,
          })}
          {...rest}
        >
          {children}
        </div>
        {!hideArrow && (
          <FloatingArrow
            {...arrowProps}
            className={withBaseName("arrow")}
            strokeWidth={1}
            fill="var(--overlay-background)"
            stroke="var(--overlay-borderColor)"
            height={6}
            width={12}
          />
        )}
      </FloatingComponent>
    );
  },
);
