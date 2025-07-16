import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";

import dialogCloseButtonCss from "./DialogCloseButton.css";

const withBaseName = makePrefixer("saltDialogCloseButton");

export const DialogCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function DialogCloseButton({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-close-button",
      css: dialogCloseButtonCss,
      window: targetWindow,
    });
    const { CloseIcon } = useIcon();

    return (
      <Button
        ref={ref}
        aria-label="Close dialog"
        appearance="transparent"
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <CloseIcon aria-hidden />
      </Button>
    );
  },
);
