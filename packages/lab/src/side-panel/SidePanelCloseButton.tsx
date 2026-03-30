import { Button, type ButtonProps, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import sidePanelCloseButtonCss from "./SidePanelCloseButton.css";
import { useSidePanelGroup } from "./SidePanelGroupContext";

const withBaseName = makePrefixer("saltSidePanelCloseButton");

export const SidePanelCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function SidePanelCloseButton({ className, onClick, ...rest }, ref) {
    const targetWindow = useWindow();
    const { setOpen } = useSidePanelGroup();

    useComponentCssInjection({
      testId: "salt-side-panel-close-button",
      css: sidePanelCloseButtonCss,
      window: targetWindow,
    });

    const { CloseIcon } = useIcon();

    const handleClick: ButtonProps["onClick"] = (event) => {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      setOpen(false);
    };

    return (
      <div className={withBaseName("container")}>
        <Button
          ref={ref}
          aria-label="Close"
          appearance="transparent"
          className={clsx(withBaseName(), className)}
          onClick={handleClick}
          {...rest}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
    );
  },
);
