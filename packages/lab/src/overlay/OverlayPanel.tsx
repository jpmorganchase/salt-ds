import {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  HTMLProps,
} from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useOverlayContext } from "./OverlayContext";
import { FloatingOverlay } from "@floating-ui/react";
import { OverlayPanelBase } from "./OverlayPanelBase";

const withBaseName = makePrefixer("saltOverlayPanel");

export interface OverlayPanelProps extends ComponentPropsWithoutRef<"div"> {}

export const OverlayPanel = forwardRef<HTMLDivElement, OverlayPanelProps>(
  function OverlayPanel(props, ref: ForwardedRef<HTMLDivElement>) {
    const { className, ...rest } = props;

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

    const handleRef = useForkRef(floating, ref);

    const getOverlayProps = (): HTMLProps<HTMLDivElement> => {
      return getFloatingProps({
        // @ts-ignore data-placement does not exist
        "data-placement": placement,
        ref: floating,
        id: `${id}-panel`,
      });
    };

    if (!openState) return <></>;

    return (
      <FloatingOverlay>
        <FloatingComponent
          open={openState}
          ref={handleRef}
          className={clsx(withBaseName(), className)}
          aria-modal="true"
          aria-labelledby={`${id}-header`}
          aria-describedby={`${id}-content`}
          {...getOverlayProps()}
          {...floatingStyles}
          focusManagerProps={{
            context: context,
          }}
        >
          <OverlayPanelBase {...rest} />
        </FloatingComponent>
      </FloatingOverlay>
    );
  }
);
