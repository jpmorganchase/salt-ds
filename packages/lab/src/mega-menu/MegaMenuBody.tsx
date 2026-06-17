import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import megaMenuBodyCss from "./MegaMenuBody.css";

const withBaseName = makePrefixer("saltMegaMenuBody");

export interface MegaMenuBodyProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu navigation area, typically a `MegaMenuGroups`
   * and an optional `MegaMenuSupportingActions`.
   */
  children?: ReactNode;
}

export const MegaMenuBody = forwardRef<HTMLDivElement, MegaMenuBodyProps>(
  function MegaMenuBody({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-body",
      css: megaMenuBodyCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
