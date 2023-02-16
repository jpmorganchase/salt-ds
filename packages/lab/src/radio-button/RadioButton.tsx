import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  ComponentType,
  ReactNode
} from "react";
import { Label, makePrefixer } from "@salt-ds/core";
import { RadioButtonBase as Radio } from "./RadioButtonBase";
import { RadioButtonIconProps } from "./RadioButtonIcon";

import "./RadioButton.css";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /**
   * Custom icon component
   */
  icon?: ComponentType<RadioButtonIconProps>;
  /**
   * The label to be shown next to the radio
   */
  label?: ReactNode;
  // LabelProps?: Partial<ControlLabelProps>;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked,
      className,
      icon,
      disabled,
      label,
      // LabelProps,
      value,
      onChange,
      ...rest
    } = props;

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        {...rest}
      >
        {/* <ControlLabel
          {...LabelProps}
          className={clsx(
            withBaseName("labelContainer"),
            {
              [withBaseName("disabled")]: disabled,
            },
            className
          )}
          disabled={disabled}
          label={label}
          labelPlacement="right"
          ref={ref}
        > */}
        <Radio
          checked={checked}
          disabled={disabled}
          value={value}
          onChange={onChange}
          icon={icon}
        />
        <Label disabled={disabled} className={clsx(withBaseName("label"))}>{label}</Label>
        {/* </ControlLabel> */}
      </div>
    );
  }
);
