import {
  Button,
  makePrefixer,
  useAriaAnnouncer,
  useId,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, HTMLAttributes, MouseEvent, Ref, useEffect } from "react";

import { Div } from "../text";
import {
  StatusIndicator,
  StatusIndicatorProps,
} from "./internal/StatusIndicator";

import "./ContentStatus.css";

const withBaseName = makePrefixer("uitkContentStatus");

export interface ContentStatusProps
  extends HTMLAttributes<HTMLDivElement>,
    StatusIndicatorProps {
  actionLabel?: string;
  buttonRef?: Ref<any>;
  onActionClick?: (evt: MouseEvent<HTMLButtonElement>) => void;
}

export const ContentStatus = forwardRef<HTMLDivElement, ContentStatusProps>(
  function ContentStatus(
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
    },
    ref
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
    }, [announce, disableAnnouncer, message, status, title]);

    return (
      <div className={cx(withBaseName(), className)} ref={ref} {...rest}>
        <StatusIndicator
          CircularProgressProps={CircularProgressProps}
          SpinnerProps={SpinnerProps}
          disableAnnouncer={disableAnnouncer}
          id={id}
          message={message}
          status={status}
          title={title}
          unit={unit}
          value={value}
          {...rest}
        />
        {hasContent && (
          <div
            // `aria-labelledby` to itself so that children of this div will show up in screen reader, and we don't need to join to aria-label
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
  }
);
