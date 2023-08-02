import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogNextContentCss from "./DialogNextContent.css";

const withBaseName = makePrefixer("saltDialogNextContent");

export const DialogNextContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogNextContent(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-content",
    css: dialogNextContentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      {children}
    </div>
  );
});
