import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogContentCss from "./DialogContent.css";
import { useDialogContext } from "./DialogContext";

const withBaseName = makePrefixer("saltDialogContent");

export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogContent(props, ref) {
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
});
