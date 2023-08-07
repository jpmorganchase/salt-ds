import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import {
  H2,
  StatusIndicator,
  ValidationStatus,
  makePrefixer,
} from "@salt-ds/core";
import { useDialogNextContext } from "./DialogNextContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dialogNextTitleCss from "./DialogNextTitle.css";

const withBaseName = makePrefixer("saltDialogNextTitle");

interface DialogNextTitleProps extends ComponentPropsWithoutRef<"h1"> {
  status?: ValidationStatus;
  accent?: boolean;
}

export const DialogNextTitle = ({
  children,
  className,
  accent,
  status: statusProp,
  ...rest
}: DialogNextTitleProps) => {
  const { dialogId, status: statusContext } = useDialogNextContext();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-title",
    css: dialogNextTitleCss,
    window: targetWindow,
  });

  const status = statusProp || statusContext;

  return (
    <H2
      id={`${dialogId}-heading`}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("withAccent")]: accent && !status,
          [withBaseName(status!)]: !!status,
        },
        className
      )}
      {...rest}
    >
      {status && <StatusIndicator size={2} status={status} />}
      {children}
    </H2>
  );
};
