import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  ErrorIcon,
  IconProps,
  InfoIcon,
  LoaderIcon,
  SuccessIcon,
  WarningIcon,
} from "@jpmorganchase/uitk-icons";
import { ComponentType, ReactElement } from "react";
import {
  ContentStatusProps,
  ContentStatusStatus,
  Status,
  STATUS_TO_ICONS,
} from "../ContentStatus";
import { getDeterminateLoadingComponent } from "./getDeterminateLoadingComponent";
import { getIndeterminateLoadingComponent } from "./getIndeterminateLoadingComponent";

const withBaseName = makePrefixer("uitkContentStatus");

const contentByType = new Map<
  ContentStatusStatus,
  { icon: ComponentType<IconProps>; className: string }
>([
  [
    "loading",
    {
      icon: LoaderIcon,
      className: withBaseName("loading"),
    },
  ],
  [
    "error",
    {
      icon: ErrorIcon,
      className: withBaseName("error"),
    },
  ],
  [
    "success",
    {
      icon: SuccessIcon,
      className: withBaseName("success"),
    },
  ],
  [
    "warning",
    {
      icon: WarningIcon,
      className: withBaseName("warning"),
    },
  ],
  [
    "info",
    {
      icon: InfoIcon,
      className: withBaseName("info"),
    },
  ],
]);

export function renderStatusIndicator({
  status = "info",
  disableAnnouncer,
  unit,
  value,
  title,
  message,
  CircularProgressProps: { ...restCircularProgressProps } = {},
  SpinnerProps: { ...restSpinnerProps } = {},
  id,
}: Partial<ContentStatusProps>): ReactElement {
  const { icon: Icon, className } = contentByType.get(status)!;
  if (status === "loading") {
    return value !== undefined
      ? getDeterminateLoadingComponent({
          unit,
          value,
          title,
          message,
          ...restCircularProgressProps,
        })
      : getIndeterminateLoadingComponent({
          disableAnnouncer,
          id,
          ...restSpinnerProps,
        });
  } else {
    const iconName = STATUS_TO_ICONS[status];
    return (
      <Icon
        aria-label={status}
        className={className}
        data-jpmui-test={`icon-${iconName}-${id!}`}
        role="img"
        size={24}
      />
    );
  }
}
