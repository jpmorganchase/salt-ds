import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

const withBaseName = makePrefixer("saltMegaMenuCustomRegion");

export interface MegaMenuCustomRegionProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the custom region.
   */
  children?: ReactNode;
}

export const MegaMenuCustomRegion = forwardRef<
  HTMLDivElement,
  MegaMenuCustomRegionProps
>(function MegaMenuCustomRegion({ children, className, ...rest }, ref) {
  return (
    <div
      className={clsx(withBaseName(), className)}
      data-salt-mega-menu-region="true"
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
});
