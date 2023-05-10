import { PropsWithChildren } from "react";
import { makePrefixer } from "@salt-ds/core";

import formFieldControlWrapper from "./FormFieldControlWrapper.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export const FormFieldControlWrapper = ({ children }: PropsWithChildren) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-form-field-next",
    css: formFieldControlWrapper,
    window: targetWindow,
  });
  return (
    <div className={withBaseName()}>{children}</div>
  );
}
