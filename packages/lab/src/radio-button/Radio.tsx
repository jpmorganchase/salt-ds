import {
  makePrefixer,
  useControlled,
  useForkRef,
} from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  forwardRef,
  Ref,
  useState,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { useIsFocusVisible } from "../utils";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioIcon as DefaultRadioIcon, RadioIconProps } from "./RadioIcon";

import "./Radio.css";

const withBaseName = makePrefixer("uitkRadio");

export interface RadioProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  emphasis?: "low" | "medium" | "high";
  /**
   * custom icon component
   */
  icon?: FC<RadioIconProps>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  name?: string;
  defaultChecked?: boolean;
  onFocus?: FocusEventHandler<HTMLSpanElement>;
  onBlur?: FocusEventHandler<HTMLSpanElement>;
  required?: boolean;
  id?: string;
  value?: string;
  tabIndex?: number;
}

export const Radio = forwardRef<HTMLSpanElement, RadioProps>(function RadioBase(
  props,
  ref
) {
  const {
    checked: checkedProp,
    defaultChecked,
    name: nameProp,
    className,
    disabled: disabledProp,
    icon: iconProp,
    value,
    onFocus,
    onBlur,
    onChange,
    id,
    tabIndex,
    ...rest
  } = props;

  const { inFormField } = useFormFieldProps();

  const radioGroup = useRadioGroup();

  let radioGroupChecked = checkedProp;
  let name = nameProp;
  if (radioGroup) {
    if (typeof radioGroupChecked === "undefined") {
      radioGroupChecked = radioGroup.value === props.value;
    }
    if (typeof name === "undefined") {
      name = radioGroup.name;
    }
  }

  const [checked, setCheckedState] = useControlled({
    controlled: radioGroupChecked,
    default: Boolean(defaultChecked),
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

  const RadioIcon = iconProp || DefaultRadioIcon;

  return (
    <span
      className={classnames(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("focusVisible")]: focusVisible,
        },
        className
      )}
      ref={handleRef}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...rest}
    >
      <span className={withBaseName("radioContainer")}>
        <input
          className={withBaseName("input")}
          checked={radioGroupChecked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={id}
          name={name}
          onChange={handleInputChange}
          type="radio"
          value={value}
          tabIndex={tabIndex}
        />
        <RadioIcon checked={checked} />
      </span>
    </span>
  );
});
