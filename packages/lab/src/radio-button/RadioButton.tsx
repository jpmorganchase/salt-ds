import { ChangeEventHandler, FC, forwardRef, HTMLAttributes } from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { Radio } from "./Radio";
import "./RadioButton.css";
import { RadioIconProps } from "./RadioIcon";

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
  label?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
}

export const RadioButton = forwardRef<HTMLDivElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked,
      className,
      icon,
      disabled,
      label,
      value,
      onChange,
      ...rest
    } = props;

    return (
      <div
        className={classnames(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <label className={withBaseName("label")}>
          <Radio
            checked={checked}
            disabled={disabled}
            value={value}
            onChange={onChange}
            icon={icon}
          />
          <span className={withBaseName("labelText")}>{label}</span>
        </label>
      </div>
    );
  }
);
