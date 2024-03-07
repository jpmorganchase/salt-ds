import {
  ForwardedRef,
  forwardRef,
  HTMLProps,
  ComponentPropsWithoutRef,
} from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useOverlayContext } from "./OverlayContext";
import { OverlayPanelBase } from "./OverlayPanelBase";

const withBaseName = makePrefixer("saltOverlayPanel");

export interface OverlayPanelProps extends ComponentPropsWithoutRef<"div"> {}

export const OverlayPanel = forwardRef<HTMLDivElement, OverlayPanelProps>(
  function OverlayPanel(props, ref: ForwardedRef<HTMLDivElement>) {
    const { className, ["aria-labelledby"]: ariaLabelledby, ...rest } = props;
    console.log({ ...rest });

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
        aria-labelledby={ariaLabelledby}
      >
        <OverlayPanelBase {...rest} />
      </FloatingComponent>
    );
  }
);
