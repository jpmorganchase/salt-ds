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
} from "react";
import { CheckboxIcon } from "../../checkbox";
import { useCheckboxGroup } from "../../checkbox/internal/useCheckboxGroup";
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
      disabled,
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
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });
    const { onChange: inputOnChange, ...restInputProps } = inputProps;

    const checkboxGroup = useCheckboxGroup();

    const checkboxGroupChecked =
      checkedProp ??
      (checkboxGroup?.checkedValues && value
        ? checkboxGroup.checkedValues.includes(value)
        : checkedProp);

    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(inputRefProp, inputRef);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setChecked(!checked);
        if (inputRef.current) {
          inputRef.current.checked = !checked;
          inputRef.current.dispatchEvent(
            new Event("change", { bubbles: true }),
          );
        }
      }
    };

    const [checked, setChecked] = useControlled({
      controlled: checkboxGroupChecked,
      default: Boolean(defaultChecked),
      name: "Checkbox",
      state: "checked",
    });

    // we do not want to spread tab index in this case because the input element
    // does not require tabindex="0" attribute
    const { tabIndex: _tabIndex, ...restLabelProps } = rest;
    return (
      <label
        data-testid="pill"
        className={clsx(
          withBaseName(),
          withBaseName("clickable"),
          { [withBaseName("active")]: checked },
          className,
        )}
        htmlFor={id}
        onKeyDown={handleKeyDown}
        ref={ref}
        tabIndex={0}
        {...restLabelProps}
      >
        <input
          id={id}
          type="checkbox"
          tabIndex={-1}
          ref={handleInputRef}
          onChange={handleChange}
          className={clsx(withBaseName("input"))}
          {...restInputProps}
        />
        <CheckboxIcon checked={checked} disabled={disabled} />
        {children}
      </label>
    );
  },
);
