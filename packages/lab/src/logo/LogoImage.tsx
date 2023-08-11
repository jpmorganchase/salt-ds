import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import logoImageCss from "./LogoImage.css";

export interface LogoImageProps
  extends Omit<ComponentPropsWithoutRef<"img">, "alt"> {
  alt: string;
}

const withBaseName = makePrefixer("saltLogoImage");

export const LogoImage = forwardRef<HTMLImageElement, LogoImageProps>(
  function LogoImage(props, ref) {
    const { className, alt, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-logo-image",
      css: logoImageCss,
      window: targetWindow,
    });

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
