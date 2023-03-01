import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  ReactNode,
} from "react";
import { Label, makePrefixer, useControlled, useId } from "@salt-ds/core";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import "./RadioButton.css";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * The label to be shown next to the radio
   */
  label?: ReactNode;
  name?: string;
  onFocus?: FocusEventHandler<HTMLSpanElement>;
  onBlur?: FocusEventHandler<HTMLSpanElement>;
  required?: boolean;
  id?: string;
  tabIndex?: number;
  value?: string;
  error?: boolean;
  defaultCheched?: boolean;
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked: checkedProp,
      name: nameProp,
      className,
      defaultCheched,
      disabled,
      label,
      value,
      onFocus,
      onBlur,
      onChange,
      id: idProp,
      error,
      ...rest
    } = props;

    const id = idProp || useId();
    const radioGroup = useRadioGroup();

    let radioGroupChecked = checkedProp;
    let name = nameProp;

    if (Object.keys(radioGroup).length) {
      if (typeof radioGroupChecked === "undefined") {
        radioGroupChecked = radioGroup.value === value;
      }
      if (typeof name === "undefined") {
        name = radioGroup.name;
      }
    }

    const [checked, setCheckedState] = useControlled({
      controlled: radioGroupChecked,
      default: Boolean(defaultCheched),
      name: "RadioBase",
      state: "checked",
    });

    const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
      if (onFocus) {
        onFocus(event);
      }
    };

    const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
      if (onBlur) {
        onBlur(event);
      }
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newChecked = event.target.checked;
      setCheckedState(newChecked);
      if (onChange) {
        onChange(event);
      }
      if (radioGroup && radioGroup.onChange) {
        radioGroup.onChange(event);
      }
    };

    return (
      <Label
        disabled={disabled}
        className={clsx(withBaseName(), className, {
          [withBaseName("disabled")]: disabled,
        })}
        ref={ref}
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        <input
          className={withBaseName("input")}
          checked={checked}
          disabled={disabled}
          id={id}
          name={name}
          onChange={handleInputChange}
          type="radio"
          value={value}
          {...rest}
        />
        <RadioButtonIcon checked={checked} error={error} />
        {label}
      </Label>
    );
  }
);
