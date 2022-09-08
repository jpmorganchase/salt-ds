import {
  ErrorIcon,
  IconProps,
  InfoIcon,
  SuccessTickIcon,
  WarningIcon,
  DEFAULT_ICON_SIZE,
} from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import { forwardRef } from "react";
import { makePrefixer } from "../utils";
import { ValidationStatus } from "./ValidationStatus";

import "./StatusIcon.css";

const icons = {
  error: ErrorIcon,
  success: SuccessTickIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

export interface StatusIconProps extends IconProps {
  status: ValidationStatus;
}

const withBaseName = makePrefixer("uitkStatusIcon");

export const StatusIcon = forwardRef<HTMLSpanElement, StatusIconProps>(
  function StatusIcon(
    { className, status, size = DEFAULT_ICON_SIZE, ...restProps },
    ref
  ) {
    const IconComponent = icons[status];

    return (
      <IconComponent
        className={classnames(withBaseName(), withBaseName(status), className)}
        size={size}
        {...(state === "success" && { "aria-label": "success" })}
        {...restProps}
        ref={ref}
      />
    );
  }
);
