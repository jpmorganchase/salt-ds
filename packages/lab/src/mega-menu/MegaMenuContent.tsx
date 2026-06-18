import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuContentCss from "./MegaMenuContent.css";

const withBaseName = makePrefixer("saltMegaMenuContent");

export interface MegaMenuContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu navigation area, typically a `MegaMenuGroups`
   * and an optional `MegaMenuActions`.
   */
  children?: ReactNode;
}

export const MegaMenuContent = forwardRef<HTMLDivElement, MegaMenuContentProps>(
  function MegaMenuContent({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-content",
      css: megaMenuContentCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
