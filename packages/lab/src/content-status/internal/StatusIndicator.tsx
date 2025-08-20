import {
  StatusIndicator as BaseStatusIndicator,
  type StatusIndicatorProps as BaseStatusIndicatorProps,
  CircularProgress,
  type CircularProgressProps,
  makePrefixer,
  Spinner,
  type SpinnerProps,
} from "@salt-ds/core";
import { clsx } from "clsx";
import type { ReactElement } from "react";

export interface StatusIndicatorProps
  extends Pick<SpinnerProps, "disableAnnouncer">,
    Pick<CircularProgressProps, "value"> {
  title?: string;
  message?: string;
  CircularProgressProps?: Partial<CircularProgressProps>;
  SpinnerProps?: Partial<SpinnerProps>;
  id?: string;
  status?: BaseStatusIndicatorProps["status"] | "loading";
}

const withBaseName = makePrefixer("saltContentStatus");

export function StatusIndicator({
  status = "info",
  disableAnnouncer,
  value,
  title,
  message,
  CircularProgressProps: {
    className: circularProgressClassName,
    ...restCircularProgressProps
  } = {},
  SpinnerProps: { className: spinnerClassName, ...restSpinnerProps } = {},
  id,
}: StatusIndicatorProps): ReactElement {
  if (status === "loading") {
    if (value !== undefined) {
      return (
        <CircularProgress
          aria-label={title || message}
          className={clsx(
            withBaseName("determinateLoading"),
            circularProgressClassName,
          )}
          value={value}
          {...restCircularProgressProps}
        />
      );
    }
    return (
      <Spinner
        className={clsx(withBaseName("indeterminateLoading"), spinnerClassName)}
        // Announcement of the content status is more useful than completion announcement from spinner
        completionAnnouncement={null}
        data-testid={`spinner-${id}`}
        disableAnnouncer={disableAnnouncer}
        {...restSpinnerProps}
      />
    );
  }

  return (
    <BaseStatusIndicator
      status={status}
      data-jpmui-test={`icon-${status}-${id}`}
      size={2}
    />
  );
}
