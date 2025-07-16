import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import staticInputAdornmentCss from "./StaticInputAdornment.css";

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
