import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import {
  H1,
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
  const { headingId, status: statusContext } = useDialogNextContext();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-title",
    css: dialogNextTitleCss,
    window: targetWindow,
  });

  const status = statusProp || statusContext;

  return (
    <H1
      id={headingId}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("withAccent")]: !status && accent,
        },
        className
      )}
      {...rest}
    >
      {status && <StatusIndicator size={2} status={status} />}
      <span className={withBaseName("text")}>{children}</span>
    </H1>
  );
};
