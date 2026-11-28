import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import logoImageCss from "./LogoImage.css";

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export interface LogoImageProps
  extends Omit<ComponentPropsWithoutRef<"img">, "alt"> {
  alt: string;
}

const withBaseName = makePrefixer("saltLogoImage");

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
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
  },
);
