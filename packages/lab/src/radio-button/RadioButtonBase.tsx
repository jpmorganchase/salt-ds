import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  Ref,
  useState,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import {
  makePrefixer,
  useControlled,
  useForkRef,
  useIsFocusVisible,
} from "@salt-ds/core";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import "./RadioButtonBase.css";

const withBaseName = makePrefixer("saltRadioButtonBase");

export interface RadioButtonBaseProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  name?: string;
  defaultChecked?: boolean;
  onFocus?: FocusEventHandler<HTMLSpanElement>;
  onBlur?: FocusEventHandler<HTMLSpanElement>;
  required?: boolean;
  id?: string;
  tabIndex?: number;
  value?: string;
  error?: boolean;
}

export const RadioButtonBase = forwardRef<
  HTMLSpanElement,
  RadioButtonBaseProps
>(function RadioBase(props, ref) {
  const {
    checked: checkedProp,
    name: nameProp,
    className,
    disabled: disabledProp,
    value,
    onFocus,
    onBlur,
    onChange,
    id,
    tabIndex,
    error,
    ...rest
  } = props;

  useFormFieldProps();

  const radioGroup = useRadioGroup();

  let radioGroupChecked = checkedProp;
  let name = nameProp;

  if (Object.keys(radioGroup).length) {
    if (typeof radioGroupChecked === "undefined") {
      radioGroupChecked = radioGroup.value === props.value;
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

  const formFieldProps = useFormFieldProps();

  let disabled = disabledProp;
  if (formFieldProps) {
    if (typeof disabled === "undefined") {
      disabled = formFieldProps.a11yProps?.disabled;
    }
  }

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

  const handleRef = useForkRef<HTMLSpanElement>(
    ref,
    focusVisibleRef as Ref<HTMLSpanElement>
  );

  const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
    if (formFieldProps && formFieldProps.onFocus) {
      formFieldProps.onFocus(event);
    }
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }
    if (onFocus) {
      onFocus(event);
    }
  };

  const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
    if (formFieldProps && formFieldProps.onBlur) {
      formFieldProps.onBlur(event);
    }
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
    <span
      className={clsx(
        withBaseName(),
        {
          [withBaseName("focusVisible")]: focusVisible,
        },
        className
      )}
      ref={handleRef}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...rest}
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
        tabIndex={tabIndex}
      />
      <RadioButtonIcon checked={checked} error={error} />
    </span>
  );
});
