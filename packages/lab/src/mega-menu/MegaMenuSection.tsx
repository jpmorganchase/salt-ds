import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuSectionCss from "./MegaMenuSection.css";

const withBaseName = makePrefixer("saltMegaMenuSection");

export interface MegaMenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu section.
   */
  children?: ReactNode;
}

export const MegaMenuSection = forwardRef<HTMLDivElement, MegaMenuSectionProps>(
  function MegaMenuSection({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-section",
      css: megaMenuSectionCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
