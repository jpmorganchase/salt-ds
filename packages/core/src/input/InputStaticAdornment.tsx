import cx from "classnames";
import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "../utils";

import "./InputStaticAdornment.css";

export type InputStaticAdornmentProps = HTMLAttributes<HTMLDivElement>;

const withBaseName = makePrefixer("uitkInputStaticAdornment");

export const InputStaticAdornment = forwardRef<
  HTMLDivElement,
  InputStaticAdornmentProps
>(function InputStaticAdornment(props, ref) {
  const { children, className, ...other } = props;

  return (
    <div className={cx(withBaseName(), className)} ref={ref} {...other}>
      {children}
    </div>
  );
});
