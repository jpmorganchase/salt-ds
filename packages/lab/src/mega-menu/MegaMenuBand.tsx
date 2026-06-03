import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuBandCss from "./MegaMenuBand.css";

const withBaseName = makePrefixer("saltMegaMenuBand");

export interface MegaMenuBandProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the band. Renders as a full-width row on top when placed
   * before `MegaMenuGroups`, and on the bottom when placed after.
   */
  children?: ReactNode;
}

export const MegaMenuBand = forwardRef<HTMLDivElement, MegaMenuBandProps>(
  function MegaMenuBand({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-band",
      css: megaMenuBandCss,
      window: targetWindow,
    });

    return (
      <div
        data-mega-menu-band=""
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
