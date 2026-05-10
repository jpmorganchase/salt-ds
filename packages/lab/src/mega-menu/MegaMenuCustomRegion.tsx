import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuCustomRegionCss from "./MegaMenuCustomRegion.css";

const withBaseName = makePrefixer("saltMegaMenuCustomRegion");

export interface MegaMenuCustomRegionProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the custom region.
   */
  children?: ReactNode;
}

export const MegaMenuCustomRegion = forwardRef<
  HTMLDivElement,
  MegaMenuCustomRegionProps
>(function MegaMenuCustomRegion({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-custom-region",
    css: megaMenuCustomRegionCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), className)}
      data-mega-menu-column=""
      ref={ref}
      {...rest}
    />
  );
});
