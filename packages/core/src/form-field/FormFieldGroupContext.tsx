import { ComponentProps, createContext, useContext } from "react";

export const FormFieldGroupContext = createContext<FormFieldGroupValue>({
  labelPlacement: undefined,
  labelWidth: undefined,
  variant: undefined,
});

export const useFormFieldGroup = () => {
  const groupContext = useContext(FormFieldGroupContext);
  return groupContext;
};

interface FormFieldGroupValue extends ComponentProps<"div"> {
  /**
   * Aligns all labels in the group to the given position
   */
  labelPlacement?: "top" | "left" | "right";
  /**
   * Width of labels when labelPlacement="left" or labelPlacement="right"
   */
  labelWidth?: string;
  /*
   * Variant of all nested controls
   */
  variant?: "primary" | "secondary";
}
