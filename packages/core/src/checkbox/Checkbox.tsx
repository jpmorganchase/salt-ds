import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "../utils";
import { CheckboxIcon } from "./CheckboxIcon";

import checkboxCss from "./Checkbox.css";
import { useCheckboxGroup } from "./internal/useCheckboxGroup";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltCheckbox");

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLLabelElement>,
    "onChange" | "onBlur" | "onFocus"
  > {
  /**
   * If `true`, the checkbox will be checked.
   */
  checked?: boolean;
  /**
   * Whether the checkbox component is checked by default
   * This will be disregarded if checked is already set.
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the checkbox will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the checkbox will be in the error state.
   */
  error?: boolean;
  /**
   * If true, the checkbox appears indeterminate. This does not set the native
   * input element to indeterminate due to the inconsistent behaviour across browsers
   * However, a data-indeterminate attribute is set on the input.
   */
  indeterminate?: boolean;
  /**
   * Properties applied to the input element.
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  /**
   * The label to be shown next to the checkbox.
   */
  label?: ReactNode;
  /**
   * The name applied to the input.
   */
  name?: string;
  /**
   * Callback when checkbox loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback when checkbox gains focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * The value of the checkbox.
   */
  value?: string;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox(
    {
      checked: checkedProp,
      className,
      defaultChecked,
      disabled,
      error,
      indeterminate,
      inputProps,
      label,
      name,
      onBlur,
      onChange,
      onFocus,
      value,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-checkbox",
      css: checkboxCss,
      window: targetWindow,
    });
    const checkboxGroup = useCheckboxGroup();

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event);
      checkboxGroup.onChange?.(event);
    };

    const checkboxGroupChecked =
      checkedProp == null && value != null
        ? checkboxGroup.checkedValues?.includes(value)
        : checkedProp;

    const [checked, setChecked] = useControlled({
      controlled: checkboxGroupChecked,
      default: Boolean(defaultChecked),
      name: "Checkbox",
      state: "checked",
    });

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("error")]: error,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          // aria-checked only needed when indeterminate since native indeterminate behaviour is not used
          aria-checked={indeterminate ? "mixed" : undefined}
          name={name}
          value={value}
          {...inputProps}
          checked={checked}
          className={withBaseName("input")}
          data-indeterminate={indeterminate}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="checkbox"
        />
        <CheckboxIcon
          checked={checked}
          disabled={disabled}
          error={error}
          indeterminate={indeterminate}
        />
        {label}
      </label>
    );
  }
);
