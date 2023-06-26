import {
  ComponentProps,
  ComponentPropsWithoutRef,
  createContext,
  PropsWithChildren,
  useContext,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { capitalize, makePrefixer } from "../utils";

import formFieldControlWrapper from "./FormFieldGroup.css";
import clsx from "clsx";

const withBaseName = makePrefixer("saltFormFieldGroup");

export const FormFieldGroupContext = createContext<
  Omit<FormFieldGroupProps, "direction">
>({
  labelAlignment: undefined,
  labelWidth: undefined,
  variant: undefined,
});

export const useFormFieldGroup = () => {
  const groupContext = useContext(FormFieldGroupContext);
  return groupContext;
};

interface FormFieldGroupProps extends ComponentProps<"div"> {
  /**
   * Direction of flow of Form Fields
   */
  direction?: "vertical" | "horizontal";
  /**
   * Aligns all labels in the group to the given position
   */
  labelAlignment?: "top" | "left" | "right";
  /**
   * Width of labels when labelAlignment="left" or labelAlignment="right"
   */
  labelWidth?: string;
  /*
   * Variant of all nested controls
   */
  variant?: "primary" | "secondary";
}

export const FormFieldGroup = ({
  children,
  direction = "vertical",
  labelAlignment = "top",
  labelWidth,
  variant = "primary",
  style,
}: FormFieldGroupProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-group",
    css: formFieldControlWrapper,
    window: targetWindow,
  });

  const styles = {
    "--saltFormFieldGroup-label-width": labelWidth,
    ...style,
  };

  const {
    variant: parentVariant,
    labelAlignment: parentLabelAlignment,
    labelWidth: parentLabelWidth,
  } = useContext(FormFieldGroupContext);

  return (
    <FormFieldGroupContext.Provider
      value={{
        labelAlignment: parentLabelAlignment ?? labelAlignment,
        labelWidth: parentLabelWidth ?? labelWidth,
        variant: parentVariant ?? variant,
      }}
    >
      <div
        className={clsx(
          withBaseName(),
          withBaseName(direction),
          withBaseName(
            `labels${capitalize(parentLabelAlignment ?? labelAlignment)}`
          )
        )}
        style={styles}
      >
        {children}
      </div>
    </FormFieldGroupContext.Provider>
  );
};
