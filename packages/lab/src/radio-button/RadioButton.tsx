import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  ReactNode,
  Ref,
  useState,
} from "react";
import {
  Label,
  makePrefixer,
  useControlled,
  useForkRef,
  useId,
  useIsFocusVisible,
} from "@salt-ds/core";
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
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked: checkedProp,
      name: nameProp,
      className,
      disabled: disabledProp,
      label,
      value,
      onFocus,
      onBlur,
      onChange,
      id: idProp,
      error,
      ...rest
    } = props;

    // useFormFieldProps();

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
      default: Boolean(radioGroupChecked),
      name: "RadioBase",
      state: "checked",
    });

    // const formFieldProps = useFormFieldProps();

    let disabled = disabledProp;
    // if (formFieldProps) {
    //   if (typeof disabled === "undefined") {
    //     disabled = formFieldProps.a11yProps?.disabled;
    //   }
    // }

    const [focusVisible, setFocusVisible] = useState(false);
    if (disabled && focusVisible) {
      setFocusVisible(false);
    }

    const {
      isFocusVisibleRef,
      onFocus: handleFocusVisible,
      onBlur: handleBlurVisible,
      ref: focusVisibleRef,
    } = useIsFocusVisible();

    const handleRef = useForkRef<HTMLLabelElement>(
      ref,
      focusVisibleRef as Ref<HTMLLabelElement>
    );

    const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
      // if (formFieldProps && formFieldProps.onFocus) {
      //   formFieldProps.onFocus(event);
      // }
      handleFocusVisible(event);
      if (isFocusVisibleRef.current) {
        setFocusVisible(true);
      }
      if (onFocus) {
        onFocus(event);
      }
    };

    const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
      // if (formFieldProps && formFieldProps.onBlur) {
      //   formFieldProps.onBlur(event);
      // }
      handleBlurVisible();
      setFocusVisible(false);
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
        className={clsx(withBaseName("label"))}
        ref={handleRef}
      >
        <span
          className={clsx(
            withBaseName(),
            {
              [withBaseName("focusVisible")]: focusVisible,
            },
            className
          )}
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
        </span>
        {label}
      </Label>
    );
  }
);
