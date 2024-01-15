import { clsx } from "clsx";
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  forwardRef,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
import { AdornmentValidationStatus } from "../status-adornment";
import { makePrefixer, useControlled } from "../utils";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";
import checkboxGroupCss from "./CheckboxGroup.css";

export interface CheckboxGroupProps
  extends Omit<ComponentPropsWithoutRef<"fieldset">, "onChange"> {
  /**
   * The current checked options.
   */
  checkedValues?: string[];
  /**
   * The default selected options for un-controlled component.
   */
  defaultCheckedValues?: string[];
  /**
   * Display group of elements in a compact row.
   */
  direction?: "horizontal" | "vertical";
  /**
   * Disable the Checkbox group
   */
  disabled?: boolean;
  /**
   * The name used to reference the value of the control.
   */
  name?: string;
  /**
   * Callback fired when a checkbox is clicked.
   * `event.target.value` returns the value of the checkbox that was clicked.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * Only for horizontal direction. When `true` the text in radio button label will wrap to fit within the container. Otherwise, the checkboxes will wrap onto the next line.
   */
  wrap?: boolean;
  /**
   * Validation status.
   */
  validationStatus?: AdornmentValidationStatus;
}

const withBaseName = makePrefixer("saltCheckboxGroup");

export const CheckboxGroup = forwardRef<
  HTMLFieldSetElement,
  CheckboxGroupProps
>(function CheckboxGroup(
  {
    checkedValues: checkedValuesProp,
    defaultCheckedValues = [],
    children,
    className,
    disabled: disabledProp,
    direction = "vertical",
    name,
    onChange,
    readOnly: readOnlyProp,
    wrap,
    validationStatus: validationStatusProp,
    ...other
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-group",
    css: checkboxGroupCss,
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

  const [checkedValues, setCheckedValues] = useControlled({
    controlled: checkedValuesProp,
    default: defaultCheckedValues,
    name: "CheckboxGroup",
    state: "checkedValues",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setCheckedValues((oldValues: string[] = []) => {
      const isSelected = oldValues.includes(name);

      return isSelected
        ? oldValues.filter((value) => value !== name)
        : oldValues.concat(name);
    });

    onChange?.(event);
  };

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
      ref={ref}
      {...other}
    >
      <CheckboxGroupContext.Provider
        value={{
          a11yProps,
          disabled,
          name,
          onChange: handleChange,
          checkedValues,
          readOnly,
          validationStatus,
        }}
      >
        {children}
      </CheckboxGroupContext.Provider>
    </fieldset>
  );
});
