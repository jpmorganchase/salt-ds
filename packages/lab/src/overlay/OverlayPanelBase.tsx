import { FloatingArrow } from "@floating-ui/react";

import overlayCss from "./Overlay.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Button, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { ComponentPropsWithoutRef } from "react";
import { useOverlayContext } from "./OverlayContext";
import clsx from "clsx";

const withBaseName = makePrefixer("saltOverlay");

interface OverlayPanelBaseProps extends ComponentPropsWithoutRef<"div"> {}

export const OverlayPanelBase = (props: OverlayPanelBaseProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay",
    css: overlayCss,
    window: targetWindow,
  });

  const { arrowProps, handleCloseButton } = useOverlayContext();
  const { children, className, ...rest } = props;

  return (
    <>
      <div className={withBaseName("container")} {...rest}>
        <Button
          onClick={handleCloseButton}
          variant="secondary"
          className={withBaseName("closeButton")}
          aria-label="Close Overlay"
        >
          <CloseIcon aria-hidden />
        </Button>
        <div className={clsx(withBaseName("content"), className)}>
          {children}
        </div>
      </div>

      <FloatingArrow
        {...arrowProps}
        strokeWidth={1}
        fill="var(--overlay-background)"
        stroke="var(--overlay-borderColor)"
        style={{
          height: "calc(var(--salt-size-adornment) + 6px)", // +6px to account for Floating UI's FloatingArrow positioning calculation
          width: "calc(var(--salt-size-adornment) + 8px)", // +8px to account for Floating UI's FloatingArrow positioning calculation
        }}
      />
    </>
  );
};
