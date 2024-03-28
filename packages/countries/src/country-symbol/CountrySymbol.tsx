import { forwardRef, SVGAttributes } from "react";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import countrySymbolCss from "./CountrySymbol.css";
// Duplicate from core/util to avoid circular dependency
export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");

const withBaseName = makePrefixer("saltCountrySymbol");

export interface CountrySymbolProps extends SVGAttributes<SVGSVGElement> {
  /**
   * Multiplier for the base Country Symbol size. Should be a positive integer to conform to the rest of the design system.
   */
  size?: number;
  /**
   * Variant of the Country Symbol. Default is the circular version, sharp is the rectangular version.
   */
  variant?: "default" | "sharp";
}

export const DEFAULT_COUNTRY_SYMBOL_SIZE = 1;

export const CountrySymbol = forwardRef<SVGSVGElement, CountrySymbolProps>(
  function CountrySymbol(
    {
      children,
      className,
      size = DEFAULT_COUNTRY_SYMBOL_SIZE,
      style: styleProp,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-country-symbol",
      css: countrySymbolCss,
      window: targetWindow,
    });

    const style = {
      ...styleProp,
      "--saltCountrySymbol-size-multiplier": `${size}`,
    };

    return (
      <svg
        className={clsx(withBaseName(), className)}
        style={style}
        role="img"
        {...rest}
        ref={ref}
      >
        <g aria-hidden>{children}</g>
      </svg>
    );
  }
);
