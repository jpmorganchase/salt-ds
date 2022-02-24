import {
  DefaultValueComponent,
  ValueComponentProps,
} from "./DefaultValueComponent";
import { Tooltip, TooltipProps } from "../../tooltip";
import React, { ComponentType, FC } from "react";
import { useOverflowDetection } from "../../utils";
import { MailLinkComponent } from "../MailLinkComponent";

function isEmail(value?: string): boolean {
  return !!value && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
}

export interface TruncatableValueProps extends ValueComponentProps {
  tooltipProps?: TooltipProps;
  ValueComponent?: ComponentType<ValueComponentProps>;
}

export const TruncatableValue: FC<TruncatableValueProps> = (props) => {
  const { value, ValueComponent, tooltipProps, ...restProps } = props;

  const [valueRef, isValueOverflowed] = useOverflowDetection<any>();
  const Value =
    ValueComponent || isEmail(value)
      ? MailLinkComponent
      : DefaultValueComponent;

  return isValueOverflowed ? (
    <Tooltip placement="top" title={value} {...tooltipProps}>
      <Value ref={valueRef} tabIndex={0} value={value} {...restProps} />
    </Tooltip>
  ) : (
    <Value ref={valueRef} value={value} {...restProps} />
  );
};
