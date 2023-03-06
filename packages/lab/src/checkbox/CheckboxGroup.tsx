import { clsx } from "clsx";
import {
  ChangeEvent,
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";

import "./CheckboxGroup.css";

export type CheckboxGroupDirectionProps = "horizontal" | "vertical";

export interface CheckboxGroupProps extends HTMLAttributes<HTMLDivElement> {
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
  direction?: CheckboxGroupDirectionProps;
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
    FormControlProps,
    direction = "vertical",
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
      <fieldset className={clsx(withBaseName(), className)} ref={ref}>
        <div className={clsx(withBaseName(direction))} {...other}>
          {children}
        </div>
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
});
