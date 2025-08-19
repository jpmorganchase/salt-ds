import {
  Button,
  makePrefixer,
  Text,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type Ref,
  useEffect,
} from "react";
import contentStatusCss from "./ContentStatus.css";
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from "./internal/StatusIndicator";

const withBaseName = makePrefixer("saltContentStatus");

export interface ContentStatusProps
  extends HTMLAttributes<HTMLDivElement>,
    StatusIndicatorProps {
  actionLabel?: string;
  buttonRef?: Ref<HTMLButtonElement>;
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
      value,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-content-status",
      css: contentStatusCss,
      window: targetWindow,
    });

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
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        <StatusIndicator
          CircularProgressProps={CircularProgressProps}
          SpinnerProps={SpinnerProps}
          disableAnnouncer={disableAnnouncer}
          id={id}
          message={message}
          status={status}
          title={title}
          value={value}
          {...rest}
        />
        {hasContent && (
          <div
            // `aria-labelledby` to itself so that children of this div will show up in screen reader, and we don't need to join to aria-label
            aria-labelledby={id}
            className={clsx(withBaseName("content"))}
            id={id}
            role="region"
          >
            {title && (
              <Text className={clsx(withBaseName("title"))}>{title}</Text>
            )}
            {message && (
              <Text className={clsx(withBaseName("message"))}>{message}</Text>
            )}
            {hasActions && (
              <div className={clsx(withBaseName("actions"))}>
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
  },
);
