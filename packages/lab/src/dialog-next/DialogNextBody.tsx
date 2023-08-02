import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer, StatusIndicator } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogNextBodyCss from "./DialogNextBody.css";
import { DialogNextProps } from "./DialogNext";

const withBaseName = makePrefixer("saltDialogNextBody");

interface DialogNextBodyProps extends HTMLAttributes<HTMLDivElement> {
  status?: DialogNextProps["status"];
}

export const DialogNextBody = forwardRef<HTMLDivElement, DialogNextBodyProps>(
  function DialogNextBody(props, ref) {
    const { children, className, status, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-next-body",
      css: dialogNextBodyCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("withStatus")]: status,
        })}
        ref={ref}
        {...rest}
      >
        {status && <StatusIndicator size={2} status={status} />}
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );
  }
);
