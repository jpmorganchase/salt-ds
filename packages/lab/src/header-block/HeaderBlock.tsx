import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import {
  H2,
  makePrefixer,
  Text,
  useDialogContext,
  StatusIndicator,
  type ValidationStatus,
} from "@salt-ds/core";
import headerBlockCss from "./HeaderBlock.css";

import { HeaderBlockCloseButton } from "./HeaderBlockCloseButton";

const withBaseName = makePrefixer("saltHeaderBlock");

export interface HeaderBlockProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The status of the Dialog
   */
  status?: ValidationStatus | undefined;
  /**
   * Displays the accent bar in the Dialog Title */
  accent?: boolean;
  /**
   * Header text
   */
  header?: string;
  /**
   * Preheader text is displayed just above the header
   **/
  preheader?: string;
  /**
   * Description text is displayed  just below the header
   **/
  description?: string;
  /**
   * Callback when the close button
   * is clicked
   * */
  onClose?: () => void;
}

export const HeaderBlock = forwardRef<HTMLDivElement, HeaderBlockProps>(
  function HeaderBlock(props, ref) {
    const {
      className,
      header,
      preheader,
      description,
      accent,
      status: statusProp,
      onClose,
      ...rest
    } = props;
    const { status: statusContext, id } = useDialogContext();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-header-block",
      css: headerBlockCss,
      window: targetWindow,
    });

    const status = statusProp ?? statusContext;

    return (
      <div
        id={id}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withAccent")]: accent && !status,
            [withBaseName(status ?? "")]: !!status,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {status && <StatusIndicator status={status} />}
        <H2 className={withBaseName("body")}>
          {preheader && (
            <Text className={withBaseName("preheader")}>{preheader}</Text>
          )}
          <div>{header}</div>
          {description && (
            <Text color="secondary" className={withBaseName("description")}>
              {description}
            </Text>
          )}
        </H2>
        {onClose && <HeaderBlockCloseButton onClick={onClose} />}
      </div>
    );
  },
);
