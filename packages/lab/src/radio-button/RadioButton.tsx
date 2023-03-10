import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import "./RadioButton.css";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps
  extends Omit<
    HTMLAttributes<HTMLLabelElement>,
    "onChange" | "onBlur" | "onFocus"
  > {
  /**
   * Set the default selected radio button in the group
   */
  checked?: boolean;
  className?: string;
  /**
   * Prop used to set the styling
   */
  disabled?: boolean;
  /**
   * Prop used to set the styling
   */
  error?: boolean;
  id?: string;
  /**
   * Props to be passed to the radio input
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  /**
   * The label to be shown next to the radio icon
   */
  label?: ReactNode;
  /**
   * Name of the radio group
   */
  name?: string;
  /**
   * Callback for blur event
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback for change event
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback for focus event
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * Value of radio button
   */
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
      inputProps,
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

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      onFocus && onFocus(event);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      onBlur && onBlur(event);
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newChecked = event.target.checked;
      setCheckedState(newChecked);

      onChange && onChange(event);

      if (Object.keys(radioGroup).length) {
        radioGroup.onChange && radioGroup.onChange(event);
      }
    };

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          className={withBaseName("input")}
          {...inputProps}
          checked={checked}
          disabled={disabled}
          id={id}
          name={name}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          type="radio"
        />
        <RadioButtonIcon checked={checked} error={error} disabled={disabled} />
        {label}
      </label>
    );
  }
);
