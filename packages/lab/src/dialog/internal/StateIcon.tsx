import { forwardRef } from "react";
import classnames from "classnames";
import { IconProps, makePrefixer } from "@jpmorganchase/uitk-core";
import {
  ErrorIcon,
  InfoIcon,
  SuccessTickIcon,
  WarningIcon,
} from "@jpmorganchase/uitk-icons";

import { State } from "../State";

import "./StateIcon.css";

const icons = {
  error: ErrorIcon,
  success: SuccessTickIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

export interface StateIconProps extends IconProps {
  state: State;
}

const withBaseName = makePrefixer("uitkStateIcon");

export const StateIcon = forwardRef<HTMLSpanElement, StateIconProps>(
  (props, ref) => {
    const { className, state, ...restProps } = props;
    const IconComponent = icons[state];

    return (
      <IconComponent
        className={classnames(withBaseName(), withBaseName(state), className)}
        size={24}
        {...restProps}
        ref={ref}
      />
    );
  }
);
