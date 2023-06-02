import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

export interface LogoTitleProps extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltLogoTitle");

export const LogoTitle = forwardRef<HTMLSpanElement, LogoTitleProps>(
  function LogoTitle({ className, ...rest }, ref) {
    return (
      <span {...rest} className={clsx(withBaseName(), className)} ref={ref} />
    );
  }
);
