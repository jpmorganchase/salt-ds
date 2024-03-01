import { ForwardedRef, forwardRef, HTMLProps, HTMLAttributes } from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useOverlayContext } from "./OverlayContext";
import { OverlayPanelBase } from "./OverlayPanelBase";

const withBaseName = makePrefixer("saltOverlayPanel");

export interface A11yValueProps {
  /**
   * announced by screen reader when overlay panel is opened
   */
  "aria-labelledBy"?: string;
}

export interface OverlayPanelProps extends HTMLAttributes<HTMLDivElement> {
  a11yProps?: A11yValueProps;
}

export const OverlayPanel = forwardRef<HTMLDivElement, OverlayPanelProps>(
  function OverlayPanel(props, ref: ForwardedRef<HTMLDivElement>) {
    const { className, a11yProps, ...rest } = props;

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      id,
      openState,
      floatingStyles,
      placement,
      context,
      getFloatingProps,
      floating,
    } = useOverlayContext();

    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    const { top, left, width, height, position } = floatingStyles;

    const getOverlayProps = (): HTMLProps<HTMLDivElement> => {
      return getFloatingProps({
        // @ts-ignore data-placement does not exist
        "data-placement": placement,
        ref: floating,
        id: `${id}-panel`,
      });
    };

    return (
      <FloatingComponent
        open={openState}
        className={clsx(withBaseName(), className)}
        aria-modal="true"
        {...getOverlayProps()}
        ref={handleRef}
        width={width}
        height={height}
        top={top}
        left={left}
        position={position}
        focusManagerProps={{
          context: context,
        }}
        {...a11yProps}
      >
        <OverlayPanelBase {...rest} />
      </FloatingComponent>
    );
  }
);
