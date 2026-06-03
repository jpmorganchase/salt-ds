import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { MegaMenuColumn } from "./MegaMenuColumn";
import megaMenuRegionCss from "./MegaMenuRegion.css";

const withBaseName = makePrefixer("saltMegaMenuRegion");

export interface MegaMenuRegionProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the region. Renders to the left of the groups when placed
   * before `MegaMenuGroups`, and to the right when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuRegion = forwardRef<HTMLDivElement, MegaMenuRegionProps>(
  function MegaMenuRegion({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-region",
      css: megaMenuRegionCss,
      window: targetWindow,
    });

    return (
      <MegaMenuColumn
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
