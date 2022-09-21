import classnames from "classnames";
import { ChangeEventHandler, FC, forwardRef, HTMLAttributes } from "react";
import { ControlLabel, ControlLabelProps } from "../control-label";
import { makePrefixer } from "../utils";
import { RadioButtonBase as Radio } from "./RadioButtonBase";
import { RadioButtonIconProps } from "./RadioButtonIcon";

import "./RadioButton.css";

const withBaseName = makePrefixer("uitkRadioButton");

export interface RadioButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /**
   * Custom icon component
   */
  icon?: FC<RadioButtonIconProps>;
  /**
   * The label to be shown next to the radio
   */
  label?: ControlLabelProps["label"];
  LabelProps?: Partial<ControlLabelProps>;
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
      LabelProps,
      value,
      onChange,
      ...rest
    } = props;

    return (
      <div className={classnames(withBaseName())}>
        <ControlLabel
          {...LabelProps}
          className={classnames(
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
        >
          <div
            className={classnames(
              withBaseName(),
              {
                [withBaseName("disabled")]: disabled,
              },
              className
            )}
            {...rest}
          >
            <Radio
              checked={checked}
              disabled={disabled}
              value={value}
              onChange={onChange}
              icon={icon}
            />
          </div>
        </ControlLabel>
      </div>
    );
  }
);
