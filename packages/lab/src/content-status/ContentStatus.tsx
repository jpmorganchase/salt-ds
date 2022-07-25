import {
  Button,
  makePrefixer,
  useAriaAnnouncer,
  useId,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  Ref,
  useEffect,
} from "react";
import { CircularProgressProps } from "../progress";
import { SpinnerProps } from "../spinner";
import { Div } from "../typography";
import { renderStatusIndicator } from "./internal/renderStatusIndicator";

import "./ContentStatus.css";

const withBaseName = makePrefixer("uitkContentStatus");

export type ContentStatusStatus =
  | "loading"
  | "error"
  | "success"
  | "warning"
  | "info";

export type Status = ContentStatusStatus;

export interface ContentStatusProps extends HTMLAttributes<HTMLDivElement> {
  CircularProgressProps?: Partial<CircularProgressProps>;
  SpinnerProps?: Partial<SpinnerProps>;
  actionLabel?: string;
  buttonRef?: Ref<any>;
  disableAnnouncer?: boolean;
  message?: string;
  onActionClick?: (evt: MouseEvent<HTMLButtonElement>) => void;
  status?: ContentStatusStatus;
  title?: string;
  unit?: string;
  value?: number;
}

export const ContentStatus = forwardRef(function ContentStatus(
  {
    CircularProgressProps,
    SpinnerProps,
    actionLabel,
    buttonRef,
    className,
    children,
    disableAnnouncer,
    message,
    onActionClick,
    status = "info",
    title,
    unit = "%",
    value,
    ...rest
  }: ContentStatusProps,
  ref?: ForwardedRef<HTMLDivElement>
) {
  const id = useId();

  const hasDefaultActionContent = actionLabel && onActionClick;
  const hasActions = children || hasDefaultActionContent;
  const hasContent = title || message || hasActions;

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (disableAnnouncer) return;

    const toBeAnnounced = [];
    if (title) {
      toBeAnnounced.push(title);
    }
    if (message) {
      toBeAnnounced.push(message);
    }
    // Loading is announced by the spinner
    if (status !== "loading") {
      toBeAnnounced.push(status);
    }
    if (toBeAnnounced.length > 0) {
      announce(toBeAnnounced.join(" "));
    }
  }, [announce, children, disableAnnouncer, message, status, title]);

  return (
    <div className={cx(withBaseName(), className)} ref={ref} {...rest}>
      {renderStatusIndicator({
        CircularProgressProps,
        SpinnerProps,
        actionLabel,
        className,
        children,
        disableAnnouncer,
        id,
        message,
        onActionClick,
        status,
        title,
        unit,
        value,
        ...rest,
      })}
      {hasContent && (
        <div
          aria-labelledby={id}
          className={cx(withBaseName("content"))}
          id={id}
          role="region"
        >
          {title && (
            <Div truncate className={cx(withBaseName("title"))}>
              {title}
            </Div>
          )}
          {message && (
            <Div truncate className={cx(withBaseName("message"))}>
              {message}
            </Div>
          )}
          {hasActions && (
            <div className={cx(withBaseName("actions"))}>
              {children || (
                <Button onClick={onActionClick} ref={buttonRef}>
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
