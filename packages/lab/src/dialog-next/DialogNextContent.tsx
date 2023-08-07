import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogNextContentCss from "./DialogNextContent.css";
import { useDialogNextContext } from "./DialogNextContext";

const withBaseName = makePrefixer("saltDialogNextContent");

export const DialogNextContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogNextContent(props, ref) {
  const { children, className, ...rest } = props;
  const { dialogId } = useDialogNextContext();

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-content",
    css: dialogNextContentCss,
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
