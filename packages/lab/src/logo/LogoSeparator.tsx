import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import logoSeparatorCss from "./LogoSeparator.css";

export type LogoSeparatorProps = ComponentPropsWithoutRef<"span">;

const withBaseName = makePrefixer("saltLogoSeparator");

export const LogoSeparator = forwardRef<HTMLImageElement, LogoSeparatorProps>(
  function LogoSeparator(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-logo-separator",
      css: logoSeparatorCss,
      window: targetWindow,
    });

    return (
      <span {...rest} className={clsx(withBaseName(), className)} ref={ref} />
    );
  },
);
