import { Button, makePrefixer, StateIcon } from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import { forwardRef, HTMLAttributes, SyntheticEvent, useContext } from "react";
import { DialogContext } from "./internal/DialogContext";

import "./DialogTitle.css";
export interface DialogTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Disable the built-in ARIA heading attributes.
   */
  disableAria?: boolean;
  onClose?: (event: SyntheticEvent) => void;
}

const withBaseName = makePrefixer("uitkDialogTitle");

export const DialogTitle = forwardRef<HTMLDivElement, DialogTitleProps>(
  function DialogTitle(props, ref) {
    const { children, className, onClose, ...rest } = props;
    const { state, dialogId } = useContext(DialogContext);

    return (
      <div
        className={classnames(withBaseName(), className)}
        ref={ref}
        {...rest}
      >
        {onClose && (
          <Button
            className={withBaseName("close")}
            onClick={onClose}
            variant="secondary"
          >
            <CloseIcon
              aria-label="close dialog"
              className={withBaseName("closeIcon")}
              size={14}
            />
          </Button>
        )}
        {state && (
          <StateIcon className={withBaseName("stateIcon")} state={state} />
        )}
        <span aria-level={1} id={`${dialogId}-heading`} role="heading">
          {children}
        </span>
      </div>
    );
  }
);
