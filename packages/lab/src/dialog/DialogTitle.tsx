import { Button, H1, makePrefixer, StatusIndicator } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, SyntheticEvent, useContext } from "react";
import { DialogContext } from "./internal/DialogContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogTitleCss from "./DialogTitle.css";

export interface DialogTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Disable the built-in ARIA heading attributes.
   */
  disableAria?: boolean;
  onClose?: (event: SyntheticEvent) => void;
}

const withBaseName = makePrefixer("saltDialogTitle");

export const DialogTitle = forwardRef<HTMLDivElement, DialogTitleProps>(
  function DialogTitle(props, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-title",
      css: dialogTitleCss,
      window: targetWindow,
    });

    const { children, className, onClose, ...rest } = props;
    const { status, dialogId } = useContext(DialogContext);

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {onClose && (
          <Button
            className={withBaseName("close")}
            onClick={onClose}
            variant="secondary"
          >
            <CloseIcon
              aria-label="close dialog"
              className={withBaseName("closeIcon")}
            />
          </Button>
        )}
        {status && (
          <StatusIndicator
            className={withBaseName("statusIndicator")}
            status={status}
          />
        )}
        <H1 id={`${dialogId}-heading`} className={withBaseName("text")}>
          {children}
        </H1>
      </div>
    );
  }
);
