import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./StaticInputAdornment.css";

export interface StaticInputAdornmentProps
  extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("uitkStaticInputAdornment");

export const StaticInputAdornment = forwardRef<
  HTMLDivElement,
  StaticInputAdornmentProps
>(function StaticInputAdornment(props, ref) {
  const { children, className, ...other } = props;

  return (
    <div className={cx(withBaseName(), className)} ref={ref} {...other}>
      {children}
    </div>
  );
});
