import { ReactNode, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import {
  H2,
  StatusIndicator,
  ValidationStatus,
  makePrefixer,
  Text,
} from "@salt-ds/core";
import { useDialogContext } from "./DialogContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dialogTitleCss from "./DialogTitle.css";

const withBaseName = makePrefixer("saltDialogTitle");

interface DialogTitleProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  /**
   * The status of the Dialog
   */
  status?: ValidationStatus | undefined;
  /**
   * Displays the accent bar in the Dialog Title */
  disableAccent?: boolean;
  /**
   * Displays the Dialog Title in a H2 component
   */
  title: ReactNode;
  /**
   * Displays the Dialog Subtitle in a Label component
   **/
  subtitle?: ReactNode;

  className?: string;
}

export const DialogTitle = ({
  className,
  title,
  subtitle,
  disableAccent,
  status: statusProp,
  ...rest
}: DialogTitleProps) => {
  const { status: statusContext, id } = useDialogContext();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-title",
    css: dialogTitleCss,
    window: targetWindow,
  });

  const subtitleId = `${id}-subtitle`;
  const titleId = `${id}-title`;

  const status = statusProp ?? (statusContext as ValidationStatus);

  return (
    <div
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
      <div>
        {subtitle && (
          <Text as={"label"} variant="secondary" id={subtitleId}>
            {subtitle}
          </Text>
        )}
        <H2 className={clsx(withBaseName("title"))} id={titleId}>
          {title}
        </H2>
      </div>
    </div>
  );
};
