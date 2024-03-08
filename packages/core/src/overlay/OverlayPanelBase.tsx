import { FloatingArrow } from "@floating-ui/react";

import overlayCss from "./Overlay.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "../utils";
import { Button } from "../button";
import { CloseIcon } from "@salt-ds/icons";
import { ComponentPropsWithoutRef } from "react";
import { useOverlayContext } from "./OverlayContext";
import clsx from "clsx";

const withBaseName = makePrefixer("saltOverlayPanelBase");

// OverlayPanelBase component needed for CSS style injection
export const OverlayPanelBase = (props: ComponentPropsWithoutRef<"div">) => {
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
      <div className={clsx(withBaseName("container"), className)} {...rest}>
        <Button
          onClick={handleCloseButton}
          variant="secondary"
          className={withBaseName("closeButton")}
          aria-label="Close Overlay"
        >
          <CloseIcon aria-hidden />
        </Button>
        <div className={withBaseName("content")}>{children}</div>
      </div>
      <FloatingArrow
        {...arrowProps}
        strokeWidth={1}
        fill="var(--overlay-background)"
        stroke="var(--overlay-borderColor)"
        height={5}
        width={10}
      />
    </>
  );
};
