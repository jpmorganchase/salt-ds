import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

export interface LogoImageProps
  extends Omit<ComponentPropsWithoutRef<"img">, "alt"> {
  alt: string;
}

const withBaseName = makePrefixer("saltLogoImage");

export const LogoImage = forwardRef<HTMLImageElement, LogoImageProps>(
  function LogoImage(props, ref) {
    const { className, alt, ...rest } = props;

    return (
      <img
        {...rest}
        alt={alt}
        className={clsx(withBaseName(), className)}
        ref={ref}
      />
    );
  }
);
