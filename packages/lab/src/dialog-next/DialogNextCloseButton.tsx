import { forwardRef } from "react";
import clsx from "clsx";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { CloseIcon } from "@salt-ds/icons";

import { useDialogNextContext } from "./DialogNextContext";
import dialogNextCloseButtonCss from "./DialogNextCloseButton.css";

const withBaseName = makePrefixer("saltDialogNextCloseButton");

export const DialogNextCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function DialogNextCloseButton({ className, ...rest }, ref) {
    const { dialogId } = useDialogNextContext();
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-next-close-button",
      css: dialogNextCloseButtonCss,
      window: targetWindow,
    });

    return (
      <Button
        ref={ref}
        aria-controls={dialogId}
        aria-label="Close dialog"
        variant="secondary"
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <CloseIcon />
      </Button>
    );
  }
);
