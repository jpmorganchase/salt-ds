import { clsx } from "clsx";
import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@salt-ds/core";

import staticInputAdornmentCss from "./StaticInputAdornment.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export type StaticInputAdornmentProps = HTMLAttributes<HTMLDivElement>;

const withBaseName = makePrefixer("saltStaticInputAdornment");

export const StaticInputAdornment = forwardRef<
  HTMLDivElement,
  StaticInputAdornmentProps
>(function StaticInputAdornment(props, ref) {
  const { children, className, ...other } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-static-input-adornments",
    css: staticInputAdornmentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} ref={ref} {...other}>
      {children}
    </div>
  );
});
