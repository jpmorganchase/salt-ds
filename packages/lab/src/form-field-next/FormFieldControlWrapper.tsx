import { PropsWithChildren } from "react";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldControlWrapper from "./FormFieldControlWrapper.css";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export const FormFieldControlWrapper = ({ children }: PropsWithChildren) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-form-field-control-wrapper",
    css: formFieldControlWrapper,
    window: targetWindow,
  });
  return <div className={withBaseName()}>{children}</div>;
};
