import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

export interface LogoSeparatorProps extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltLogoSeparator");

export const LogoSeparator = forwardRef<HTMLImageElement, LogoSeparatorProps>(
  function LogoSeparator(props, ref) {
    const { className, ...rest } = props;
    return (
      <span {...rest} className={clsx(withBaseName(), className)} ref={ref} />
    );
  }
);
