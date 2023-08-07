import { forwardRef } from "react";
import clsx from "clsx";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { CloseIcon } from "@salt-ds/icons";

import { useDialogContext } from "./DialogContext";
import dialogCloseButtonCss from "./DialogCloseButton.css";

const withBaseName = makePrefixer("saltDialogCloseButton");

export const DialogCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function DialogCloseButton({ className, ...rest }, ref) {
    const { dialogId } = useDialogContext();
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-close-button",
      css: dialogCloseButtonCss,
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
