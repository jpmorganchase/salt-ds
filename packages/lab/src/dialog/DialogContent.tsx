import { makePrefixer, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useContext } from "react";
import { DialogContext } from "./internal/DialogContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogContentCss from "./DialogContent.css";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("saltDialogContent");

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-content",
      css: dialogContentCss,
      window: targetWindow,
    });

    const { children, className, ...rest } = props;
    const { status, dialogId, setContentElement } = useContext(DialogContext);

    const handleRef = useForkRef(ref, setContentElement);

    return (
      <div
        {...rest}
        className={clsx(
          withBaseName(),
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
