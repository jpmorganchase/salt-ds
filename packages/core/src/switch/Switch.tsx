import { clsx } from "clsx";
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  FocusEventHandler,
  forwardRef,
  ReactNode,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { makePrefixer, useControlled } from "../utils";
import { useDensity } from "../salt-provider";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import switchCss from "./Switch.css";
import {
  IconProps,
  SuccessSmallSolidIcon,
  SuccessSolidIcon,
} from "@salt-ds/icons";

export interface SwitchProps
  extends Omit<
    ComponentPropsWithoutRef<"label">,
    "children" | "onFocus" | "onBlur" | "onChange"
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
   * Properties applied to the input element.
   */
  inputProps?: Partial<ComponentPropsWithoutRef<"input">>;
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

const withBaseName = makePrefixer("saltSwitch");

function CheckedIcon(props: IconProps) {
  const density = useDensity();
  return density === "high" ? (
    <SuccessSmallSolidIcon {...props} />
  ) : (
    <SuccessSolidIcon {...props} />
  );
}

export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
  props,
  ref
) {
  const {
    checked: checkedProp,
    className,
    defaultChecked,
    disabled: disabledProp,
    inputProps = {},
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    value,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-switch",
    css: switchCss,
    window: targetWindow,
  });

  const {
    "aria-describedby": inputDescribedBy,
    "aria-labelledby": inputLabelledBy,
    className: inputClassName,
    onChange: inputOnChange,
    ...restInputProps
  } = inputProps;

  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: "Switch",
    state: "checked",
  });

  const { a11yProps: formFieldA11yProps, disabled: formFieldDisabled } =
    useFormFieldProps();

  const disabled = formFieldDisabled || disabledProp;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    // Workaround for https://github.com/facebook/react/issues/9023
    if (event.nativeEvent.defaultPrevented) {
      return;
    }

    const value = event.target.checked;
    setChecked(value);
    onChange?.(event);
    inputOnChange?.(event);
  };

  return (
    <label
      className={clsx(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("checked")]: checked,
        },
        className
      )}
      ref={ref}
      {...rest}
    >
      <input
        aria-describedby={clsx(
          formFieldA11yProps?.["aria-describedby"],
          inputDescribedBy
        )}
        aria-labelledby={clsx(
          formFieldA11yProps?.["aria-labelledby"],
          inputLabelledBy
        )}
        name={name}
        value={value}
        checked={checked}
        className={clsx(withBaseName("input"), inputClassName)}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        type="checkbox"
        {...restInputProps}
      />
      <span className={withBaseName("track")}>
        <span className={withBaseName("thumb")}>
          {checked && (
            <CheckedIcon aria-hidden className={withBaseName("icon")} />
          )}
        </span>
      </span>
      <span className={withBaseName("label")}>{label}</span>
    </label>
  );
});
