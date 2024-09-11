import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import {
  H2,
  H3,
  makePrefixer,
  Text,
  useDialogContext,
  StatusIndicator,
  type ValidationStatus,
} from "@salt-ds/core";
import headerBlockCss from "./HeaderBlock.css";

import { HeaderBlockCloseButton } from "./HeaderBlockCloseButton";

export type HeaderBlockPadding = "100" | "200" | "300";

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
   * Description text is displayed just below the header
   **/
  description?: string;
  /**
   * Padding of the header block. Default is "300"
   **/
  padding?: HeaderBlockPadding;
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
      style,
      status: statusProp,
      padding = "300",
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

    const headerBlockStyles = {
      ...style,
      "--headerBlock-padding": `var(--salt-spacing-${padding})`,
    };

    const status = statusProp ?? statusContext;

    const Heading = padding === "300" ? H2 : H3;
    const iconSize = padding === "300" ? 1.5 : 1;

    return (
      <div
        id={id}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withAccent")]:
              accent && !status && padding !== "100",
            [withBaseName(status ?? "")]: !!status,
          },
          className,
        )}
        style={headerBlockStyles}
        ref={ref}
        {...rest}
      >
        {status && (
          <StatusIndicator
            className={withBaseName("status")}
            status={status}
            size={iconSize}
          />
        )}
        <Heading className={withBaseName("body")}>
          {preheader && !status && (
            <Text className={withBaseName("preheader")}>{preheader}</Text>
          )}
          <div>{header}</div>
          {description && !status && (
            <Text color="secondary" className={withBaseName("description")}>
              {description}
            </Text>
          )}
        </Heading>
        {onClose && <HeaderBlockCloseButton onClick={onClose} />}
      </div>
    );
  },
);
