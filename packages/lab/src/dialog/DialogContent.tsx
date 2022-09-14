import { makePrefixer, useForkRef } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import { forwardRef, HTMLAttributes, useContext } from "react";
import { DialogContext } from "./internal/DialogContext";

import "./DialogContent.css";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("uitkDialogContent");

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, className, ...rest } = props;
    const { status, dialogId, setContentElement } = useContext(DialogContext);

    const handleRef = useForkRef(ref, setContentElement);

    return (
      <div
        {...rest}
        className={classnames(
          withBaseName(),
          className,
          {
            [withBaseName("leftGutter")]: !!status,
          },
          className
        )}
        id={`${dialogId}-body`}
        ref={handleRef}
      >
        {children}
      </div>
    );
  }
);
