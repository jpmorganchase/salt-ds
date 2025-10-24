import { CheckboxGroup, type CheckboxGroupProps } from "../../checkbox";

export interface SelectablePillGroupProps extends CheckboxGroupProps {}

export const SelectablePillGroup = ({
  children,
  ...rest
}: SelectablePillGroupProps) => {
  return <CheckboxGroup {...rest}>{children}</CheckboxGroup>;
};
