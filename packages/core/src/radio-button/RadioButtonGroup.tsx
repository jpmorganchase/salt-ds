import { clsx } from "clsx";
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  forwardRef,
} from "react";
import { makePrefixer, useControlled, useId } from "../utils";
import { RadioGroupContext } from "./internal/RadioGroupContext";

import radioButtonGroupCss from "./RadioButtonGroup.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useFormFieldProps } from "../form-field-context";

const withBaseName = makePrefixer("saltRadioButtonGroup");

export interface RadioButtonGroupProps
  extends Omit<ComponentPropsWithoutRef<"fieldset">, "onChange"> {
  /**
   * Set the selected value when initialized.
   */
  defaultValue?: string;
  /**
   * Set the group direction.
   */
  direction?: "horizontal" | "vertical";
  /**
   * Disable the RadioButton group
   */
  disabled?: boolean;
  /**
   * Only for horizontal direction. When `true` the text in radio button label will wrap to fit within the container. Otherwise the radio buttons will wrap onto the next line.
   */
  wrap?: boolean;
  /**
   * The name to be set on each radio button within the group. If not set, then one will be generated for you.
   */
  name?: string;
  /**
   * Callback for change event.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Set the RadioButton group to read only.
   */
  readOnly?: boolean;
  /**
   * The value of the radio group, required for a controlled component.
   */
  value?: string;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning";
}

export const RadioButtonGroup = forwardRef<
  HTMLFieldSetElement,
  RadioButtonGroupProps
>(function RadioButtonGroup(props, ref) {
  const {
    children,
    className,
    defaultValue,
    direction = "vertical",
    disabled: disabledProp,
    wrap = true,
    name: nameProp,
    onChange,
    readOnly: readOnlyProp,
    value: valueProp,
    validationStatus: validationStatusProp,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-radio-button-group",
    css: radioButtonGroupCss,
    window: targetWindow,
  });

  const {
    a11yProps,
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    validationStatus: formFieldValidationStatus,
  } = useFormFieldProps();

  const disabled = formFieldDisabled || disabledProp;
  const readOnly = formFieldReadOnly || readOnlyProp;
  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [value, setStateValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    state: "value",
    name: "RadioButtonGroup",
  });

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setStateValue(event.target.value);
    onChange?.(event);
  };

  const name = useId(nameProp);

  return (
    <fieldset
      className={clsx(
        withBaseName(),
        withBaseName(direction),
        {
          [withBaseName("noWrap")]: !wrap,
        },
        className
      )}
      data-testid="radio-button-group"
      ref={ref}
      {...rest}
    >
      <RadioGroupContext.Provider
        value={{
          a11yProps,
          disabled,
          name,
          onChange: handleChange,
          readOnly,
          validationStatus,
          value,
        }}
      >
        {children}
      </RadioGroupContext.Provider>
    </fieldset>
  );
});
