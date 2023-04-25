import { PropsWithChildren } from "react";
import { makePrefixer } from "@salt-ds/core";

import "./FormFieldControlWrapper.css";

const withBaseName = makePrefixer("saltFormFieldControlWrapper");

export const FormFieldControlWrapper = ({
  children
}: PropsWithChildren) => (
    <div className={withBaseName()}>{children}</div>
);
