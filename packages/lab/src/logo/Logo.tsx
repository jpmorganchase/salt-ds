import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import logoCss from "./Logo.css";

export interface LogoProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * If `true`, the logo will be compact;
   */
  compact?: boolean;
}

const withBaseName = makePrefixer("saltLogo");

export const Logo = forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  props,
  ref
) {
  const { className, compact, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-logo",
    css: logoCss,
    window: targetWindow,
  });

  return (
    <span
      className={clsx(withBaseName(), className, {
        [withBaseName("compact")]: compact,
      })}
      ref={ref}
      {...rest}
    />
  );
});
