import { useControlled } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  ChangeEvent,
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import { FormGroup, FormGroupProps } from "../form-group";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";

import "./CheckboxGroup.css";

export interface CheckboxGroupProps extends FormGroupProps {
  /**
   * The current checked options.
   */
  checkedValues?: string[];
  /**
   * The default selected options for un-controlled component.
   */
  defaultCheckedValues?: string[];
  /**
   * Props spread onto the FormControl component that wraps the checkboxes.
   */
  FormControlProps?: Partial<HTMLAttributes<HTMLFieldSetElement>>;
  /**
   * Props spread onto the legend.
   */
  LegendProps?: unknown;
  /**
   * The label for the group legend
   */
  legend?: ReactNode;
  /**
   * The name used to reference the value of the control.
   */
  name?: string;
  /**
   * Callback fired when a checkbox is clicked.
   * `event.target.value` returns the value of the checkbox that was clicked.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const classBase = "uitkCheckboxGroup";

export const CheckboxGroup = forwardRef<
  HTMLFieldSetElement,
  CheckboxGroupProps
>(function CheckboxGroup(
  {
    checkedValues: checkedValuesProp,
    defaultCheckedValues = [],
    children,
    className,
    FormControlProps,
    row,
    name,
    onChange,
    ...other
  },
  ref
) {
  const [checkedValues, setCheckedValues] = useControlled({
    controlled: checkedValuesProp,
    default: defaultCheckedValues,
    name: "CheckboxGroup",
    state: "checkedValues",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCheckedValues((oldValues: string[] = []) => {
      const name = event.target.value;
      const isSelected = oldValues.includes(name);

      return isSelected
        ? oldValues.filter((value) => value !== name)
        : oldValues.concat(name);
    });

    onChange?.(event);
  };

  return (
    <CheckboxGroupContext.Provider
      value={{ name, onChange: handleChange, checkedValues }}
    >
      <fieldset
        className={cx(classBase, {
          [`${classBase}-horizontal`]: row,
        })}
        ref={ref}
      >
        <FormGroup className={`${classBase}-formGroup`} row={row} {...other}>
          {children}
        </FormGroup>
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
});
