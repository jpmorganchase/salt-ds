import {
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { ComponentType, FC } from "react";
import { useOverflowDetection } from "../../utils";
import { MailLinkComponent } from "../MailLinkComponent";
import {
  DefaultValueComponent,
  ValueComponentProps,
} from "./DefaultValueComponent";

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

  const { getTooltipProps, getTriggerProps } = useTooltip({
    disabled: !isValueOverflowed,
    placement: "top",
  });

  const { ref: triggerRef, ...triggerProps } = getTriggerProps<typeof Value>({
    tabIndex: isValueOverflowed ? 0 : undefined,
    value,
    ...restProps,
  });

  const handleRef = useForkRef(triggerRef, valueRef);

  return (
    <>
      <Tooltip
        {...getTooltipProps({
          title: value,
          ...tooltipProps,
        })}
      />
      <Value ref={handleRef} {...triggerProps} />
    </>
  );
};
