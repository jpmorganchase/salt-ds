import { ChangeEventHandler, FC, forwardRef, HTMLAttributes } from "react";
import classnames from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Radio } from "./Radio";
import { RadioIconProps } from "./RadioIcon";
import { ControlLabel, ControlLabelProps } from "../control-label";
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
  icon?: FC<RadioIconProps>;
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
