import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import {
  H2,
  StatusIndicator,
  ValidationStatus,
  makePrefixer,
} from "@salt-ds/core";
import { useDialogContext } from "./DialogContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dialogTitleCss from "./DialogTitle.css";

const withBaseName = makePrefixer("saltDialogTitle");

interface DialogTitleProps extends ComponentPropsWithoutRef<"h2"> {
  /**
   * The status of the Dialog
   * */
  status?: ValidationStatus | undefined;
  /**
   * Displays the accent bar in the Dialog Title
   * */
  disableAccent?: boolean;
}

export const DialogTitle = ({
  children,
  className,
  disableAccent,
  status: statusProp,
  ...rest
}: DialogTitleProps) => {
  const { status: statusContext } = useDialogContext();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-title",
    css: dialogTitleCss,
    window: targetWindow,
  });

  const status = statusProp ?? (statusContext as ValidationStatus);

  return (
    <H2
      className={clsx(
        withBaseName(),
        {
          [withBaseName("withAccent")]: !disableAccent && !status,
          [withBaseName(status)]: !!status,
        },
        className
      )}
      {...rest}
    >
      {status && <StatusIndicator status={status} />}
      {children}
    </H2>
  );
};
