import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEventHandler,
  forwardRef,
  type InputHTMLAttributes,
  type Ref,
  useId,
  useRef,
  useState,
} from "react";
import { CheckboxIcon } from "../../checkbox";
import { useCheckboxGroup } from "../../checkbox/internal/useCheckboxGroup";
import { useFormFieldProps } from "../../form-field-context";
import type { DataAttributes } from "../../types";
import { makePrefixer, useControlled, useForkRef } from "../../utils";
import pillCss from "../Pill.css";

const withBaseName = makePrefixer("saltPill");

export interface SelectablePillProps
  extends Omit<
    InputHTMLAttributes<HTMLLabelElement>,
    "onChange" | "onBlur" | "onFocus"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>> & DataAttributes;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
}

export const SelectablePill = forwardRef<HTMLLabelElement, SelectablePillProps>(
  function SelectablePill(
    {
      checked: checkedProp,
      children,
      className,
      disabled: disabledProp,
      inputRef: inputRefProp,
      defaultChecked,
      inputProps = {},
      onChange,
      selectable = false,
      value,
      ...rest
    },
    ref,
  ) {
    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      onChange: inputOnChange,
      ...restInputProps
    } = inputProps;

    const [focusVisible, setFocusVisible] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.matches(":focus-visible")) setFocusVisible(true);
    };
    const handleBlur = () => setFocusVisible(false);

    const { a11yProps: formFieldA11yProps, disabled: formFieldDisabled } =
      useFormFieldProps();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });

    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(inputRefProp, inputRef);
    const checkboxGroup = useCheckboxGroup();

    const disabled =
      checkboxGroup?.disabled || formFieldDisabled || disabledProp;

    const checkboxGroupChecked =
      checkedProp ??
      (checkboxGroup?.checkedValues && value
        ? checkboxGroup.checkedValues.includes(value)
        : checkedProp);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event);
      inputOnChange?.(event);
      checkboxGroup?.onChange?.(event);
    };

    const [checked, setChecked] = useControlled({
      controlled: checkboxGroupChecked,
      default: Boolean(defaultChecked),
      name: "SelectablePill",
      state: "checked",
    });

    const { tabIndex: _tabIndex, ...restLabelProps } = rest;
    return (
      <label
        data-testid="pill"
        className={clsx(
          withBaseName(),
          withBaseName("clickable"),
          { [withBaseName("active")]: checked },
          { [withBaseName("focusVisible")]: focusVisible },
          className,
        )}
        htmlFor={id}
        ref={ref}
        {...restLabelProps}
      >
        <input
          id={id}
          aria-describedby={clsx(
            checkboxGroup === undefined
              ? formFieldA11yProps?.["aria-describedby"]
              : undefined,
            inputDescribedBy,
          )}
          aria-labelledby={clsx(
            checkboxGroup === undefined
              ? formFieldA11yProps?.["aria-labelledby"]
              : undefined,
            inputLabelledBy,
          )}
          type="checkbox"
          ref={handleInputRef}
          onChange={handleChange}
          className={withBaseName("input")}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          defaultChecked={defaultChecked}
          value={value}
          checked={checked}
          {...restInputProps}
        />
        <CheckboxIcon checked={checked} disabled={disabled} />
        {children}
      </label>
    );
  },
);
