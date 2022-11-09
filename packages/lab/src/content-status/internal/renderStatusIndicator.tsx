import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  ErrorSolidIcon,
  IconProps,
  InfoSolidIcon,
  LoaderIcon,
  SuccessIcon,
  WarningSolidIcon,
} from "@jpmorganchase/uitk-icons";
import { ComponentType, ReactElement } from "react";
import { ContentStatusProps, ContentStatusStatus } from "../ContentStatus";
import { getDeterminateLoadingComponent } from "./getDeterminateLoadingComponent";
import { getIndeterminateLoadingComponent } from "./getIndeterminateLoadingComponent";

const withBaseName = makePrefixer("uitkContentStatus");

const contentByType = new Map<
  ContentStatusStatus,
  { icon: ComponentType<IconProps>; iconName: string; className: string }
>([
  [
    "loading",
    {
      icon: LoaderIcon,
      iconName: "loading",
      className: withBaseName("loading"),
    },
  ],
  [
    "error",
    {
      icon: ErrorSolidIcon,
      iconName: "error",
      className: withBaseName("error"),
    },
  ],
  [
    "success",
    {
      icon: SuccessIcon,
      iconName: "tick",
      className: withBaseName("success"),
    },
  ],
  [
    "warning",
    {
      icon: WarningSolidIcon,
      iconName: "warning",
      className: withBaseName("warning"),
    },
  ],
  [
    "info",
    {
      icon: InfoSolidIcon,
      iconName: "info",
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
  const { icon: Icon, iconName, className } = contentByType.get(status)!;
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
  }

  return (
    <Icon
      aria-label={status}
      className={className}
      data-jpmui-test={`icon-${iconName}-${id!}`}
      role="img"
      size={2}
    />
  );
}
