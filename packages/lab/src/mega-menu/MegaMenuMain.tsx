import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuMainCss from "./MegaMenuMain.css";

const withBaseName = makePrefixer("saltMegaMenuMain");

export interface MegaMenuMainProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu navigation area, typically `MegaMenuSection`
   * columns and an optional `MegaMenuFooter`.
   */
  children?: ReactNode;
}

export const MegaMenuMain = forwardRef<HTMLDivElement, MegaMenuMainProps>(
  function MegaMenuMain({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-main",
      css: megaMenuMainCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
