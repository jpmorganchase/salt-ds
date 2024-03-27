import { forwardRef } from "react";
import clsx from "clsx";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { CloseIcon } from "@salt-ds/icons";
import overlayPanelCloseButtonCss from "./OverlayPanelCloseButton.css";

const withBaseName = makePrefixer("saltOverlayPanelCloseButton");

export const OverlayPanelCloseButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function OverlayPanelButton({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-close-button",
    css: overlayPanelCloseButtonCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)}>
      <Button
        ref={ref}
        aria-label="Close overlay"
        variant="secondary"
        className={withBaseName("button")}
        {...rest}
      >
        <CloseIcon aria-hidden />
      </Button>
    </div>
  );
});
