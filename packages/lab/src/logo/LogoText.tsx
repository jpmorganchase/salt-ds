import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import logoTitleCss from "./LogoText.css";

export interface LogoTitleProps extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltLogoTitle");

export const LogoText = forwardRef<HTMLSpanElement, LogoTitleProps>(
  function LogoText({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-logo-title",
      css: logoTitleCss,
      window: targetWindow,
    });

    return (
      <span {...rest} className={clsx(withBaseName(), className)} ref={ref} />
    );
  }
);
