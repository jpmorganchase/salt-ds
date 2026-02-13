import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { H2, Text } from "../text";
import { makePrefixer, useId, useIsomorphicLayoutEffect } from "../utils";
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
  description?: ReactNode;
  /**
   * Actions to be displayed in header
   */
  actions?: ReactNode;
}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader(props, ref) {
    const {
      id: idProp,
      className,
      description,
      disableAccent,
      actions,
      header,
      preheader,
      status: statusProp,
      ...rest
    } = props;
    const { status: statusContext, setHeaderId } = useDialogContext();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-header",
      css: dialogHeaderCss,
      window: targetWindow,
    });

    const status = statusProp ?? statusContext;
    const id = useId(idProp);

    useIsomorphicLayoutEffect(() => {
      if (id) {
        setHeaderId(id);
      }
    }, [id, setHeaderId]);

    return (
      <div
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
        <div className={withBaseName("container")}>
          <H2 id={id} className={withBaseName("header")}>
            {preheader && <Text color="primary">{preheader}</Text>}
            {header}
          </H2>
          {description && (
            <Text color="secondary" className={withBaseName("description")}>
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className={withBaseName("actionsContainer")}>{actions}</div>
        )}
      </div>
    );
  },
);
