import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { H2, Text } from "../text";
import { makePrefixer } from "../utils";
import { useDialogContext } from "./DialogContext";
import dialogHeaderCss from "./DialogHeader.css";

const withBaseName = makePrefixer("saltDialogHeader");

export interface DialogHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The status of the Dialog
   */
  status?: ValidationStatus | undefined;
  /**
   * Displays the accent bar in the Dialog Title */
  disableAccent?: boolean;
  /**
   * Displays the header at the top of the Dialog
   */
  header: ReactNode;
  /**
   * Displays the preheader just above the header
   **/
  preheader?: ReactNode;
  /**
   * Description text is displayed just below the header
   **/
  description?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader(props, ref) {
    const {
      className,
      description,
      disableAccent,
      endAdornment,
      header,
      preheader,
      status: statusProp,
      ...rest
    } = props;
    const { status: statusContext, id } = useDialogContext();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-header",
      css: dialogHeaderCss,
      window: targetWindow,
    });

    const status = statusProp ?? statusContext;

    return (
      <div
        id={id}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withAccent")]: !disableAccent && !status,
            [withBaseName(status ?? "")]: !!status,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {status && <StatusIndicator status={status} />}
        <div className={withBaseName("body")}>
          {preheader && (
            <Text className={withBaseName("preheader")}>{preheader}</Text>
          )}
          <H2 className={withBaseName("header")}>{header}</H2>
          {description && (
            <Text color="secondary" className={withBaseName("description")}>
              {description}
            </Text>
          )}
        </div>
        {endAdornment && (
          <div className={withBaseName("endAdornmentContainer")}>
            {endAdornment}
          </div>
        )}
      </div>
    );
  },
);
