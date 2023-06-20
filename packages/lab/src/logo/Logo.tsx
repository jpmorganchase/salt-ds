import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import logoCss from "./Logo.css";

export type LogoProps = ComponentPropsWithoutRef<"span">;

const withBaseName = makePrefixer("saltLogo");

export const Logo = forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  props,
  ref
) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-logo",
    css: logoCss,
    window: targetWindow,
  });

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest} />
  );
});
