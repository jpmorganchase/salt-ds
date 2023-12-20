import { FloatingArrow, FloatingArrowProps } from "@floating-ui/react";
import { OverlayProps } from "./Overlay";

import overlayCss from "./Overlay.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Button, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { SyntheticEvent } from "react";

const withBaseName = makePrefixer("saltOverlay");

interface OverlayBaseProps extends Omit<OverlayProps, "children"> {
  arrowProps: FloatingArrowProps;
  /*
   * Handles close button click or press.
   */
  handleCloseButton: (event: SyntheticEvent) => void;
}

export const OverlayBase = (props: OverlayBaseProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay",
    css: overlayCss,
    window: targetWindow,
  });

  const { content, arrowProps, handleCloseButton, ...rest } = props;

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
        <div className={withBaseName("content")}>{content}</div>
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
