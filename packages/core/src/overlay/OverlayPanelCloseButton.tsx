import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";
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
  const { CloseIcon } = useIcon();

  return (
    <div className={clsx(withBaseName(), className)}>
      <Button
        ref={ref}
        aria-label="Close overlay"
        appearance="transparent"
        className={withBaseName("button")}
        {...rest}
      >
        <CloseIcon aria-hidden />
      </Button>
    </div>
  );
});
