import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  ComponentType,
  ReactNode,
} from "react";
import { Label, makePrefixer, useId } from "@salt-ds/core";
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
   * The label to be shown next to the radio
   */
  label?: ReactNode;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const { checked, className, disabled, label, value, onChange, ...rest } =
      props;

    const id = useId();
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
        <Radio
          checked={checked}
          disabled={disabled}
          value={value}
          onChange={onChange}
          ref={ref}
          id={id}
        />
        <Label
          disabled={disabled}
          className={clsx(withBaseName("label"))}
          htmlFor={id}
        >
          {label}
        </Label>
      </div>
    );
  }
);
