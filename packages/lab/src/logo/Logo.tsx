import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import logoCss from "./Logo.css";

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export type LogoProps = ComponentPropsWithoutRef<"span">;

const withBaseName = makePrefixer("saltLogo");

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const Logo = forwardRef<HTMLSpanElement, LogoProps>(
  function Logo(props, ref) {
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
  },
);
