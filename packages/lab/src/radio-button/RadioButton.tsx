import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  ReactNode,
} from "react";
import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import "./RadioButton.css";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  /**
   * The label to be shown next to the radio
   */
  label?: ReactNode;
  name?: string;
  onBlur?: FocusEventHandler<HTMLSpanElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLSpanElement>;
  value?: string;
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked: checkedProp,
      className,
      disabled,
      error,
      id: idProp,
      label,
      name: nameProp,
      onFocus,
      onBlur,
      onChange,
      value,
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
      default: Boolean(checkedProp),
      name: "RadioBase",
      state: "checked",
    });

    const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
      onFocus && onFocus(event);
    };

    const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
      onBlur && onBlur(event);
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newChecked = event.target.checked;
      setCheckedState(newChecked);

      onChange && onChange(event);

      if (Object.keys(radioGroup).length) {
        radioGroup.onChange && radioGroup.onChange(event);
      }
    };

    return (
      <label
        className={clsx(withBaseName(), className, {
          [withBaseName("disabled")]: disabled,
        })}
        ref={ref}
      >
        <input
          className={withBaseName("input")}
          checked={checked}
          disabled={disabled}
          id={id}
          name={name}
          value={value}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onFocus={handleFocus}
          {...rest}
          type="radio"
        />
        <RadioButtonIcon checked={checked} error={error} disabled={disabled} />
        {label}
      </label>
    );
  }
);
