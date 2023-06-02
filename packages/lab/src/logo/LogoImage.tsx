import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

export interface LogoImageProps extends ComponentPropsWithoutRef<"img"> {}

const withBaseName = makePrefixer("saltLogoImage");

export const LogoImage = forwardRef<HTMLImageElement, LogoImageProps>(
  function LogoImage(props, ref) {
    const { className, ...rest } = props;
    return (
      <img {...rest} className={clsx(withBaseName(), className)} ref={ref} />
    );
  }
);
