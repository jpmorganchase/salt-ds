import {
  DEFAULT_ICON_SIZE,
  ErrorSolidIcon,
  IconProps,
  InfoSolidIcon,
  SuccessTickIcon,
  WarningSolidIcon,
} from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import { forwardRef } from "react";
import { makePrefixer } from "../utils";
import { ValidationStatus } from "./ValidationStatus";

import "./StatusIcon.css";

const icons = {
  error: ErrorSolidIcon,
  success: SuccessTickIcon,
  warning: WarningSolidIcon,
  info: InfoSolidIcon,
};

export interface StatusIconProps extends IconProps {
  /**
   * Status icon to be displayed.
   */
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
        {...(status === "success" && { "aria-label": "success" })}
        {...restProps}
        ref={ref}
      />
    );
  }
);
