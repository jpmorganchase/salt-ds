import { PropsWithChildren } from "react";
import { makePrefixer } from "../utils";

import "./FormFieldControlWrapper.css";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export const FormFieldControlWrapper = ({ children }: PropsWithChildren) => (
  <div className={withBaseName()}>{children}</div>
);
