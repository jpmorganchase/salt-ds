import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogContentCss from "./DialogContent.css";
import { useDialogContext } from "./DialogContext";

const withBaseName = makePrefixer("saltDialogContent");

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of Dialog Content
   */
  children?: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, className, ...rest } = props;
    const { dialogId } = useDialogContext();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-content",
      css: dialogContentCss,
      window: targetWindow,
    });

    return (
      <div
        id={`${dialogId!}-description`}
        className={clsx(withBaseName(), className)}
        {...rest}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
