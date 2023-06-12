import { PropsWithChildren } from "react";
import { makePrefixer } from "../utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldControlWrapper from "./FormFieldControlWrapper.css";
import clsx from "clsx";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export const FormFieldControlWrapper = ({ children, variant = "primary" }: PropsWithChildren & {variant?: string}) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-control-wrapper",
    css: formFieldControlWrapper,
    window: targetWindow,
  });
  return <div className={clsx(withBaseName(), withBaseName(variant))}>{children}</div>;
};
