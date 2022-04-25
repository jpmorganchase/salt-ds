import {
  forwardRef,
  ForwardedRef,
  HTMLAttributes,
  useEffect,
  MouseEvent,
  Ref,
} from "react";
import cx from "classnames";
import { Button, makePrefixer, useAriaAnnouncer } from "@brandname/core";
import { CircularProgressProps, SpinnerProps, useId } from "@brandname/lab";
import { renderStatusIndicator } from "./internal/renderStatusIndicator";

import "./ContentStatus.css";

const withBaseName = makePrefixer("uitkContentStatus");

export type ContentStatusStatus =
  | "loading"
  | "error"
  | "success"
  | "warning"
  | "info";

export const Status = {
  LOADING: "loading" as ContentStatusStatus,
  ERROR: "error" as ContentStatusStatus,
  SUCCESS: "success" as ContentStatusStatus,
  WARNING: "warning" as ContentStatusStatus,
  INFO: "info" as ContentStatusStatus,
};

export const STATUS_TO_ICONS = {
  [Status.ERROR]: "error",
  [Status.SUCCESS]: "tick",
  [Status.WARNING]: "warning",
  [Status.INFO]: "info",
};

export type Status = keyof typeof Status;

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
    status = Status.INFO,
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
    if (status !== Status.LOADING) {
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
          {title && <div className={cx(withBaseName("title"))}>{title}</div>}
          {message && (
            <div className={cx(withBaseName("message"))}>{message}</div>
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
