import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuCustomRegionCss from "./MegaMenuCustomRegion.css";

const withBaseName = makePrefixer("saltMegaMenuCustomRegion");

export interface MegaMenuCustomRegionProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the custom region.
   */
  children?: ReactNode;
  /**
   * Background style variant.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const MegaMenuCustomRegion = forwardRef<
  HTMLDivElement,
  MegaMenuCustomRegionProps
>(function MegaMenuCustomRegion(
  { children, className, variant, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-custom-region",
    css: megaMenuCustomRegionCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(
        withBaseName(),
        variant && withBaseName(variant),
        className,
      )}
      data-salt-mega-menu-region="true"
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
});
