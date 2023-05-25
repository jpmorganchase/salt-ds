import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "../utils";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import radioButtonCss from "./RadioButton.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
  /**
   * Set the disabled state
   */
  disabled?: boolean;
  /**
   * Set the error state
   */
  error?: boolean;
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
      inputProps,
      label,
      name: nameProp,
      onFocus,
      onBlur,
      onChange,
      value,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-radio-button",
      css: radioButtonCss,
      window: targetWindow,
    });

    const radioGroup = useRadioGroup();

    const radioGroupChecked =
      radioGroup.value != null && value != null
        ? radioGroup.value === value
        : checkedProp;
    const name = nameProp ?? radioGroup.name;

    const [checked, setCheckedState] = useControlled({
      controlled: radioGroupChecked,
      default: Boolean(checkedProp),
      name: "RadioBase",
      state: "checked",
    });

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newChecked = event.target.checked;
      setCheckedState(newChecked);

      onChange?.(event);
      radioGroup.onChange?.(event);
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
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="radio"
        />
        <RadioButtonIcon checked={checked} error={error} disabled={disabled} />
        {label}
      </label>
    );
  }
);
