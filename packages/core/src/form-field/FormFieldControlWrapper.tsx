import { createContext, PropsWithChildren, useContext } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "../utils";

import formFieldControlWrapper from "./FormFieldControlWrapper.css";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export type ControlWrapper = {
  variant: "primary" | "secondary";
};

export const ControlWrapperContext = createContext<ControlWrapper>({variant: "primary"});

export const useControlWrapperVariant = () => {
  const variant = useContext(ControlWrapperContext);
  return variant;
}

export const FormFieldControlWrapper = ({
  children,
  variant = "primary",
}: PropsWithChildren & { variant?: "primary" | "secondary" }) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-control-wrapper",
    css: formFieldControlWrapper,
    window: targetWindow,
  });
  return (
    <ControlWrapperContext.Provider value={{ variant }}>
      <fieldset className={withBaseName()}>
        {children}
      </fieldset>
    </ControlWrapperContext.Provider>
  );
};
